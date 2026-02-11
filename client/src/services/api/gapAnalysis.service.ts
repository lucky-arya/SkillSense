import apiClient from './client';

export interface SkillGap {
  skillId: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gapSize: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  importance: 'essential' | 'preferred' | 'nice-to-have';
}

export interface GapAnalysisResult {
  overallReadiness: number;
  gaps: SkillGap[];
  strengths: {
    skillId: string;
    skillName: string;
    level: number;
    exceededBy: number;
  }[];
  recommendations: string[];
  estimatedTimeToClose: number; // in weeks
}

export const gapAnalysisService = {
  async analyzeGaps(roleId: string): Promise<GapAnalysisResult> {
    const response = await apiClient.post<GapAnalysisResult>('/gap-analysis/analyze', {
      targetRoleId: roleId,
    });
    return response.data;
  },

  async getLatestAnalysis(): Promise<GapAnalysisResult | null> {
    try {
      const response = await apiClient.get<GapAnalysisResult>('/gap-analysis/latest');
      return response.data;
    } catch {
      return null;
    }
  },

  async getGapHistory(): Promise<{ date: string; readiness: number }[]> {
    const response = await apiClient.get<{ date: string; readiness: number }[]>(
      '/gap-analysis/history'
    );
    return response.data;
  },
};
