/**
 * SkillSense AI - Recommendation Service
 * 
 * Personalized learning resource recommendations
 */

import { LearningResource, ILearningResource } from '../models/learningResource.model';
import { SkillProfile } from '../models/skillProfile.model';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES } from '@skillsense/shared';
import { mlServiceClient } from './mlService.client';

interface SkillGapInput {
  skillId: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gapSize: number;
  priority: string;
}

interface RecommendationResult {
  skillId: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  gapSize: number;
  resources: ILearningResource[];
  estimatedTime: number;
  reason: string;
}

interface LearningPathPhase {
  phase: number;
  name: string;
  skills: string[];
  duration: number;
  resources: ILearningResource[];
}

class RecommendationService {
  /**
   * Get personalized recommendations based on user's skill gaps
   */
  async getRecommendations(
    userId: string,
    gaps: SkillGapInput[]
  ): Promise<RecommendationResult[]> {
    if (!gaps || gaps.length === 0) {
      // If no gaps provided, get from user's profile
      const profile = await SkillProfile.findOne({ userId });
      if (!profile) {
        throw new AppError(
          'No skill profile found. Complete an assessment first.',
          400,
          ERROR_CODES.ML_INSUFFICIENT_DATA
        );
      }
      // Return generic recommendations for improving existing skills
      return this.getGenericRecommendations(userId, profile);
    }

    const recommendations: RecommendationResult[] = [];

    // Sort gaps by priority
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedGaps = [...gaps].sort(
      (a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
    );

    // Get resources for each gap
    for (const gap of sortedGaps) {
      const resources = await this.getResourcesForSkill(gap.skillId, gap.currentLevel);
      
      if (resources.length > 0) {
        const totalDuration = resources.reduce((sum, r) => sum + r.estimatedDuration, 0);
        
        recommendations.push({
          skillId: gap.skillId,
          skillName: gap.skillName,
          currentLevel: gap.currentLevel,
          targetLevel: gap.requiredLevel,
          gapSize: gap.gapSize,
          resources: resources.slice(0, 5), // Top 5 resources per skill
          estimatedTime: totalDuration,
          reason: this.generateReason(gap),
        });
      }
    }

    return recommendations;
  }

  /**
   * Get resources for a specific skill based on current level
   */
  async getResourcesForSkill(
    skillId: string,
    currentLevel: number = 0
  ): Promise<ILearningResource[]> {
    // Determine appropriate difficulty based on current level
    let difficulty: string[];
    if (currentLevel <= 1) {
      difficulty = ['beginner'];
    } else if (currentLevel <= 3) {
      difficulty = ['beginner', 'intermediate'];
    } else {
      difficulty = ['intermediate', 'advanced'];
    }

    const resources = await LearningResource.find({
      skillId,
      difficulty: { $in: difficulty },
      isActive: true,
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10);

    return resources;
  }

  /**
   * Get all resources for a skill (no level filtering)
   */
  async getAllResourcesForSkill(skillId: string): Promise<ILearningResource[]> {
    const resources = await LearningResource.find({
      skillId,
      isActive: true,
    })
      .sort({ difficulty: 1, rating: -1 })
      .limit(20);

    return resources;
  }

  /**
   * Generate a structured learning path for a target role
   */
  async generateLearningPath(
    userId: string,
    gaps: SkillGapInput[]
  ): Promise<{ phases: LearningPathPhase[]; totalDuration: number }> {
    const phases: LearningPathPhase[] = [];
    let totalDuration = 0;

    // Phase 1: Critical gaps (foundations)
    const criticalGaps = gaps.filter(g => g.priority === 'critical');
    if (criticalGaps.length > 0) {
      const phase1Resources: ILearningResource[] = [];
      for (const gap of criticalGaps) {
        const resources = await this.getResourcesForSkill(gap.skillId, gap.currentLevel);
        phase1Resources.push(...resources.slice(0, 3));
      }
      const phaseDuration = phase1Resources.reduce((sum, r) => sum + r.estimatedDuration, 0);
      phases.push({
        phase: 1,
        name: 'Foundation Building',
        skills: criticalGaps.map(g => g.skillName),
        duration: phaseDuration,
        resources: phase1Resources,
      });
      totalDuration += phaseDuration;
    }

    // Phase 2: High priority gaps
    const highGaps = gaps.filter(g => g.priority === 'high');
    if (highGaps.length > 0) {
      const phase2Resources: ILearningResource[] = [];
      for (const gap of highGaps) {
        const resources = await this.getResourcesForSkill(gap.skillId, gap.currentLevel);
        phase2Resources.push(...resources.slice(0, 3));
      }
      const phaseDuration = phase2Resources.reduce((sum, r) => sum + r.estimatedDuration, 0);
      phases.push({
        phase: phases.length + 1,
        name: 'Core Skills Development',
        skills: highGaps.map(g => g.skillName),
        duration: phaseDuration,
        resources: phase2Resources,
      });
      totalDuration += phaseDuration;
    }

    // Phase 3: Medium/Low priority (enhancement)
    const otherGaps = gaps.filter(g => g.priority === 'medium' || g.priority === 'low');
    if (otherGaps.length > 0) {
      const phase3Resources: ILearningResource[] = [];
      for (const gap of otherGaps) {
        const resources = await this.getResourcesForSkill(gap.skillId, gap.currentLevel);
        phase3Resources.push(...resources.slice(0, 2));
      }
      const phaseDuration = phase3Resources.reduce((sum, r) => sum + r.estimatedDuration, 0);
      phases.push({
        phase: phases.length + 1,
        name: 'Skill Enhancement',
        skills: otherGaps.map(g => g.skillName),
        duration: phaseDuration,
        resources: phase3Resources,
      });
      totalDuration += phaseDuration;
    }

    return { phases, totalDuration };
  }

  /**
   * Search resources by query
   */
  async searchResources(
    query: string,
    filters?: {
      skillId?: string;
      type?: string;
      difficulty?: string;
      provider?: string;
    }
  ): Promise<ILearningResource[]> {
    const searchQuery: any = { isActive: true };

    if (query) {
      searchQuery.$text = { $search: query };
    }
    if (filters?.skillId) {
      searchQuery.skillId = filters.skillId;
    }
    if (filters?.type) {
      searchQuery.type = filters.type;
    }
    if (filters?.difficulty) {
      searchQuery.difficulty = filters.difficulty;
    }
    if (filters?.provider) {
      searchQuery.provider = filters.provider;
    }

    const resources = await LearningResource.find(searchQuery)
      .sort({ rating: -1, reviewCount: -1 })
      .limit(50);

    return resources;
  }

  /**
   * Mark a resource as completed by user
   */
  async markResourceCompleted(
    userId: string,
    resourceId: string
  ): Promise<void> {
    // In a full implementation, this would update a UserProgress model
    // For now, we'll update the skill profile's last activity
    await SkillProfile.findOneAndUpdate(
      { userId },
      { $set: { lastUpdated: new Date() } }
    );
  }

  /**
   * Get generic recommendations for users without gaps data
   */
  private async getGenericRecommendations(
    userId: string,
    profile: any
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    for (const skill of profile.skills.slice(0, 5)) {
      const resources = await this.getResourcesForSkill(
        skill.skillId.toString(),
        skill.proficiencyLevel
      );

      if (resources.length > 0) {
        recommendations.push({
          skillId: skill.skillId.toString(),
          skillName: skill.skillName,
          currentLevel: skill.proficiencyLevel,
          targetLevel: Math.min(5, skill.proficiencyLevel + 1),
          gapSize: 1,
          resources: resources.slice(0, 3),
          estimatedTime: resources.slice(0, 3).reduce((sum, r) => sum + r.estimatedDuration, 0),
          reason: `Continue improving your ${skill.skillName} skills`,
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate explanation for why a skill needs improvement
   */
  private generateReason(gap: SkillGapInput): string {
    const reasons: Record<string, string> = {
      critical: `Critical gap in ${gap.skillName}. This is essential for your target role and needs immediate attention.`,
      high: `High priority skill gap. ${gap.skillName} is important for your career goals.`,
      medium: `${gap.skillName} will strengthen your overall profile.`,
      low: `Nice to have improvement in ${gap.skillName}.`,
    };

    return reasons[gap.priority] || `Improve your ${gap.skillName} skills to reach level ${gap.requiredLevel}.`;
  }
}

export const recommendationService = new RecommendationService();
