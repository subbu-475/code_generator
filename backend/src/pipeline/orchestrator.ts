// ============================================================
// Pipeline Orchestrator — Master controller for video generation
// ============================================================

import { EventEmitter } from 'node:events';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { getResearchProvider, getTextProvider, getVoiceProvider, getImageProvider } from '../providers/registry.js';
import type { VideoJob, VideoProject, JobStatus, ResearchResult, GeneratedScript, PlannedScene, VoiceResult, QAReport, YouTubeMetadata } from '../providers/types.js';
import { buildScenePlan } from './scenePlanner.js';
import { generateAllVoices } from './voiceGenerator.js';
import { generateAllAssets } from './assetGenerator.js';
import { buildTimeline } from './timelineBuilder.js';
import { generateCaptions } from './captionGenerator.js';
import { runQualityAssurance } from './qualityAssurance.js';
import { generateThumbnail } from './thumbnailGenerator.js';
import { generateMetadata } from './metadataGenerator.js';
import { getDb } from '../database/connection.js';
import { runMigrations } from '../database/migrations.js';
import { GENERATED_VIDEOS_DIR, PROJECT_ROOT } from '../utils/paths.js';

export const pipelineEvents = new EventEmitter();
pipelineEvents.setMaxListeners(100);

export interface PipelineOptions {
  topic: string;
  duration?: number;
  style?: string;
  voice?: string;
  language?: string;
}

interface PipelineState {
  job: VideoJob;
  project: VideoProject;
  research?: ResearchResult;
  script?: GeneratedScript;
  scenePlan?: PlannedScene[];
  voices?: VoiceResult[];
  qaReport?: QAReport;
  metadata?: YouTubeMetadata;
}

/**
 * Run the entire video generation pipeline for a given topic.
 * Returns the job ID immediately — actual work runs asynchronously.
 */
