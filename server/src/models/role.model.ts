/**
 * SkillSense AI - Role Model
 * 
 * MongoDB schema for career roles and their skill requirements
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IRoleSkillRequirement {
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  requiredLevel: number;
  importance: 'must_have' | 'good_to_have' | 'nice_to_have';
}

export interface ISalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface IRole extends Document {
  title: string;
  description: string;
  industry: string;
  requiredSkills: IRoleSkillRequirement[];
  salaryRange: ISalaryRange;
  demandLevel: 'high' | 'medium' | 'low';
  experienceRange: {
    min: number;
    max: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSkillRequirementSchema = new Schema<IRoleSkillRequirement>({
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  requiredLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  importance: {
    type: String,
    enum: ['must_have', 'good_to_have', 'nice_to_have'],
    default: 'good_to_have',
  },
}, { _id: false });

const salaryRangeSchema = new Schema<ISalaryRange>({
  min: {
    type: Number,
    required: true,
    min: 0,
  },
  max: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
}, { _id: false });

const roleSchema = new Schema<IRole>({
  title: {
    type: String,
    required: [true, 'Role title is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
  },
  requiredSkills: [roleSkillRequirementSchema],
  salaryRange: {
    type: salaryRangeSchema,
    default: { min: 0, max: 0, currency: 'USD' },
  },
  demandLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  experienceRange: {
    min: {
      type: Number,
      default: 0,
      min: 0,
    },
    max: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    },
  },
});

// Indexes
roleSchema.index({ title: 'text', description: 'text' });
roleSchema.index({ industry: 1 });
roleSchema.index({ demandLevel: 1 });
roleSchema.index({ isActive: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);
