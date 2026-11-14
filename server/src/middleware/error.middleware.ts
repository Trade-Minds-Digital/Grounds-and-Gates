import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('💥 Unhandled Exception / API Error:', err);

  // Zod Validation Errors
  if (err instanceof ZodError) {
    const formatted = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    errorResponse(res, 'Validation Error', 400, formatted);
    return;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    errorResponse(res, `Duplicate entry. A record with this ${field} already exists.`, 409);
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    errorResponse(res, `Invalid ID format for ${err.path}`, 400);
    return;
  }

  // Multer Error
  if (err.name === 'MulterError') {
    errorResponse(res, `File upload error: ${err.message}`, 400);
    return;
  }

  // Default Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  errorResponse(res, message, statusCode);
};
