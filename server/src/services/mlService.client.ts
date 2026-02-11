/**
 * SkillSense AI - ML Service Client
 * 
 * HTTP client for communicating with Python ML microservice
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/environment';

interface ProficiencyPredictionRequest {
  userId: string;
  assessmentResponses: {
    questionId: string;
    skillId: string;
    answer: string | string[];
    timeSpent: number;
  }[];
}

interface ProficiencyPredictionResponse {
  predictions: {
    skillId: string;
    skillName: string;
    proficiencyLevel: number;
    confidence: number;
  }[];
  confidence: number;
}

interface GapAnalysisRequest {
  userId: string;
  skillProfile: {
    userId: string;
    skills: {
      skillId: string;
      skillName: string;
      proficiencyLevel: number;
      confidence: number;
      assessedAt: Date;
      source: string;
    }[];
    overallScore: number;
    lastUpdated: Date;
  };
  targetRoleId: string;
}

interface GapAnalysisResponse {
  gaps: {
    skillId: string;
    skillName: string;
    currentLevel: number;
    requiredLevel: number;
    gapSize: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    importance: string;
    estimatedTimeToClose: number;
  }[];
  overallReadiness: number;
  strengthAreas: string[];
  improvementAreas: string[];
}

interface RecommendationRequest {
  userId: string;
  gaps: {
    skillId: string;
    skillName: string;
    gapSize: number;
    priority: string;
  }[];
}

interface LearningRecommendation {
  skillId: string;
  skillName: string;
  resourceType: string;
  title: string;
  description: string;
  url: string;
  provider: string;
  estimatedDuration: number;
  priority: number;
}

class MLServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.mlServiceUrl,
      timeout: config.mlServiceTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        console.error('ML Service Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        throw error;
      }
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data?.status === 'healthy';
    } catch {
      return false;
    }
  }

  async predictProficiency(
    request: ProficiencyPredictionRequest
  ): Promise<ProficiencyPredictionResponse | null> {
    try {
      const response = await this.client.post<ProficiencyPredictionResponse>(
        '/api/v1/predict/proficiency',
        request
      );
      return response.data;
    } catch (error) {
      console.warn('Proficiency prediction failed:', error);
      return null;
    }
  }

  async analyzeGaps(
    request: GapAnalysisRequest
  ): Promise<GapAnalysisResponse | null> {
    try {
      const response = await this.client.post<GapAnalysisResponse>(
        '/api/v1/analyze/gaps',
        request
      );
      return response.data;
    } catch (error) {
      console.warn('Gap analysis failed:', error);
      return null;
    }
  }

  async getRecommendations(
    request: RecommendationRequest
  ): Promise<LearningRecommendation[] | null> {
    try {
      const response = await this.client.post<{ recommendations: LearningRecommendation[] }>(
        '/api/v1/recommend',
        request
      );
      return response.data.recommendations;
    } catch (error) {
      console.warn('Recommendations request failed:', error);
      return null;
    }
  }
}

export const mlServiceClient = new MLServiceClient();
