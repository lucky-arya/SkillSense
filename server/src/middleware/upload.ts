/**
 * SkillSense AI - File Upload Middleware
 * 
 * Handles multipart file uploads (resumes, etc.) via Multer
 */

import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Memory storage (files stay in RAM for processing, not saved to disk)
const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.'));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Single file upload
  },
});

// Single file upload middleware
export const uploadResume = upload.single('resume');

// Error handling wrapper
export const handleUploadError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 5MB.', 400, 'FILE_TOO_LARGE'));
    }
    return next(new AppError(`Upload error: ${err.message}`, 400, 'UPLOAD_ERROR'));
  }
  if (err) {
    return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
  }
  next();
};
