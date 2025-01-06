import { Express, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { GoogleAuth } from '../config/google';
import { WordPressService } from '../services/wordpress';
import { SheetManager } from '../core/SheetManager';
import NodeCache from 'node-cache';

export const setupHealthRoutes = (app: Express) => {
  const cache = new NodeCache();

  app.get('/api/health/endpoints', (_req: Request, res: Response) => {
    const endpoints = {
      service: 'appraisily-hub',
      version: '1.0.0',
      endpoints: [
        {
          path: '/api/appraisals/pending',
          method: 'GET',
          description: 'Retrieves pending appraisals with optional filters',
          requiredParams: ['X-API-Key'],
          response: {
            appraisals: [
              {
                date: '2024-03-10',
                serviceType: 'Standard',
                sessionId: 'abc123',
                customerEmail: 'customer@example.com'
              }
            ],
            total: 1
          }
        },
        {
          path: '/api/appraisals/completed',
          method: 'GET',
          description: 'Retrieves completed appraisals with optional filters',
          requiredParams: ['X-API-Key'],
          response: {
            appraisals: [
              {
                date: '2024-03-10',
                serviceType: 'Standard',
                sessionId: 'abc123',
                customerEmail: 'customer@example.com'
              }
            ],
            total: 1
          }
        },
        {
          path: '/api/sales',
          method: 'GET',
          description: 'Retrieves sales data with optional filters',
          requiredParams: ['X-API-Key'],
          response: {
            sales: [
              {
                sessionId: 'abc123',
                customerEmail: 'customer@example.com',
                amount: '$100.00'
              }
            ],
            total: 1
          }
        },
        {
          path: '/api/process',
          method: 'GET',
          description: 'Retrieves information about the appraisal request process',
          requiredParams: ['X-API-Key'],
          response: {
            customerJourney: {
              steps: ['Select service', 'Choose date', 'Checkout']
            }
          }
        }
      ]
    };

    res.json(endpoints);
  });

  app.get('/api/health/status', async (_req: Request, res: Response) => {
    try {
      const checks = await performHealthChecks();
      const allHealthy = Object.values(checks.services).every(status => status === true);

      res.json({
        status: allHealthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: checks.services
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
          database: false,
          cache: false,
          wordpress: false,
          sheets: false,
          email: false
        }
      });
    }
  });
};

async function performHealthChecks() {
  const checks = {
    services: {
      database: false,
      cache: false,
      wordpress: false,
      sheets: false,
      email: false
    }
  };

  // Check cache
  try {
    const testKey = 'health_check';
    const testValue = 'test';
    const cache = new NodeCache();
    cache.set(testKey, testValue, 10);
    const retrieved = cache.get(testKey);
    checks.services.cache = retrieved === testValue;
  } catch (error) {
    logger.error('Cache health check failed:', error);
  }

  // Check Google Sheets
  try {
    const sheetManager = SheetManager.getInstance();
    await sheetManager.loadIndexSheet();
    checks.services.sheets = true;
  } catch (error) {
    logger.error('Sheets health check failed:', error);
  }

  // Check WordPress
  try {
    const wpService = WordPressService.getInstance();
    await wpService.syncPosts();
    checks.services.wordpress = true;
  } catch (error) {
    logger.error('WordPress health check failed:', error);
  }

  // Check Google Auth (as a proxy for database access)
  try {
    const auth = GoogleAuth.getInstance().getAuth();
    await auth.getClient();
    checks.services.database = true;
  } catch (error) {
    logger.error('Database health check failed:', error);
  }

  // Check email service (SendGrid)
  try {
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    checks.services.email = !!sendGridApiKey;
  } catch (error) {
    logger.error('Email health check failed:', error);
  }

  return checks;
}