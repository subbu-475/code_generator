// ============================================================
// Audio router - Piper TTS voice generation
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import * as audioService from '../services/audioService.js';

const router = Router();

const AudioRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  voice_model: z.string().optional(),
  output_filename: z.string().optional(),
});

// POST /api/audio - Generate audio from text
router.post('/', validate(AudioRequestSchema), async (req, res, next) => {
  try {
    const { text, voice_model, output_filename } = req.body;
    
    if (!audioService.checkPiper()) {
      res.status(400).json({
        success: false,
        error: 'Piper TTS not configured',
        message: 'Piper TTS is not installed or available on this system. Voice generation is disabled.',
      });
      return;
    }

    const result = await audioService.generateAudio(text, voice_model, output_filename);
    
    res.json({
      success: true,
      data: {
        audio_path: result.audioPath,
        audio_url: result.audioUrl,
        duration_seconds: result.durationSeconds,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
