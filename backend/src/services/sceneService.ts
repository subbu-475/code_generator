// ============================================================
// Scene service — auto-generate scenes from project data
// ============================================================

import { getDb } from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';
import type {
  Scene,
  SceneConfig,
  CodeSnippet,
  AnimationStyle,
  TransitionStyle,
  SceneType,
} from '../types/sharedTypes.js';
import { FPS } from '../types/sharedTypes.js';

// Default durations in seconds
const HOOK_DURATION_SECS = 3;
const CODE_DURATION_SECS = 5;
const OUTPUT_DURATION_SECS = 4;
const CTA_DURATION_SECS = 3;

/**
 * Auto-generate scenes for a project, persisting them to the DB
 * and returning the SceneConfig array.
 */
export function generateScenes(
  projectId: string,
  hookText: string,
  codeSnippets: CodeSnippet[],
  output: string,
  cta: string,
  explanationTemplate: string = 'none',
): SceneConfig[] {
  const db = getDb();

  // Delete old scenes for this project
  db.prepare('DELETE FROM scenes WHERE project_id = ?').run(projectId);

  const configs: SceneConfig[] = [];
  let order = 0;

  const addSceneHelper = (config: SceneConfig) => {
    configs.push(config);
    insertScene(db, projectId, order++, config);
  };

  if (explanationTemplate === 'step_by_step') {
    // 1. Hook Scene
    addSceneHelper(createSceneConfig('hook', 'Hook', {
      text: hookText || 'Step-by-Step Tutorial!',
      duration_frames: HOOK_DURATION_SECS * FPS,
      animation: 'pop',
      transition: 'fade',
    }));

    // 2. Code Scenes
    for (const snippet of codeSnippets) {
      addSceneHelper(createSceneConfig('code', snippet.title || 'Code', {
        code: snippet.code,
        language: snippet.language,
        output: snippet.output,
        duration_frames: CODE_DURATION_SECS * FPS,
        animation: 'fade',
        transition: 'slide',
      }));
    }

    // 3. Step explanation (Tip scenes)
    const hasCustomExplanations = codeSnippets.some(s => s.explanation && s.explanation.trim());
    if (hasCustomExplanations) {
      let stepNum = 1;
      for (const snippet of codeSnippets) {
        if (snippet.explanation && snippet.explanation.trim()) {
          addSceneHelper(createSceneConfig('tip', snippet.title ? `Step ${stepNum}: ${snippet.title}` : `Step ${stepNum}`, {
            text: snippet.explanation,
            duration_frames: 120,
            animation: 'fade',
            transition: 'slide',
          }));
          stepNum++;
        }
      }
    } else {
      // Fallback placeholders
      addSceneHelper(createSceneConfig('tip', 'Step 1: Setup', {
        text: 'First, define your variables and imports.',
        duration_frames: 120, // 4s
        animation: 'fade',
        transition: 'slide',
      }));

      addSceneHelper(createSceneConfig('tip', 'Step 2: Core Logic', {
        text: 'Next, run your main handler logic to compute findings.',
        duration_frames: 120,
        animation: 'fade',
        transition: 'slide',
      }));
    }

    // 4. Output scenes
    const hasSnippetOutput = codeSnippets.some(s => s.output && s.output.trim());
    if (hasSnippetOutput || output) {
      for (const snippet of codeSnippets) {
        if (snippet.output && snippet.output.trim()) {
          addSceneHelper(createSceneConfig('output', snippet.title ? `${snippet.title} Output` : 'Output', {
            text: snippet.output,
            explanation: snippet.explanation,
            duration_frames: OUTPUT_DURATION_SECS * FPS,
            animation: 'zoom',
            transition: 'fade',
          }));
        }
      }
      if (output && !hasSnippetOutput) {
        addSceneHelper(createSceneConfig('output', 'Output', {
          text: output,
          explanation: codeSnippets[codeSnippets.length - 1]?.explanation,
          duration_frames: OUTPUT_DURATION_SECS * FPS,
          animation: 'zoom',
          transition: 'fade',
        }));
      }
    }

    // 5. CTA scene
    addSceneHelper(createSceneConfig('cta', 'CTA', {
      text: cta || 'Subscribe for more tips!',
      duration_frames: CTA_DURATION_SECS * FPS,
      animation: 'bounce',
      transition: 'none',
    }));

  } else if (explanationTemplate === 'refactor') {
    // 1. Hook Scene
    addSceneHelper(createSceneConfig('hook', 'Hook', {
      text: hookText || 'Stop writing bad code!',
      duration_frames: HOOK_DURATION_SECS * FPS,
      animation: 'pop',
      transition: 'fade',
    }));

    // 2. Code Scene (Original "bad" code)
    const originalSnippet = codeSnippets[0];
    if (originalSnippet) {
      addSceneHelper(createSceneConfig('code', originalSnippet.title || 'The Old Way', {
        code: originalSnippet.code,
        language: originalSnippet.language,
        output: originalSnippet.output,
        duration_frames: CODE_DURATION_SECS * FPS,
        animation: 'fade',
        transition: 'slide',
      }));
    }

    // 3. Problem Explanation (Tip scene)
    addSceneHelper(createSceneConfig('tip', 'The Problem', {
      text: (originalSnippet && originalSnippet.explanation) || 'This method is slow, allocates unnecessary memory, and doesn\'t scale well.',
      duration_frames: 150, // 5s
      animation: 'fade',
      transition: 'zoom',
    }));

    // 4. Code Scene (Refactored "good" code)
    const refactoredSnippet = codeSnippets[1] || originalSnippet;
    addSceneHelper(createSceneConfig('code', codeSnippets[1] ? refactoredSnippet.title || 'The Better Way' : 'Refactored Way', {
      code: refactoredSnippet.code,
      language: refactoredSnippet.language,
      output: refactoredSnippet.output,
      duration_frames: CODE_DURATION_SECS * FPS,
      animation: 'fade',
      transition: 'slide',
    }));

    // 5. Output scene (if output exists)
    const lastSnippet = codeSnippets[1] || originalSnippet;
    if ((lastSnippet && lastSnippet.output && lastSnippet.output.trim()) || output) {
      addSceneHelper(createSceneConfig('output', 'Output', {
        text: (lastSnippet && lastSnippet.output) || output,
        explanation: lastSnippet?.explanation,
        duration_frames: OUTPUT_DURATION_SECS * FPS,
        animation: 'zoom',
        transition: 'fade',
      }));
    }

    // 6. CTA scene
    addSceneHelper(createSceneConfig('cta', 'CTA', {
      text: cta || 'Follow for more optimizations!',
      duration_frames: CTA_DURATION_SECS * FPS,
      animation: 'bounce',
      transition: 'none',
    }));

  } else if (explanationTemplate === 'spotlight') {
    // 1. Hook Scene
    addSceneHelper(createSceneConfig('hook', 'Hook', {
      text: hookText || 'Spotlight on: Feature API',
      duration_frames: HOOK_DURATION_SECS * FPS,
      animation: 'pop',
      transition: 'fade',
    }));

    // 2. Code Scenes
    for (const snippet of codeSnippets) {
      addSceneHelper(createSceneConfig('code', snippet.title || 'Code Example', {
        code: snippet.code,
        language: snippet.language,
        output: snippet.output,
        duration_frames: CODE_DURATION_SECS * FPS,
        animation: 'fade',
        transition: 'slide',
      }));
    }

    // 3. Spotlight Tip Scene
    const firstSnippet = codeSnippets[0];
    addSceneHelper(createSceneConfig('tip', 'Key Spotlight', {
      text: (firstSnippet && firstSnippet.explanation) || 'This method maximizes processing speed and keeps resource leaks to zero.',
      duration_frames: 120,
      animation: 'fade',
      transition: 'slide',
    }));

    // 4. Output Scene
    const hasSnippetOutput = codeSnippets.some(s => s.output && s.output.trim());
    if (hasSnippetOutput || output) {
      for (const snippet of codeSnippets) {
        if (snippet.output && snippet.output.trim()) {
          addSceneHelper(createSceneConfig('output', snippet.title ? `${snippet.title} Output` : 'Output', {
            text: snippet.output,
            explanation: snippet.explanation,
            duration_frames: OUTPUT_DURATION_SECS * FPS,
            animation: 'zoom',
            transition: 'fade',
          }));
        }
      }
      if (output && !hasSnippetOutput) {
        addSceneHelper(createSceneConfig('output', 'Output', {
          text: output,
          explanation: codeSnippets[codeSnippets.length - 1]?.explanation,
          duration_frames: OUTPUT_DURATION_SECS * FPS,
          animation: 'zoom',
          transition: 'fade',
        }));
      }
    }

    // 5. CTA Scene
    addSceneHelper(createSceneConfig('cta', 'CTA', {
      text: cta || 'Join our dev community!',
      duration_frames: CTA_DURATION_SECS * FPS,
      animation: 'bounce',
      transition: 'none',
    }));

  } else {
    // default/none template
    const hasGlobalHook = !!hookText && hookText.trim().length > 0;
    const firstSnippetHasHook = !!codeSnippets[0] && !!codeSnippets[0].hook && codeSnippets[0].hook.trim().length > 0;
    
    if (hasGlobalHook && !firstSnippetHasHook) {
      addSceneHelper(createSceneConfig('hook', 'Hook', {
        text: hookText,
        duration_frames: HOOK_DURATION_SECS * FPS,
        animation: 'pop',
        transition: 'fade',
      }));
    }

    for (let i = 0; i < codeSnippets.length; i++) {
      const snippet = codeSnippets[i];
      
      // 1. Snippet Hook (if specified)
      if (snippet.hook && snippet.hook.trim()) {
        addSceneHelper(createSceneConfig('hook', snippet.title ? `${snippet.title} Hook` : 'Hook', {
          text: snippet.hook,
          duration_frames: HOOK_DURATION_SECS * FPS,
          animation: 'pop',
          transition: 'fade',
        }));
      }

      // 2. Code Scene
      addSceneHelper(createSceneConfig('code', snippet.title || 'Code', {
        code: snippet.code,
        language: snippet.language,
        output: snippet.output,
        duration_frames: CODE_DURATION_SECS * FPS,
        animation: 'fade',
        transition: 'slide',
      }));

      // 3. Snippet Output (if specified)
      if (snippet.output && snippet.output.trim()) {
        addSceneHelper(createSceneConfig('output', snippet.title ? `${snippet.title} Output` : 'Output', {
          text: snippet.output,
          explanation: snippet.explanation,
          duration_frames: OUTPUT_DURATION_SECS * FPS,
          animation: 'zoom',
          transition: 'fade',
        }));
      } else if (i === codeSnippets.length - 1 && output && output.trim()) {
        // Fall back to project global output for the last snippet if it doesn't have its own output
        addSceneHelper(createSceneConfig('output', 'Output', {
          text: output,
          explanation: snippet.explanation,
          duration_frames: OUTPUT_DURATION_SECS * FPS,
          animation: 'zoom',
          transition: 'fade',
        }));
      }

      // 4. Snippet Explanation (if specified)
      if (snippet.explanation && snippet.explanation.trim()) {
        addSceneHelper(createSceneConfig('tip', snippet.title ? `${snippet.title} Explanation` : 'Explanation', {
          text: snippet.explanation,
          duration_frames: 120, // 4s
          animation: 'fade',
          transition: 'slide',
        }));
      }
    }

    if (cta) {
      addSceneHelper(createSceneConfig('cta', 'Call to Action', {
        text: cta,
        duration_frames: CTA_DURATION_SECS * FPS,
        animation: 'bounce',
        transition: 'none',
      }));
    }
  }

  return configs;
}

