/**
 * SkillSense AI - Skill Model
 * 
 * MongoDB schema for skill definitions and taxonomy
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IProficiencyLevel {
  level: number;
  name: string;
  description: string;
  indicators: string[];
}

export interface ISkill extends Document {
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'tool';
  description: string;
  parentSkillId: mongoose.Types.ObjectId | null;
  proficiencyLevels: IProficiencyLevel[];
  weight: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const proficiencyLevelSchema = new Schema<IProficiencyLevel>({
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  indicators: [{
    type: String,
  }],
}, { _id: false });

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    unique: true,
  },
  category: {
    type: String,
    enum: ['technical', 'soft', 'domain', 'tool'],
    required: [true, 'Category is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  parentSkillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    default: null,
  },
  proficiencyLevels: {
    type: [proficiencyLevelSchema],
    default: [
      { level: 1, name: 'Novice', description: 'Just starting, needs guidance', indicators: [] },
      { level: 2, name: 'Beginner', description: 'Can perform basic tasks', indicators: [] },
      { level: 3, name: 'Intermediate', description: 'Works independently', indicators: [] },
      { level: 4, name: 'Advanced', description: 'Handles complex tasks', indicators: [] },
      { level: 5, name: 'Expert', description: 'Deep expertise', indicators: [] },
    ],
  },
  weight: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 10,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
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

// Indexes for efficient queries
skillSchema.index({ name: 'text', description: 'text', tags: 'text' });
skillSchema.index({ category: 1 });
skillSchema.index({ parentSkillId: 1 });
skillSchema.index({ isActive: 1 });

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);
