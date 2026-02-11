/**
 * SkillSense AI - Recommendation Routes
 * 
 * Personalized learning recommendation endpoints
 */

import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as recommendationController from '../controllers/recommendation.controller';

const router = Router();

// All recommendation routes require authentication
router.use(authenticate);

// Get personalized recommendations based on skill gaps
router.get('/', recommendationController.getRecommendations);

// Search learning resources
router.get(
  '/search',
  validate([
    query('q').optional().isString().trim(),
    query('skillId').optional().isMongoId(),
    query('type').optional().isIn(['course', 'tutorial', 'video', 'article', 'book', 'project', 'documentation']),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  ]),
  recommendationController.searchResources
);

// Get learning path for a target role
router.get(
  '/learning-path/:roleId',
  validate([
    param('roleId').isMongoId().withMessage('Invalid role ID'),
  ]),
  recommendationController.getLearningPath
);

// Get all resources for a specific skill
router.get(
  '/skill/:skillId/resources',
  validate([
    param('skillId').isMongoId().withMessage('Invalid skill ID'),
  ]),
  recommendationController.getResourcesForSkill
);

// Mark a resource as completed
router.post(
  '/resources/:resourceId/complete',
  validate([
    param('resourceId').isMongoId().withMessage('Invalid resource ID'),
  ]),
  recommendationController.markResourceCompleted
);

export default router;
