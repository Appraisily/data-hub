import { Express, Request, Response } from 'express';
import { endpoints } from '../config/endpoints';
import { logger } from '../utils/logger';

export const setupEndpointRoutes = (app: Express) => {
  app.get('/api/endpoints', async (_req: Request, res: Response) => {
    try {
      const endpointDocs = {
        endpoints,
        authentication: {
          type: 'API Key',
          headerName: 'X-API-Key',
          description: 'All endpoints require authentication using an API key in the X-API-Key header'
        },
        rateLimiting: {
          requestsPerWindow: 100,
          windowMinutes: 15,
          errorCode: 429,
          errorMessage: 'Too many requests from this IP, please try again later'
        }
      };

      res.json(endpointDocs);
    } catch (error) {
      logger.error('Error in endpoints documentation:', error);
      res.status(500).json({ error: 'Failed to retrieve endpoints documentation' });
    }
  });
};