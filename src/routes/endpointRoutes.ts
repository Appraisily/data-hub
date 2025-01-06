import { Express, Request, Response } from 'express';
import { endpoints } from '../config/endpoints';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';

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

  app.get('/api/process', auth, (_req: Request, res: Response) => {
    try {
      const processInfo = {
        customerJourney: {
          startUrl: "appraisily.com/start",
          steps: [
            "Select desired appraisal service (Regular, Insurance, or Tax)",
            "Choose preferred date for the appraisal",
            "Click 'Continue to Checkout'"
          ]
        },
        paymentProcess: {
          steps: [
            "Redirected to Stripe checkout",
            "Complete payment securely",
            "Automatic redirect to success page"
          ]
        },
        appraisalDetails: {
          successPageFormat: "appraisily.com/success-payment/?session_id={sessionID}",
          requiredInformation: [
            "Images of item(s)",
            "Description and details",
            "Additional relevant information"
          ]
        },
        serviceDelivery: {
          process: [
            "Appraisal process begins after details submission",
            "Expert assigned based on service type",
            "Completed within specified timeframe (usually 48 hours)"
          ]
        }
      };

      res.json(processInfo);
    } catch (error) {
      logger.error('Error in process information endpoint:', error);
      res.status(500).json({ error: 'Failed to retrieve process information' });
    }
  });
};