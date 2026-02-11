/**
 * SkillSense AI - Role Service
 */

import { Role, IRole } from '../models/role.model';
import { Skill } from '../models/skill.model';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES } from '@skillsense/shared';

interface GetAllRolesOptions {
  page: number;
  limit: number;
  industry?: string;
  demandLevel?: string;
}

interface SearchRolesOptions {
  query?: string;
  industry?: string;
  demandLevel?: string;
}

interface CreateRoleInput {
  title: string;
  description: string;
  industry: string;
  requiredSkills: {
    skillId: string;
    skillName: string;
    requiredLevel: number;
    importance: 'must_have' | 'good_to_have' | 'nice_to_have';
  }[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  demandLevel?: 'high' | 'medium' | 'low';
  experienceRange?: {
    min: number;
    max: number;
  };
}

class RoleService {
  async getAllRoles(options: GetAllRolesOptions) {
    const { page, limit, industry, demandLevel } = options;
    const skip = (page - 1) * limit;

    const query: any = { isActive: true };
    if (industry) {
      query.industry = industry;
    }
    if (demandLevel) {
      query.demandLevel = demandLevel;
    }

    const [roles, total] = await Promise.all([
      Role.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ title: 1 }),
      Role.countDocuments(query),
    ]);

    return {
      roles,
      page,
      limit,
      total,
    };
  }

  async getRoleById(roleId: string): Promise<IRole> {
    const role = await Role.findById(roleId);

    if (!role) {
      throw new AppError(
        'Role not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return role;
  }

  async searchRoles(options: SearchRolesOptions): Promise<IRole[]> {
    const { query, industry, demandLevel } = options;
    const searchQuery: any = { isActive: true };

    if (query) {
      searchQuery.$text = { $search: query };
    }
    if (industry) {
      searchQuery.industry = industry;
    }
    if (demandLevel) {
      searchQuery.demandLevel = demandLevel;
    }

    const roles = await Role.find(searchQuery)
      .limit(50)
      .sort({ title: 1 });

    return roles;
  }

  async getRoleSkills(roleId: string) {
    const role = await Role.findById(roleId);

    if (!role) {
      throw new AppError(
        'Role not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    // Get full skill details
    const skillIds = role.requiredSkills.map(s => s.skillId);
    const skills = await Skill.find({ _id: { $in: skillIds } });

    // Combine skill details with requirements
    return role.requiredSkills.map(req => {
      const skill = skills.find(s => s._id.toString() === req.skillId.toString());
      return {
        ...req,
        skill: skill || null,
      };
    });
  }

  async createRole(input: CreateRoleInput): Promise<IRole> {
    // Check for duplicate title
    const existing = await Role.findOne({ title: input.title });
    if (existing) {
      throw new AppError(
        'Role with this title already exists',
        409,
        ERROR_CODES.RESOURCE_ALREADY_EXISTS
      );
    }

    const role = await Role.create(input);
    return role;
  }

  async updateRole(roleId: string, input: Partial<CreateRoleInput>): Promise<IRole> {
    const role = await Role.findByIdAndUpdate(
      roleId,
      input,
      { new: true, runValidators: true }
    );

    if (!role) {
      throw new AppError(
        'Role not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return role;
  }
}

export const roleService = new RoleService();
