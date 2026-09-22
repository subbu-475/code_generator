// ============================================================
// Asset Generator — Generates visual assets (SVGs/diagrams/images) for scenes
// ============================================================

import type { PlannedScene, ImageProvider } from '../providers/types.js';
import path from 'node:path';
import fs from 'node:fs';

export async function generateAllAssets(
  scenes: PlannedScene[],
  imageProvider: ImageProvider,
  projectDir: string,
  onProgress?: (progress: number, msg: string) => void,
): Promise<void> {
  const assetsDir = path.join(projectDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const totalAssets = scenes.reduce((sum, s) => sum + (s.assets?.length || 0), 0);
  let processed = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    if (!scene.assets || scene.assets.length === 0) continue;

    for (let j = 0; j < scene.assets.length; j++) {
      const asset = scene.assets[j];
      processed++;
      onProgress?.(
        totalAssets > 0 ? processed / totalAssets : 1,
        `Generating asset ${processed}/${totalAssets} for scene ${i + 1}`,
      );

      const prompt = asset.prompt || `${scene.componentType} visualization`;
      const ext = asset.type === 'svg-diagram' ? 'svg' : 'png';
      const outputFilename = `${asset.id}.${ext}`;
      const outputPath = path.join(assetsDir, outputFilename);

      try {
        const result = await imageProvider.generateImage(prompt, {
          width: 1080,
          height: 1920,
          outputPath,
        });

        asset.path = result.path;
        asset.status = 'generated';

        // Provide URL for renderer
        const relativeAssetUrl = `/storage/projects/${path.basename(projectDir)}/assets/${outputFilename}`;

        // If the scene needs an image URL, assign it
        if (!scene.visualConfig.imageUrl) {
          scene.visualConfig.imageUrl = relativeAssetUrl;
        }
      } catch (err) {
        console.error(`[AssetGen] Failed to generate asset ${asset.id}:`, err);
        asset.status = 'failed';
      }
    }
  }

  onProgress?.(1, `Generated ${processed} assets`);
}
