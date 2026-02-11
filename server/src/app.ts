/**
 * SkillSense AI - Express Application Configuration
 * 
 * Sets up Express with middleware stack and route mounting
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config/environment';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Route imports
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import skillRoutes from './routes/skill.routes';
import assessmentRoutes from './routes/assessment.routes';
import roleRoutes from './routes/role.routes';
import gapAnalysisRoutes from './routes/gapAnalysis.routes';
import recommendationRoutes from './routes/recommendation.routes';
import aiRoutes from './routes/ai.routes';

const app: Application = express();

// ===========================================
// Security Middleware
// ===========================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
});
app.use(limiter);

// ===========================================
// Body Parsing & Logging
// ===========================================

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logging (skip in test environment)
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ===========================================
// API Routes
// ===========================================

const apiPrefix = `/api/${config.apiVersion}`;

// Health check (no auth required)
app.use(`${apiPrefix}/health`, healthRoutes);

// Authentication routes
app.use(`${apiPrefix}/auth`, authRoutes);

// Protected resource routes
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/skills`, skillRoutes);
app.use(`${apiPrefix}/assessments`, assessmentRoutes);
app.use(`${apiPrefix}/roles`, roleRoutes);
app.use(`${apiPrefix}/gap-analysis`, gapAnalysisRoutes);
app.use(`${apiPrefix}/recommendations`, recommendationRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);

// ===========================================
// Error Handling
// ===========================================

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
