/**
 * SkillSense AI - User Service
 */

import { User, IUser } from '../models/user.model';
import { SkillProfile, ISkillProfile } from '../models/skillProfile.model';
import { Role } from '../models/role.model';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES } from '@skillsense/shared';

interface UpdateUserInput {
  name?: string;
  profile?: {
    targetRole?: string;
    currentEducation?: string;
    yearsOfExperience?: number;
  };
}

class UserService {
  async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(
        'User not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }
    
    return user;
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<IUser> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(
        'User not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    // Update fields
    if (input.name) {
      user.name = input.name;
    }

    if (input.profile) {
      if (input.profile.targetRole !== undefined) {
        user.profile.targetRole = input.profile.targetRole;
      }
      if (input.profile.currentEducation !== undefined) {
        user.profile.currentEducation = input.profile.currentEducation as any;
      }
      if (input.profile.yearsOfExperience !== undefined) {
        user.profile.yearsOfExperience = input.profile.yearsOfExperience;
      }
    }

    await user.save();
    
    return user;
  }

  async getUserSkillProfile(userId: string): Promise<ISkillProfile | null> {
    const skillProfile = await SkillProfile.findOne({ userId });
    
    return skillProfile;
  }

  async setTargetRole(userId: string, roleId: string): Promise<IUser> {
    // Verify role exists
    const role = await Role.findById(roleId);
    
    if (!role) {
      throw new AppError(
        'Role not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 'profile.targetRole': role.title },
      { new: true }
    );

    if (!user) {
      throw new AppError(
        'User not found',
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return user;
  }
}

export const userService = new UserService();