/**
 * Get all scenes for a project, ordered by scene_order.
 */
export function getScenesByProjectId(projectId: string): Scene[] {
  const db = getDb();
  return db
    .prepare('SELECT id, project_id, scene_order, type, title, content, duration_frames, animation, transition_ AS transition, created_at FROM scenes WHERE project_id = ? ORDER BY scene_order ASC')
    .all(projectId) as Scene[];
}

/**
 * Update a single scene.
 */
export function updateScene(sceneId: string, updates: Partial<SceneConfig>): Scene | undefined {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM scenes WHERE id = ?').get(sceneId) as Scene | undefined;
  if (!existing) return undefined;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.duration_frames !== undefined) { fields.push('duration_frames = ?'); values.push(updates.duration_frames); }
  if (updates.animation !== undefined) { fields.push('animation = ?'); values.push(updates.animation); }
  if (updates.transition !== undefined) { fields.push('transition_ = ?'); values.push(updates.transition); }

  const contentKeys = [
    'code', 'text', 'output', 'language', 'channelName', 'channelHandle', 'subscriberCount', 'socials', 'imageUrl', 'videoUrl',
    'hookBadge', 'hookBadgeStyle', 'hookCreatorName', 'hookCreatorHandle', 'hookCreatorAvatar', 'hookShowProgress', 'hookProgressStyle', 'hookLayout', 'hookImage',
    'hookImageSize', 'hookImageViewMode', 'explanation', 'quizQuestion', 'quizOptions', 'quizCorrectIndex', 'quizExplanation', 'quizRevealDelay'
  ];
  const hasContentUpdate = contentKeys.some((k) => (updates as any)[k] !== undefined);

  if (hasContentUpdate) {
    const currentContent = JSON.parse(existing.content);
    for (const k of contentKeys) {
      if ((updates as any)[k] !== undefined) {
        currentContent[k] = (updates as any)[k];
      }
    }
    fields.push('content = ?');
    values.push(JSON.stringify(currentContent));
  }

  if (fields.length > 0) {
    values.push(sceneId);
    db.prepare(`UPDATE scenes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    // Sync to projects.scene_config
    syncProjectSceneConfig(db, existing.project_id);
  }

  return db.prepare('SELECT id, project_id, scene_order, type, title, content, duration_frames, animation, transition_ AS transition, created_at FROM scenes WHERE id = ?').get(sceneId) as Scene;
}

/**
 * Synchronize scenes table back to project's scene_config column.
 */
export function syncProjectSceneConfig(db: ReturnType<typeof getDb>, projectId: string): void {
  const scenes = db
    .prepare('SELECT id, type, title, content, duration_frames, animation, transition_ AS transition FROM scenes WHERE project_id = ? ORDER BY scene_order ASC')
    .all(projectId) as any[];

  const configs: SceneConfig[] = scenes.map((s) => {
    let content: Record<string, any> = {};
    try {
      content = JSON.parse(s.content);
    } catch {
      // ignore
    }

    return {
      id: s.id,
      type: s.type,
      title: s.title,
      duration_frames: s.duration_frames,
      animation: s.animation,
      transition: s.transition,
      text: content.text,
      code: content.code,
      language: content.language,
      output: content.output,
      channelName: content.channelName,
      channelHandle: content.channelHandle,
      subscriberCount: content.subscriberCount,
      socials: content.socials,
      imageUrl: content.imageUrl,
      videoUrl: content.videoUrl,
      hookBadge: content.hookBadge,
      hookBadgeStyle: content.hookBadgeStyle,
      hookCreatorName: content.hookCreatorName,
      hookCreatorHandle: content.hookCreatorHandle,
      hookCreatorAvatar: content.hookCreatorAvatar,
      hookShowProgress: content.hookShowProgress,
      hookProgressStyle: content.hookProgressStyle,
      hookLayout: content.hookLayout,
      hookImage: content.hookImage,
      hookImageSize: content.hookImageSize,
      hookImageViewMode: content.hookImageViewMode,
      explanation: content.explanation,
      quizQuestion: content.quizQuestion,
      quizOptions: content.quizOptions,
      quizCorrectIndex: content.quizCorrectIndex,
      quizExplanation: content.quizExplanation,
      quizRevealDelay: content.quizRevealDelay,
    };
  });

  db.prepare('UPDATE projects SET scene_config = ? WHERE id = ?').run(
    JSON.stringify(configs),
    projectId,
  );
}

/**
 * Reorder scenes by setting scene_order based on the provided ordered scene ID array.
 */
export function reorderScenes(projectId: string, sceneIds: string[]): void {
  const db = getDb();
  
  db.transaction(() => {
    let order = 0;
    for (const id of sceneIds) {
      db.prepare('UPDATE scenes SET scene_order = ? WHERE id = ? AND project_id = ?').run(
        order++,
        id,
        projectId,
      );
    }
    syncProjectSceneConfig(db, projectId);
  })();
}

/**
 * Add a new scene to a project.
 */
export function addScene(projectId: string, type: SceneType, insertAfterId?: string): Scene {
  const db = getDb();
  const id = uuidv4();
  let resultScene: Scene | undefined;

  db.transaction(() => {
    let targetOrder = 0;

    if (insertAfterId) {
      if (insertAfterId === 'START') {
        targetOrder = 0;
        db.prepare('UPDATE scenes SET scene_order = scene_order + 1 WHERE project_id = ? AND scene_order >= 0')
          .run(projectId);
      } else {
        const afterScene = db
          .prepare('SELECT scene_order FROM scenes WHERE id = ? AND project_id = ?')
          .get(insertAfterId, projectId) as { scene_order: number } | undefined;

        if (afterScene) {
          targetOrder = afterScene.scene_order + 1;
          db.prepare('UPDATE scenes SET scene_order = scene_order + 1 WHERE project_id = ? AND scene_order >= ?')
            .run(projectId, targetOrder);
        } else {
          const maxRow = db
            .prepare('SELECT MAX(scene_order) AS max_order FROM scenes WHERE project_id = ?')
            .get(projectId) as { max_order: number | null };
          targetOrder = maxRow.max_order !== null ? maxRow.max_order + 1 : 0;
        }
      }
    } else {
      const maxRow = db
        .prepare('SELECT MAX(scene_order) AS max_order FROM scenes WHERE project_id = ?')
        .get(projectId) as { max_order: number | null };
      targetOrder = maxRow.max_order !== null ? maxRow.max_order + 1 : 0;
    }

    let title = '';
    let duration = 90;
    let animation: AnimationStyle = 'fade';
    let transition: TransitionStyle = 'fade';
    const content: Record<string, any> = {};

    switch (type) {
      case 'hook':
        title = 'Hook';
        duration = 90;
        animation = 'pop';
        content.text = 'Write your video hook here';
        break;
      case 'code':
        title = 'Code';
        duration = 150;
        animation = 'fade';
        transition = 'slide';
        content.code = 'console.log("Hello, World!");';
        content.language = 'javascript';
        content.output = '';
        break;
      case 'output':
        title = 'Output';
        duration = 120;
        animation = 'zoom';
        content.text = 'Expected output goes here';
        break;
      case 'cta':
        title = 'Call to Action';
        duration = 90;
        animation = 'bounce';
        transition = 'none';
        content.text = 'Like and Subscribe!';
        break;
      case 'tip':
        title = 'Tip';
        duration = 120;
        animation = 'fade';
        transition = 'slide';
        content.text = 'Here is a useful coding tip';
        break;
      case 'subscribe':
        title = 'Subscribe Card';
        duration = 90;
        animation = 'pop';
        content.channelName = 'CodeShorts';
        content.channelHandle = '@codeshorts';
        content.subscriberCount = '100K';
        break;
      case 'end_screen':
        title = 'End Screen';
        duration = 120;
        animation = 'fade';
        transition = 'none';
        content.title = 'Thanks for watching!';
        content.socials = [
          { platform: 'github', handle: 'username' },
          { platform: 'twitter', handle: 'username' },
        ];
        break;
      case 'image':
        title = 'Image Frame';
        duration = 120;
        animation = 'zoom';
        content.text = 'Explain your image here';
        content.imageUrl = 'https://picsum.photos/800/600';
        break;
      case 'video':
        title = 'Video Clip';
        duration = 150;
        animation = 'fade';
        content.text = 'Write captions for your video here';
        content.videoUrl = '';
        break;
      case 'subscribe_video':
        title = 'Subscribe Video';
        duration = 150;
        animation = 'fade';
        transition = 'none';
        content.videoUrl = '';
        break;
      case 'quiz':
        title = 'Quiz Challenge';
        duration = 150;
        animation = 'fade';
        transition = 'fade';
        content.quizQuestion = 'What is the output of this code?';
        content.quizOptions = ['Option A', 'Option B', 'Option C', 'Option D'];
        content.quizCorrectIndex = 0;
        content.quizExplanation = 'This is because...';
        content.quizRevealDelay = 90;
        break;
    }

    db.prepare(`
      INSERT INTO scenes (id, project_id, scene_order, type, title, content, duration_frames, animation, transition_)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      projectId,
      targetOrder,
      type,
      title,
      JSON.stringify(content),
      duration,
      animation,
      transition,
    );

    syncProjectSceneConfig(db, projectId);

    resultScene = db
      .prepare('SELECT id, project_id, scene_order, type, title, content, duration_frames, animation, transition_ AS transition, created_at FROM scenes WHERE id = ?')
      .get(id) as Scene;
  })();

  return resultScene!;
}

