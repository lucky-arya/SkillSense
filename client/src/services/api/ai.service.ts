import apiClient from './client';

export interface ResumeAnalysisResult {
  overallScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
  experienceLevel: string;
  summary: string;
}

export interface ResumeRoastResult {
  roastComments: string[];
  improvementTips: string[];
  memeVerdict: string;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  tips: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  softSkillScore: number;
  technicalScore: number;
  communicationScore: number;
  feedback: string;
  questionEvaluations: Array<{
    question: string;
    score: number;
    evaluation: string;
    idealAnswer: string;
    areasToImprove: string;
  }>;
}

export interface CareerRoadmap {
  introduction: string;
  currentLevel: string;
  targetLevel: string;
  estimatedDuration: string;
  timelineSteps: Array<{
    phase: string;
    duration: string;
    title: string;
    description: string;
    skills: string[];
    projects: string[];
    resources: string[];
    milestones: string[];
  }>;
  finalAdvice: string;
}

export const aiService = {
  // Resume Analysis
  analyzeResume: async (data: FormData): Promise<ResumeAnalysisResult> => {
    const response = await apiClient.post('/ai/resume/analyze', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  roastResume: async (data: FormData): Promise<ResumeRoastResult> => {
    const response = await apiClient.post('/ai/resume/roast', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  extractSkills: async (data: FormData) => {
    const response = await apiClient.post('/ai/resume/extract-skills', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  // Mock Interview
  startInterview: async (params: {
    targetRole: string;
    difficulty: string;
    resumeText?: string;
    focusArea?: string;
  }): Promise<InterviewQuestion[]> => {
    const response = await apiClient.post('/ai/interview/start', params, { timeout: 30000 });
    return response.data;
  },

  evaluateAnswer: async (params: {
    question: string;
    answer: string;
    targetRole: string;
    conversationHistory: Array<{ role: string; content: string }>;
  }) => {
    const response = await apiClient.post('/ai/interview/evaluate-answer', params, { timeout: 30000 });
    return response.data;
  },

  evaluateInterview: async (params: {
    targetRole: string;
    conversationHistory: Array<{ role: string; content: string }>;
  }): Promise<InterviewEvaluation> => {
    const response = await apiClient.post('/ai/interview/evaluate', params, { timeout: 60000 });
    return response.data;
  },

  // Career Roadmap
  generateRoadmap: async (params: {
    targetRole: string;
    currentSkills?: Array<{ name: string; level: number }>;
    experienceLevel?: string;
  }): Promise<CareerRoadmap> => {
    const response = await apiClient.post('/ai/roadmap/generate', params, { timeout: 60000 });
    return response.data;
  },

  // AI Chat
  chat: async (params: {
    message: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    userContext?: { skills?: string[]; targetRole?: string; name?: string };
  }): Promise<{ reply: string }> => {
    const response = await apiClient.post('/ai/chat', params, { timeout: 30000 });
    return response.data;
  },

  // AI Assessment Generation
  generateAssessment: async (params: {
    targetRole: string;
    experienceLevel: string;
    currentSkills: string[];
    focusAreas: string[];
  }): Promise<{
    title: string;
    description: string;
    questions: Array<{
      id: string;
      text: string;
      type: 'multiple_choice' | 'self_rating' | 'scenario_based';
      options?: Array<{ id: string; text: string; isCorrect: boolean }>;
      skillArea: string;
      difficulty: string;
    }>;
  }> => {
    const response = await apiClient.post('/ai/assessment/generate', params, { timeout: 60000 });
    return response.data;
  },
};
