// ============================================================
// Server entry point for the backend API
// ============================================================

import express from 'express';
import cors from 'cors';
import { ensureDirectories, GENERATED_DIR, ASSETS_DIR } from './utils/paths.js';
import { runMigrations } from './database/migrations.js';
import { getDb } from './database/connection.js';
import { checkFfmpeg } from './utils/ffmpeg.js';
import { checkPiper } from './services/audioService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routers
import projectsRouter from './routes/projects.js';
import templatesRouter from './routes/templates.js';
import codeImageRouter from './routes/codeImage.js';
import audioRouter from './routes/audio.js';
import renderRouter from './routes/render.js';
import exportsRouter from './routes/exports.js';
import settingsRouter from './routes/settings.js';
import uploadRouter from './routes/upload.js';
import batchRouter from './routes/batch.js';
import { initQueue } from './services/batchQueue.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure generated and asset directories exist
ensureDirectories();

// Run database migrations on startup
runMigrations();

// Initialize batch rendering queue
initQueue();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static generated outputs and assets
app.use('/generated', express.static(GENERATED_DIR));
app.use('/assets', express.static(ASSETS_DIR));

// Mount routes
app.use('/api/projects', projectsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/code-image', codeImageRouter);
app.use('/api/audio', audioRouter);
app.use('/api', renderRouter); // mounts /render and /render-progress/:projectId
app.use('/api/exports', exportsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/batch', batchRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  let database = false;
  try {
    getDb().prepare('SELECT 1').get();
    database = true;
  } catch {
    // ignore
  }

  const ffmpeg = checkFfmpeg();
  const piper = checkPiper();

  const isOk = database && ffmpeg;

  res.json({
    status: isOk ? 'ok' : 'degraded',
    ffmpeg,
    piper,
    database,
    version: '1.0.0',
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[Backend] Express server running on port ${PORT}`);
  console.log(`[Backend] - API base: http://localhost:${PORT}/api`);
  console.log(`[Backend] - Static assets: http://localhost:${PORT}/assets`);
  console.log(`[Backend] - Static generated: http://localhost:${PORT}/generated`);
});
