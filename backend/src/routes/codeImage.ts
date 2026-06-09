// ============================================================
// Code Image router
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import * as codeImageService from '../services/codeImageService.js';

const router = Router();

const CodeImageRequestSchema = z.object({
  code: z.string(),
  language: z.enum(['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php']),
  theme: z.enum(['github-dark', 'vitesse-dark', 'tokyo-night', 'dracula']),
  font_size: z.number().int().min(10).max(48).optional(),
  padding: z.number().int().min(0).max(100).optional(),
});

// POST /api/code-image - Generate syntax-highlighted code image (HTML file)
router.post('/', validate(CodeImageRequestSchema), async (req, res, next) => {
  try {
    const { code, language, theme, font_size, padding } = req.body;
    const result = await codeImageService.generateCodeHtml(
      code,
      language,
      theme,
      font_size ?? 16,
      padding ?? 24
    );

    res.json({
      success: true,
      data: {
        image_path: result.htmlPath,
        image_url: result.htmlUrl,
        width: 800,
        height: 600,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
