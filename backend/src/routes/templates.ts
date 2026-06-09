// ============================================================
// Templates router
// ============================================================

import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import * as templateService from '../services/templateService.js';

const router = Router();

const TemplateInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  background_color: z.string().default('#1a1a2e'),
  font_family: z.string().default('JetBrains Mono'),
  font_size: z.number().int().min(10).max(48).default(16),
  accent_color: z.string().default('#7c3aed'),
  text_color: z.string().default('#ffffff'),
  animation_style: z.enum(['fade', 'zoom', 'slide', 'pop', 'bounce']).default('fade'),
  transition_style: z.enum(['fade', 'slide', 'zoom', 'none']).default('fade'),
  code_theme: z.enum(['github-dark', 'vitesse-dark', 'tokyo-night', 'dracula']).default('github-dark'),
  custom_css: z.string().optional().nullable(),
  background_effect: z.enum(['none', 'particles', 'matrix', 'grid']).default('none'),
  background_gradient: z.string().optional().nullable(),
  container_style: z.enum(['rounded', 'sharp', 'floating']).default('rounded'),
  glow_effect: z.boolean().default(true),
});

const TemplateUpdateSchema = TemplateInputSchema.partial();

// GET /api/templates - Get all templates
router.get('/', (req, res, next) => {
  try {
    const templates = templateService.getAllTemplates();
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
});

// GET /api/templates/:id - Get a single template by ID
router.get('/:id', (req, res, next) => {
  try {
    const template = templateService.getTemplateById(req.params.id as string);
    if (!template) {
      res.status(404).json({ success: false, error: 'Template not found' });
      return;
    }
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
});

// POST /api/templates - Create a new custom template
router.post('/', validate(TemplateInputSchema), (req, res, next) => {
  try {
    const template = templateService.createTemplate(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
});

// PUT /api/templates/:id - Update an existing template
router.put('/:id', validate(TemplateUpdateSchema), (req, res, next) => {
  try {
    const template = templateService.updateTemplate(req.params.id as string, req.body);
    if (!template) {
      res.status(404).json({ success: false, error: 'Template not found' });
      return;
    }
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/templates/:id - Delete a custom template
router.delete('/:id', (req, res, next) => {
  try {
    const success = templateService.deleteTemplate(req.params.id as string);
    if (!success) {
      res.status(404).json({ success: false, error: 'Template not found' });
      return;
    }
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
