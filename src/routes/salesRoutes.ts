import { Express, Request, Response } from 'express';
import { SalesService } from '../services/salesService';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

const searchParamsSchema = z.object({
  query: z.object({
    email: z.string().email().optional(),
    sessionId: z.string().optional(),
    stripeCustomerId: z.string().optional()
  })
});

export const setupSalesRoutes = (app: Express) => {
  const salesService = SalesService.getInstance();

  app.get('/api/sales', 
    auth, 
    validateRequest(searchParamsSchema),
    async (req: Request, res: Response) => {
      try {
        const filters = {
          email: req.query.email as string | undefined,
          sessionId: req.query.sessionId as string | undefined,
          stripeCustomerId: req.query.stripeCustomerId as string | undefined
        };

        const sales = await salesService.getSales(filters);
        res.json({
          sales,
          total: sales.length
        });
      } catch (error) {
        logger.error('Error in sales endpoint:', error);
        res.status(500).json({ error: 'Failed to retrieve sales data' });
      }
    }
  );
};