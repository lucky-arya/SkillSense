/**
 * Tests for shared constants and validation rules
 */

import {
  PROFICIENCY_LEVELS,
  PROFICIENCY_LABELS,
  GAP_THRESHOLDS,
  VALIDATION,
  ERROR_CODES,
  ASSESSMENT_CONFIG,
  API_CONFIG,
  LEARNING_TIME_ESTIMATES,
} from '@skillsense/shared';

describe('Proficiency Levels', () => {
  it('should define 5 levels from Novice to Expert', () => {
    expect(PROFICIENCY_LEVELS.NOVICE).toBe(1);
    expect(PROFICIENCY_LEVELS.BEGINNER).toBe(2);
    expect(PROFICIENCY_LEVELS.INTERMEDIATE).toBe(3);
    expect(PROFICIENCY_LEVELS.ADVANCED).toBe(4);
    expect(PROFICIENCY_LEVELS.EXPERT).toBe(5);
  });

  it('should have labels for each level', () => {
    expect(PROFICIENCY_LABELS[1]).toBe('Novice');
    expect(PROFICIENCY_LABELS[5]).toBe('Expert');
    // All 5 levels should have labels
    for (let i = 1; i <= 5; i++) {
      expect(PROFICIENCY_LABELS[i]).toBeDefined();
      expect(typeof PROFICIENCY_LABELS[i]).toBe('string');
    }
  });
});

describe('Gap Thresholds', () => {
  it('should have correct priority thresholds', () => {
    expect(GAP_THRESHOLDS.CRITICAL).toBe(3);
    expect(GAP_THRESHOLDS.HIGH).toBe(2);
    expect(GAP_THRESHOLDS.MEDIUM).toBe(1);
  });

  it('should satisfy CRITICAL > HIGH > MEDIUM', () => {
    expect(GAP_THRESHOLDS.CRITICAL).toBeGreaterThan(GAP_THRESHOLDS.HIGH);
    expect(GAP_THRESHOLDS.HIGH).toBeGreaterThan(GAP_THRESHOLDS.MEDIUM);
  });
});

describe('Validation Rules', () => {
  it('should validate correct emails', () => {
    const validEmails = [
      'user@example.com',
      'name+tag@domain.co',
      'a@b.c',
    ];
    validEmails.forEach(email => {
      expect(VALIDATION.EMAIL_REGEX.test(email)).toBe(true);
    });
  });

  it('should reject invalid emails', () => {
    const invalidEmails = [
      'missing-at.com',
      '@no-local.com',
      'spaces in@email.com',
      '',
    ];
    invalidEmails.forEach(email => {
      expect(VALIDATION.EMAIL_REGEX.test(email)).toBe(false);
    });
  });

  it('should have reasonable password minimum length', () => {
    expect(VALIDATION.PASSWORD_MIN_LENGTH).toBeGreaterThanOrEqual(8);
  });

  it('should have reasonable name length constraints', () => {
    expect(VALIDATION.NAME_MIN_LENGTH).toBeGreaterThanOrEqual(1);
    expect(VALIDATION.NAME_MAX_LENGTH).toBeLessThanOrEqual(100);
    expect(VALIDATION.NAME_MIN_LENGTH).toBeLessThan(VALIDATION.NAME_MAX_LENGTH);
  });
});

describe('Error Codes', () => {
  it('should follow the naming convention pattern', () => {
    // All codes should start with 'E' followed by digits
    Object.values(ERROR_CODES).forEach(code => {
      expect(code).toMatch(/^E\d{4}$/);
    });
  });

  it('should have unique codes', () => {
    const codes = Object.values(ERROR_CODES);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it('should group auth errors in 1xxx range', () => {
    expect(ERROR_CODES.AUTH_INVALID_CREDENTIALS).toMatch(/^E1/);
    expect(ERROR_CODES.AUTH_TOKEN_EXPIRED).toMatch(/^E1/);
    expect(ERROR_CODES.AUTH_TOKEN_INVALID).toMatch(/^E1/);
  });

  it('should group validation errors in 2xxx range', () => {
    expect(ERROR_CODES.VALIDATION_FAILED).toMatch(/^E2/);
    expect(ERROR_CODES.INVALID_INPUT).toMatch(/^E2/);
  });
});

describe('Assessment Config', () => {
  it('should have valid question count bounds', () => {
    expect(ASSESSMENT_CONFIG.MIN_QUESTIONS_PER_SKILL).toBeLessThan(
      ASSESSMENT_CONFIG.MAX_QUESTIONS_PER_SKILL
    );
    expect(ASSESSMENT_CONFIG.MIN_QUESTIONS_PER_SKILL).toBeGreaterThan(0);
  });

  it('should have a confidence threshold between 0 and 1', () => {
    expect(ASSESSMENT_CONFIG.CONFIDENCE_THRESHOLD).toBeGreaterThan(0);
    expect(ASSESSMENT_CONFIG.CONFIDENCE_THRESHOLD).toBeLessThanOrEqual(1);
  });
});

describe('API Config', () => {
  it('should have reasonable pagination defaults', () => {
    expect(API_CONFIG.DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    expect(API_CONFIG.MAX_PAGE_SIZE).toBeGreaterThan(API_CONFIG.DEFAULT_PAGE_SIZE);
  });
});

describe('Learning Time Estimates', () => {
  it('should have positive base hours', () => {
    expect(LEARNING_TIME_ESTIMATES.PER_LEVEL_BASE).toBeGreaterThan(0);
  });

  it('should have increasing difficulty multipliers', () => {
    const mult = LEARNING_TIME_ESTIMATES.DIFFICULTY_MULTIPLIER;
    expect(mult.beginner).toBeLessThan(mult.intermediate);
    expect(mult.intermediate).toBeLessThan(mult.advanced);
  });
});
