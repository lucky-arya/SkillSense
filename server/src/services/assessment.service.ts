/**
 * SkillSense AI - Assessment Service
 */

import { Assessment, IAssessment } from '../models/assessment.model';
import { AssessmentResult, IAssessmentResult } from '../models/assessmentResult.model';
import { SkillProfile } from '../models/skillProfile.model';
import { User } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES } from '@skillsense/shared';
import { mlServiceClient } from './mlService.client';

interface GetAssessmentsOptions {
  page: number;
  limit: number;
  difficulty?: string;
  skillId?: string;
}

interface AssessmentResponseInput {
  questionId: string;
  answer: string | string[];
  timeSpent?: number;
}

interface CreateAssessmentInput {
  title: string;
  description: string;
  targetSkills: string[];
  questions: any[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

class AssessmentService {
  async getAssessments(options: GetAssessmentsOptions) {
    const { page, limit, difficulty, skillId } = options;
    const skip = (page - 1) * limit;

    const query: any = { isActive: true };
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (skillId) {
      query.targetSkills = skillId;
    }

    const [assessments, total] = await Promise.all([
      Assessment.find(query)
        .select('-questions.correctAnswer') // Don't expose answers
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Assessment.countDocuments(query),
    ]);

    return {
      assessments,
      page,
      limit,
      total,
    };
  }

  async getAssessmentById(assessmentId: string): Promise<IAssessment> {
    const assessment = await Assessment.findById(assessmentId)
      .select('-questions.correctAnswer -questions.explanation');

    if (!assessment) {
      throw new AppError(
        'Assessment not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return assessment;
  }

  async submitAssessment(
    userId: string,
    assessmentId: string,
    responses: AssessmentResponseInput[],
    duration: number = 0
  ): Promise<IAssessmentResult> {
    // Get assessment with answers
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      throw new AppError(
        'Assessment not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    // Score the responses
    const scoredResponses = responses.map(response => {
      const question = assessment.questions.find(q => q.id === response.questionId);
      
      if (!question) {
        return {
          questionId: response.questionId,
          skillId: null as any,
          answer: response.answer,
          timeSpent: response.timeSpent || 0,
          isCorrect: false,
        };
      }

      let isCorrect = false;
      
      if (question.type === 'self_rating') {
        // Self-rating questions are always "correct" - they indicate proficiency
        isCorrect = true;
      } else if (question.correctAnswer) {
        if (Array.isArray(question.correctAnswer)) {
          isCorrect = Array.isArray(response.answer) &&
            question.correctAnswer.every(a => response.answer.includes(a)) &&
            response.answer.every((a: string) => question.correctAnswer!.includes(a));
        } else {
          isCorrect = response.answer === question.correctAnswer;
        }
      }

      return {
        questionId: response.questionId,
        skillId: question.skillId,
        answer: response.answer,
        timeSpent: response.timeSpent || 0,
        isCorrect,
      };
    });

    // Calculate overall score
    const totalQuestions = scoredResponses.length;
    const correctAnswers = scoredResponses.filter(r => r.isCorrect).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Calculate skill-wise scores
    const skillScores = new Map<string, number>();
    const skillCounts = new Map<string, { correct: number; total: number }>();

    scoredResponses.forEach(response => {
      if (response.skillId) {
        const skillId = response.skillId.toString();
        const current = skillCounts.get(skillId) || { correct: 0, total: 0 };
        current.total++;
        if (response.isCorrect) current.correct++;
        skillCounts.set(skillId, current);
      }
    });

    skillCounts.forEach((counts, skillId) => {
      skillScores.set(skillId, Math.round((counts.correct / counts.total) * 100));
    });

    // Create result
    const result = await AssessmentResult.create({
      userId,
      assessmentId,
      responses: scoredResponses,
      score,
      skillScores,
      duration,
      completedAt: new Date(),
    });

    // Update user's completed assessments
    await User.findByIdAndUpdate(userId, {
      $addToSet: { 'profile.completedAssessments': assessmentId },
    });

    // Update skill profile with new assessments
    await this.updateSkillProfile(userId, scoredResponses, assessment);

    return result;
  }

  private async updateSkillProfile(
    userId: string,
    responses: any[],
    assessment: IAssessment
  ): Promise<void> {
    // Try to get ML predictions for skill proficiency
    try {
      const predictions = await mlServiceClient.predictProficiency({
        userId,
        assessmentResponses: responses.map(r => ({
          questionId: r.questionId,
          skillId: r.skillId?.toString() || '',
          answer: r.answer,
          timeSpent: r.timeSpent,
        })),
      });

      if (predictions && predictions.predictions) {
        // Update skill profile with ML predictions
        const skillProfile = await SkillProfile.findOne({ userId });
        
        if (skillProfile) {
          for (const pred of predictions.predictions) {
            const existingIndex = skillProfile.skills.findIndex(
              s => s.skillId.toString() === pred.skillId
            );

            const skillAssessment = {
              skillId: pred.skillId as any,
              skillName: pred.skillName,
              proficiencyLevel: pred.proficiencyLevel,
              confidence: pred.confidence,
              assessedAt: new Date(),
              source: 'quiz' as const,
            };

            if (existingIndex >= 0) {
              skillProfile.skills[existingIndex] = skillAssessment;
            } else {
              skillProfile.skills.push(skillAssessment);
            }
          }

          // Recalculate overall score
          const avgProficiency = skillProfile.skills.reduce(
            (sum, s) => sum + s.proficiencyLevel, 0
          ) / skillProfile.skills.length;
          skillProfile.overallScore = Math.round((avgProficiency / 5) * 100);

          await skillProfile.save();
        }
      }
    } catch (error) {
      // If ML service is unavailable, use basic scoring
      console.warn('ML service unavailable, using basic skill scoring');
      await this.basicSkillUpdate(userId, responses, assessment);
    }
  }

  private async basicSkillUpdate(
    userId: string,
    responses: any[],
    assessment: IAssessment
  ): Promise<void> {
    const skillProfile = await SkillProfile.findOne({ userId });
    if (!skillProfile) return;

    // Group responses by skill
    const skillScores = new Map<string, { correct: number; total: number }>();

    responses.forEach(response => {
      if (response.skillId) {
        const skillId = response.skillId.toString();
        const current = skillScores.get(skillId) || { correct: 0, total: 0 };
        current.total++;
        if (response.isCorrect) current.correct++;
        skillScores.set(skillId, current);
      }
    });

    // Convert scores to proficiency levels (1-5)
    skillScores.forEach((scores, skillId) => {
      const percentage = scores.correct / scores.total;
      const proficiencyLevel = Math.min(5, Math.max(1, Math.ceil(percentage * 5)));

      const existingIndex = skillProfile.skills.findIndex(
        s => s.skillId.toString() === skillId
      );

      const question = assessment.questions.find(
        q => q.skillId.toString() === skillId
      );

      const skillAssessment = {
        skillId: skillId as any,
        skillName: question?.skillId?.toString() || 'Unknown',
        proficiencyLevel,
        confidence: 0.6, // Lower confidence without ML
        assessedAt: new Date(),
        source: 'quiz' as const,
      };

      if (existingIndex >= 0) {
        // Average with existing score
        const existing = skillProfile.skills[existingIndex];
        skillAssessment.proficiencyLevel = Math.round(
          (existing.proficiencyLevel + proficiencyLevel) / 2
        );
        skillProfile.skills[existingIndex] = skillAssessment;
      } else {
        skillProfile.skills.push(skillAssessment);
      }
    });

    await skillProfile.save();
  }

  async getUserAssessmentHistory(userId: string): Promise<IAssessmentResult[]> {
    const results = await AssessmentResult.find({ userId })
      .populate('assessmentId', 'title description difficulty')
      .sort({ completedAt: -1 });

    return results;
  }

  async getAssessmentResult(
    userId: string,
    resultId: string
  ): Promise<IAssessmentResult> {
    const result = await AssessmentResult.findOne({
      _id: resultId,
      userId,
    }).populate('assessmentId', 'title description questions');

    if (!result) {
      throw new AppError(
        'Assessment result not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return result;
  }

  async createAssessment(input: CreateAssessmentInput): Promise<IAssessment> {
    const assessment = await Assessment.create(input);
    return assessment;
  }
}

export const assessmentService = new AssessmentService();
