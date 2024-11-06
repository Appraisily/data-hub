import { Express, Request, Response } from 'express';
import { SheetManager } from '../core/SheetManager';
import { QueryOptions } from '../types/sheet';
import { logger } from '../utils/logger';

export const setupSheetRoutes = (app: Express) => {
  const sheetManager = SheetManager.getInstance();

  app.get('/api/departments', async (_req: Request, res: Response) => {
    try {
      const indexData = await sheetManager.loadIndexSheet();
      res.json({ departments: indexData.departments });
    } catch (error) {
      logger.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Failed to retrieve departments' });
    }
  });

  app.get('/api/sheets/:department', async (req: Request, res: Response) => {
    try {
      const { department } = req.params;
      const indexData = await sheetManager.loadIndexSheet();
      const sheets = indexData.sheets.filter(sheet => sheet.department === department);
      res.json({ sheets });
    } catch (error) {
      logger.error('Error fetching department sheets:', error);
      res.status(500).json({ error: 'Failed to retrieve department sheets' });
    }
  });

  app.get('/api/data/:sheetId', async (req: Request, res: Response) => {
    try {
      const { sheetId } = req.params;
      const options: QueryOptions = {
        filters: req.query.filters ? JSON.parse(String(req.query.filters)) : undefined,
        sort: req.query.sort as string,
        limit: req.query.limit ? parseInt(String(req.query.limit)) : undefined,
        offset: req.query.offset ? parseInt(String(req.query.offset)) : undefined,
      };

      const data = await sheetManager.querySheet(sheetId, options);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching sheet data:', error);
      res.status(500).json({ error: 'Failed to retrieve sheet data' });
    }
  });
};