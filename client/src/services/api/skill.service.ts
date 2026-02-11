import apiClient from './client';

export interface Skill {
  _id: string;
  name: string;
  category: string;
  description: string;
  relatedSkills: string[];
}

export interface SkillWithProficiency extends Skill {
  currentLevel: number;
  targetLevel: number;
}

export const skillService = {
  async getAllSkills(): Promise<Skill[]> {
    const response = await apiClient.get<Skill[]>('/skills');
    return response.data;
  },

  async getSkillById(id: string): Promise<Skill> {
    const response = await apiClient.get<Skill>(`/skills/${id}`);
    return response.data;
  },

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const response = await apiClient.get<Skill[]>(`/skills/category/${category}`);
    return response.data;
  },

  async getUserSkillProfile(): Promise<SkillWithProficiency[]> {
    const response = await apiClient.get<SkillWithProficiency[]>('/users/me/skills');
    return response.data;
  },

  async updateUserSkillLevel(skillId: string, level: number): Promise<void> {
    await apiClient.put(`/users/me/skills/${skillId}`, { level });
  },
};
