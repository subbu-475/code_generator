// ============================================================
// Voice Provider — Edge TTS wrapper with provider interface
// ============================================================

import type { VoiceProvider, VoiceOptions, VoiceResult } from './types.js';
import { generateAudio, getAudioDuration } from '../services/audioService.js';
import fs from 'node:fs';

export class EdgeTTSVoiceProvider implements VoiceProvider {
  name = 'edge-tts';

  async generateVoice(text: string, options: VoiceOptions): Promise<VoiceResult> {
    const voice = options.voice || 'en-US-ChristopherNeural';
    const outputFilename = options.outputPath.split(/[\\/]/).pop() || `${options.sceneId}.mp3`;

    const result = await generateAudio(text, voice, outputFilename);

    return {
      sceneId: options.sceneId,
      audioPath: result.audioPath,
      audioUrl: result.audioUrl,
      durationSeconds: result.durationSeconds,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const { execSync } = await import('node:child_process');
      execSync('python -m edge_tts --version', { stdio: 'pipe', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
