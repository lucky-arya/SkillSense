/**
 * SkillSense AI - Database Configuration
 * 
 * MongoDB connection with Mongoose
 */

import mongoose from 'mongoose';
import { config } from './environment';

export const connectDatabase = async (): Promise<void> => {
  try {
    const options: mongoose.ConnectOptions = {
      // Modern mongoose doesn't need most legacy options
    };

    await mongoose.connect(config.mongodbUri, options);
    
    console.log('✓ MongoDB connected successfully');

    // Clean up stale indexes that may exist from older schema versions
    try {
      const usersCollection = mongoose.connection.collection('users');
      const indexes = await usersCollection.indexes();
      const staleIndex = indexes.find((idx: any) => idx.name === 'username_1');
      if (staleIndex) {
        await usersCollection.dropIndex('username_1');
        console.log('✓ Dropped stale username_1 index from users collection');
      }
    } catch {
      // Index doesn't exist or collection not yet created — safe to ignore
    }
    
    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};
