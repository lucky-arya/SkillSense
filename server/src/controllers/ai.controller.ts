/**
 * SkillSense AI - AI Controller
 * 
 * Handles all AI-powered feature endpoints:
 * - Resume analysis & roasting
 * - Mock interviews
 * - Career roadmap generation
 * - AI chat assistant
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '@skillsense/shared';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

// ==========================================
// Resume Analysis
// ==========================================
export const analyzeResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let resumeText = req.body.resumeText || '';
    const { targetRole, targetField } = req.body;

    // If a file was uploaded, extract text from it
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdf(req.file.buffer);
        resumeText = pdfData.text;
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    }

    if (!resumeText) {
      throw new AppError('Resume text or file is required', 400, 'MISSING_RESUME');
    }

    if (!targetRole) {
      throw new AppError('Target role is required', 400, 'MISSING_TARGET_ROLE');
    }

    const analysis = await aiService.analyzeResume(
      resumeText,
      targetRole,
      targetField || 'Technology'
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

export const roastResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let resumeText = req.body.resumeText || '';
    const { targetRole } = req.body;

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdf(req.file.buffer);
        resumeText = pdfData.text;
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    }

    if (!resumeText) {
      throw new AppError('Resume text or file is required', 400, 'MISSING_RESUME');
    }

    const roast = await aiService.roastResume(resumeText, targetRole || 'Software Engineer');

    const response: ApiResponse<typeof roast> = {
      success: true,
      data: roast,
      meta: { timestamp: new Date() },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Mock Interview
// ==========================================
export const startInterview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetRole, difficulty, resumeText, focusArea } = req.body;

    if (!targetRole) {
      throw new AppError('Target role is required', 400, 'MISSING_TARGET_ROLE');
    }

    const questions = await aiService.generateInterviewQuestions(
      targetRole,
      difficulty || 'intermediate',
      resumeText,
      focusArea
    );

    const response: ApiResponse<typeof questions> = {
      success: true,
      data: questions,
      meta: { timestamp: new Date() },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const evaluateAnswer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question, answer, targetRole, conversationHistory } = req.body;

    if (!question || !answer) {
      throw new AppError('Question and answer are required', 400, 'MISSING_INPUT');
    }

    const evaluation = await aiService.evaluateInterviewAnswer(
      question,
      answer,
      targetRole || 'Software Engineer',
      conversationHistory || []
    );

    const response: ApiResponse<typeof evaluation> = {
      success: true,
      data: evaluation,
      meta: { timestamp: new Date() },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const evaluateInterview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetRole, conversationHistory } = req.body;

    if (!conversationHistory || conversationHistory.length === 0) {
      throw new AppError('Conversation history is required', 400, 'MISSING_HISTORY');
    }

    const evaluation = await aiService.generateInterviewEvaluation(
      targetRole || 'Software Engineer',
      conversationHistory
    );

    const response: ApiResponse<typeof evaluation> = {
      success: true,
      data: evaluation,
      meta: { timestamp: new Date() },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Career Roadmap
// ==========================================
export const generateRoadmap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetRole, currentSkills, experienceLevel } = req.body;

    if (!targetRole) {
      throw new AppError('Target role is required', 400, 'MISSING_TARGET_ROLE');
    }

    const roadmap = await aiService.generateCareerRoadmap(
      currentSkills || [],
      targetRole,
      experienceLevel
    );

    const response: ApiResponse<typeof roadmap> = {
      success: true,
      data: roadmap,
      meta: { timestamp: new Date() },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// AI Chat
// ==========================================
export const chat = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, conversationHistory, userContext } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400, 'MISSING_MESSAGE');
    }

    const reply = await aiService.chatWithAI(
      message,
      conversationHistory || [],
      userContext
    );

    const response: ApiResponse<{ reply: string }> = {
      success: true,
      data: { reply },
      meta: { timestamp: new Date() },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Skill Extraction
// ==========================================
export const extractSkills = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let resumeText = req.body.resumeText || '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdf(req.file.buffer);
        resumeText = pdfData.text;
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    }

    if (!resumeText) {
      throw new AppError('Resume text or file is required', 400, 'MISSING_RESUME');
    }

    const skills = await aiService.extractSkillsFromResume(resumeText);

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

// ==========================================
// AI Assessment Generation
// ==========================================
export const generateAssessment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetRole, experienceLevel, currentSkills, focusAreas } = req.body;

    if (!targetRole) {
      throw new AppError('Target role is required', 400, 'MISSING_TARGET_ROLE');
    }

    if (!experienceLevel) {
      throw new AppError('Experience level is required', 400, 'MISSING_EXPERIENCE_LEVEL');
    }

    const assessment = await aiService.generatePersonalizedAssessment({
      targetRole,
      experienceLevel: experienceLevel || 'Junior',
      currentSkills: currentSkills || [],
      focusAreas: focusAreas || [],
    });

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
