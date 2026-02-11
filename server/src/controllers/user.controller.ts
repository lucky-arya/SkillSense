/**
 * SkillSense AI - User Controller
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { userService } from '../services/user.service';
import { ApiResponse } from '@skillsense/shared';

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.user!.id);
    
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.updateUser(req.user!.id, req.body);
    
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserSkillProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skillProfile = await userService.getUserSkillProfile(req.user!.id);
    
    const response: ApiResponse<typeof skillProfile> = {
      success: true,
      data: skillProfile,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const setTargetRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleId } = req.body;
    const user = await userService.setTargetRole(req.user!.id, roleId);
    
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
