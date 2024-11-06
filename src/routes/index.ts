import { Express } from 'express';
import { setupSheetRoutes } from './sheetRoutes';
import { RouterBuilder } from '../core/RouterBuilder';
import { logger } from '../utils/logger';

export const setupRoutes = async (app: Express) => {
  try {
    // Setup static routes
    setupSheetRoutes(app);

    // Generate dynamic routes
    const routerBuilder = RouterBuilder.getInstance();
    await routerBuilder.generateRoutes(app);

    logger.info('All routes configured successfully');
  } catch (error) {
    logger.error('Error setting up routes:', error);
    throw error;
  }
};