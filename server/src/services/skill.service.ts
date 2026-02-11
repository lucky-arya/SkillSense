/**
 * SkillSense AI - Skill Service
 */

import { Skill, ISkill } from '../models/skill.model';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES } from '@skillsense/shared';

interface GetAllSkillsOptions {
  page: number;
  limit: number;
  category?: string;
}

interface CreateSkillInput {
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'tool';
  description: string;
  weight?: number;
  tags?: string[];
  parentSkillId?: string;
}

class SkillService {
  async getAllSkills(options: GetAllSkillsOptions) {
    const { page, limit, category } = options;
    const skip = (page - 1) * limit;

    const query: any = { isActive: true };
    if (category) {
      query.category = category;
    }

    const [skills, total] = await Promise.all([
      Skill.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      Skill.countDocuments(query),
    ]);

    return {
      skills,
      page,
      limit,
      total,
    };
  }

  async getSkillById(skillId: string): Promise<ISkill> {
    const skill = await Skill.findById(skillId);

    if (!skill) {
      throw new AppError(
        'Skill not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return skill;
  }

  async searchSkills(query: string, category?: string): Promise<ISkill[]> {
    const searchQuery: any = { isActive: true };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (category) {
      searchQuery.category = category;
    }

    const skills = await Skill.find(searchQuery)
      .limit(50)
      .sort({ score: { $meta: 'textScore' } });

    return skills;
  }

  async createSkill(input: CreateSkillInput): Promise<ISkill> {
    // Check for duplicate name
    const existing = await Skill.findOne({ name: input.name });
    if (existing) {
      throw new AppError(
        'Skill with this name already exists',
        409,
        ERROR_CODES.RESOURCE_ALREADY_EXISTS
      );
    }

    const skill = await Skill.create(input);
    return skill;
  }

  async updateSkill(skillId: string, input: Partial<CreateSkillInput>): Promise<ISkill> {
    const skill = await Skill.findByIdAndUpdate(
      skillId,
      input,
      { new: true, runValidators: true }
    );

    if (!skill) {
      throw new AppError(
        'Skill not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return skill;
  }

  async getSkillsByIds(skillIds: string[]): Promise<ISkill[]> {
    const skills = await Skill.find({ _id: { $in: skillIds }, isActive: true });
    return skills;
  }
}

export const skillService = new SkillService();
