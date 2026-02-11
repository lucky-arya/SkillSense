/**
 * Tests for AppError class and errorHandler middleware
 */

import { AppError } from '../../middleware/errorHandler';
import { ERROR_CODES } from '@skillsense/shared';

describe('AppError', () => {
  it('should create an error with default values', () => {
    const error = new AppError('Something went wrong');

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    expect(error.isOperational).toBe(true);
    expect(error.details).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should create an error with custom status and code', () => {
    const error = new AppError(
      'Not found',
      404,
      ERROR_CODES.RESOURCE_NOT_FOUND
    );

    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ERROR_CODES.RESOURCE_NOT_FOUND);
  });

  it('should accept optional details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const error = new AppError(
      'Validation error',
      400,
      ERROR_CODES.VALIDATION_FAILED,
      details
    );

    expect(error.details).toEqual(details);
  });

  it('should have a stack trace', () => {
    const error = new AppError('test');
    expect(error.stack).toBeDefined();
  });
});
