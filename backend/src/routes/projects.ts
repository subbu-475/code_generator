// ============================================================
// Projects router
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { validate } from '../middleware/validation.js';
import * as projectService from '../services/projectService.js';
import * as sceneService from '../services/sceneService.js';
import * as audioService from '../services/audioService.js';

const router = Router();

const CodeSnippetSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  code: z.string().optional().default(''),
  language: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']),
  output: z.string().optional(),
  hook: z.string().optional(),
  explanation: z.string().optional(),
  
  // Quiz
  quizQuestion: z.string().optional(),
  quizOptions: z.array(z.string()).optional(),
  quizCorrectIndex: z.number().int().optional(),
  quizExplanation: z.string().optional(),
  quizRevealDelay: z.number().int().optional(),

  // Guess The Output
  guessCode: z.string().optional(),
  guessLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  guessAnswer: z.string().optional(),
  guessRevealDelay: z.number().int().optional(),

  // Interview Question
  interviewDifficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  interviewCategory: z.string().optional(),
  interviewAnswer: z.string().optional(),

  // Bug Fix
  buggyCode: z.string().optional(),
  fixedCode: z.string().optional(),
  bugLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  bugExplanation: z.string().optional(),

  // One-Liner
  onelinerCode: z.string().optional(),
  onelinerLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  onelinerExplanation: z.string().optional(),

  // Comparison
  comparisonLeftTitle: z.string().optional(),
  comparisonRightTitle: z.string().optional(),
  comparisonLeftCode: z.string().optional(),
  comparisonRightCode: z.string().optional(),
  comparisonLeftLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  comparisonRightLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  comparisonVerdict: z.string().optional(),

  // Roadmap Step
  roadmapStepNumber: z.number().int().optional(),
  roadmapTotalSteps: z.number().int().optional(),
  roadmapIcon: z.string().optional(),
  roadmapDescription: z.string().optional(),
});

const ProjectInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  language: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']),
  hook_text: z.string().default(''),
  code_snippets: z.array(CodeSnippetSchema).default([]),
  output: z.string().default(''),
  cta: z.string().default(''),
  template_id: z.string().optional().nullable(),
  audio_mode: z.enum(['none', 'music', 'voice_music']).default('none'),
  music_file: z.string().optional().nullable(),
  explanation_template: z.enum(['none', 'step_by_step', 'refactor', 'spotlight', 'quiz_generator', 'guess_output', 'interview_question', 'bugfix', 'oneliner', 'comparison', 'roadmap']).default('none').optional(),
  sfx_whoosh: z.boolean().default(true).optional(),
  sfx_typing: z.boolean().default(true).optional(),
  sfx_achievement: z.boolean().default(true).optional(),
  tts_explanation: z.boolean().default(true).optional(),
  tts_output: z.boolean().default(true).optional(),
  music_volume: z.number().min(0).max(1).default(0.15).optional(),
  voice_volume: z.number().min(0).max(1).default(1.0).optional(),
});

const ProjectUpdateSchema = ProjectInputSchema.partial();

const SceneUpdateSchema = z.object({
  title: z.string().optional(),
  duration_frames: z.number().int().min(15).optional(),
  animation: z.enum(['fade', 'zoom', 'slide', 'pop', 'bounce']).optional(),
  transition: z.enum(['fade', 'slide', 'zoom', 'none']).optional(),
  code: z.string().optional(),
  text: z.string().optional(),
  output: z.string().optional(),
  language: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  channelName: z.string().optional(),
  channelHandle: z.string().optional(),
  subscriberCount: z.string().optional(),
  socials: z.array(z.object({ platform: z.string(), handle: z.string() })).optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  hookBadge: z.string().optional(),
  hookBadgeStyle: z.enum(['heartbeat', 'bounce', 'shake', 'glow']).optional(),
  hookCreatorName: z.string().optional(),
  hookCreatorHandle: z.string().optional(),
  hookCreatorAvatar: z.string().optional(),
  hookShowProgress: z.boolean().optional(),
  hookProgressStyle: z.enum(['bar', 'ring']).optional(),
  hookLayout: z.enum(['standard', 'thumbnail', 'glassmorphic']).optional(),
  hookImage: z.string().optional(),
  hookImageSize: z.enum(['small', 'medium', 'large']).optional(),
  hookImageViewMode: z.enum(['cover', 'contain']).optional(),
  explanation: z.string().optional(),
  quizQuestion: z.string().optional(),
  quizOptions: z.array(z.string()).optional(),
  quizCorrectIndex: z.number().int().min(0).max(3).optional(),
  quizExplanation: z.string().optional(),
  quizRevealDelay: z.number().int().min(0).optional(),

  // Guess The Output
  guessCode: z.string().optional(),
  guessLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  guessAnswer: z.string().optional(),
  guessRevealDelay: z.number().int().optional(),

  // Interview Question
  interviewDifficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  interviewCategory: z.string().optional(),
  interviewAnswer: z.string().optional(),

  // Bug Fix
  buggyCode: z.string().optional(),
  fixedCode: z.string().optional(),
  bugLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  bugExplanation: z.string().optional(),

  // One-Liner
  onelinerCode: z.string().optional(),
  onelinerLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  onelinerExplanation: z.string().optional(),

  // Comparison
  comparisonLeftTitle: z.string().optional(),
  comparisonRightTitle: z.string().optional(),
  comparisonLeftCode: z.string().optional(),
  comparisonRightCode: z.string().optional(),
  comparisonLeftLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  comparisonRightLanguage: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']).optional(),
  comparisonVerdict: z.string().optional(),

  // Roadmap Step
  roadmapStepNumber: z.number().int().optional(),
  roadmapTotalSteps: z.number().int().optional(),
  roadmapIcon: z.string().optional(),
  roadmapDescription: z.string().optional(),
});

