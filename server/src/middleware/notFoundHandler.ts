/**
 * SkillSense AI - 404 Not Found Handler
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@skillsense/shared';
import { ERROR_CODES } from '@skillsense/shared';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    meta: {
      timestamp: new Date(),
    },
  };

  res.status(404).json(response);
};
