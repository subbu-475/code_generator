// ============================================================
// Database migrations — schema creation & seed data
// ============================================================

import { getDb } from './connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Run all migrations: create tables, seed defaults.
 * Idempotent — safe to call on every startup.
 */
export function runMigrations(): void {
  const db = getDb();

  // ---- Create tables -----------------------------------------------

  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      background_color TEXT NOT NULL DEFAULT '#1a1a2e',
      font_family     TEXT NOT NULL DEFAULT 'JetBrains Mono',
      font_size       INTEGER NOT NULL DEFAULT 16,
      accent_color    TEXT NOT NULL DEFAULT '#7c3aed',
      text_color      TEXT NOT NULL DEFAULT '#ffffff',
      animation_style TEXT NOT NULL DEFAULT 'fade',
      transition_style TEXT NOT NULL DEFAULT 'fade',
      code_theme      TEXT NOT NULL DEFAULT 'github-dark',
      custom_css      TEXT,
      is_default      INTEGER NOT NULL DEFAULT 0,
      background_effect TEXT NOT NULL DEFAULT 'none',
      background_gradient TEXT DEFAULT NULL,
      container_style TEXT NOT NULL DEFAULT 'rounded',
      glow_effect     INTEGER NOT NULL DEFAULT 1,
      hook_font_size  INTEGER NOT NULL DEFAULT 64,
      hook_color      TEXT NOT NULL DEFAULT '#ffffff',
      code_font_size  INTEGER NOT NULL DEFAULT 16,
      code_color      TEXT NOT NULL DEFAULT '#ffffff',
      explanation_font_size INTEGER NOT NULL DEFAULT 26,
      explanation_color TEXT NOT NULL DEFAULT '#ffffff',
      cta_font_size   INTEGER NOT NULL DEFAULT 24,
      cta_color       TEXT NOT NULL DEFAULT '#ffffff',
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  try {
    db.exec("ALTER TABLE templates ADD COLUMN background_effect TEXT DEFAULT 'none'");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN background_gradient TEXT DEFAULT NULL");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN container_style TEXT DEFAULT 'rounded'");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN glow_effect INTEGER DEFAULT 1");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN hook_font_size INTEGER DEFAULT 64");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN hook_color TEXT DEFAULT '#ffffff'");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN code_font_size INTEGER DEFAULT 16");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN code_color TEXT DEFAULT '#ffffff'");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN explanation_font_size INTEGER DEFAULT 26");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN explanation_color TEXT DEFAULT '#ffffff'");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN cta_font_size INTEGER DEFAULT 24");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE templates ADD COLUMN cta_color TEXT DEFAULT '#ffffff'");
  } catch (err) {
    // Column already exists
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      language        TEXT NOT NULL,
      hook_text       TEXT NOT NULL DEFAULT '',
      code_snippets   TEXT NOT NULL DEFAULT '[]',
      output          TEXT NOT NULL DEFAULT '',
      cta             TEXT NOT NULL DEFAULT '',
      template_id     TEXT,
      scene_config    TEXT NOT NULL DEFAULT '[]',
      audio_mode      TEXT NOT NULL DEFAULT 'none',
      music_file      TEXT,
      status          TEXT NOT NULL DEFAULT 'draft',
      explanation_template TEXT NOT NULL DEFAULT 'none',
      sfx_whoosh      INTEGER NOT NULL DEFAULT 1,
      sfx_typing      INTEGER NOT NULL DEFAULT 1,
      sfx_achievement INTEGER NOT NULL DEFAULT 1,
      tts_explanation INTEGER NOT NULL DEFAULT 1,
      tts_output      INTEGER NOT NULL DEFAULT 1,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
    );
  `);

  try {
    db.exec("ALTER TABLE projects ADD COLUMN explanation_template TEXT DEFAULT 'none'");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE projects ADD COLUMN sfx_whoosh INTEGER DEFAULT 1");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE projects ADD COLUMN sfx_typing INTEGER DEFAULT 1");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE projects ADD COLUMN sfx_achievement INTEGER DEFAULT 1");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE projects ADD COLUMN tts_explanation INTEGER DEFAULT 1");
  } catch (err) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE projects ADD COLUMN tts_output INTEGER DEFAULT 1");
  } catch (err) {
    // Column already exists
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS scenes (
      id              TEXT PRIMARY KEY,
      project_id      TEXT NOT NULL,
      scene_order     INTEGER NOT NULL,
      type            TEXT NOT NULL,
      title           TEXT NOT NULL DEFAULT '',
      content         TEXT NOT NULL DEFAULT '{}',
      duration_frames INTEGER NOT NULL DEFAULT 90,
      animation       TEXT NOT NULL DEFAULT 'fade',
      transition_     TEXT NOT NULL DEFAULT 'fade',
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS exports (
      id               TEXT PRIMARY KEY,
      project_id       TEXT NOT NULL,
      file_path        TEXT NOT NULL,
      format           TEXT NOT NULL DEFAULT 'mp4',
      resolution       TEXT NOT NULL DEFAULT '1080p',
      file_size        INTEGER,
      duration_seconds REAL,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS batches (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      status           TEXT NOT NULL DEFAULT 'pending',
      total_videos     INTEGER NOT NULL DEFAULT 0,
      completed_videos INTEGER NOT NULL DEFAULT 0,
      failed_videos    INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS batch_items (
      id               TEXT PRIMARY KEY,
      batch_id         TEXT NOT NULL,
      title            TEXT NOT NULL,
      hook             TEXT NOT NULL DEFAULT '',
      code             TEXT NOT NULL DEFAULT '',
      output           TEXT NOT NULL DEFAULT '',
      cta              TEXT NOT NULL DEFAULT '',
      language         TEXT NOT NULL DEFAULT 'javascript',
      template         TEXT NOT NULL DEFAULT '',
      status           TEXT NOT NULL DEFAULT 'pending',
      video_path       TEXT,
      error_message    TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
    );
  `);

  // ---- Indexes -------------------------------------------------------

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
    CREATE INDEX IF NOT EXISTS idx_exports_project_id ON exports(project_id);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
    CREATE INDEX IF NOT EXISTS idx_batch_items_batch_id ON batch_items(batch_id);
    CREATE INDEX IF NOT EXISTS idx_batch_items_status ON batch_items(status);
  `);

  // ---- Seed default templates ----------------------------------------

  seedDefaultTemplates();

  // ---- Seed default settings -----------------------------------------

  seedDefaultSettings();

  console.log('[Database] Migrations complete');
}

// ------------------------------------------------------------------
// Seed helpers
// ------------------------------------------------------------------

function seedDefaultTemplates(): void {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) AS cnt FROM templates WHERE is_default = 1').get() as { cnt: number };

  if (count.cnt > 0) return; // already seeded

  const insert = db.prepare(`
    INSERT INTO templates (id, name, background_color, font_family, font_size, accent_color, text_color, animation_style, transition_style, code_theme, background_effect, is_default, background_gradient, container_style, glow_effect, hook_font_size, hook_color, code_font_size, code_color, explanation_font_size, explanation_color, cta_font_size, cta_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaults = [
    {
      name: 'Coding Dark',
      bg: '#1a1a2e',
      accent: '#7c3aed',
      font: 'JetBrains Mono',
      fontSize: 16,
      textColor: '#ffffff',
      animation: 'fade',
      transition: 'fade',
      codeTheme: 'github-dark',
      bgEffect: 'none',
      bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      containerStyle: 'rounded',
      glowEffect: 1,
    },
    {
      name: 'VSCode Theme',
      bg: '#1e1e1e',
      accent: '#007acc',
      font: 'Consolas',
      fontSize: 16,
      textColor: '#ffffff',
      animation: 'slide',
      transition: 'slide',
      codeTheme: 'vitesse-dark',
      bgEffect: 'grid',
      bgGradient: 'linear-gradient(135deg, #1e1e1e 0%, #252526 100%)',
      containerStyle: 'sharp',
      glowEffect: 0,
    },
    {
      name: 'Neon Blue',
      bg: '#0a0a2e',
      accent: '#00d4ff',
      font: 'Fira Code',
      fontSize: 16,
      textColor: '#ffffff',
      animation: 'zoom',
      transition: 'fade',
      codeTheme: 'tokyo-night',
      bgEffect: 'particles',
      bgGradient: 'linear-gradient(135deg, #0a0a2e 0%, #000033 100%)',
      containerStyle: 'floating',
      glowEffect: 1,
    },
    {
      name: 'Cyberpunk',
      bg: '#0d0221',
      accent: '#ff2079',
      font: 'Space Mono',
      fontSize: 16,
      textColor: '#ffffff',
      animation: 'pop',
      transition: 'zoom',
      codeTheme: 'dracula',
      bgEffect: 'matrix',
      bgGradient: 'linear-gradient(135deg, #0d0221 0%, #150050 100%)',
      containerStyle: 'floating',
      glowEffect: 1,
    },
    {
      name: 'Minimal',
      bg: '#fafafa',
      accent: '#333333',
      font: 'SF Mono',
      fontSize: 16,
      textColor: '#1a1a1a',
      animation: 'fade',
      transition: 'none',
      codeTheme: 'github-dark',
      bgEffect: 'none',
      bgGradient: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
      containerStyle: 'rounded',
      glowEffect: 0,
    },
  ];

  const insertMany = db.transaction(() => {
    for (const t of defaults) {
      insert.run(
        uuidv4(),
        t.name,
        t.bg,
        t.font,
        t.fontSize,
        t.accent,
        t.textColor,
        t.animation,
        t.transition,
        t.codeTheme,
        t.bgEffect,
        t.bgGradient,
        t.containerStyle,
        t.glowEffect,
        64,          // hook_font_size
        t.textColor, // hook_color
        16,          // code_font_size
        t.textColor, // code_color
        26,          // explanation_font_size
        t.textColor, // explanation_color
        24,          // cta_font_size
        t.textColor, // cta_color
      );
    }
  });

  insertMany();
  console.log('[Database] Seeded 5 default templates');
}

function seedDefaultSettings(): void {
  const db = getDb();

  const defaults: Record<string, string> = {
    theme: 'dark',
    default_font: 'JetBrains Mono',
    default_animation: 'fade',
    default_music: '',
    default_resolution: '1080p',
  };

  const upsert = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO NOTHING
  `);

  const seedAll = db.transaction(() => {
    for (const [key, value] of Object.entries(defaults)) {
      upsert.run(key, value);
    }
  });

  seedAll();
}
