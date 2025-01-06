import { Express, Request, Response } from 'express';
import { ChatLogService } from '../services/chatLogService';
import { logger } from '../utils/logger';
import { auth } from '../middleware/auth';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

const dateFilterSchema = z.object({
  query: z.object({
    startDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      .optional()
      .describe('Start date in ISO format (e.g., 2025-01-06T03:54:07.594Z)'),
    endDate: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      .optional()
      .describe('End date in ISO format (e.g., 2025-01-06T03:54:07.594Z)')
  })
});

export const setupChatLogRoutes = (app: Express) => {
  const chatLogService = ChatLogService.getInstance();

  app.get('/api/chat-logs', 
    auth,
    validateRequest(dateFilterSchema),
    async (req: Request, res: Response) => {
      try {
        const filters = {
          startDate: req.query.startDate as string | undefined,
          endDate: req.query.endDate as string | undefined
        };

        const logs = await chatLogService.getChatLogs(filters);
        res.json({
          logs,
          total: logs.length
        });
      } catch (error) {
        logger.error('Error in chat logs endpoint:', error);
        res.status(500).json({ error: 'Failed to retrieve chat logs' });
      }
    }
  );
};