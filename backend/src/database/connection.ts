// ============================================================
// SQLite database connection — singleton with better-sqlite3
// ============================================================

import Database from 'better-sqlite3';
import { DATABASE_PATH, DATABASE_DIR } from '../utils/paths.js';
import fs from 'node:fs';

let db: Database.Database | null = null;

/**
 * Get (or create) the singleton database connection.
 * Enables WAL mode for better concurrent-read performance.
 */
export function getDb(): Database.Database {
  if (db) return db;

  // Ensure the database directory exists
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
  }

  db = new Database(DATABASE_PATH);

  // Performance & safety pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  console.log(`[Database] Connected to ${DATABASE_PATH}`);
  return db;
}

/**
 * Close the database connection gracefully.
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    console.log('[Database] Connection closed');
  }
}

/**
 * Check whether the database is healthy.
 */
export function isDatabaseHealthy(): boolean {
  try {
    const connection = getDb();
    const row = connection.prepare('SELECT 1 AS ok').get() as { ok: number } | undefined;
    return row?.ok === 1;
  } catch {
    return false;
  }
}

// ---- Graceful shutdown ----
function handleShutdown(signal: string): void {
  console.log(`\n[Database] Received ${signal}, closing…`);
  closeDb();
  process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('exit', () => {
  closeDb();
});
