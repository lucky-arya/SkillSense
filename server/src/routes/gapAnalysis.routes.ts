/**
 * SkillSense AI - Gap Analysis Routes
 * 
 * Core ML-powered skill gap analysis endpoints
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as gapAnalysisController from '../controllers/gapAnalysis.controller';

const router = Router();

// All gap analysis routes require authentication
router.use(authenticate);

// Analyze skill gaps for current user against a target role
router.post(
  '/analyze',
  validate([
    body('targetRoleId')
      .notEmpty()
      .withMessage('Target role ID is required')
      .isMongoId()
      .withMessage('Invalid role ID'),
  ]),
  gapAnalysisController.analyzeGaps
);

// Get learning recommendations based on gaps
router.get('/recommendations', gapAnalysisController.getRecommendations);

// Get gap analysis history
router.get('/history', gapAnalysisController.getGapAnalysisHistory);

// Get specific gap analysis result
router.get(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid analysis ID'),
  ]),
  gapAnalysisController.getGapAnalysisById
);

export default router;
