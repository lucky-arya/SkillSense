/**
 * SkillSense AI - User Model
 * 
 * MongoDB schema for user accounts and profiles
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserProfile {
  targetRole: string | null;
  currentEducation: string;
  yearsOfExperience: number;
  completedAssessments: string[];
  skillProfileId: mongoose.Types.ObjectId | null;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  profile: IUserProfile;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userProfileSchema = new Schema<IUserProfile>({
  targetRole: {
    type: String,
    default: null,
  },
  currentEducation: {
    type: String,
    enum: ['high_school', 'undergraduate', 'graduate', 'postgraduate', 'professional'],
    default: 'undergraduate',
  },
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: 0,
    max: 50,
  },
  completedAssessments: [{
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
  }],
  skillProfileId: {
    type: Schema.Types.ObjectId,
    ref: 'SkillProfile',
    default: null,
  },
}, { _id: false });

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student',
  },
  profile: {
    type: userProfileSchema,
    default: () => ({}),
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      delete (ret as any).__v;
      delete (ret as any).password;
      return ret;
    },
  },
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ 'profile.targetRole': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
