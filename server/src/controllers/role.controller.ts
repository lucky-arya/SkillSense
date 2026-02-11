/**
 * SkillSense AI - Role Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { roleService } from '../services/role.service';
import { ApiResponse } from '@skillsense/shared';

export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, industry, demandLevel } = req.query;
    
    const result = await roleService.getAllRoles({
      page: Number(page),
      limit: Number(limit),
      industry: industry as string | undefined,
      demandLevel: demandLevel as string | undefined,
    });
    
    const response: ApiResponse<typeof result.roles> = {
      success: true,
      data: result.roles,
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

export const getRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    
    const response: ApiResponse<typeof role> = {
      success: true,
      data: role,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const searchRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, industry, demandLevel } = req.query;
    
    const roles = await roleService.searchRoles({
      query: q as string,
      industry: industry as string | undefined,
      demandLevel: demandLevel as string | undefined,
    });
    
    const response: ApiResponse<typeof roles> = {
      success: true,
      data: roles,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getRoleSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skills = await roleService.getRoleSkills(req.params.id);
    
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

export const createRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = await roleService.createRole(req.body);
    
    const response: ApiResponse<typeof role> = {
      success: true,
      data: role,
      meta: { timestamp: new Date() },
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    
    const response: ApiResponse<typeof role> = {
      success: true,
      data: role,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
