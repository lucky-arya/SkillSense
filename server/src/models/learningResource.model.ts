/**
 * SkillSense AI - Learning Resource Model
 * 
 * MongoDB schema for learning resources and courses
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningResource extends Document {
  title: string;
  description: string;
  type: 'course' | 'tutorial' | 'video' | 'article' | 'book' | 'project' | 'documentation';
  url: string;
  provider: string;
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  rating: number;
  reviewCount: number;
  tags: string[];
  isPremium: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const learningResourceSchema = new Schema<ILearningResource>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  type: {
    type: String,
    enum: ['course', 'tutorial', 'video', 'article', 'book', 'project', 'documentation'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isPremium: {
    type: Boolean,
    default: false,
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
learningResourceSchema.index({ skillId: 1 });
learningResourceSchema.index({ type: 1 });
learningResourceSchema.index({ difficulty: 1 });
learningResourceSchema.index({ provider: 1 });
learningResourceSchema.index({ rating: -1 });
learningResourceSchema.index({ title: 'text', description: 'text' });

export const LearningResource = mongoose.model<ILearningResource>('LearningResource', learningResourceSchema);
