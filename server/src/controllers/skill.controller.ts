/**
 * SkillSense AI - Skill Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { skillService } from '../services/skill.service';
import { ApiResponse } from '@skillsense/shared';

export const getAllSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    
    const result = await skillService.getAllSkills({
      page: Number(page),
      limit: Number(limit),
      category: category as string | undefined,
    });
    
    const response: ApiResponse<typeof result.skills> = {
      success: true,
      data: result.skills,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        timestamp: new Date(),
      },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getSkillById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skill = await skillService.getSkillById(req.params.id);
    
    const response: ApiResponse<typeof skill> = {
      success: true,
      data: skill,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const searchSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, category } = req.query;
    
    const skills = await skillService.searchSkills(
      q as string,
      category as string | undefined
    );
    
    const response: ApiResponse<typeof skills> = {
      success: true,
      data: skills,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createSkill = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skill = await skillService.createSkill(req.body);
    
    const response: ApiResponse<typeof skill> = {
      success: true,
      data: skill,
      meta: { timestamp: new Date() },
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skill = await skillService.updateSkill(req.params.id, req.body);
    
    const response: ApiResponse<typeof skill> = {
      success: true,
      data: skill,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