/**
 * Delete a scene from a project and shift following scene orders.
 */
export function deleteScene(projectId: string, sceneId: string): boolean {
  const db = getDb();
  let deleted = false;

  db.transaction(() => {
    const scene = db
      .prepare('SELECT scene_order FROM scenes WHERE id = ? AND project_id = ?')
      .get(sceneId, projectId) as { scene_order: number } | undefined;

    if (!scene) return;

    db.prepare('DELETE FROM scenes WHERE id = ? AND project_id = ?').run(sceneId, projectId);

    db.prepare('UPDATE scenes SET scene_order = scene_order - 1 WHERE project_id = ? AND scene_order > ?')
      .run(projectId, scene.scene_order);

    syncProjectSceneConfig(db, projectId);
    deleted = true;
  })();

  return deleted;
}

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

function createSceneConfig(
  type: SceneType,
  title: string,
  opts: {
    text?: string;
    code?: string;
    language?: string;
    output?: string;
    explanation?: string;
    duration_frames: number;
    animation: AnimationStyle;
    transition: TransitionStyle;
  },
): SceneConfig {
  return {
    id: uuidv4(),
    type,
    title,
    code: opts.code,
    language: opts.language as SceneConfig['language'],
    output: opts.output,
    text: opts.text,
    explanation: opts.explanation,
    duration_frames: opts.duration_frames,
    animation: opts.animation,
    transition: opts.transition,
  };
}

