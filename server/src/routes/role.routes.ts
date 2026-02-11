/**
 * SkillSense AI - Role Routes
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as roleController from '../controllers/role.controller';

const router = Router();

// Public routes
router.get('/', roleController.getAllRoles);

router.get(
  '/search',
  validate([
    query('q')
      .optional()
      .isString()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
    query('industry')
      .optional()
      .isString(),
    query('demandLevel')
      .optional()
      .isIn(['high', 'medium', 'low']),
  ]),
  roleController.searchRoles
);

router.get(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid role ID'),
  ]),
  roleController.getRoleById
);

// Get skills required for a role
router.get(
  '/:id/skills',
  validate([
    param('id').isMongoId().withMessage('Invalid role ID'),
  ]),
  roleController.getRoleSkills
);

// Protected routes
router.use(authenticate);

// Admin: Create role
router.post(
  '/',
  authorize('admin'),
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('industry').trim().notEmpty().withMessage('Industry is required'),
    body('requiredSkills').isArray().withMessage('Required skills must be an array'),
  ]),
  roleController.createRole
);

// Admin: Update role
router.put(
  '/:id',
  authorize('admin'),
  validate([
    param('id').isMongoId().withMessage('Invalid role ID'),
  ]),
  roleController.updateRole
);

export default router;
