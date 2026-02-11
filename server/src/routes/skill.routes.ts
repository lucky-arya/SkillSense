/**
 * SkillSense AI - Skill Routes
 */

import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as skillController from '../controllers/skill.controller';

const router = Router();

// Public routes (no auth required)
router.get('/', skillController.getAllSkills);

router.get(
  '/search',
  validate([
    query('q')
      .optional()
      .isString()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
    query('category')
      .optional()
      .isIn(['technical', 'soft', 'domain', 'tool']),
  ]),
  skillController.searchSkills
);

router.get(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid skill ID'),
  ]),
  skillController.getSkillById
);

// Protected routes (require authentication)
router.use(authenticate);

// Admin-only routes
router.post(
  '/',
  authorize('admin'),
  validate([
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('category').isIn(['technical', 'soft', 'domain', 'tool']).withMessage('Invalid category'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('weight').optional().isFloat({ min: 0, max: 10 }),
  ]),
  skillController.createSkill
);

router.put(
  '/:id',
  authorize('admin'),
  validate([
    param('id').isMongoId().withMessage('Invalid skill ID'),
    body('name').optional().trim().isLength({ min: 1 }),
    body('category').optional().isIn(['technical', 'soft', 'domain', 'tool']),
    body('description').optional().trim().isLength({ min: 1 }),
  ]),
  skillController.updateSkill
);

export default router;
