// ============================================================
// Batch Router — handles batch generation API endpoints
// ============================================================

import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { GENERATED_DIR } from '../utils/paths.js';
import * as batchService from '../services/batchService.js';
import { triggerQueue } from '../services/batchQueue.js';

const router = Router();

// Configure multer storage for uploaded batch files
const uploadsDir = path.join(GENERATED_DIR, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'batch-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv' || ext === '.json' || ext === '.xlsx') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, JSON, and XLSX files are allowed!'));
    }
  },
});

// POST /api/batch/upload - Upload and parse file to create a batch
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a batch file (CSV, JSON, XLSX)' });
    }

    try {
      const batchId = await batchService.createBatchFromFile(req.file.path, req.file.originalname);
      
      // Clean up uploaded file since it's already stored in database items
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('[BatchRouter] Failed to delete temporary upload file:', unlinkErr);
      }

      res.status(201).json({
        success: true,
        data: {
          batchId,
        },
      });
    } catch (parseErr) {
      // Clean up file if parsing fails
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (ignore) {}

      res.status(400).json({
        success: false,
        error: parseErr instanceof Error ? parseErr.message : 'Failed to parse file',
      });
    }
  });
});

// POST /api/batch/start - Trigger queue runner to start rendering pending videos
router.post('/start', (req, res) => {
  triggerQueue();
  res.json({ success: true, message: 'Queue processor started' });
});

// GET /api/batch - List all batches
router.get('/', (req, res, next) => {
  try {
    const batches = batchService.getAllBatches();
    res.json({
      success: true,
      data: batches,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/batch/:id - Get details of a batch and its items
router.get('/:id', (req, res, next) => {
  try {
    const batch = batchService.getBatchWithItems(req.params.id);
    if (!batch) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }
    res.json({
      success: true,
      data: batch,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/batch/:id/status - Get stats/progress of a batch
router.get('/:id/status', (req, res, next) => {
  try {
    const progress = batchService.getBatchProgress(req.params.id);
    if (!progress) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }
    res.json({
      success: true,
      data: progress,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/batch/:id/download - Stream downloadable ZIP with batch outputs
router.get('/:id/download', async (req, res, next) => {
  try {
    const batch = batchService.getBatchWithItems(req.params.id);
    if (!batch) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="batch-${batch.name || req.params.id}.zip"`);

    await batchService.generateBatchZipStream(req.params.id, res);
  } catch (err) {
    // If headers have not been sent yet, send a JSON error
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'ZIP compilation failed' });
    } else {
      next(err);
    }
  }
});

// POST /api/batch/:id/retry - Re-queue failed items in a specific batch
router.post('/:id/retry', (req, res, next) => {
  try {
    const retried = batchService.retryBatch(req.params.id);
    if (!retried) {
      res.status(400).json({ success: false, error: 'No failed items found in this batch to retry' });
      return;
    }
    res.json({
      success: true,
      message: 'Failed items re-queued successfully',
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/batch/:id - Delete a batch and its videos/records
router.delete('/:id', (req, res, next) => {
  try {
    const deleted = batchService.deleteBatch(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Batch not found' });
      return;
    }
    res.json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
