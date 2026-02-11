/**
 * SkillSense AI - Server Entry Point
 * 
 * Bootstraps the Express application with all middleware and routes
 */

import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config/environment';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Start Express server
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    SkillSense AI Server                   ║
╠═══════════════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(42)}║
║  Port: ${config.port.toString().padEnd(49)}║
║  API Version: ${config.apiVersion.padEnd(42)}║
║  ML Service: ${config.mlServiceUrl.padEnd(43)}║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
