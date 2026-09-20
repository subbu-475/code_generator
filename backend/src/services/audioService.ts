// ============================================================
// Audio service — Piper TTS integration
// ============================================================

import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { GENERATED_AUDIO_DIR, ASSETS_PIPER_DIR } from '../utils/paths.js';

let _piperAvailable: boolean | null = null;

/**
 * Check whether piper is available on the system or in assets/piper/.
 */
export function checkPiper(): boolean {
  if (_piperAvailable !== null) return _piperAvailable;

  // Try system-wide piper
  try {
    execSync('piper --version', { stdio: 'pipe', timeout: 5000 });
    _piperAvailable = true;
    return true;
  } catch {
    // ignore
  }

  // Try local piper in assets/piper/
  const localPiper = getPiperPath();
  if (localPiper && fs.existsSync(localPiper)) {
    try {
      execSync(`"${localPiper}" --version`, { stdio: 'pipe', timeout: 5000 });
      _piperAvailable = true;
      return true;
    } catch {
      // ignore
    }
  }

  _piperAvailable = false;
  return false;
}

/**
 * Get the piper executable path (system or local).
 */
function getPiperPath(): string {
  const isWindows = process.platform === 'win32';
  const exeName = isWindows ? 'piper.exe' : 'piper';

  // Check local assets first
  const localPath = path.join(ASSETS_PIPER_DIR, exeName);
  if (fs.existsSync(localPath)) return localPath;

  // Fall back to system PATH
  return exeName;
}

/**
 * Find a voice model in assets/piper/ directory.
 */
function findVoiceModel(modelName?: string): string | null {
  const defaultModel = modelName ?? 'en_US-lessac-medium';

  // Search for .onnx model files
  if (!fs.existsSync(ASSETS_PIPER_DIR)) return null;

  const files = fs.readdirSync(ASSETS_PIPER_DIR);
  const modelFile = files.find(
    (f) => f.includes(defaultModel) && f.endsWith('.onnx'),
  );

  if (modelFile) return path.join(ASSETS_PIPER_DIR, modelFile);

  // Try any .onnx file
  const anyModel = files.find((f) => f.endsWith('.onnx'));
  if (anyModel) return path.join(ASSETS_PIPER_DIR, anyModel);

  return null;
}

export interface AudioResult {
  id: string;
  audioPath: string;
  audioUrl: string;
  durationSeconds: number;
}

/**
 * Accurately get audio file duration in seconds using ffprobe.
 */
export function getAudioDuration(filePath: string): number {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 5000,
    }).trim();
    const parsed = parseFloat(out);
    if (!isNaN(parsed) && parsed > 0) {
      return Math.round(parsed * 100) / 100;
    }
  } catch {
    // ffprobe failed or timed out, fall back
  }

  try {
    const stats = fs.statSync(filePath);
    if (filePath.endsWith('.wav')) {
      return Math.round(Math.max(0.5, (stats.size - 44) / 44100) * 100) / 100;
    }
    // Approximate for 128kbps mp3 (~16000 bytes/sec)
    return Math.round(Math.max(0.5, stats.size / 16000) * 100) / 100;
  } catch {
    return 1.0;
  }
}

/**
 * Generate voice audio from text using Edge TTS (default) or Piper TTS.
 */
export async function generateAudio(
  text: string,
  voiceModel?: string,
  outputFilename?: string,
): Promise<AudioResult> {
  const isTamil = /[\u0B80-\u0BFF]/.test(text) || voiceModel?.includes('ta-IN');
  const isEdgeTts = isTamil || voiceModel?.includes('Neural') || voiceModel?.includes('en-US') || !checkPiper();
  if (isEdgeTts) {
    const id = uuidv4();
    const fileName = outputFilename ?? `${id}.mp3`;
    const outputPath = path.join(GENERATED_AUDIO_DIR, fileName);
    // Default to clean English developer neural voice
    const selectedVoice = voiceModel || (isTamil ? 'ta-IN-ValluvarNeural' : 'en-US-ChristopherNeural');
    const rate = isTamil ? '--rate=+18%' : '--rate=+10%';

    if (outputFilename && fs.existsSync(outputPath)) {
      const durationSeconds = getAudioDuration(outputPath);
      return {
        id,
        audioPath: outputPath,
        audioUrl: `/generated/audio/${fileName}`,
        durationSeconds,
      };
    }

    const tempTextPath = path.join(GENERATED_AUDIO_DIR, `temp_${id}.txt`);
    fs.writeFileSync(tempTextPath, text, 'utf-8');

    return new Promise<AudioResult>((resolve, reject) => {
      const proc = spawn('python', [
        '-m', 'edge_tts',
        '--voice', selectedVoice,
        rate,
        '-f', tempTextPath,
        '--write-media', outputPath,
      ], { shell: false });

      let stderr = '';
      proc.stderr?.on('data', (d) => { stderr += d.toString(); });

      proc.on('close', (code) => {
        try { fs.unlinkSync(tempTextPath); } catch {}
        if (code === 0 && fs.existsSync(outputPath)) {
          const durationSeconds = getAudioDuration(outputPath);
          resolve({
            id,
            audioPath: outputPath,
            audioUrl: `/generated/audio/${fileName}`,
            durationSeconds,
          });
        } else {
          reject(new Error(`edge-tts failed (code ${code}): ${stderr}`));
        }
      });
      proc.on('error', (err) => {
        try { fs.unlinkSync(tempTextPath); } catch {}
        reject(err);
      });
    });
  }

  if (!checkPiper()) {
    throw new Error('Piper TTS is not available. Install piper or place it in assets/piper/');
  }

  const model = findVoiceModel(voiceModel);
  if (!model) {
    throw new Error('No voice model found. Place a .onnx model file in assets/piper/');
  }

  const id = uuidv4();
  const fileName = outputFilename ?? `${id}.wav`;
  const outputPath = path.join(GENERATED_AUDIO_DIR, fileName);
  const piperPath = getPiperPath();

  // Cache hit — return existing file without re-running Piper
  if (outputFilename && fs.existsSync(outputPath)) {
    const durationSeconds = getAudioDuration(outputPath);
    return {
      id,
      audioPath: outputPath,
      audioUrl: `/generated/audio/${fileName}`,
      durationSeconds,
    };
  }


  return new Promise<AudioResult>((resolve, reject) => {
    const args = [
      '--model', model,
      '--output_file', outputPath,
    ];

    const proc = spawn(piperPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stderr = '';

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    // Write text to stdin
    proc.stdin.write(text);
    proc.stdin.end();

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Piper exited with code ${code}: ${stderr}`));
        return;
      }

      if (!fs.existsSync(outputPath)) {
        reject(new Error('Piper did not produce an output file'));
        return;
      }

      const durationSeconds = getAudioDuration(outputPath);

      resolve({
        id,
        audioPath: outputPath,
        audioUrl: `/generated/audio/${fileName}`,
        durationSeconds,
      });
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to start Piper: ${err.message}`));
    });
  });
}
