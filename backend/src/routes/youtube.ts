// ============================================================
// YouTube router — OAuth & video upload endpoints
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import {
  getYoutubeStatus,
  saveYoutubeConfig,
  getAuthUrl,
  handleCallback,
  disconnect,
  uploadVideo,
  getYoutubeUploads,
} from '../services/youtubeService.js';
import { getDb } from '../database/connection.js';
import path from 'node:path';

const router = Router();

const ConfigSchema = z.object({
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  autoUpload: z.boolean().optional(),
  defaultPrivacy: z.enum(['private', 'unlisted', 'public']).optional(),
  defaultTags: z.string().optional(),
});

const UploadSchema = z.object({
  exportId: z.string().optional(),
  projectId: z.string().optional(),
  filePath: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  privacyStatus: z.enum(['private', 'unlisted', 'public']).optional(),
});

// GET /api/youtube/status - Get integration status
router.get('/status', async (req, res, next) => {
  try {
    const status = await getYoutubeStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/youtube/config - Update configuration
router.post('/config', validate(ConfigSchema), async (req, res, next) => {
  try {
    saveYoutubeConfig(req.body as any);
    const status = await getYoutubeStatus();
    res.json({
      success: true,
      data: status,
      message: 'YouTube configuration updated',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/youtube/auth-url - Get OAuth authorization link
router.get('/auth-url', (req, res, next) => {
  try {
    const url = getAuthUrl();
    res.json({
      success: true,
      data: { url },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/youtube/oauth2callback - Google OAuth redirect handler
router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>YouTube Authentication Failed</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>YouTube Connection Failed</h2>
          <p style="color: red;">${error}</p>
          <p><a href="http://localhost:5173/settings">Return to App Settings</a></p>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  try {
    await handleCallback(code);
    // Render a clean success page that closes automatically or redirects
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YouTube Connected</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'YOUTUBE_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = 'http://localhost:5173/settings?youtube=connected';
            }
          </script>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 60px; background: #121218; color: #fff;">
          <h2 style="color: #10b981;">🎉 YouTube Connected Successfully!</h2>
          <p>Your YouTube channel is now connected to CodeShorts.</p>
          <p style="margin-top: 30px;"><a href="http://localhost:5173/settings" style="color: #8b5cf6; text-decoration: underline;">Return to Settings</a></p>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>YouTube Authentication Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Authentication Error</h2>
          <p style="color: red;">${err instanceof Error ? err.message : 'Unknown error'}</p>
          <p><a href="http://localhost:5173/settings">Return to App Settings</a></p>
        </body>
      </html>
    `);
  }
});

// POST /api/youtube/disconnect - Disconnect channel
router.post('/disconnect', (req, res, next) => {
  try {
    disconnect();
    res.json({
      success: true,
      message: 'YouTube account disconnected',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/youtube/upload - Upload a video
router.post('/upload', validate(UploadSchema), async (req, res, next) => {
  try {
    const { exportId, projectId, filePath, title, description, tags, privacyStatus } = req.body;

    let targetFilePath = filePath;

    // Resolve file path from exportId if not directly provided
    if (!targetFilePath && exportId) {
      const db = getDb();
      const exportRecord = db.prepare('SELECT file_path FROM exports WHERE id = ?').get(exportId) as { file_path: string } | undefined;
      if (exportRecord) {
        targetFilePath = exportRecord.file_path;
      }
    }

    // Resolve file path from latest export of projectId if neither provided
    if (!targetFilePath && projectId) {
      const db = getDb();
      const exportRecord = db.prepare('SELECT file_path FROM exports WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(projectId) as { file_path: string } | undefined;
      if (exportRecord) {
        targetFilePath = exportRecord.file_path;
      }
    }

    if (!targetFilePath) {
      return res.status(400).json({
        success: false,
        error: 'No video file found to upload. Provide exportId, projectId, or filePath.',
      });
    }

    const result = await uploadVideo({
      filePath: targetFilePath,
      title,
      description,
      tags,
      privacyStatus,
      projectId,
      exportId,
    });

    res.json({
      success: true,
      data: result,
      message: 'Video successfully uploaded to YouTube Shorts!',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/youtube/uploads - List previous uploads
router.get('/uploads', (req, res, next) => {
  try {
    const uploads = getYoutubeUploads();
    res.json({
      success: true,
      data: uploads,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
