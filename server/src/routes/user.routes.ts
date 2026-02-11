/**
 * SkillSense AI - User Routes
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as userController from '../controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update current user profile
router.put(
  '/me',
  validate([
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('profile.targetRole')
      .optional()
      .isString(),
    body('profile.currentEducation')
      .optional()
      .isIn(['high_school', 'undergraduate', 'graduate', 'postgraduate', 'professional']),
    body('profile.yearsOfExperience')
      .optional()
      .isInt({ min: 0, max: 50 }),
  ]),
  userController.updateCurrentUser
);

// Get user's skill profile
router.get('/me/skills', userController.getUserSkillProfile);

// Update user's target role
router.put(
  '/me/target-role',
  validate([
    body('roleId')
      .notEmpty()
      .withMessage('Role ID is required')
      .isMongoId()
      .withMessage('Invalid role ID'),
  ]),
  userController.setTargetRole
);

export default router;