const SceneCreateSchema = z.object({
  type: z.enum([
    'hook',
    'code',
    'output',
    'tip',
    'cta',
    'subscribe',
    'end_screen',
    'image',
    'video',
    'subscribe_video',
    'quiz',
    'guess_output',
    'interview_question',
    'bugfix',
    'oneliner',
    'comparison',
    'roadmap_step',
  ]),
  insertAfterId: z.string().optional(),
});

const SceneReorderSchema = z.object({
  sceneIds: z.array(z.string()),
});

// GET /api/projects - List all projects
router.get('/', (req, res, next) => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    const result = projectService.getAllProjects({ search, status, limit, offset });
    res.json({
      success: true,
      data: result.projects,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/preview-audio - Pre-generate TTS audio for preview player
// Returns an array of relative voice URLs, one per scene (empty string = no narration).
// Same scene filter logic as renderService so preview matches the rendered video exactly.
router.get('/:id/preview-audio', async (req, res, next) => {
  try {
    const project = projectService.getProjectById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Only applicable when voice narration mode is on
    if (project.audio_mode !== 'voice_music') {
      res.json({ success: true, data: [] });
      return;
    }

    if (!audioService.checkPiper()) {
      // Return empty array gracefully — preview will just be silent
      res.json({ success: true, data: [] });
      return;
    }

    const scenes = project.scenes ?? [];
    const voiceUrls: string[] = [];

    for (const scene of scenes) {
      let content: any = {};
      try { content = JSON.parse(scene.content); } catch { /* ignore */ }

      let textToSpeak = '';
      if (
        (scene.type === 'tip' && project.tts_explanation !== false) ||
        (scene.type === 'output' && project.tts_output !== false) ||
        scene.type === 'cta'
      ) {
        textToSpeak = content.text || '';
      } else if (scene.type === 'quiz') {
        const question = content.quizQuestion || '';
        const options = content.quizOptions || [];
        textToSpeak = `${question}. ${options.join('. ')}`;
      } else if (scene.type === 'guess_output') {
        const question = content.text || 'What does this code output?';
        const answer = content.guessAnswer || '';
        textToSpeak = `${question}. ${answer}`;
      } else if (scene.type === 'interview_question') {
        const question = content.text || '';
        const answer = content.interviewAnswer || '';
        textToSpeak = `${question}. ${answer}`;
      } else if (scene.type === 'bugfix') {
        const question = content.text || 'Can you spot the bug?';
        const explanation = content.bugExplanation || '';
        textToSpeak = `${question}. ${explanation}`;
      } else if (scene.type === 'oneliner') {
        textToSpeak = content.onelinerExplanation || '';
      } else if (scene.type === 'comparison') {
        textToSpeak = content.comparisonVerdict || '';
      } else if (scene.type === 'roadmap_step') {
        const title = content.text || '';
        const description = content.roadmapDescription || '';
        textToSpeak = `${title}. ${description}`;
      }

      if (textToSpeak.trim()) {
        try {
          // Use a deterministic filename so we cache by scene ID and text hash — avoids re-generating unless content changes
          const textHash = crypto.createHash('md5').update(textToSpeak).digest('hex');
          const cacheFile = `preview_${scene.id}_${textHash}.wav`;
          const result = await audioService.generateAudio(textToSpeak, undefined, cacheFile);
          voiceUrls.push(result.audioUrl);
        } catch (err) {
          console.error(`[PreviewAudio] TTS failed for scene ${scene.id}:`, err);
          voiceUrls.push('');
        }
      } else {
        voiceUrls.push('');
      }
    }

    res.json({ success: true, data: voiceUrls });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id - Get a single project with scenes
router.get('/:id', (req, res, next) => {
  try {
    const project = projectService.getProjectById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects - Create a new project
router.post('/', validate(ProjectInputSchema), (req, res, next) => {
  try {
    const project = projectService.createProject(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id - Update an existing project
router.put('/:id', validate(ProjectUpdateSchema), (req, res, next) => {
  try {
    const project = projectService.updateProject(req.params.id as string, req.body);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', (req, res, next) => {
  try {
    const deleted = projectService.deleteProject(req.params.id as string);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/scenes/reorder - Reorder scenes
// NOTE: Must be defined BEFORE /:sceneId to prevent Express treating "reorder" as a sceneId param
router.put('/:id/scenes/reorder', validate(SceneReorderSchema), (req, res, next) => {
  try {
    sceneService.reorderScenes(req.params.id as string, req.body.sceneIds);
    res.json({ success: true, message: 'Scenes reordered successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id/scenes/:sceneId - Update properties of a specific scene
router.put('/:id/scenes/:sceneId', validate(SceneUpdateSchema), (req, res, next) => {
  try {
    const updated = sceneService.updateScene(req.params.sceneId as string, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Scene not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/scenes - Add a new scene
router.post('/:id/scenes', validate(SceneCreateSchema), (req, res, next) => {
  try {
    const scene = sceneService.addScene(req.params.id as string, req.body.type, req.body.insertAfterId);
    res.status(201).json({ success: true, data: scene });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id/scenes/:sceneId - Delete a scene
router.delete('/:id/scenes/:sceneId', (req, res, next) => {
  try {
    const deleted = sceneService.deleteScene(req.params.id as string, req.params.sceneId as string);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Scene not found' });
      return;
    }
    res.json({ success: true, message: 'Scene deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
