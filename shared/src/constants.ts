/**
 * SkillSense AI - Shared Constants
 * 
 * Application-wide constants used across all services
 */

// ===========================================
// Skill Proficiency Levels
// ===========================================

export const PROFICIENCY_LEVELS = {
  NOVICE: 1,
  BEGINNER: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4,
  EXPERT: 5,
} as const;

export const PROFICIENCY_LABELS: Record<number, string> = {
  1: 'Novice',
  2: 'Beginner',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export const PROFICIENCY_DESCRIPTIONS: Record<number, string> = {
  1: 'Just starting, needs guidance for basic tasks',
  2: 'Can perform basic tasks with some assistance',
  3: 'Can work independently on standard tasks',
  4: 'Can handle complex tasks and mentor others',
  5: 'Deep expertise, can architect solutions and innovate',
};

// ===========================================
// Gap Priority Thresholds
// ===========================================

export const GAP_THRESHOLDS = {
  CRITICAL: 3, // Gap of 3+ levels
  HIGH: 2,     // Gap of 2 levels
  MEDIUM: 1,   // Gap of 1 level
  LOW: 0,      // No gap or surplus
} as const;

// ===========================================
// Skill Categories
// ===========================================

export const SKILL_CATEGORIES = {
  TECHNICAL: 'technical',
  SOFT: 'soft',
  DOMAIN: 'domain',
  TOOL: 'tool',
} as const;

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical Skills',
  soft: 'Soft Skills',
  domain: 'Domain Knowledge',
  tool: 'Tools & Technologies',
};

// ===========================================
// Assessment Configuration
// ===========================================

export const ASSESSMENT_CONFIG = {
  MIN_QUESTIONS_PER_SKILL: 3,
  MAX_QUESTIONS_PER_SKILL: 10,
  DEFAULT_TIME_PER_QUESTION: 60, // seconds
  CONFIDENCE_THRESHOLD: 0.7, // Minimum confidence for skill assessment
} as const;

// ===========================================
// API Configuration
// ===========================================

export const API_CONFIG = {
  VERSION: 'v1',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

// ===========================================
// Validation Rules
// ===========================================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// ===========================================
// Error Codes
// ===========================================

export const ERROR_CODES = {
  // Authentication Errors (1xxx)
  AUTH_INVALID_CREDENTIALS: 'E1001',
  AUTH_TOKEN_EXPIRED: 'E1002',
  AUTH_TOKEN_INVALID: 'E1003',
  AUTH_UNAUTHORIZED: 'E1004',
  
  // Validation Errors (2xxx)
  VALIDATION_FAILED: 'E2001',
  INVALID_INPUT: 'E2002',
  MISSING_REQUIRED_FIELD: 'E2003',
  
  // Resource Errors (3xxx)
  RESOURCE_NOT_FOUND: 'E3001',
  RESOURCE_ALREADY_EXISTS: 'E3002',
  RESOURCE_CONFLICT: 'E3003',
  
  // ML Service Errors (4xxx)
  ML_SERVICE_UNAVAILABLE: 'E4001',
  ML_PREDICTION_FAILED: 'E4002',
  ML_INSUFFICIENT_DATA: 'E4003',
  
  // Server Errors (5xxx)
  INTERNAL_ERROR: 'E5001',
  DATABASE_ERROR: 'E5002',
  EXTERNAL_SERVICE_ERROR: 'E5003',
} as const;

// ===========================================
// Time Estimates (in hours)
// ===========================================

export const LEARNING_TIME_ESTIMATES = {
  PER_LEVEL_BASE: 20, // Base hours to improve one proficiency level
  DIFFICULTY_MULTIPLIER: {
    beginner: 0.8,
    intermediate: 1.0,
    advanced: 1.5,
  },
} as const;
