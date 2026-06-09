// ============================================================
// Centralized path configuration for the backend
// ============================================================

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Project root: codegen/ directory */
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

/** Backend source root */
export const BACKEND_ROOT = path.resolve(PROJECT_ROOT, 'backend');

/** Shared types directory */
export const SHARED_DIR = path.resolve(PROJECT_ROOT, 'shared');

/** Database directory and file */
export const DATABASE_DIR = path.resolve(PROJECT_ROOT, 'database');
export const DATABASE_PATH = path.resolve(DATABASE_DIR, 'codeshorts.db');

/** Generated output directories */
export const GENERATED_DIR = path.resolve(PROJECT_ROOT, 'generated');
export const GENERATED_VIDEOS_DIR = path.resolve(GENERATED_DIR, 'videos');
export const GENERATED_AUDIO_DIR = path.resolve(GENERATED_DIR, 'audio');
export const GENERATED_CODE_IMAGES_DIR = path.resolve(GENERATED_DIR, 'code-images');
export const GENERATED_VIDEOS_BATCHES_DIR = path.resolve(GENERATED_VIDEOS_DIR, 'batches');

/** Assets directories */
export const ASSETS_DIR = path.resolve(PROJECT_ROOT, 'assets');
export const ASSETS_FONTS_DIR = path.resolve(ASSETS_DIR, 'fonts');
export const ASSETS_MUSIC_DIR = path.resolve(ASSETS_DIR, 'music');
export const ASSETS_PIPER_DIR = path.resolve(ASSETS_DIR, 'piper');

/**
 * Ensure all required directories exist.
 * Called once at server startup.
 */
export function ensureDirectories(): void {
  const dirs = [
    DATABASE_DIR,
    GENERATED_DIR,
    GENERATED_VIDEOS_DIR,
    GENERATED_VIDEOS_BATCHES_DIR,
    GENERATED_AUDIO_DIR,
    GENERATED_CODE_IMAGES_DIR,
    ASSETS_DIR,
    ASSETS_FONTS_DIR,
    ASSETS_MUSIC_DIR,
    ASSETS_PIPER_DIR,
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
