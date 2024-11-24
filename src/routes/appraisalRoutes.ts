import { Express, Request, Response } from 'express';
import { AppraisalService } from '../services/appraisalService';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';

export const setupAppraisalRoutes = (app: Express) => {
  const appraisalService = AppraisalService.getInstance();

  app.get('/api/appraisals/pending', auth, async (_req: Request, res: Response) => {
    try {
      const appraisals = await appraisalService.getPendingAppraisals();
      res.json({
        appraisals,
        total: appraisals.length
      });
    } catch (error) {
      logger.error('Error in pending appraisals endpoint:', error);
      res.status(500).json({ error: 'Failed to retrieve pending appraisals' });
    }
  });
};