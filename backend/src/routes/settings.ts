// ============================================================
// Settings router
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../database/connection.js';
import { validate } from '../middleware/validation.js';

const router = Router();

const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  default_font: z.string().optional(),
  default_animation: z.enum(['fade', 'zoom', 'slide', 'pop', 'bounce']).optional(),
  default_music: z.string().optional(),
  default_resolution: z.enum(['720p', '1080p', '4k']).optional(),
});

// GET /api/settings - Fetch all settings
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
    
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings - Update settings
router.put('/', validate(SettingsSchema), (req, res, next) => {
  try {
    const db = getDb();
    const updates = req.body;

    const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const runUpserts = db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          upsert.run(key, String(value));
        }
      }
    });

    runUpserts();

    // Fetch and return updated settings
    const rows = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
