/**
 * SkillSense AI - Environment Configuration
 * 
 * Centralized configuration management with validation
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

interface Config {
  nodeEnv: string;
  port: number;
  apiVersion: string;
  
  // Database
  mongodbUri: string;
  
  // Authentication
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // ML Service
  mlServiceUrl: string;
  mlServiceTimeout: number;
  
  // CORS
  corsOrigin: string;
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvVarAsInt = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer for environment variable: ${key}`);
  }
  return parsed;
};

export const config: Config = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: getEnvVarAsInt('PORT', 5000),
  apiVersion: getEnvVar('API_VERSION', 'v1'),
  
  mongodbUri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/skillsense'),
  
  jwtSecret: getEnvVar('JWT_SECRET', 'dev-secret-change-in-production'),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  
  mlServiceUrl: getEnvVar('ML_SERVICE_URL', 'http://localhost:8000'),
  mlServiceTimeout: getEnvVarAsInt('ML_SERVICE_TIMEOUT', 30000),
  
  corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
  
  rateLimitWindowMs: getEnvVarAsInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  rateLimitMaxRequests: getEnvVarAsInt('RATE_LIMIT_MAX_REQUESTS', 100),
};

// Validate critical config in production
if (config.nodeEnv === 'production') {
  if (config.jwtSecret === 'dev-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production');
  }
}
