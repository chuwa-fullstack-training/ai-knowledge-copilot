import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';
import logger from '../config/logger';

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error:', {
          path: req.path,
          errors: error.issues,
        });

        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: formattedErrors,
        });
        return;
      }

      // Log unexpected error types for debugging
      logger.error('Unexpected validation error:', {
        path: req.path,
        errorType: error?.constructor?.name,
        error: error,
      });

      next(error);
    }
  };
}
