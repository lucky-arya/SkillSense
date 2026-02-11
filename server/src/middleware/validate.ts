/**
 * SkillSense AI - Validation Middleware
 * 
 * Request validation using express-validator
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';
import { ERROR_CODES } from '@skillsense/shared';

/**
 * Middleware to check validation results and throw error if invalid
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: 'path' in error ? error.path : 'unknown',
      message: error.msg,
    }));

    next(new AppError(
      'Validation failed',
      400,
      ERROR_CODES.VALIDATION_FAILED,
      { errors: formattedErrors }
    ));
  };
};
