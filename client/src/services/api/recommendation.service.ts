import apiClient from './client';

export interface LearningResource {
  id: string;
  title: string;
  type: 'course' | 'tutorial' | 'documentation' | 'video' | 'project';
  url: string;
  provider: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  relevanceScore: number;
}

export interface SkillRecommendation {
  skillId: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  resources: LearningResource[];
  estimatedTime: string;
  reason: string;
}

export const recommendationService = {
  async getRecommendations(roleId?: string): Promise<SkillRecommendation[]> {
    const response = await apiClient.get<SkillRecommendation[]>(
      '/recommendations',
      { params: { roleId } }
    );
    return response.data;
  },

  async getResourcesForSkill(skillId: string): Promise<LearningResource[]> {
    const response = await apiClient.get<LearningResource[]>(
      `/recommendations/skill/${skillId}/resources`
    );
    return response.data;
  },

  async markResourceComplete(resourceId: string): Promise<void> {
    await apiClient.post(`/recommendations/resources/${resourceId}/complete`);
  },

  async getLearningPath(roleId: string): Promise<{
    phases: {
      name: string;
      skills: string[];
      duration: string;
    }[];
    totalDuration: string;
  }> {
    const response = await apiClient.get(`/recommendations/learning-path/${roleId}`);
    return response.data;
  },
};
