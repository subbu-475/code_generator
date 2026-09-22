// ============================================================
// Videos Router — API endpoints for AI automated video factory
// ============================================================

import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {
  startPipeline,
  getJob,
  getVideoProject,
  listJobs,
  pipelineEvents,
} from '../pipeline/orchestrator.js';
import { PROJECT_ROOT } from '../utils/paths.js';

const router = Router();

/**
 * POST /api/videos
 * Start automated video generation for any topic.
 */
router.post('/videos', async (req, res) => {
  try {
    const { topic, duration, style, voice, language } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required and must be a non-empty string' });
      return;
    }

    const job = startPipeline({
      topic: topic.trim(),
      duration: duration ? Number(duration) : 45,
      style: style || 'dark-cinematic-tech',
      voice: voice || 'en-US-ChristopherNeural',
      language: language || 'en',
    });

    res.status(201).json({
      message: 'Video generation initiated successfully',
      job,
    });
  } catch (err: any) {
    console.error('[Routes:Videos] Failed to start pipeline:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/jobs
 * List recent video generation jobs.
 */
router.get('/jobs', (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const jobs = listJobs(limit);
    res.json({ jobs });
  } catch (err: any) {
    console.error('[Routes:Videos] Failed to list jobs:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/jobs/:id
 * Get status and details of a single job.
 */
router.get('/jobs/:id', (req, res) => {
  try {
    const job = getJob(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    let project = null;
    if (job.projectId) {
      project = getVideoProject(job.projectId);
    }

    res.json({ job, project });
  } catch (err: any) {
    console.error('[Routes:Videos] Failed to get job:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/jobs/:id/stream
 * Server-Sent Events (SSE) stream for live progress updates.
 */
router.get('/jobs/:id/stream', (req, res) => {
  const jobId = req.params.id;
  const job = getJob(jobId);

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial state immediately
  res.write(`data: ${JSON.stringify({ status: job.status, progress: job.progress, message: job.currentStage })}\n\n`);

  // If already completed or failed, close early
  if (job.status === 'completed' || job.status === 'failed') {
    res.end();
    return;
  }

  const eventKey = `progress:${jobId}`;
  const onProgress = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (data.status === 'completed' || data.status === 'failed') {
      pipelineEvents.off(eventKey, onProgress);
      res.end();
    }
  };

  pipelineEvents.on(eventKey, onProgress);

  req.on('close', () => {
    pipelineEvents.off(eventKey, onProgress);
  });
});

/**
 * GET /api/videos/:projectId
 * Get complete project data including script, scene plan, QA report, and metadata.
 */
router.get('/videos/:projectId', (req, res) => {
  try {
    const project = getVideoProject(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const projectDir = path.resolve(PROJECT_ROOT, 'storage', 'projects', project.id);
    const readData = (file: string) => {
      try {
        const p = path.join(projectDir, `${file}.json`);
        return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : null;
      } catch {
        return null;
      }
    };

    const details = {
      research: readData('research'),
      script: readData('script'),
      scenes: readData('scenes'),
      qa: readData('qa'),
      metadata: readData('metadata'),
      timeline: readData('timeline'),
    };

    res.json({ project, details });
  } catch (err: any) {
    console.error('[Routes:Videos] Failed to get project:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