function insertScene(
  db: ReturnType<typeof getDb>,
  projectId: string,
  order: number,
  config: SceneConfig,
): void {
  const content: Record<string, unknown> = {};
  if (config.text) content.text = config.text;
  if (config.code) content.code = config.code;
  if (config.language) content.language = config.language;
  if (config.output) content.output = config.output;
  if (config.channelName) content.channelName = config.channelName;
  if (config.channelHandle) content.channelHandle = config.channelHandle;
  if (config.subscriberCount) content.subscriberCount = config.subscriberCount;
  if (config.socials) content.socials = config.socials;
  if (config.imageUrl) content.imageUrl = config.imageUrl;
  if (config.videoUrl) content.videoUrl = config.videoUrl;
  if (config.hookBadge) content.hookBadge = config.hookBadge;
  if (config.hookBadgeStyle) content.hookBadgeStyle = config.hookBadgeStyle;
  if (config.hookCreatorName) content.hookCreatorName = config.hookCreatorName;
  if (config.hookCreatorHandle) content.hookCreatorHandle = config.hookCreatorHandle;
  if (config.hookCreatorAvatar) content.hookCreatorAvatar = config.hookCreatorAvatar;
  if (config.hookShowProgress !== undefined) content.hookShowProgress = config.hookShowProgress;
  if (config.hookProgressStyle) content.hookProgressStyle = config.hookProgressStyle;
  if (config.hookLayout) content.hookLayout = config.hookLayout;
  if (config.hookImage) content.hookImage = config.hookImage;
  if (config.hookImageSize) content.hookImageSize = config.hookImageSize;
  if (config.hookImageViewMode) content.hookImageViewMode = config.hookImageViewMode;
  if (config.explanation) content.explanation = config.explanation;
  if (config.quizQuestion !== undefined) content.quizQuestion = config.quizQuestion;
  if (config.quizOptions !== undefined) content.quizOptions = config.quizOptions;
  if (config.quizCorrectIndex !== undefined) content.quizCorrectIndex = config.quizCorrectIndex;
  if (config.quizExplanation !== undefined) content.quizExplanation = config.quizExplanation;
  if (config.quizRevealDelay !== undefined) content.quizRevealDelay = config.quizRevealDelay;

  db.prepare(`
    INSERT INTO scenes (id, project_id, scene_order, type, title, content, duration_frames, animation, transition_)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    config.id,
    projectId,
    order,
    config.type,
    config.title,
    JSON.stringify(content),
    config.duration_frames,
    config.animation,
    config.transition,
  );
}
