// ============================================================
// Render service — Remotion rendering orchestration
// ============================================================

import { EventEmitter } from 'node:events';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { GENERATED_VIDEOS_DIR, PROJECT_ROOT } from '../utils/paths.js';
import { getProjectById, updateProjectStatus } from './projectService.js';
import { generateAudio } from './audioService.js';
import { getTemplateById } from './templateService.js';
import { createExportRecord, updateExportRecord } from './exportService.js';
import type {
  ExportFormat,
  ExportResolution,
  RenderProgress,
  VideoProps,
  VideoTheme,
  SceneConfig,
} from '../types/sharedTypes.js';
import { RESOLUTION_CONFIG, FPS } from '../types/sharedTypes.js';

/** Global event emitter for SSE progress updates, keyed by projectId */
export const renderEvents = new EventEmitter();
renderEvents.setMaxListeners(50);

/**
 * Start a video render for a project.
 * Runs asynchronously; progress is emitted via renderEvents.
 */
export async function startRender(
  projectId: string,
  format: ExportFormat,
  resolution: ExportResolution,
): Promise<{ exportId: string }> {
  const project = getProjectById(projectId);
  if (!project) throw new Error(`Project "${projectId}" not found`);

  const template = project.template_id
    ? getTemplateById(project.template_id)
    : null;

  const sceneConfigs: SceneConfig[] = JSON.parse(project.scene_config);
  if (sceneConfigs.length === 0) {
    throw new Error('Project has no scenes to render');
  }

  // Build VideoProps
  const videoTheme: VideoTheme = {
    backgroundColor: template?.background_color ?? '#1a1a2e',
    fontFamily: template?.font_family ?? 'JetBrains Mono',
    fontSize: template?.font_size ?? 16,
    accentColor: template?.accent_color ?? '#7c3aed',
    textColor: template?.text_color ?? '#ffffff',
    codeTheme: (template?.code_theme as VideoTheme['codeTheme']) ?? 'github-dark',
    containerStyle: (template?.container_style as VideoTheme['containerStyle']) ?? 'rounded',
    glowEffect: template?.glow_effect !== 0,
    backgroundEffect: (template?.background_effect as VideoTheme['backgroundEffect']) ?? 'none',
    backgroundGradient: template?.background_gradient || undefined,
  };

  const host = `http://localhost:${process.env.PORT || 3001}`;

  const videoProps: VideoProps = {
    scenes: sceneConfigs,
    template: videoTheme,
    audioMode: project.audio_mode,
    musicUrl: project.music_file ? `${host}/assets/music/${project.music_file}` : undefined,
    backendUrl: host,
    sfxWhoosh: project.sfx_whoosh !== false,
    sfxTyping: project.sfx_typing !== false,
    sfxAchievement: project.sfx_achievement !== false,
    ttsExplanation: project.tts_explanation !== false,
    ttsOutput: project.tts_output !== false,
  };

  // Calculate total duration
  const totalFrames = sceneConfigs.reduce((sum, s) => sum + s.duration_frames, 0);

  // Create export record
  const outputFileName = `${projectId}_${Date.now()}.${format}`;
  const outputPath = path.join(GENERATED_VIDEOS_DIR, outputFileName);

  const exportId = createExportRecord({
    projectId,
    filePath: outputPath,
    format,
    resolution,
  });

  // Update project status
  updateProjectStatus(projectId, 'rendering');

  // Emit initial progress
  emitProgress(projectId, {
    status: 'bundling',
    progress: 0,
    message: 'Preparing render...',
  });

  // Run render in the background
  doRender(projectId, exportId, outputPath, videoProps, format, resolution, totalFrames)
    .catch((err) => {
      console.error('[Render] Error:', err);
      updateProjectStatus(projectId, 'error');
      emitProgress(projectId, {
        status: 'error',
        progress: 0,
        message: err instanceof Error ? err.message : 'Render failed',
      });
    });

  return { exportId };
}

/**
 * Perform the actual render using Remotion.
 * Dynamically imports Remotion packages to handle the case where they
 * aren't installed yet.
 */
