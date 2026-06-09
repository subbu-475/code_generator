// ============================================================
// Render Worker — Worker thread for background video rendering
// ============================================================

import { parentPort, workerData } from 'node:worker_threads';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 3 levels up from backend/src/workers/ (or backend/dist/workers/)
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const RESOLUTION_CONFIG = {
  '720p': { width: 720, height: 1280 },
  '1080p': { width: 1080, height: 1920 },
  '4k': { width: 2160, height: 3840 },
} as const;

const FPS = 30;

async function executeRender() {
  if (!parentPort) {
    throw new Error('This script must be run as a worker thread.');
  }

  const { outputPath, videoProps, format, resolution, totalFrames } = workerData;
  const resConfig = RESOLUTION_CONFIG[resolution as keyof typeof RESOLUTION_CONFIG] || RESOLUTION_CONFIG['1080p'];

  try {
    // 1. Ensure output folder exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 2. Dynamically import Remotion packages
    let bundle: typeof import('@remotion/bundler')['bundle'];
    let renderMedia: typeof import('@remotion/renderer')['renderMedia'];

    try {
      const bundlerMod = await import('@remotion/bundler');
      bundle = bundlerMod.bundle;
    } catch {
      throw new Error(
        'Remotion bundler is not installed. Run: npm install @remotion/bundler @remotion/renderer @remotion/cli'
      );
    }

    try {
      const rendererMod = await import('@remotion/renderer');
      renderMedia = rendererMod.renderMedia;
    } catch {
      throw new Error('Remotion renderer is not installed. Run: npm install @remotion/renderer');
    }

    // 3. Bundle the Remotion entrypoint
    parentPort.postMessage({ type: 'progress', progress: 5, message: 'Bundling Remotion composition...' });

    const rendererEntry = path.resolve(PROJECT_ROOT, 'renderer', 'src', 'index.ts');

    if (!fs.existsSync(rendererEntry)) {
      throw new Error(`Renderer entry point not found at ${rendererEntry}. Ensure the renderer workspace is set up.`);
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
        parentPort!.postMessage({
          type: 'progress',
          progress: Math.round(progress * 20),
          message: `Bundling: ${Math.round(progress * 100)}%`,
        });
      },
    });

    // 4. Render the composition to video file
    parentPort.postMessage({ type: 'progress', progress: 20, message: 'Starting render...' });

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
        parentPort!.postMessage({
          type: 'progress',
          progress: Math.min(overall, 98),
          message: `Rendering: ${Math.round(progress * 100)}%`,
        });
      },
    });

    // 5. Notify parent of success
    parentPort.postMessage({ type: 'success', outputPath });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    parentPort.postMessage({ type: 'error', error: errorMsg });
  }
}

executeRender();
