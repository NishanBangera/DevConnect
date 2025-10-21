import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(new ApiResponse(err.statusCode, null, err.message || 'Error'));
  }

  console.error('Unhandled error:', err);
  const status = err && err.statusCode && Number(err.statusCode) < 600 ? Number(err.statusCode) : 500;
  const message = err && err.message ? err.message : 'Internal server error';
  res.status(status).json(new ApiResponse(status, null, message));
};

export default errorHandler;
