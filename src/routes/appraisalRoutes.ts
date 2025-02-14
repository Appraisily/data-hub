import { Express, Request, Response } from 'express';
import { AppraisalService } from '../services/appraisalService';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

const searchParamsSchema = z.object({
  query: z.object({
    email: z.string().email().optional(),
    sessionId: z.string().optional(),
    wordpressSlug: z.string().optional()
  })
});

export const setupAppraisalRoutes = (app: Express) => {
  const appraisalService = AppraisalService.getInstance();

  // Pending appraisals endpoint
  app.get('/api/appraisals/pending', 
    auth, 
    validateRequest(searchParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const filters = {
          email: req.query.email as string | undefined,
          sessionId: req.query.sessionId as string | undefined,
          wordpressSlug: req.query.wordpressSlug as string | undefined
        };

        const appraisals = await appraisalService.getPendingAppraisals(filters);
        res.json({
          appraisals,
          total: appraisals.length
        });
      } catch (error) {
        logger.error('Error in pending appraisals endpoint:', error);
        res.status(500).json({ error: 'Failed to retrieve pending appraisals' });
      }
    }
  );

  // Completed appraisals endpoint
  app.get('/api/appraisals/completed', 
    auth, 
    validateRequest(searchParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const filters = {
          email: req.query.email as string | undefined,
          sessionId: req.query.sessionId as string | undefined,
          wordpressSlug: req.query.wordpressSlug as string | undefined
        };

        const appraisals = await appraisalService.getCompletedAppraisals(filters);
        res.json({
          appraisals,
          total: appraisals.length
        });
      } catch (error) {
        logger.error('Error in completed appraisals endpoint:', error);
        res.status(500).json({ error: 'Failed to retrieve completed appraisals' });
      }
    }
  );
};