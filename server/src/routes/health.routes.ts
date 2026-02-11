/**
 * SkillSense AI - Health Check Routes
 * 
 * Endpoint for monitoring service health
 */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const healthcheck = {
    success: true,
    data: {
      service: 'SkillSense API',
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
    },
  };

  res.status(200).json(healthcheck);
});

// Readiness check (for k8s/container orchestration)
router.get('/ready', (req: Request, res: Response) => {
  const isReady = mongoose.connection.readyState === 1;
  
  res.status(isReady ? 200 : 503).json({
    success: isReady,
    data: {
      ready: isReady,
      database: isReady ? 'connected' : 'disconnected',
    },
  });
});

// Liveness check
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      alive: true,
      timestamp: new Date(),
    },
  });
});

export default router;
