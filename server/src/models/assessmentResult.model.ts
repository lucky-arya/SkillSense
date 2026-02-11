/**
 * SkillSense AI - Assessment Result Model
 * 
 * MongoDB schema for storing user assessment responses and results
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IAssessmentResponse {
  questionId: string;
  skillId: mongoose.Types.ObjectId;
  answer: string | string[];
  timeSpent: number;
  isCorrect?: boolean;
}

export interface IAssessmentResult extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  responses: IAssessmentResponse[];
  score: number;
  skillScores: Map<string, number>;
  completedAt: Date;
  duration: number;
  createdAt: Date;
}

const assessmentResponseSchema = new Schema<IAssessmentResponse>({
  questionId: {
    type: String,
    required: true,
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  answer: {
    type: Schema.Types.Mixed,
    required: true,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
  isCorrect: Boolean,
}, { _id: false });

const assessmentResultSchema = new Schema<IAssessmentResult>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  responses: [assessmentResponseSchema],
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  skillScores: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    default: 0,
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
assessmentResultSchema.index({ userId: 1 });
assessmentResultSchema.index({ assessmentId: 1 });
assessmentResultSchema.index({ userId: 1, assessmentId: 1 });
assessmentResultSchema.index({ completedAt: -1 });

export const AssessmentResult = mongoose.model<IAssessmentResult>('AssessmentResult', assessmentResultSchema);
