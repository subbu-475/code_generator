// ============================================================
// Project service — CRUD operations for projects
// ============================================================

import { getDb } from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import type { Project, ProjectInput, CodeSnippet, Scene } from '../types/sharedTypes.js';
import { generateScenes, getScenesByProjectId } from './sceneService.js';

export interface ProjectWithScenes extends Project {
  scenes: Scene[];
}

/**
 * Create a new project, auto-generating its scenes.
 */
export function createProject(input: ProjectInput): ProjectWithScenes {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  // Ensure every snippet has an ID
  const snippets: CodeSnippet[] = input.code_snippets.map((s) => ({
    ...s,
    id: s.id || uuidv4(),
  }));

  let sceneConfigs: ReturnType<typeof generateScenes> = [];

  const executeCreate = db.transaction(() => {
    // 1. Insert project first with a placeholder '[]' for scene_config to satisfy foreign key constraints
    db.prepare(`
      INSERT INTO projects (id, title, language, hook_text, code_snippets, output, cta, template_id, scene_config, audio_mode, music_file, status, explanation_template, sfx_whoosh, sfx_typing, sfx_achievement, tts_explanation, tts_output, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.title,
      input.language,
      input.hook_text,
      JSON.stringify(snippets),
      input.output,
      input.cta,
      input.template_id ?? null,
      input.audio_mode ?? 'none',
      input.music_file ?? null,
      input.explanation_template ?? 'none',
      input.sfx_whoosh === false ? 0 : 1,
      input.sfx_typing === false ? 0 : 1,
      input.sfx_achievement === false ? 0 : 1,
      input.tts_explanation === false ? 0 : 1,
      input.tts_output === false ? 0 : 1,
      now,
      now,
    );

    // 2. Generate scenes (inserts scene rows)
    sceneConfigs = generateScenes(
      id,
      input.hook_text,
      snippets,
      input.output,
      input.cta,
      input.explanation_template ?? 'none',
    );

    // 3. Update the project with the generated scene config
    db.prepare(`
      UPDATE projects SET scene_config = ? WHERE id = ?
    `).run(JSON.stringify(sceneConfigs), id);
  });

  executeCreate();

  return getProjectById(id)!;
}

/**
 * Get all projects with optional search and status filter.
 */
export function getAllProjects(options?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): { projects: Project[]; total: number } {
  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options?.search) {
    conditions.push('(title LIKE ? OR hook_text LIKE ?)');
    const term = `%${options.search}%`;
    params.push(term, term);
  }

  if (options?.status) {
    conditions.push('status = ?');
    params.push(options.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM projects ${where}`).get(...params) as { total: number };

  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const projects = db
    .prepare(`SELECT * FROM projects ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset) as any[];

  for (const p of projects) {
    p.sfx_whoosh = p.sfx_whoosh !== 0;
    p.sfx_typing = p.sfx_typing !== 0;
    p.sfx_achievement = p.sfx_achievement !== 0;
    p.tts_explanation = p.tts_explanation !== 0;
    p.tts_output = p.tts_output !== 0;
  }

  return { projects, total: countRow.total };
}

/**
 * Get a single project by ID, including its scenes.
 */
export function getProjectById(id: string): ProjectWithScenes | undefined {
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!project) return undefined;

  project.sfx_whoosh = project.sfx_whoosh !== 0;
  project.sfx_typing = project.sfx_typing !== 0;
  project.sfx_achievement = project.sfx_achievement !== 0;
  project.tts_explanation = project.tts_explanation !== 0;
  project.tts_output = project.tts_output !== 0;

  const scenes = getScenesByProjectId(id);
  return { ...project, scenes };
}

/**
 * Update an existing project. Regenerates scenes if content fields change.
 */
export function updateProject(id: string, input: Partial<ProjectInput>): ProjectWithScenes | undefined {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
  if (!existing) return undefined;

  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: unknown[] = [now];

  let needRegenScenes = false;

  if (input.title !== undefined) { fields.push('title = ?'); values.push(input.title); }
  if (input.language !== undefined) { fields.push('language = ?'); values.push(input.language); }
  if (input.hook_text !== undefined) { fields.push('hook_text = ?'); values.push(input.hook_text); needRegenScenes = true; }
  if (input.output !== undefined) { fields.push('output = ?'); values.push(input.output); needRegenScenes = true; }
  if (input.cta !== undefined) { fields.push('cta = ?'); values.push(input.cta); needRegenScenes = true; }
  if (input.template_id !== undefined) { fields.push('template_id = ?'); values.push(input.template_id); }
  if (input.audio_mode !== undefined) { fields.push('audio_mode = ?'); values.push(input.audio_mode); }
  if (input.music_file !== undefined) { fields.push('music_file = ?'); values.push(input.music_file); }
  if (input.sfx_whoosh !== undefined) { fields.push('sfx_whoosh = ?'); values.push(input.sfx_whoosh ? 1 : 0); }
  if (input.sfx_typing !== undefined) { fields.push('sfx_typing = ?'); values.push(input.sfx_typing ? 1 : 0); }
  if (input.sfx_achievement !== undefined) { fields.push('sfx_achievement = ?'); values.push(input.sfx_achievement ? 1 : 0); }
  if (input.tts_explanation !== undefined) { fields.push('tts_explanation = ?'); values.push(input.tts_explanation ? 1 : 0); }
  if (input.tts_output !== undefined) { fields.push('tts_output = ?'); values.push(input.tts_output ? 1 : 0); }

  if (input.code_snippets !== undefined) {
    const snippets = input.code_snippets.map((s) => ({ ...s, id: s.id || uuidv4() }));
    fields.push('code_snippets = ?');
    values.push(JSON.stringify(snippets));
    needRegenScenes = true;
  }

  if (input.explanation_template !== undefined) {
    fields.push('explanation_template = ?');
    values.push(input.explanation_template);
    needRegenScenes = true;
  }

  values.push(id);
  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  // Regenerate scenes if content changed
  if (needRegenScenes) {
    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project;
    const snippets: CodeSnippet[] = JSON.parse(updated.code_snippets);
    const sceneConfigs = generateScenes(
      id,
      updated.hook_text,
      snippets,
      updated.output,
      updated.cta,
      updated.explanation_template,
    );
    db.prepare('UPDATE projects SET scene_config = ? WHERE id = ?').run(JSON.stringify(sceneConfigs), id);
  }

  return getProjectById(id);
}

/**
 * Delete a project and all associated data (scenes cascade).
 */
export function deleteProject(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * Update only the status field of a project.
 */
export function updateProjectStatus(id: string, status: Project['status']): void {
  const db = getDb();
  db.prepare('UPDATE projects SET status = ?, updated_at = ? WHERE id = ?').run(
    status,
    new Date().toISOString(),
    id,
  );
}
