// ============================================================
// Exports router
// ============================================================

import { Router } from 'express';
import fs from 'node:fs';
import * as exportService from '../services/exportService.js';

const router = Router();

// GET /api/exports - List all export records
router.get('/', (req, res, next) => {
  try {
    const exports = exportService.getAllExports();
    res.json({ success: true, data: exports });
  } catch (err) {
    next(err);
  }
});

// GET /api/exports/:id - Get export record details
router.get('/:id', (req, res, next) => {
  try {
    const record = exportService.getExportById(req.params.id);
    if (!record) {
      res.status(404).json({ success: false, error: 'Export record not found' });
      return;
    }
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// GET /api/exports/:id/download - Download the actual video file
router.get('/:id/download', (req, res, next) => {
  try {
    const record = exportService.getExportById(req.params.id);
    if (!record) {
      res.status(404).json({ success: false, error: 'Export record not found' });
      return;
    }

    if (!fs.existsSync(record.file_path)) {
      res.status(404).json({ success: false, error: 'Video file not found on disk' });
      return;
    }

    res.download(record.file_path);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/exports/:id - Delete an export record and its file
router.delete('/:id', (req, res, next) => {
  try {
    const deleted = exportService.deleteExport(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Export record not found' });
      return;
    }
    res.json({ success: true, message: 'Export deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
