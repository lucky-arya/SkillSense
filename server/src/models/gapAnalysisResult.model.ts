/**
 * SkillSense AI - Gap Analysis Result Model
 * 
 * MongoDB schema for persisting gap analysis results
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillGap {
  skillId: string;
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  gapSize: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  importance: string;
  estimatedTimeToClose: number;
}

export interface IGapAnalysisResult extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: {
    roleId: mongoose.Types.ObjectId;
    title: string;
  };
  gaps: ISkillGap[];
  overallReadiness: number;
  strengthAreas: string[];
  improvementAreas: string[];
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const skillGapSchema = new Schema<ISkillGap>({
  skillId: {
    type: String,
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  currentLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  requiredLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  gapSize: {
    type: Number,
    required: true,
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true,
  },
  importance: {
    type: String,
    required: true,
  },
  estimatedTimeToClose: {
    type: Number,
    required: true,
  },
}, { _id: false });

const gapAnalysisResultSchema = new Schema<IGapAnalysisResult>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  targetRole: {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  gaps: [skillGapSchema],
  overallReadiness: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  strengthAreas: [{
    type: String,
  }],
  improvementAreas: [{
    type: String,
  }],
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      (ret as any).__v = undefined;
      return ret;
    },
  },
});

// Compound index for efficient queries: latest analysis per user
gapAnalysisResultSchema.index({ userId: 1, analyzedAt: -1 });

// Index for role-specific queries
gapAnalysisResultSchema.index({ userId: 1, 'targetRole.roleId': 1, analyzedAt: -1 });

export const GapAnalysisResult = mongoose.model<IGapAnalysisResult>(
  'GapAnalysisResult',
  gapAnalysisResultSchema
);
