/**
 * SkillSense AI - Authentication Service
 */

import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import { SkillProfile } from '../models/skillProfile.model';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES } from '@skillsense/shared';
import { config } from '../config/environment';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  expiresIn: string;
}

class AuthService {
  private generateToken(user: IUser): string {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, config.jwtSecret, { 
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn']
    });
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(
        'User with this email already exists',
        409,
        ERROR_CODES.RESOURCE_ALREADY_EXISTS
      );
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: 'student',
    });

    // Create empty skill profile for the user
    await SkillProfile.create({
      userId: user._id,
      skills: [],
      overallScore: 0,
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      expiresIn: config.jwtExpiresIn,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError(
        'Invalid email or password',
        401,
        ERROR_CODES.AUTH_INVALID_CREDENTIALS
      );
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new AppError(
        'Invalid email or password',
        401,
        ERROR_CODES.AUTH_INVALID_CREDENTIALS
      );
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      expiresIn: config.jwtExpiresIn,
    };
  }

  async refreshToken(oldToken: string): Promise<AuthResult> {
    try {
      // Verify the old token (even if expired)
      const decoded = jwt.verify(oldToken, config.jwtSecret, {
        ignoreExpiration: true,
      }) as { id: string };

      // Find the user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new AppError(
          'User not found',
          401,
          ERROR_CODES.AUTH_UNAUTHORIZED
        );
      }

      // Generate new token
      const token = this.generateToken(user);

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        expiresIn: config.jwtExpiresIn,
      };
    } catch (error) {
      throw new AppError(
        'Invalid token',
        401,
        ERROR_CODES.AUTH_TOKEN_INVALID
      );
    }
  }
}

export const authService = new AuthService();
