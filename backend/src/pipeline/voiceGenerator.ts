// ============================================================
// Voice Generator — Generates narration audio for all scenes
// ============================================================

import type { PlannedScene, VoiceResult, VoiceProvider } from '../providers/types.js';
import path from 'node:path';

export async function generateAllVoices(
  scenes: PlannedScene[],
  voiceProvider: VoiceProvider,
  projectDir: string,
  onProgress?: (progress: number, msg: string) => void,
): Promise<VoiceResult[]> {
  const results: VoiceResult[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const narration = scene.narration.trim();

    if (!narration) {
      results.push({
        sceneId: scene.id,
        audioPath: '',
        audioUrl: '',
        durationSeconds: 0,
      });
      continue;
    }

    onProgress?.(i / scenes.length, `Generating voice for scene ${i + 1}/${scenes.length}`);

    try {
      const outputFilename = `voice_${scene.id}.mp3`;
      const outputPath = path.join(projectDir, 'audio', outputFilename);

      const result = await voiceProvider.generateVoice(narration, {
        sceneId: scene.id,
        outputPath,
      });

      results.push(result);
    } catch (err) {
      console.error(`[VoiceGen] Failed for scene ${scene.id}:`, err);
      results.push({
        sceneId: scene.id,
        audioPath: '',
        audioUrl: '',
        durationSeconds: 0,
      });
    }
  }

  onProgress?.(1, `Voice generation complete: ${results.filter(r => r.durationSeconds > 0).length}/${scenes.length} clips`);
  return results;
}
