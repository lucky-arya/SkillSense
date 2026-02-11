/**
 * SkillSense AI - Assessment Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { assessmentService } from '../services/assessment.service';
import { ApiResponse } from '@skillsense/shared';

export const getAssessments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, difficulty, skillId } = req.query;
    
    const result = await assessmentService.getAssessments({
      page: Number(page),
      limit: Number(limit),
      difficulty: difficulty as string | undefined,
      skillId: skillId as string | undefined,
    });
    
    const response: ApiResponse<typeof result.assessments> = {
      success: true,
      data: result.assessments,
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

export const getAssessmentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessment = await assessmentService.getAssessmentById(req.params.id);
    
    const response: ApiResponse<typeof assessment> = {
      success: true,
      data: assessment,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { responses, duration } = req.body;
    
    const result = await assessmentService.submitAssessment(
      req.user!.id,
      req.params.id,
      responses,
      duration
    );
    
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

export const getUserAssessmentHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const history = await assessmentService.getUserAssessmentHistory(req.user!.id);
    
    const response: ApiResponse<typeof history> = {
      success: true,
      data: history,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAssessmentResult = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await assessmentService.getAssessmentResult(
      req.user!.id,
      req.params.resultId
    );
    
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

export const createAssessment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessment = await assessmentService.createAssessment(req.body);
    
    const response: ApiResponse<typeof assessment> = {
      success: true,
      data: assessment,
      meta: { timestamp: new Date() },
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