export function startPipeline(options: PipelineOptions): VideoJob {
  const jobId = uuidv4();
  const projectId = uuidv4();
  const now = new Date().toISOString();

  const job: VideoJob = {
    id: jobId,
    topic: options.topic,
    status: 'queued',
    progress: 0,
    currentStage: 'Initializing',
    projectId,
    createdAt: now,
    updatedAt: now,
  };

  const project: VideoProject = {
    id: projectId,
    jobId,
    topic: options.topic,
    title: options.topic,
    status: 'queued',
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  // Ensure tables exist
  runMigrations();

  // Save to database
  saveJob(job);
  saveProject(project);

  // Ensure storage directories
  const projectDir = getProjectDir(projectId);
  for (const sub of ['assets', 'audio', 'captions', 'renders', 'thumbnail']) {
    fs.mkdirSync(path.join(projectDir, sub), { recursive: true });
  }

  // Run pipeline asynchronously
  runPipeline({ job, project }, options).catch((err) => {
    console.error(`[Pipeline] Fatal error for job ${jobId}:`, err);
    updateJobStatus(jobId, 'failed', 0, `Pipeline failed: ${err.message}`);
  });

  return job;
}

async function runPipeline(state: PipelineState, options: PipelineOptions): Promise<void> {
  const { job, project } = state;
  const projectDir = getProjectDir(project.id);
  const targetDuration = options.duration || 32;

  try {
    // ── Stage 1: Research ──
    emitProgress(job.id, 'researching', 5, 'Researching topic...');
    const researchProvider = getResearchProvider();
    const research = await researchProvider.research(options.topic);
    state.research = research;
    saveProjectData(project.id, 'research', research);
    emitProgress(job.id, 'researching', 15, `Research complete: ${research.category} topic with ${research.keyFacts.length} key facts`);

    // ── Stage 2: Script Generation ──
    emitProgress(job.id, 'scripting', 20, 'Generating script...');
    const textProvider = getTextProvider();
    const script = await textProvider.generateScript(options.topic, research, {
      targetDuration,
      style: options.style || 'dark-cinematic-tech',
      language: options.language || 'en',
    });
    state.script = script;
    project.title = script.title;
    saveProjectData(project.id, 'script', script);
    emitProgress(job.id, 'scripting', 30, `Script generated: "${script.title}" — ${script.scenes.length} scenes, ${script.wordCount} words`);

    // ── Stage 3: Scene Planning ──
    emitProgress(job.id, 'planning', 35, 'Planning visual scenes...');
    const scenePlan = buildScenePlan(script, research, projectDir);
    state.scenePlan = scenePlan;
    saveProjectData(project.id, 'scenes', scenePlan);
    emitProgress(job.id, 'planning', 40, `Scene plan complete: ${scenePlan.length} scenes with visual configs`);

    // ── Stage 4: Asset Generation ──
    emitProgress(job.id, 'generating_assets', 42, 'Generating visual assets...');
    const imageProvider = getImageProvider();
    await generateAllAssets(scenePlan, imageProvider, projectDir, (progress, msg) => {
      emitProgress(job.id, 'generating_assets', 42 + Math.round(progress * 8), msg);
    });
    emitProgress(job.id, 'generating_assets', 50, 'All assets generated');

    // ── Stage 5: Voice Generation ──
    emitProgress(job.id, 'generating_voice', 52, 'Generating voice narration...');
    const voiceProvider = getVoiceProvider();
    const voices = await generateAllVoices(scenePlan, voiceProvider, projectDir, (progress, msg) => {
      emitProgress(job.id, 'generating_voice', 52 + Math.round(progress * 13), msg);
    });
    state.voices = voices;
    saveProjectData(project.id, 'voices', voices);
    emitProgress(job.id, 'generating_voice', 65, `Voice narration complete: ${voices.length} audio clips`);

    // ── Stage 6: Build Timeline (audio = source of truth) ──
    emitProgress(job.id, 'building_timeline', 67, 'Building frame-accurate timeline...');
    const { sceneConfigs, totalFrames } = buildTimeline(scenePlan, voices, script);
    saveProjectData(project.id, 'timeline', { sceneConfigs, totalFrames });
    emitProgress(job.id, 'building_timeline', 70, `Timeline built: ${totalFrames} frames (${(totalFrames / 30).toFixed(1)}s)`);

    // ── Stage 7: Render via Remotion ──
    emitProgress(job.id, 'rendering', 72, 'Starting Remotion render...');
    const outputFileName = `${project.id}_v${project.version}.mp4`;
    const outputPath = path.join(projectDir, 'renders', outputFileName);
    const latestPath = path.join(projectDir, 'renders', 'latest.mp4');

    await doRemotionRender(project.id, job.id, sceneConfigs, voices, totalFrames, outputPath);

    // Copy to latest
    if (fs.existsSync(outputPath)) {
      fs.copyFileSync(outputPath, latestPath);
      // Also copy to generated/videos for serving
      const servePath = path.join(GENERATED_VIDEOS_DIR, outputFileName);
      fs.copyFileSync(outputPath, servePath);
    }
    project.renderPath = outputPath;
    emitProgress(job.id, 'rendering', 92, 'Render complete');

    // ── Stage 8: Quality Assurance ──
    emitProgress(job.id, 'qa', 93, 'Running quality checks...');
    const qaReport = await runQualityAssurance(outputPath);
    state.qaReport = qaReport;
    project.qaReport = qaReport;
    saveProjectData(project.id, 'qa', qaReport);
    emitProgress(job.id, 'qa', 96, `QA ${qaReport.passed ? 'PASSED ✓' : 'FAILED ✗'}: ${qaReport.checks.filter(c => c.passed).length}/${qaReport.checks.length} checks`);

    // ── Stage 9: Thumbnail & Metadata ──
    emitProgress(job.id, 'qa', 97, 'Generating thumbnail...');
    const thumbnailPath = path.join(projectDir, 'thumbnail', 'thumb.jpg');
    await generateThumbnail(outputPath, thumbnailPath, script.title);
    project.thumbnailPath = thumbnailPath;

    emitProgress(job.id, 'qa', 98, 'Generating metadata...');
    const metadata = generateMetadata(script, research);
    state.metadata = metadata;
    project.metadata = metadata;
    saveProjectData(project.id, 'metadata', metadata);

    // ── Complete ──
    const stats = fs.existsSync(outputPath) ? fs.statSync(outputPath) : null;
    project.duration = totalFrames / 30;
    project.status = 'completed';
    updateJobStatus(job.id, 'completed', 100, 'Video generation complete!');
    saveProject(project);

    // Also save to the legacy projects table for the existing frontend
    saveLegacyProject(project, sceneConfigs, voices);

    emitProgress(job.id, 'completed', 100, JSON.stringify({
      title: script.title,
      duration: `${(totalFrames / 30).toFixed(1)}s`,
      scenes: sceneConfigs.length,
      fileSize: stats ? `${(stats.size / 1024 / 1024).toFixed(1)} MB` : 'unknown',
      outputPath: outputPath,
      qa: qaReport.passed ? 'PASSED' : 'FAILED',
    }));

  } catch (err: any) {
    console.error(`[Pipeline] Error at stage for job ${job.id}:`, err);
    updateJobStatus(job.id, 'failed', 0, err.message || 'Unknown error');
    throw err;
  }
}

async function doRemotionRender(
  projectId: string,
  jobId: string,
  sceneConfigs: any[],
  voices: VoiceResult[],
  totalFrames: number,
  outputPath: string,
): Promise<void> {
  // Dynamic import Remotion
  let bundle: any;
  let renderMedia: any;

  try {
    const bundlerMod = await import('@remotion/bundler');
    bundle = bundlerMod.bundle;
  } catch {
    throw new Error('Remotion bundler not installed. Run: npm install @remotion/bundler');
  }
  try {
    const rendererMod = await import('@remotion/renderer');
    renderMedia = rendererMod.renderMedia;
  } catch {
    throw new Error('Remotion renderer not installed. Run: npm install @remotion/renderer');
  }

  const assetServer = await ensureAssetServer();
  const host = assetServer.host;

  try {
    // Build voice URLs
    const voiceUrls = sceneConfigs.map((sc) => {
      const voice = voices.find(v => v.sceneId === sc.id);
      if (voice?.audioUrl) {
        return voice.audioUrl.startsWith('http') ? voice.audioUrl : `${host}${voice.audioUrl}`;
      }
      return '';
    });

    const videoProps = {
      scenes: sceneConfigs,
      template: loadVisualTheme(),
      audioMode: 'voice_music' as const,
      musicUrl: `${host}/assets/music/ambient.mp3`,
      voiceUrls,
      backendUrl: host,
      sfxWhoosh: false,
      sfxTyping: false,
      sfxAchievement: false,
      ttsExplanation: false,
      musicVolume: 0.08,
      voiceVolume: 1.0,
    };

    emitProgress(jobId, 'rendering', 73, 'Bundling Remotion composition...');

    const rendererEntry = path.resolve(PROJECT_ROOT, 'renderer', 'src', 'index.ts');
    const bundleLocation = await bundle({
      entryPoint: rendererEntry,
      webpackOverride: (config: any) => ({
        ...config,
        resolve: {
          ...config.resolve,
          extensionAlias: { '.js': ['.ts', '.tsx', '.js', '.jsx'], '.mjs': ['.mts', '.mjs'] },
        },
      }),
      onProgress: (progress: number) => {
        const normalized = progress > 1 ? Math.min(100, progress) / 100 : progress;
        const pct = Math.min(77, 73 + Math.round(normalized * 4));
        emitProgress(jobId, 'rendering', pct, `Bundling: ${Math.round(normalized * 100)}%`);
      },
    });

    emitProgress(jobId, 'rendering', 78, 'Rendering frames...');

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await renderMedia({
      composition: {
        id: 'CodeShort',
        width: 1080,
        height: 1920,
        fps: 30,
        durationInFrames: totalFrames,
        defaultProps: videoProps,
        props: videoProps,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      crf: 20,
      imageFormat: 'png',
      pixelFormat: 'yuv420p',
      x264Preset: 'veryfast',
      scale: 1,
      outputLocation: outputPath,
      onProgress: ({ progress }: { progress: number }) => {
        emitProgress(jobId, 'rendering', 78 + Math.round(progress * 14), `Rendering: ${Math.round(progress * 100)}%`);
      },
    });
  } finally {
    assetServer.close();
  }
}

async function ensureAssetServer(): Promise<{ host: string; close: () => void }> {
  const port = Number(process.env.PORT) || 3001;

  // 1. Check if server is already running on port
  const isRunning = await new Promise<boolean>((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, { timeout: 1000 }, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });

  if (isRunning) {
    return { host: `http://localhost:${port}`, close: () => {} };
  }

  // 2. Not running — start a lightweight static file server for Remotion
  const serverPort = 3188;
  const server = http.createServer((req, res) => {
    try {
      const decodedUrl = decodeURIComponent(req.url || '').split('?')[0];
      let filePath: string | null = null;

      if (decodedUrl.startsWith('/generated/')) {
        filePath = path.join(PROJECT_ROOT, decodedUrl);
      } else if (decodedUrl.startsWith('/assets/')) {
        filePath = path.join(PROJECT_ROOT, decodedUrl);
      } else if (decodedUrl.startsWith('/storage/')) {
        filePath = path.join(PROJECT_ROOT, decodedUrl);
      }

      if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes: Record<string, string> = {
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.mp4': 'video/mp4',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.json': 'application/json',
        };
        res.writeHead(200, {
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
          'Content-Length': fs.statSync(filePath).size,
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal error');
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(serverPort, () => resolve());
    server.on('error', reject);
  });

  return {
    host: `http://localhost:${serverPort}`,
    close: () => {
      server.close();
    },
  };
}

function loadVisualTheme(): any {
  try {
    const stylePath = path.resolve(PROJECT_ROOT, 'config', 'visual-style.json');
    const style = JSON.parse(fs.readFileSync(stylePath, 'utf-8'));
    return {
      backgroundColor: style.background?.primary || '#0a0a0f',
      backgroundGradient: style.background?.gradient,
      fontFamily: style.typography?.body || 'Inter, sans-serif',
      fontSize: 16,
      accentColor: style.colors?.accent || '#6C63FF',
      textColor: style.colors?.textPrimary || '#F8FAFC',
      codeTheme: 'tokyo-night' as const,
      containerStyle: 'rounded' as const,
      glowEffect: true,
      backgroundEffect: 'particles' as const,
      hookFontSize: 52,
      hookColor: style.colors?.textPrimary || '#F8FAFC',
      codeFontSize: 18,
      codeColor: style.colors?.codeText || '#c0caf5',
      explanationFontSize: 26,
      explanationColor: style.colors?.textPrimary || '#F8FAFC',
      ctaFontSize: 24,
      ctaColor: style.colors?.accent || '#6C63FF',
    };
  } catch {
    return {
      backgroundColor: '#0a0a0f',
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      accentColor: '#6C63FF',
      textColor: '#F8FAFC',
      codeTheme: 'tokyo-night',
      containerStyle: 'rounded',
      glowEffect: true,
      backgroundEffect: 'particles',
      hookFontSize: 52,
      hookColor: '#F8FAFC',
      codeFontSize: 18,
      codeColor: '#c0caf5',
      explanationFontSize: 26,
      explanationColor: '#F8FAFC',
      ctaFontSize: 24,
      ctaColor: '#6C63FF',
    };
  }
}

// ── Database helpers ──

function getProjectDir(projectId: string): string {
  const dir = path.resolve(PROJECT_ROOT, 'storage', 'projects', projectId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function saveProjectData(projectId: string, filename: string, data: any): void {
  const dir = getProjectDir(projectId);
  fs.writeFileSync(path.join(dir, `${filename}.json`), JSON.stringify(data, null, 2), 'utf-8');
}

function saveJob(job: VideoJob): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO video_jobs (id, topic, status, progress, current_stage, project_id, error, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(job.id, job.topic, job.status, job.progress, job.currentStage, job.projectId || null, job.error || null, job.createdAt, job.updatedAt);
}

function saveProject(project: VideoProject): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO video_projects (id, job_id, topic, title, status, version, render_path, thumbnail_path, duration, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(project.id, project.jobId, project.topic, project.title, project.status, project.version,
    project.renderPath || null, project.thumbnailPath || null, project.duration || null, project.createdAt, project.updatedAt);
}

function updateJobStatus(jobId: string, status: JobStatus, progress: number, message: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`UPDATE video_jobs SET status = ?, progress = ?, current_stage = ?, updated_at = ? WHERE id = ?`)
    .run(status, progress, message, now, jobId);
}

/**
 * Save to the legacy projects table so the existing frontend can show it.
 */
function saveLegacyProject(project: VideoProject, sceneConfigs: any[], voices: VoiceResult[]): void {
  try {
    const db = getDb();
    const sceneConfigJson = JSON.stringify(sceneConfigs);
    db.prepare(`
      INSERT OR REPLACE INTO projects (id, title, language, hook_text, code_snippets, output, cta, template_id, scene_config, audio_mode, status, created_at, updated_at)
      VALUES (?, ?, 'javascript', ?, '[]', '', 'Follow for more', NULL, ?, 'voice_music', ?, ?, ?)
    `).run(
      project.id, project.title, project.topic, sceneConfigJson,
      project.status === 'completed' ? 'completed' : 'draft',
      project.createdAt, project.updatedAt,
    );
  } catch (err) {
    console.warn('[Pipeline] Could not save to legacy projects table:', err);
  }
}

function emitProgress(jobId: string, status: JobStatus, rawProgress: number, message: string): void {
  const progress = Math.max(0, Math.min(100, Math.round(rawProgress)));
  console.log(`[Pipeline] [${status}] ${progress}% — ${message}`);
  pipelineEvents.emit(`progress:${jobId}`, { status, progress, message });

  // Also update DB
  try {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(`UPDATE video_jobs SET status = ?, progress = ?, current_stage = ?, updated_at = ? WHERE id = ?`)
      .run(status, progress, message, now, jobId);
  } catch { /* ignore */ }
}

// ── Public API ──

export function getJob(jobId: string): VideoJob | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM video_jobs WHERE id = ?').get(jobId) as any;
  if (!row) return null;
  return {
    id: row.id,
    topic: row.topic,
    status: row.status,
    progress: row.progress,
    currentStage: row.current_stage,
    projectId: row.project_id,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getVideoProject(projectId: string): VideoProject | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM video_projects WHERE id = ?').get(projectId) as any;
  if (!row) return null;
  return {
    id: row.id,
    jobId: row.job_id,
    topic: row.topic,
    title: row.title,
    status: row.status,
    version: row.version,
    renderPath: row.render_path,
    thumbnailPath: row.thumbnail_path,
    duration: row.duration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listJobs(limit = 50): VideoJob[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM video_jobs ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
  return rows.map(row => ({
    id: row.id,
    topic: row.topic,
    status: row.status,
    progress: row.progress,
    currentStage: row.current_stage,
    projectId: row.project_id,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
