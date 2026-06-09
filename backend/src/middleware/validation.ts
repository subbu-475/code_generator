// ============================================================
// Zod validation middleware helper
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Factory that returns an Express middleware validating `req.body`
 * against the supplied Zod schema.
 *
 * On success the parsed (and potentially transformed) data replaces
 * `req.body`.  On failure a 400 JSON response is returned.
 */
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => {
          const path = e.path.join('.');
          return path ? `${path}: ${e.message}` : e.message;
        });

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: messages.join('; '),
        });
        return;
      }
      next(err);
    }
  };
}