async function doRender(
  projectId: string,
  exportId: string,
  outputPath: string,
  videoProps: VideoProps,
  format: ExportFormat,
  resolution: ExportResolution,
  totalFrames: number,
): Promise<void> {
  // Generate voice narration audio using Piper TTS if voice narration is enabled
  if (videoProps.audioMode === 'voice_music') {
    emitProgress(projectId, {
      status: 'bundling',
      progress: 2,
      message: 'Generating TTS voice narration...',
    });

    const host = videoProps.backendUrl || '';
    const voiceUrls: string[] = [];
    for (let i = 0; i < videoProps.scenes.length; i++) {
      const scene = videoProps.scenes[i];
      let textToSpeak = '';
      
      // Restrict TTS narration to explanation (tip), output, and cta scenes.
      // Hook scene uses a whoosh SFX and Code scene uses a typing SFX.
      if (
        (scene.type === 'tip' && videoProps.ttsExplanation !== false) ||
        (scene.type === 'output' && videoProps.ttsOutput !== false) ||
        scene.type === 'cta'
      ) {
        textToSpeak = scene.text || '';
      }

      if (textToSpeak.trim()) {
        try {
          const audioResult = await generateAudio(textToSpeak);
          voiceUrls.push(`${host}${audioResult.audioUrl}`);
        } catch (err) {
          console.error(`[Render] Failed to generate TTS for scene ${scene.id}:`, err);
          voiceUrls.push('');
        }
      } else {
        voiceUrls.push('');
      }
    }
    videoProps.voiceUrls = voiceUrls;
  }

  const resConfig = RESOLUTION_CONFIG[resolution];

  // Try to dynamically import Remotion packages
  let bundle: typeof import('@remotion/bundler')['bundle'];
  let renderMedia: typeof import('@remotion/renderer')['renderMedia'];

  try {
    const bundlerMod = await import('@remotion/bundler');
    bundle = bundlerMod.bundle;
  } catch {
    throw new Error(
      'Remotion bundler is not installed. Run: npm install @remotion/bundler @remotion/renderer @remotion/cli',
    );
  }

  try {
    const rendererMod = await import('@remotion/renderer');
    renderMedia = rendererMod.renderMedia;
  } catch {
    throw new Error(
      'Remotion renderer is not installed. Run: npm install @remotion/renderer',
    );
  }

  // Step 1: Bundle
  emitProgress(projectId, {
    status: 'bundling',
    progress: 5,
    message: 'Bundling Remotion composition...',
  });

  const rendererEntry = path.resolve(PROJECT_ROOT, 'renderer', 'src', 'index.ts');

  if (!fs.existsSync(rendererEntry)) {
    throw new Error(
      `Renderer entry point not found at ${rendererEntry}. Ensure the renderer workspace is set up.`,
    );
  }

  const bundleLocation = await bundle({
    entryPoint: rendererEntry,
    webpackOverride: (currentConfiguration) => {
      return {
        ...currentConfiguration,
        resolve: {
          ...currentConfiguration.resolve,
          extensionAlias: {
            '.js': ['.ts', '.tsx', '.js', '.jsx'],
            '.mjs': ['.mts', '.mjs'],
            '.cjs': ['.cts', '.cjs'],
          },
        },
      };
    },
    onProgress: (progress: number) => {
      emitProgress(projectId, {
        status: 'bundling',
        progress: Math.round(progress * 20),
        message: `Bundling: ${Math.round(progress * 100)}%`,
      });
    },
  });

  // Step 2: Render
  emitProgress(projectId, {
    status: 'rendering',
    progress: 20,
    message: 'Starting render...',
  });

  await renderMedia({
    composition: {
      id: 'CodeShort',
      width: resConfig.width,
      height: resConfig.height,
      fps: FPS,
      durationInFrames: totalFrames,
      defaultProps: videoProps as any,
      props: videoProps as any,
    } as any,
    serveUrl: bundleLocation,
    codec: format === 'webm' ? 'vp8' : 'h264',
    crf: format === 'webm' ? undefined : 16,
    imageFormat: 'png',
    pixelFormat: format === 'webm' ? undefined : 'yuv420p',
    x264Preset: format === 'webm' ? undefined : 'slow',
    scale: 1,
    outputLocation: outputPath,
    onProgress: ({ progress }: { progress: number }) => {
      const overall = 20 + Math.round(progress * 75);
      emitProgress(projectId, {
        status: 'rendering',
        progress: Math.min(overall, 95),
        message: `Rendering: ${Math.round(progress * 100)}%`,
      });
    },
  });

  // Step 3: Finalize
  const stats = fs.statSync(outputPath);
  const durationSeconds = totalFrames / FPS;

  updateExportRecord(exportId, {
    fileSize: stats.size,
    durationSeconds,
  });

  updateProjectStatus(projectId, 'completed');

  emitProgress(projectId, {
    status: 'complete',
    progress: 100,
    message: 'Render complete!',
    output_path: `/generated/videos/${path.basename(outputPath)}`,
  });
}

function emitProgress(projectId: string, progress: RenderProgress): void {
  renderEvents.emit(`progress:${projectId}`, progress);
}
