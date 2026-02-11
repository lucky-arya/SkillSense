/**
 * SkillSense AI - Gap Analysis Service
 * 
 * Core business logic for skill gap analysis
 * Results are persisted to MongoDB via the GapAnalysisResult model
 */

import mongoose from 'mongoose';
import { SkillProfile, ISkillProfile } from '../models/skillProfile.model';
import { Role, IRole } from '../models/role.model';
import { User } from '../models/user.model';
import { GapAnalysisResult } from '../models/gapAnalysisResult.model';
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

interface GapAnalysisData {
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

class GapAnalysisService {
  async analyzeGaps(userId: string, targetRoleId: string): Promise<GapAnalysisData> {
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
        const saved = await this.persistResult(userId, role, mlResult);

        // Update user's target role
        await User.findByIdAndUpdate(userId, {
          'profile.targetRole': role.title,
        });

        return saved;
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
  ): Promise<GapAnalysisData> {
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

    const mlStyleResult = {
      gaps,
      overallReadiness,
      strengthAreas: strengthAreas.slice(0, 5),
      improvementAreas: improvementAreas.slice(0, 5),
    };

    const saved = await this.persistResult(userId, role, mlStyleResult);

    // Update user's target role
    await User.findByIdAndUpdate(userId, {
      'profile.targetRole': role.title,
    });

    return saved;
  }

  /**
   * Persist a gap analysis result to MongoDB and return the formatted data.
   */
  private async persistResult(
    userId: string,
    role: IRole,
    result: {
      gaps: SkillGap[];
      overallReadiness: number;
      strengthAreas: string[];
      improvementAreas: string[];
    }
  ): Promise<GapAnalysisData> {
    const doc = await GapAnalysisResult.create({
      userId: new mongoose.Types.ObjectId(userId),
      targetRole: {
        roleId: role._id,
        title: role.title,
      },
      gaps: result.gaps,
      overallReadiness: result.overallReadiness,
      strengthAreas: result.strengthAreas,
      improvementAreas: result.improvementAreas,
      analyzedAt: new Date(),
    });

    return this.toGapAnalysisData(doc);
  }

  /**
   * Map a Mongoose document to the plain GapAnalysisData interface.
   */
  private toGapAnalysisData(doc: any): GapAnalysisData {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      targetRole: {
        id: doc.targetRole.roleId.toString(),
        title: doc.targetRole.title,
      },
      gaps: doc.gaps.map((g: any) => ({
        skillId: g.skillId,
        skillName: g.skillName,
        currentLevel: g.currentLevel,
        requiredLevel: g.requiredLevel,
        gapSize: g.gapSize,
        priority: g.priority,
        importance: g.importance,
        estimatedTimeToClose: g.estimatedTimeToClose,
      })),
      overallReadiness: doc.overallReadiness,
      strengthAreas: doc.strengthAreas,
      improvementAreas: doc.improvementAreas,
      analyzedAt: doc.analyzedAt,
    };
  }

  async getRecommendations(userId: string): Promise<LearningRecommendation[]> {
    // Get the latest gap analysis from MongoDB
    const latestDoc = await GapAnalysisResult.findOne({ userId })
      .sort({ analyzedAt: -1 })
      .lean();

    if (!latestDoc) {
      throw new AppError(
        'No gap analysis found. Please run a gap analysis first.',
        400,
        ERROR_CODES.ML_INSUFFICIENT_DATA
      );
    }

    // Try ML service for personalized recommendations
    try {
      const mlRecommendations = await mlServiceClient.getRecommendations({
        userId,
        gaps: latestDoc.gaps as SkillGap[],
      });

      if (mlRecommendations) {
        return mlRecommendations;
      }
    } catch (error) {
      console.warn('ML service unavailable, using fallback recommendations');
    }

    // Fallback: Generate basic recommendations
    return this.generateBasicRecommendations(latestDoc.gaps as SkillGap[]);
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

  async getGapAnalysisHistory(userId: string): Promise<GapAnalysisData[]> {
    const docs = await GapAnalysisResult.find({ userId })
      .sort({ analyzedAt: -1 })
      .limit(10)
      .lean();

    return docs.map(doc => this.toGapAnalysisData(doc));
  }

  async getGapAnalysisById(
    userId: string,
    analysisId: string
  ): Promise<GapAnalysisData> {
    const doc = await GapAnalysisResult.findOne({
      _id: analysisId,
      userId,
    }).lean();

    if (!doc) {
      throw new AppError(
        'Gap analysis not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return this.toGapAnalysisData(doc);
  }
}

export const gapAnalysisService = new GapAnalysisService();
