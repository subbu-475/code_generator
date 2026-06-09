// ============================================================
// Batch Queue Manager — concurrency-limited task queue
// ============================================================

import { Worker } from 'node:worker_threads';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getDb } from '../database/connection.js';
import { GENERATED_VIDEOS_BATCHES_DIR } from '../utils/paths.js';
import type { BatchItem, VideoProps, VideoTheme, SceneConfig } from '../types/sharedTypes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_CONCURRENT = 2;
let activeCount = 0;
let isProcessing = false;

/**
 * Initialize queue: reset stuck "processing" items to "pending" on startup.
 */
export function initQueue(): void {
  try {
    const db = getDb();
    
    // Reset any processing items back to pending
    const result = db.prepare("UPDATE batch_items SET status = 'pending' WHERE status = 'processing'").run();
    if (result.changes > 0) {
      console.log(`[BatchQueue] Reset ${result.changes} stuck items to pending.`);
    }

    // Reset processing batches back to pending if they still have pending items
    db.prepare(`
      UPDATE batches 
      SET status = 'pending' 
      WHERE status = 'processing' 
        AND id IN (
          SELECT batch_id FROM batch_items WHERE status = 'pending'
        )
    `).run();

    // Start checking for work
    tick();
  } catch (err) {
    console.error('[BatchQueue] Failed to initialize queue:', err);
  }
}

/**
 * Kick off processing if not already running.
 */
export function triggerQueue(): void {
  if (!isProcessing) {
    tick();
  }
}

/**
 * The main queue runner loop. Runs iteratively up to MAX_CONCURRENT.
 */
async function tick(): Promise<void> {
  if (activeCount >= MAX_CONCURRENT) {
    return;
  }

  isProcessing = true;
  const db = getDb();

  // Find next pending batch item
  const item = db.prepare(`
    SELECT * FROM batch_items 
    WHERE status = 'pending' 
    ORDER BY created_at ASC 
    LIMIT 1
  `).get() as BatchItem | undefined;

  if (!item) {
    isProcessing = false;
    return;
  }

  // Mark item as processing immediately
  db.prepare("UPDATE batch_items SET status = 'processing' WHERE id = ?").run(item.id);
  db.prepare("UPDATE batches SET status = 'processing' WHERE id = ?").run(item.batch_id);
  updateBatchStats(item.batch_id);

  activeCount++;

  // Trigger another check in case we are below concurrency limit
  tick();

  // Process the item
  try {
    await processItem(item);
  } catch (err) {
    console.error(`[BatchQueue] Error processing item ${item.id}:`, err);
    markItemFailed(item.id, item.batch_id, err instanceof Error ? err.message : String(err));
  } finally {
    activeCount--;
    tick();
  }
}

/**
 * Process a single batch item: build video props and launch render worker.
 */
