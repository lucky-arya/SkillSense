/**
 * SkillSense AI - Gap Analysis Service
 * 
 * Core business logic for skill gap analysis
 */

import mongoose from 'mongoose';
import { SkillProfile, ISkillProfile } from '../models/skillProfile.model';
import { Role, IRole } from '../models/role.model';
import { User } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, GAP_THRESHOLDS, LEARNING_TIME_ESTIMATES } from '@skillsense/shared';
import { mlServiceClient } from './mlService.client';

interface SkillGap {
  skillId: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gapSize: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  importance: string;
  estimatedTimeToClose: number;
}

interface GapAnalysisResult {
  id: string;
  userId: string;
  targetRole: {
    id: string;
    title: string;
  };
  gaps: SkillGap[];
  overallReadiness: number;
  strengthAreas: string[];
  improvementAreas: string[];
  analyzedAt: Date;
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

// In-memory storage for gap analysis results (in production, use a proper model)
const gapAnalysisCache = new Map<string, GapAnalysisResult[]>();

class GapAnalysisService {
  async analyzeGaps(userId: string, targetRoleId: string): Promise<GapAnalysisResult> {
    // Get user's skill profile
    const skillProfile = await SkillProfile.findOne({ userId });
    
    if (!skillProfile || skillProfile.skills.length === 0) {
      throw new AppError(
        'No skill profile found. Please complete at least one assessment first.',
        400,
        ERROR_CODES.ML_INSUFFICIENT_DATA
      );
    }

    // Get target role
    const role = await Role.findById(targetRoleId);
    
    if (!role) {
      throw new AppError(
        'Target role not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    // Try ML service first for intelligent gap analysis
    try {
      const mlResult = await mlServiceClient.analyzeGaps({
        userId,
        skillProfile: {
          userId,
          skills: skillProfile.skills.map(s => ({
            skillId: s.skillId.toString(),
            skillName: s.skillName,
            proficiencyLevel: s.proficiencyLevel,
            confidence: s.confidence,
            assessedAt: s.assessedAt,
            source: s.source,
          })),
          overallScore: skillProfile.overallScore,
          lastUpdated: skillProfile.lastUpdated,
        },
        targetRoleId,
      });

      if (mlResult) {
        const result: GapAnalysisResult = {
          id: new mongoose.Types.ObjectId().toString(),
          userId,
          targetRole: {
            id: role._id.toString(),
            title: role.title,
          },
          gaps: mlResult.gaps,
          overallReadiness: mlResult.overallReadiness,
          strengthAreas: mlResult.strengthAreas,
          improvementAreas: mlResult.improvementAreas,
          analyzedAt: new Date(),
        };

        // Cache the result
        this.cacheResult(userId, result);

        // Update user's target role
        await User.findByIdAndUpdate(userId, {
          'profile.targetRole': role.title,
        });

        return result;
      }
    } catch (error) {
      console.warn('ML service unavailable, using fallback gap analysis');
    }

    // Fallback: Calculate gaps locally
    return this.localGapAnalysis(userId, skillProfile, role);
  }

  private async localGapAnalysis(
    userId: string,
    skillProfile: ISkillProfile,
    role: IRole
  ): Promise<GapAnalysisResult> {
    const gaps: SkillGap[] = [];
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];

    // Create a map of user's skills
    const userSkills = new Map(
      skillProfile.skills.map(s => [s.skillId.toString(), s])
    );

    // Compare with role requirements
    for (const req of role.requiredSkills) {
      const userSkill = userSkills.get(req.skillId.toString());
      const currentLevel = userSkill?.proficiencyLevel || 0;
      const gapSize = req.requiredLevel - currentLevel;

      if (gapSize > 0) {
        // Calculate priority based on gap size and importance
        let priority: 'critical' | 'high' | 'medium' | 'low';
        if (gapSize >= GAP_THRESHOLDS.CRITICAL || req.importance === 'must_have') {
          priority = 'critical';
        } else if (gapSize >= GAP_THRESHOLDS.HIGH) {
          priority = 'high';
        } else if (gapSize >= GAP_THRESHOLDS.MEDIUM) {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        // Estimate time to close gap
        const estimatedTime = gapSize * LEARNING_TIME_ESTIMATES.PER_LEVEL_BASE;

        gaps.push({
          skillId: req.skillId.toString(),
          skillName: req.skillName,
          currentLevel,
          requiredLevel: req.requiredLevel,
          gapSize,
          priority,
          importance: req.importance,
          estimatedTimeToClose: estimatedTime,
        });

        improvementAreas.push(req.skillName);
      } else if (currentLevel >= req.requiredLevel) {
        strengthAreas.push(req.skillName);
      }
    }

    // Sort gaps by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Calculate overall readiness
    const totalRequired = role.requiredSkills.length;
    const totalMet = strengthAreas.length;
    const overallReadiness = totalRequired > 0
      ? Math.round((totalMet / totalRequired) * 100)
      : 0;

    const result: GapAnalysisResult = {
      id: new mongoose.Types.ObjectId().toString(),
      userId,
      targetRole: {
        id: role._id.toString(),
        title: role.title,
      },
      gaps,
      overallReadiness,
      strengthAreas: strengthAreas.slice(0, 5),
      improvementAreas: improvementAreas.slice(0, 5),
      analyzedAt: new Date(),
    };

    // Cache the result
    this.cacheResult(userId, result);

    // Update user's target role
    await User.findByIdAndUpdate(userId, {
      'profile.targetRole': role.title,
    });

    return result;
  }

  private cacheResult(userId: string, result: GapAnalysisResult): void {
    const existing = gapAnalysisCache.get(userId) || [];
    existing.unshift(result);
    // Keep only last 10 analyses
    gapAnalysisCache.set(userId, existing.slice(0, 10));
  }

  async getRecommendations(userId: string): Promise<LearningRecommendation[]> {
    // Get the latest gap analysis
    const analyses = gapAnalysisCache.get(userId);
    
    if (!analyses || analyses.length === 0) {
      throw new AppError(
        'No gap analysis found. Please run a gap analysis first.',
        400,
        ERROR_CODES.ML_INSUFFICIENT_DATA
      );
    }

    const latestAnalysis = analyses[0];

    // Try ML service for personalized recommendations
    try {
      const mlRecommendations = await mlServiceClient.getRecommendations({
        userId,
        gaps: latestAnalysis.gaps,
      });

      if (mlRecommendations) {
        return mlRecommendations;
      }
    } catch (error) {
      console.warn('ML service unavailable, using fallback recommendations');
    }

    // Fallback: Generate basic recommendations
    return this.generateBasicRecommendations(latestAnalysis.gaps);
  }

  private generateBasicRecommendations(gaps: SkillGap[]): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = [];

    // Generate recommendations for top gaps
    const topGaps = gaps.slice(0, 5);

    topGaps.forEach((gap, index) => {
      recommendations.push({
        skillId: gap.skillId,
        skillName: gap.skillName,
        resourceType: 'course',
        title: `Learn ${gap.skillName} - Beginner to ${this.getLevelName(gap.requiredLevel)}`,
        description: `Close your ${gap.skillName} skill gap with this comprehensive course.`,
        url: '#', // Would be actual course URLs in production
        provider: 'SkillSense Learning',
        estimatedDuration: gap.estimatedTimeToClose,
        priority: index + 1,
      });
    });

    return recommendations;
  }

  private getLevelName(level: number): string {
    const names = ['', 'Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return names[level] || 'Advanced';
  }

  async getGapAnalysisHistory(userId: string): Promise<GapAnalysisResult[]> {
    return gapAnalysisCache.get(userId) || [];
  }

  async getGapAnalysisById(
    userId: string,
    analysisId: string
  ): Promise<GapAnalysisResult> {
    const analyses = gapAnalysisCache.get(userId) || [];
    const analysis = analyses.find(a => a.id === analysisId);

    if (!analysis) {
      throw new AppError(
        'Gap analysis not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return analysis;
  }
}

export const gapAnalysisService = new GapAnalysisService();
