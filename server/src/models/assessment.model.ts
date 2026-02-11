/**
 * SkillSense AI - Assessment Model
 * 
 * MongoDB schema for skill assessment questionnaires
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  proficiencyIndicator?: number;
}

export interface IAssessmentQuestion {
  id: string;
  skillId: mongoose.Types.ObjectId;
  type: 'multiple_choice' | 'multi_select' | 'self_rating' | 'scenario_based' | 'code_snippet';
  text: string;
  options?: IQuestionOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  difficultyWeight: number;
}

export interface IAssessment extends Document {
  title: string;
  description: string;
  targetSkills: mongoose.Types.ObjectId[];
  questions: IAssessmentQuestion[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionOptionSchema = new Schema<IQuestionOption>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  isCorrect: Boolean,
  proficiencyIndicator: {
    type: Number,
    min: 1,
    max: 5,
  },
}, { _id: false });

const assessmentQuestionSchema = new Schema<IAssessmentQuestion>({
  id: {
    type: String,
    required: true,
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'multi_select', 'self_rating', 'scenario_based', 'code_snippet'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  options: [questionOptionSchema],
  correctAnswer: Schema.Types.Mixed,
  explanation: String,
  difficultyWeight: {
    type: Number,
    default: 1,
    min: 0.5,
    max: 3,
  },
}, { _id: false });

const assessmentSchema = new Schema<IAssessment>({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  targetSkills: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  }],
  questions: [assessmentQuestionSchema],
  estimatedDuration: {
    type: Number,
    default: 15,
    min: 5,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
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
assessmentSchema.index({ title: 'text', description: 'text' });
assessmentSchema.index({ targetSkills: 1 });
assessmentSchema.index({ difficulty: 1 });
assessmentSchema.index({ isActive: 1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);
