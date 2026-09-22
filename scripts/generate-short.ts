#!/usr/bin/env node
// ============================================================
// CodeWithSundresh — Automated Shorts Generation CLI
// Usage: npm run short -- --topic="What is Docker?"
//        npm run short --topic="How does DNS work?"
// ============================================================

import { startPipeline, pipelineEvents, getJob, getVideoProject } from '../backend/src/pipeline/orchestrator.js';
import { runMigrations } from '../backend/src/database/migrations.js';
import path from 'node:path';
import fs from 'node:fs';

function parseArgs(): { topic: string; duration: number; style: string; voice: string } {
  const args = process.argv.slice(2);
  let topic = '';
  let duration = 32;
  let style = 'dark-cinematic-tech';
  let voice = 'en-US-ChristopherNeural';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--topic=')) {
      topic = arg.slice(8).replace(/^["']|["']$/g, '');
    } else if (arg === '--topic' && args[i + 1]) {
      topic = args[++i].replace(/^["']|["']$/g, '');
    } else if (arg.startsWith('--duration=')) {
      duration = parseInt(arg.slice(11), 10) || 32;
    } else if (arg === '--duration' && args[i + 1]) {
      duration = parseInt(args[++i], 10) || 32;
    } else if (arg.startsWith('--voice=')) {
      voice = arg.slice(8);
    } else if (arg === '--voice' && args[i + 1]) {
      voice = args[++i];
    } else if (arg.startsWith('--style=')) {
      style = arg.slice(8);
    } else if (!arg.startsWith('-') && !topic) {
      topic = arg.replace(/^["']|["']$/g, '');
    }
  }

  return { topic, duration, style, voice };
}

function renderProgressBar(percent: number, width = 30): string {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const filled = Math.max(0, Math.min(width, Math.round((safePercent / 100) * width)));
  const empty = Math.max(0, width - filled);
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

async function main() {
  const { topic, duration, style, voice } = parseArgs();

  if (!topic) {
    console.log(`
\x1b[32m\x1b[1m⚡ CodeWithSundresh — Automated AI Shorts Video Factory\x1b[0m

\x1b[36mUsage:\x1b[0m
  npm run short -- --topic="<TOPIC>" [options]

\x1b[36mOptions:\x1b[0m
  --topic="<text>"     The technology topic to explain (e.g. "What is Docker?")
  --duration=<sec>     Target duration in seconds (default: 32)
  --voice=<name>       Edge TTS voice (default: en-US-ChristopherNeural)
  --style=<name>       Visual style (default: dark-cinematic-tech)

\x1b[36mExamples:\x1b[0m
  npm run short -- --topic="What is Docker?"
  npm run short -- --topic="How does DNS work?"
  npm run short -- --topic="What is a Race Condition?"
  npm run short -- --topic="HTTP vs HTTPS"
    `);
    process.exit(1);
  }

  console.log('\n\x1b[32m\x1b[1m═══════════════════════════════════════════════════════════════\x1b[0m');
  console.log(`\x1b[32m\x1b[1m🚀 STARTING VIDEO FACTORY PIPELINE\x1b[0m`);
  console.log(`\x1b[37mTopic:\x1b[0m \x1b[36m\x1b[1m"${topic}"\x1b[0m`);
  console.log(`\x1b[37mChannel:\x1b[0m \x1b[33mCodeWithSundresh (@CodeWithSundresh)\x1b[0m`);
  console.log(`\x1b[37mVoice:\x1b[0m \x1b[35m${voice}\x1b[0m`);
  console.log(`\x1b[37mTarget Duration:\x1b[0m \x1b[35m${duration}s (9:16 vertical, 1080x1920)\x1b[0m`);
  console.log('\x1b[32m\x1b[1m═══════════════════════════════════════════════════════════════\x1b[0m\n');

  const startTime = Date.now();

  try {
    const job = startPipeline({
      topic,
      duration,
      style,
      voice,
      language: 'en',
    });

    console.log(`\x1b[90mJob ID: ${job.id}\x1b[0m`);
    console.log(`\x1b[90mProject ID: ${job.projectId}\x1b[0m\n`);

    await new Promise<void>((resolve, reject) => {
      const eventKey = `progress:${job.id}`;

      const onProgress = (data: { status: string; progress: number; message: string }) => {
        const bar = renderProgressBar(data.progress);
        const color = data.status === 'failed' ? '\x1b[31m' : '\x1b[32m';
        process.stdout.write(`\r${color}${bar}\x1b[0m \x1b[1m${data.progress}%\x1b[0m — ${data.message.padEnd(50)}`);

        if (data.status === 'completed') {
          process.stdout.write('\n\n');
          pipelineEvents.off(eventKey, onProgress);
          resolve();
        } else if (data.status === 'failed') {
          process.stdout.write('\n\n');
          pipelineEvents.off(eventKey, onProgress);
          reject(new Error(data.message));
        }
      };

      pipelineEvents.on(eventKey, onProgress);
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const updatedJob = getJob(job.id);
    const project = job.projectId ? getVideoProject(job.projectId) : null;

    console.log('\x1b[32m\x1b[1m═══════════════════════════════════════════════════════════════\x1b[0m');
    console.log(`\x1b[32m\x1b[1m✨ VIDEO GENERATION COMPLETE in ${elapsed}s!\x1b[0m`);
    console.log('\x1b[32m\x1b[1m═══════════════════════════════════════════════════════════════\x1b[0m');
    if (project?.renderPath && fs.existsSync(project.renderPath)) {
      const stats = fs.statSync(project.renderPath);
      console.log(`\x1b[37mFile:\x1b[0m      \x1b[32m${project.renderPath}\x1b[0m`);
      console.log(`\x1b[37mSize:\x1b[0m      \x1b[36m${(stats.size / 1024 / 1024).toFixed(2)} MB\x1b[0m`);
      console.log(`\x1b[37mDuration:\x1b[0m  \x1b[36m${project.duration ? project.duration.toFixed(1) + 's' : 'N/A'}\x1b[0m`);
    }
    if (project?.thumbnailPath && fs.existsSync(project.thumbnailPath)) {
      console.log(`\x1b[37mThumbnail:\x1b[0m \x1b[33m${project.thumbnailPath}\x1b[0m`);
    }
    console.log('\x1b[32m\x1b[1m═══════════════════════════════════════════════════════════════\x1b[0m\n');

  } catch (err: any) {
    console.error(`\n\x1b[31m\x1b[1m❌ Video Generation Failed:\x1b[0m`, err.message || err);
    process.exit(1);
  }
}

main();
