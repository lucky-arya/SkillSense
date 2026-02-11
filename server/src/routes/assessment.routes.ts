/**
 * SkillSense AI - Assessment Routes
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as assessmentController from '../controllers/assessment.controller';

const router = Router();

// All assessment routes require authentication
router.use(authenticate);

// Get available assessments
router.get('/', assessmentController.getAssessments);

// Get assessment by ID
router.get(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid assessment ID'),
  ]),
  assessmentController.getAssessmentById
);

// Submit assessment responses
router.post(
  '/:id/submit',
  validate([
    param('id').isMongoId().withMessage('Invalid assessment ID'),
    body('responses')
      .isArray({ min: 1 })
      .withMessage('Responses array is required'),
    body('responses.*.questionId')
      .notEmpty()
      .withMessage('Question ID is required'),
    body('responses.*.answer')
      .notEmpty()
      .withMessage('Answer is required'),
    body('duration')
      .optional()
      .isInt({ min: 0 }),
  ]),
  assessmentController.submitAssessment
);

// Get user's assessment history
router.get('/history/me', assessmentController.getUserAssessmentHistory);

// Get specific assessment result
router.get(
  '/result/:resultId',
  validate([
    param('resultId').isMongoId().withMessage('Invalid result ID'),
  ]),
  assessmentController.getAssessmentResult
);

// Admin: Create assessment
router.post(
  '/',
  authorize('admin'),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('questions').isArray({ min: 1 }).withMessage('Questions are required'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
  ]),
  assessmentController.createAssessment
);

export default router;
