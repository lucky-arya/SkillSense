import apiClient from './client';

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'rating' | 'practical';
  options?: string[];
  skillId: string;
}

export interface Assessment {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  estimatedTime: number;
  skillsAssessed: string[];
}

export interface AssessmentResult {
  _id: string;
  assessmentId: string;
  userId: string;
  scores: {
    skillId: string;
    score: number;
    predictedLevel: number;
  }[];
  completedAt: string;
}

export const assessmentService = {
  async getAvailableAssessments(): Promise<Assessment[]> {
    const response = await apiClient.get<Assessment[]>('/assessments');
    return response.data;
  },

  async getAssessmentById(id: string): Promise<Assessment> {
    const response = await apiClient.get<Assessment>(`/assessments/${id}`);
    return response.data;
  },

  async startAssessment(assessmentId: string): Promise<{ sessionId: string }> {
    const response = await apiClient.post<{ sessionId: string }>(`/assessments/${assessmentId}/start`);
    return response.data;
  },

  async submitAssessment(
    assessmentId: string,
    answers: { questionId: string; answer: string | number }[]
  ): Promise<AssessmentResult> {
    const response = await apiClient.post<AssessmentResult>(
      `/assessments/${assessmentId}/submit`,
      { responses: answers }
    );
    return response.data;
  },

  async getPastResults(): Promise<AssessmentResult[]> {
    const response = await apiClient.get<AssessmentResult[]>('/assessments/history');
    return response.data;
  },
};
