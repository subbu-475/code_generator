// ============================================================
// Global error-handling middleware
// ============================================================

import type { Request, Response, NextFunction } from 'express';

/**
 * Express error-handling middleware.
 * Catches all errors thrown or passed via next(err) and returns a
 * consistent JSON error envelope.
 */
export function errorHandler(
  err: Error & { status?: number; statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || 'Internal Server Error';

  // Log the full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorHandler]', err);
  } else {
    console.error('[ErrorHandler]', message);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
}
