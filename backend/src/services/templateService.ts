// ============================================================
// Template service — CRUD operations for templates
// ============================================================

import { getDb } from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import type { Template, TemplateInput } from '../types/sharedTypes.js';

/**
 * Get all templates, ordered by is_default DESC then name ASC.
 */
export function getAllTemplates(): Template[] {
  const db = getDb();
  return db.prepare('SELECT * FROM templates ORDER BY is_default DESC, name ASC').all() as Template[];
}

/**
 * Get a template by ID.
 */
export function getTemplateById(id: string): Template | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as Template | undefined;
}

/**
 * Create a new custom template.
 */
export function createTemplate(input: TemplateInput): Template {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO templates (id, name, background_color, font_family, font_size, accent_color, text_color, animation_style, transition_style, code_theme, custom_css, is_default, background_effect, background_gradient, container_style, glow_effect, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.name,
    input.background_color ?? '#1a1a2e',
    input.font_family ?? 'JetBrains Mono',
    input.font_size ?? 16,
    input.accent_color ?? '#7c3aed',
    input.text_color ?? '#ffffff',
    input.animation_style ?? 'fade',
    input.transition_style ?? 'fade',
    input.code_theme ?? 'github-dark',
    input.custom_css ?? null,
    input.background_effect ?? 'none',
    input.background_gradient ?? null,
    input.container_style ?? 'rounded',
    input.glow_effect === false ? 0 : 1,
    now,
  );

  return getTemplateById(id)!;
}

/**
 * Update an existing template.
 */
export function updateTemplate(id: string, input: Partial<TemplateInput>): Template | undefined {
  const db = getDb();
  const existing = getTemplateById(id);
  if (!existing) return undefined;

  const fields: string[] = [];
  const values: unknown[] = [];

  const mappable: Array<[keyof TemplateInput, string]> = [
    ['name', 'name'],
    ['background_color', 'background_color'],
    ['font_family', 'font_family'],
    ['font_size', 'font_size'],
    ['accent_color', 'accent_color'],
    ['text_color', 'text_color'],
    ['animation_style', 'animation_style'],
    ['transition_style', 'transition_style'],
    ['code_theme', 'code_theme'],
    ['custom_css', 'custom_css'],
    ['background_effect', 'background_effect'],
    ['background_gradient', 'background_gradient'],
    ['container_style', 'container_style'],
    ['glow_effect', 'glow_effect'],
  ];

  for (const [inputKey, dbCol] of mappable) {
    if (input[inputKey] !== undefined) {
      fields.push(`${dbCol} = ?`);
      let val = input[inputKey];
      if (inputKey === 'glow_effect') {
        val = val === false ? 0 : 1;
      }
      values.push(val);
    }
  }

  if (fields.length === 0) return existing;

  values.push(id);
  db.prepare(`UPDATE templates SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return getTemplateById(id);
}

/**
 * Delete a template. Prevents deletion of built-in defaults.
 */
export function deleteTemplate(id: string): boolean {
  const db = getDb();
  const existing = getTemplateById(id);

  if (!existing) return false;
  if (existing.is_default) {
    throw new Error('Cannot delete a default template');
  }

  const result = db.prepare('DELETE FROM templates WHERE id = ? AND is_default = 0').run(id);
  return result.changes > 0;
}
