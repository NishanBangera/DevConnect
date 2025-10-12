import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Error',
      errors: err.errors || []
    });
  }

  console.error('Unhandled error:', err);
  const status = err && err.statusCode && Number(err.statusCode) < 600 ? Number(err.statusCode) : 500;
  const message = err && err.message ? err.message : 'Internal server error';
  res.status(status).json({ success: false, message });
};

export default errorHandler;
