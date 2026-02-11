/**
 * SkillSense AI - Recommendation Controller
 * 
 * Handles personalized learning recommendations
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { recommendationService } from '../services/recommendation.service';
import { gapAnalysisService } from '../services/gapAnalysis.service';
import { ApiResponse } from '@skillsense/shared';

export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleId } = req.query;
    
    // Get user's latest gap analysis if available
    let gaps: any[] = [];
    try {
      const history = await gapAnalysisService.getGapAnalysisHistory(req.user!.id);
      if (history.length > 0) {
        gaps = history[0].gaps;
      }
    } catch {
      // No gap analysis available, will use generic recommendations
    }

    const recommendations = await recommendationService.getRecommendations(
      req.user!.id,
      gaps
    );
    
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

export const getResourcesForSkill = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { skillId } = req.params;
    
    const resources = await recommendationService.getAllResourcesForSkill(skillId);
    
    const response: ApiResponse<typeof resources> = {
      success: true,
      data: resources,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getLearningPath = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleId } = req.params;
    
    // Get gap analysis for the role
    const analysis = await gapAnalysisService.analyzeGaps(req.user!.id, roleId);
    
    // Generate learning path based on gaps
    const learningPath = await recommendationService.generateLearningPath(
      req.user!.id,
      analysis.gaps
    );
    
    const response: ApiResponse<typeof learningPath> = {
      success: true,
      data: learningPath,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const searchResources = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, skillId, type, difficulty, provider } = req.query;
    
    const resources = await recommendationService.searchResources(
      q as string || '',
      {
        skillId: skillId as string,
        type: type as string,
        difficulty: difficulty as string,
        provider: provider as string,
      }
    );
    
    const response: ApiResponse<typeof resources> = {
      success: true,
      data: resources,
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const markResourceCompleted = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resourceId } = req.params;
    
    await recommendationService.markResourceCompleted(req.user!.id, resourceId);
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Resource marked as completed' },
      meta: { timestamp: new Date() },
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
