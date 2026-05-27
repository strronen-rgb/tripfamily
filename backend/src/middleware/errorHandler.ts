import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { ZodError } from 'zod';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Unknown errors
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}
