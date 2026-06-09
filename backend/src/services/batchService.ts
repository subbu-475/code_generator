// ============================================================
// Batch Service — handles CRUD, file parsing, and ZIP archiving
// ============================================================

import { getDb } from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';
import * as archiver from 'archiver';
import { GENERATED_VIDEOS_BATCHES_DIR } from '../utils/paths.js';
import { triggerQueue, updateBatchStats } from './batchQueue.js';
import type { Batch, BatchItem, BatchProgress, ProgrammingLanguage } from '../types/sharedTypes.js';

const VALID_LANGUAGES = new Set(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']);

/**
 * Custom light CSV parser (ignores commas inside quotes and handles escaped quotes).
 */
function parseCSV(content: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' || char === '\r') {
      if (inQuotes) {
        currentLine += char;
      } else {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(currentLine);
        currentLine = '';
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];
  
  const headers = parseCSVLine(lines[0]);
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      record[header.trim().toLowerCase()] = values[idx] !== undefined ? values[idx] : '';
    });
    records.push(record);
  }
  
  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',') {
      if (inQuotes) {
        currentField += char;
      } else {
        result.push(currentField);
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }
  result.push(currentField);
  return result;
}

/**
 * Normalize columns case-insensitively and handle missing properties.
 */
function normalizeRow(row: Record<string, any>): {
  title: string;
  hook: string;
  code: string;
  output: string;
  cta: string;
  language: ProgrammingLanguage;
  template: string;
} {
  const norm: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    norm[k.trim().toLowerCase()] = v !== null && v !== undefined ? String(v) : '';
  }
  
  let lang = (norm.language || 'javascript').toLowerCase();
  if (!VALID_LANGUAGES.has(lang)) {
    lang = 'javascript';
  }

  return {
    title: norm.title || '',
    hook: norm.hook || '',
    code: norm.code || '',
    output: norm.output || '',
    cta: norm.cta || '',
    language: lang as ProgrammingLanguage,
    template: norm.template || '',
  };
}

/**
 * Main service logic for Batch upload, parsing and initial db insertion.
 */
export async function createBatchFromFile(filePath: string, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();
  let rawRows: Record<string, any>[] = [];

  // 1. Parse based on file type
  if (ext === '.csv') {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    rawRows = parseCSV(fileContent);
  } else if (ext === '.json') {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    rawRows = Array.isArray(parsed) ? parsed : [parsed];
  } else if (ext === '.xlsx') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    rawRows = XLSX.utils.sheet_to_json(worksheet);
  } else {
    throw new Error('Unsupported file extension. Only CSV, XLSX, and JSON are supported.');
  }

  if (rawRows.length === 0) {
    throw new Error('Uploaded file contains no records.');
  }

  const db = getDb();
  const batchId = uuidv4();
  const now = new Date().toISOString();
  
  // Set up the batch structure
  const name = path.basename(originalName, ext);

  const executeTransaction = db.transaction(() => {
    // Insert Batch
    db.prepare(`
      INSERT INTO batches (id, name, status, total_videos, completed_videos, failed_videos, created_at)
      VALUES (?, ?, 'pending', ?, 0, 0, ?)
    `).run(batchId, name, rawRows.length, now);

    // Insert Batch Items
    const insertItem = db.prepare(`
      INSERT INTO batch_items (id, batch_id, title, hook, code, output, cta, language, template, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const rawRow of rawRows) {
      const itemId = uuidv4();
      const row = normalizeRow(rawRow);
      
      let status: 'pending' | 'failed' = 'pending';
      let error_message: string | null = null;

      // Validate required fields
      if (!row.title.trim()) {
        status = 'failed';
        error_message = 'Title is required';
      } else if (!row.code.trim()) {
        status = 'failed';
        error_message = 'Code snippet is required';
      }

      insertItem.run(
        itemId,
        batchId,
        row.title || 'Unnamed Video',
        row.hook,
        row.code,
        row.output,
        row.cta,
        row.language,
        row.template,
        status,
        error_message,
        now
      );
    }
  });

  executeTransaction();
  
  // Update stats/status of the batch initially
  updateBatchStats(batchId);

  // Trigger queue rendering in background
  triggerQueue();

  return batchId;
}

/**
 * Fetch all batches.
 */
export function getAllBatches(): Batch[] {
  const db = getDb();
  return db.prepare('SELECT * FROM batches ORDER BY created_at DESC').all() as Batch[];
}

/**
 * Get full batch details including all items.
 */
export function getBatchWithItems(batchId: string): (Batch & { items: BatchItem[] }) | null {
  const db = getDb();
  const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId) as Batch | undefined;
  if (!batch) return null;

  const items = db.prepare('SELECT * FROM batch_items WHERE batch_id = ? ORDER BY created_at ASC').all(batchId) as BatchItem[];
  return { ...batch, items };
}

/**
 * Get batch progress statistics.
 */
export function getBatchProgress(batchId: string): BatchProgress | null {
  const db = getDb();
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(case when status = 'completed' then 1 else 0 end) as completed,
      SUM(case when status = 'failed' then 1 else 0 end) as failed
    FROM batch_items 
    WHERE batch_id = ?
  `).get(batchId) as { total: number; completed: number; failed: number } | undefined;

  if (!stats || stats.total === 0) return null;

  const remaining = stats.total - stats.completed - stats.failed;
  const percentage = Math.round((stats.completed / stats.total) * 100);

  return {
    total: stats.total,
    completed: stats.completed,
    failed: stats.failed,
    remaining,
    percentage,
  };
}

/**
 * Retry failed items in a specific batch.
 */
export function retryBatch(batchId: string): boolean {
  const db = getDb();
  
  const result = db.prepare(`
    UPDATE batch_items 
    SET status = 'pending', error_message = null 
    WHERE batch_id = ? AND status = 'failed'
  `).run(batchId);

  if (result.changes === 0) return false;

  db.prepare("UPDATE batches SET status = 'pending' WHERE id = ?").run(batchId);
  updateBatchStats(batchId);

  // Trigger queue to resume processing
  triggerQueue();

  return true;
}

/**
 * Delete a batch (clean folders + remove from db).
 */
export function deleteBatch(batchId: string): boolean {
  const db = getDb();

  // Delete batch folder
  const batchDir = path.join(GENERATED_VIDEOS_BATCHES_DIR, batchId);
  if (fs.existsSync(batchDir)) {
    try {
      fs.rmSync(batchDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`[BatchService] Failed to delete directory ${batchDir}:`, err);
    }
  }

  // Delete DB record (cascade deletes items)
  const result = db.prepare('DELETE FROM batches WHERE id = ?').run(batchId);
  return result.changes > 0;
}

/**
 * Streams a ZIP file containing all completed MP4 files inside the batch directory.
 */
export function generateBatchZipStream(batchId: string, writeStream: NodeJS.WritableStream): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const archive = (archiver as any)('zip', { zlib: { level: 9 } });

    archive.on('error', (err: Error) => {
      reject(err);
    });

    archive.on('end', () => {
      resolve();
    });

    archive.pipe(writeStream);

    const batchDir = path.join(GENERATED_VIDEOS_BATCHES_DIR, batchId);
    
    // Add directory content, only including .mp4 files
    if (fs.existsSync(batchDir)) {
      archive.glob('*.mp4', { cwd: batchDir });
    }

    archive.finalize();
  });
}
