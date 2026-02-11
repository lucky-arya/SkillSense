/**
 * SkillSense AI - Authentication Middleware
 * 
 * JWT token verification and user extraction
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { AppError } from './errorHandler';
import { ERROR_CODES } from '@skillsense/shared';
import { User } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'No authentication token provided',
        401,
        ERROR_CODES.AUTH_UNAUTHORIZED
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new AppError(
        'User no longer exists',
        401,
        ERROR_CODES.AUTH_UNAUTHORIZED
      );
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401, ERROR_CODES.AUTH_TOKEN_INVALID));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401, ERROR_CODES.AUTH_TOKEN_EXPIRED));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401, ERROR_CODES.AUTH_UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403,
          ERROR_CODES.AUTH_UNAUTHORIZED
        )
      );
    }

    next();
  };
};
