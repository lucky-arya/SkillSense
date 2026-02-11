/**
 * SkillSense AI - Authentication Controller
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '@skillsense/shared';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    
    const result = await authService.register({ email, password, name });
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      meta: { timestamp: new Date() },
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login({ email, password });
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    const result = await authService.refreshToken(refreshToken);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