async function processItem(item: BatchItem): Promise<void> {
  const db = getDb();

  // Find template by name
  let templateId: string | null = null;
  if (item.template) {
    const row = db.prepare('SELECT id FROM templates WHERE name = ? OR id = ?').get(item.template, item.template) as { id: string } | undefined;
    if (row) {
      templateId = row.id;
    }
  }

  // If template not found, use default template
  if (!templateId) {
    const defaultRow = db.prepare('SELECT id FROM templates WHERE is_default = 1').get() as { id: string } | undefined;
    if (defaultRow) {
      templateId = defaultRow.id;
    }
  }

  // Fetch actual template details
  let templateObj: any = null;
  if (templateId) {
    templateObj = db.prepare('SELECT * FROM templates WHERE id = ?').get(templateId);
  }

  // Build Video Theme
  const videoTheme: VideoTheme = {
    backgroundColor: templateObj?.background_color ?? '#1a1a2e',
    fontFamily: templateObj?.font_family ?? 'JetBrains Mono',
    fontSize: templateObj?.font_size ?? 16,
    accentColor: templateObj?.accent_color ?? '#7c3aed',
    textColor: templateObj?.text_color ?? '#ffffff',
    codeTheme: (templateObj?.code_theme as VideoTheme['codeTheme']) ?? 'github-dark',
    containerStyle: (templateObj?.container_style as VideoTheme['containerStyle']) ?? 'rounded',
    glowEffect: templateObj?.glow_effect !== 0,
    backgroundEffect: (templateObj?.background_effect as VideoTheme['backgroundEffect']) ?? 'none',
    backgroundGradient: templateObj?.background_gradient || undefined,
  };

  // Build Scene Configs
  const scenes: SceneConfig[] = [];
  
  // 1. Hook Scene
  scenes.push({
    id: `hook_${item.id}`,
    type: 'hook',
    title: 'Hook',
    text: item.hook || 'Coding Secret!',
    duration_frames: 90, // 3s
    animation: 'pop',
    transition: 'fade',
  });

  // 2. Code Scene
  scenes.push({
    id: `code_${item.id}`,
    type: 'code',
    title: item.title,
    code: item.code,
    language: item.language,
    output: item.output || undefined,
    duration_frames: 150, // 5s
    animation: 'fade',
    transition: 'slide',
  });

  // 3. Output Scene (if output exists)
  if (item.output && item.output.trim()) {
    scenes.push({
      id: `output_${item.id}`,
      type: 'output',
      title: 'Output',
      text: item.output,
      duration_frames: 120, // 4s
      animation: 'zoom',
      transition: 'fade',
    });
  }

  // 4. CTA Scene (if CTA exists)
  if (item.cta && item.cta.trim()) {
    scenes.push({
      id: `cta_${item.id}`,
      type: 'cta',
      title: 'CTA',
      text: item.cta,
      duration_frames: 90, // 3s
      animation: 'bounce',
      transition: 'none',
    });
  }

  const totalFrames = scenes.reduce((sum, s) => sum + s.duration_frames, 0);

  const host = `http://localhost:${process.env.PORT || 3001}`;

  const videoProps: VideoProps = {
    scenes,
    template: videoTheme,
    audioMode: 'none',
    backendUrl: host,
  };

  // File names: slugify the title or use item id
  const cleanTitle = item.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'video';
  const fileName = `${cleanTitle}_${item.id.substring(0, 8)}.mp4`;
  
  const batchDir = path.join(GENERATED_VIDEOS_BATCHES_DIR, item.batch_id);
  const outputPath = path.join(batchDir, fileName);
  const relativeVideoUrl = `/generated/videos/batches/${item.batch_id}/${fileName}`;

  // Spawn Worker Thread
  const isTS = __filename.endsWith('.ts');
  const workerFileName = isTS ? 'renderWorker.ts' : 'renderWorker.js';
  const workerPath = path.resolve(__dirname, '..', 'workers', workerFileName);
  const execArgv = isTS ? ['--import', 'tsx'] : [];

  return new Promise<void>((resolve, reject) => {
    const worker = new Worker(workerPath, {
      workerData: {
        outputPath,
        videoProps,
        format: 'mp4',
        resolution: '1080p',
        totalFrames,
      },
      execArgv,
    });

    worker.on('message', (message) => {
      if (message.type === 'progress') {
        // Option to print/broadcast progress
      } else if (message.type === 'success') {
        db.prepare(`
          UPDATE batch_items 
          SET status = 'completed', video_path = ? 
          WHERE id = ?
        `).run(relativeVideoUrl, item.id);
        
        updateBatchStats(item.batch_id);
        resolve();
      } else if (message.type === 'error') {
        reject(new Error(message.error));
      }
    });

    worker.on('error', (err) => {
      reject(err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

/**
 * Update stats and status of a batch.
 */
export function updateBatchStats(batchId: string): void {
  try {
    const db = getDb();
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(case when status = 'completed' then 1 else 0 end) as completed,
        SUM(case when status = 'failed' then 1 else 0 end) as failed,
        SUM(case when status = 'processing' then 1 else 0 end) as processing,
        SUM(case when status = 'pending' then 1 else 0 end) as pending
      FROM batch_items 
      WHERE batch_id = ?
    `).get(batchId) as { total: number; completed: number; failed: number; processing: number; pending: number };

    if (!stats) return;

    let batchStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
    
    if (stats.processing > 0 || (stats.completed + stats.failed > 0 && stats.pending > 0)) {
      batchStatus = 'processing';
    } else if (stats.completed + stats.failed === stats.total) {
      if (stats.failed === stats.total) {
        batchStatus = 'failed';
      } else {
        batchStatus = 'completed';
      }
    }

    db.prepare(`
      UPDATE batches 
      SET status = ?, completed_videos = ?, failed_videos = ?
      WHERE id = ?
    `).run(batchStatus, stats.completed, stats.failed, batchId);
  } catch (err) {
    console.error(`[BatchQueue] Failed to update stats for batch ${batchId}:`, err);
  }
}

/**
 * Update database to mark a batch item as failed.
 */
function markItemFailed(itemId: string, batchId: string, errorMsg: string): void {
  try {
    const db = getDb();
    db.prepare(`
      UPDATE batch_items 
      SET status = 'failed', error_message = ? 
      WHERE id = ?
    `).run(errorMsg, itemId);
    
    updateBatchStats(batchId);
  } catch (err) {
    console.error(`[BatchQueue] Failed to mark item ${itemId} as failed:`, err);
  }
}
