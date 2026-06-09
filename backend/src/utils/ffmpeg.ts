// ============================================================
// FFmpeg availability check
// ============================================================

import { execSync } from 'node:child_process';

let _ffmpegAvailable: boolean | null = null;

/**
 * Check whether FFmpeg is available on the system PATH.
 * Result is cached after the first call.
 */
export function checkFfmpeg(): boolean {
  if (_ffmpegAvailable !== null) return _ffmpegAvailable;

  try {
    execSync('ffmpeg -version', { stdio: 'pipe', timeout: 5000 });
    _ffmpegAvailable = true;
  } catch {
    _ffmpegAvailable = false;
  }

  return _ffmpegAvailable;
}

/**
 * Get FFmpeg version string, or null if not available.
 */
export function getFfmpegVersion(): string | null {
  try {
    const output = execSync('ffmpeg -version', { stdio: 'pipe', timeout: 5000 }).toString();
    const match = output.match(/ffmpeg version (\S+)/);
    return match ? match[1] : 'unknown';
  } catch {
    return null;
  }
}
