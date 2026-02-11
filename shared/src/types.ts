/**
 * SkillSense AI - Shared Type Definitions
 * 
 * These types are used across frontend, backend, and ML service
 * to ensure consistency in data structures.
 */

// ===========================================
// User & Authentication Types
// ===========================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'student' | 'mentor' | 'admin';

export interface UserProfile {
  targetRole: string | null;
  currentEducation: EducationLevel;
  yearsOfExperience: number;
  completedAssessments: string[];
  skillProfile: SkillProfile | null;
}

export type EducationLevel = 
  | 'high_school'
  | 'undergraduate'
  | 'graduate'
  | 'postgraduate'
  | 'professional';

// ===========================================
// Skill & Assessment Types
// ===========================================

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  parentSkillId: string | null;
  proficiencyLevels: ProficiencyLevel[];
  weight: number; // Importance weight for gap calculation
}

export type SkillCategory = 
  | 'technical'
  | 'soft'
  | 'domain'
  | 'tool';

export interface ProficiencyLevel {
  level: number; // 1-5
  name: string;
  description: string;
  indicators: string[];
}

export interface SkillProfile {
  userId: string;
  skills: SkillAssessment[];
  overallScore: number;
  lastUpdated: Date;
}

export interface SkillAssessment {
  skillId: string;
  skillName: string;
  proficiencyLevel: number; // 1-5
  confidence: number; // 0-1, how confident the system is in this assessment
  assessedAt: Date;
  source: AssessmentSource;
}

export type AssessmentSource = 
  | 'self_assessment'
  | 'quiz'
  | 'project_analysis'
  | 'peer_review';

// ===========================================
// Role & Gap Analysis Types
// ===========================================

export interface Role {
  id: string;
  title: string;
  description: string;
  industry: string;
  requiredSkills: RoleSkillRequirement[];
  salaryRange: SalaryRange;
  demandLevel: DemandLevel;
}

export interface RoleSkillRequirement {
  skillId: string;
  skillName: string;
  requiredLevel: number; // 1-5
  importance: SkillImportance;
}

export type SkillImportance = 'must_have' | 'good_to_have' | 'nice_to_have';
export type DemandLevel = 'high' | 'medium' | 'low';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface SkillGap {
  skillId: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gapSize: number; // requiredLevel - currentLevel
  priority: GapPriority;
  estimatedTimeToClose: number; // in hours
}

export type GapPriority = 'critical' | 'high' | 'medium' | 'low';

// ===========================================
// Assessment Question Types
// ===========================================

export interface Assessment {
  id: string;
  title: string;
  description: string;
  targetSkills: string[];
  questions: AssessmentQuestion[];
  estimatedDuration: number; // in minutes
  difficulty: AssessmentDifficulty;
}

export type AssessmentDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface AssessmentQuestion {
  id: string;
  skillId: string;
  type: QuestionType;
  text: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  difficultyWeight: number; // Higher = harder question
}

export type QuestionType = 
  | 'multiple_choice'
  | 'multi_select'
  | 'self_rating'
  | 'scenario_based'
  | 'code_snippet';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  proficiencyIndicator?: number; // Which proficiency level this answer indicates
}

// ===========================================
// Recommendation Types
// ===========================================

export interface LearningRecommendation {
  id: string;
  skillId: string;
  skillName: string;
  resourceType: ResourceType;
  title: string;
  description: string;
  url: string;
  provider: string;
  estimatedDuration: number; // in hours
  difficulty: AssessmentDifficulty;
  rating: number;
  priority: number; // Lower = higher priority
}

export type ResourceType = 
  | 'course'
  | 'tutorial'
  | 'documentation'
  | 'project'
  | 'book'
  | 'video';

export interface LearningPath {
  userId: string;
  targetRoleId: string;
  targetRoleName: string;
  recommendations: LearningRecommendation[];
  totalEstimatedTime: number;
  gapsCovered: SkillGap[];
  generatedAt: Date;
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  timestamp: Date;
}

// ===========================================
// ML Service Types
// ===========================================

export interface GapAnalysisRequest {
  userId: string;
  skillProfile: SkillProfile;
  targetRoleId: string;
}

export interface GapAnalysisResponse {
  gaps: SkillGap[];
  overallReadiness: number; // 0-100 percentage
  strengthAreas: string[];
  improvementAreas: string[];
  recommendations: LearningRecommendation[];
}

export interface ProficiencyPredictionRequest {
  userId: string;
  assessmentResponses: AssessmentResponse[];
}

export interface AssessmentResponse {
  questionId: string;
  skillId: string;
  answer: string | string[];
  timeSpent: number; // in seconds
}

export interface ProficiencyPredictionResponse {
  predictions: SkillAssessment[];
  confidence: number;
}
