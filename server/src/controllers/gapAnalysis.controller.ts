/**
 * SkillSense AI - Gap Analysis Controller
 * 
 * Handles skill gap analysis requests, coordinating with ML service
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { gapAnalysisService } from '../services/gapAnalysis.service';
import { ApiResponse } from '@skillsense/shared';

export const analyzeGaps = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetRoleId } = req.body;
    
    const analysis = await gapAnalysisService.analyzeGaps(
      req.user!.id,
      targetRoleId
    );
    
    const response: ApiResponse<typeof analysis> = {
      success: true,
      data: analysis,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recommendations = await gapAnalysisService.getRecommendations(req.user!.id);
    
    const response: ApiResponse<typeof recommendations> = {
      success: true,
      data: recommendations,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getGapAnalysisHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const history = await gapAnalysisService.getGapAnalysisHistory(req.user!.id);
    
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

export const getGapAnalysisById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await gapAnalysisService.getGapAnalysisById(
      req.user!.id,
      req.params.id
    );
    
    const response: ApiResponse<typeof analysis> = {
      success: true,
      data: analysis,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
