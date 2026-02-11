/**
 * SkillSense AI - Global Error Handler Middleware
 * 
 * Catches all errors and formats them consistently
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '@skillsense/shared';
import { ERROR_CODES } from '@skillsense/shared';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 internal error
  let statusCode = 500;
  let errorCode: string = ERROR_CODES.INTERNAL_ERROR;
  let message = 'An unexpected error occurred';
  let details: Record<string, unknown> | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_FAILED;
    message = error.message;
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    statusCode = 400;
    errorCode = ERROR_CODES.INVALID_INPUT;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ERROR_CODES.AUTH_TOKEN_INVALID;
    message = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ERROR_CODES.AUTH_TOKEN_EXPIRED;
    message = 'Authentication token has expired';
  } else if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests') || error.message?.includes('rate limit')) {
    statusCode = 429;
    errorCode = 'E4029';
    message = 'AI service is temporarily unavailable due to API rate limits. Please wait a minute and try again.';
  }

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      errorCode,
    });
  }

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
    meta: {
      timestamp: new Date(),
    },
  };

  res.status(statusCode).json(response);
};
