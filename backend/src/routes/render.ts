// ============================================================
// Render router
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import * as renderService from '../services/renderService.js';
import type { RenderProgress } from '../types/sharedTypes.js';

const router = Router();

const RenderRequestSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  format: z.enum(['mp4', 'webm']),
  resolution: z.enum(['720p', '1080p', '4k']),
});

// POST /api/render - Trigger video rendering
router.post('/render', validate(RenderRequestSchema), async (req, res, next) => {
  try {
    const { project_id, format, resolution } = req.body;
    
    const { exportId } = await renderService.startRender(project_id, format, resolution);

    res.json({
      success: true,
      data: {
        jobId: exportId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/render-progress/:projectId - SSE progress endpoint
router.get('/render-progress/:projectId', (req, res) => {
  const { projectId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial message
  res.write(`data: ${JSON.stringify({ status: 'bundling', progress: 0, message: 'Connected to render progress stream' })}\n\n`);

  const onProgress = (data: RenderProgress) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  renderService.renderEvents.on(`progress:${projectId}`, onProgress);

  req.on('close', () => {
    renderService.renderEvents.off(`progress:${projectId}`, onProgress);
  });
});

export default router;
