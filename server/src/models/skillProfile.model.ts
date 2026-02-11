/**
 * SkillSense AI - Skill Profile Model
 * 
 * MongoDB schema for user skill assessments and proficiencies
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillAssessment {
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  proficiencyLevel: number;
  confidence: number;
  assessedAt: Date;
  source: 'self_assessment' | 'quiz' | 'project_analysis' | 'peer_review';
}

export interface ISkillProfile extends Document {
  userId: mongoose.Types.ObjectId;
  skills: ISkillAssessment[];
  overallScore: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const skillAssessmentSchema = new Schema<ISkillAssessment>({
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  proficiencyLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  confidence: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1,
  },
  assessedAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['self_assessment', 'quiz', 'project_analysis', 'peer_review'],
    default: 'self_assessment',
  },
}, { _id: false });

const skillProfileSchema = new Schema<ISkillProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  skills: [skillAssessmentSchema],
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
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
skillProfileSchema.index({ userId: 1 });
skillProfileSchema.index({ 'skills.skillId': 1 });
skillProfileSchema.index({ lastUpdated: -1 });

// Update lastUpdated on save
skillProfileSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export const SkillProfile = mongoose.model<ISkillProfile>('SkillProfile', skillProfileSchema);
