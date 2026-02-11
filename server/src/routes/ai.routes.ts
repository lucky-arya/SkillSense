/**
 * SkillSense AI - AI Routes
 * 
 * Routes for all AI-powered features
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadResume, handleUploadError } from '../middleware/upload';
import * as aiController from '../controllers/ai.controller';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// Resume Analysis
router.post('/resume/analyze', uploadResume, handleUploadError, aiController.analyzeResume);
router.post('/resume/roast', uploadResume, handleUploadError, aiController.roastResume);
router.post('/resume/extract-skills', uploadResume, handleUploadError, aiController.extractSkills);

// Mock Interview
router.post('/interview/start', aiController.startInterview);
router.post('/interview/evaluate-answer', aiController.evaluateAnswer);
router.post('/interview/evaluate', aiController.evaluateInterview);

// Career Roadmap
router.post('/roadmap/generate', aiController.generateRoadmap);

// AI Chat
router.post('/chat', aiController.chat);

// AI Assessment Generation
router.post('/assessment/generate', aiController.generateAssessment);

export default router;
