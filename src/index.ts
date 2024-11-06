import express from 'express';
import dotenv from 'dotenv';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setupMiddleware } from './middleware';
import { logger } from './utils/logger';
import { SecretManagerService } from './config/secretManager';

dotenv.config();

const startServer = async () => {
  try {
    // Load secrets first
    await SecretManagerService.getInstance().loadSecrets();

    const app = express();
    const port = process.env.PORT || 3000;

    // Setup middleware
    setupMiddleware(app);

    // Setup routes
    setupRoutes(app);

    // Error handler
    app.use(errorHandler);

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();