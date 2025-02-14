import { Express } from 'express';
import { setupSheetRoutes } from './sheetRoutes';
import { setupAppraisalRoutes } from './appraisalRoutes';
import { setupSalesRoutes } from './salesRoutes';
import { setupEndpointRoutes } from './endpointRoutes';
import { setupChatLogRoutes } from './chatLogRoutes';
import { setupHealthRoutes } from './healthRoutes';
import { RouterBuilder } from '../core/RouterBuilder';
import { logger } from '../utils/logger';

export const setupRoutes = async (app: Express) => {
  try {
    // Setup static routes
    setupSheetRoutes(app);
    setupAppraisalRoutes(app);
    setupSalesRoutes(app);
    setupEndpointRoutes(app);
    setupChatLogRoutes(app);
    setupHealthRoutes(app);

    // Generate dynamic routes
    const routerBuilder = RouterBuilder.getInstance();
    await routerBuilder.generateRoutes(app);

    logger.info('All routes configured successfully');
  } catch (error) {
    logger.error('Error setting up routes:', error);
    throw error;
  }
};