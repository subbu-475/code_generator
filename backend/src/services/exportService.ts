// ============================================================
// Export service — manage export records
// ============================================================

import { getDb } from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import type { ExportRecord, ExportFormat, ExportResolution } from '../types/sharedTypes.js';

/**
 * Create a new export record.
 */
export function createExportRecord(input: {
  projectId: string;
  filePath: string;
  format: ExportFormat;
  resolution: ExportResolution;
}): string {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO exports (id, project_id, file_path, format, resolution, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, input.projectId, input.filePath, input.format, input.resolution, now);

  return id;
}

/**
 * Update an export record after rendering completes.
 */
export function updateExportRecord(
  id: string,
  updates: { fileSize?: number; durationSeconds?: number },
): void {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.fileSize !== undefined) {
    fields.push('file_size = ?');
    values.push(updates.fileSize);
  }
  if (updates.durationSeconds !== undefined) {
    fields.push('duration_seconds = ?');
    values.push(updates.durationSeconds);
  }

  if (fields.length === 0) return;

  values.push(id);
  db.prepare(`UPDATE exports SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

/**
 * Get all export records, newest first.
 */
export function getAllExports(): ExportRecord[] {
  const db = getDb();
  return db.prepare('SELECT * FROM exports ORDER BY created_at DESC').all() as ExportRecord[];
}

/**
 * Get exports for a specific project.
 */
export function getExportsByProjectId(projectId: string): ExportRecord[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM exports WHERE project_id = ? ORDER BY created_at DESC')
    .all(projectId) as ExportRecord[];
}

/**
 * Get a single export record by ID.
 */
export function getExportById(id: string): ExportRecord | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM exports WHERE id = ?').get(id) as ExportRecord | undefined;
}

/**
 * Delete an export record and its associated file.
 */
export function deleteExport(id: string): boolean {
  const db = getDb();
  const record = getExportById(id);

  if (!record) return false;

  // Delete the file from disk if it exists
  if (record.file_path && fs.existsSync(record.file_path)) {
    try {
      fs.unlinkSync(record.file_path);
    } catch (err) {
      console.warn(`[Export] Failed to delete file ${record.file_path}:`, err);
    }
  }

  const result = db.prepare('DELETE FROM exports WHERE id = ?').run(id);
  return result.changes > 0;
}
