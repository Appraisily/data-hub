import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { SheetManager } from './SheetManager';
import { logger } from '../utils/logger';
import { QueryOptions } from '../types/sheet';

export class RouterBuilder {
  private static instance: RouterBuilder;
  private sheetManager: SheetManager;

  private constructor() {
    this.sheetManager = SheetManager.getInstance();
  }

  public static getInstance(): RouterBuilder {
    if (!RouterBuilder.instance) {
      RouterBuilder.instance = new RouterBuilder();
    }
    return RouterBuilder.instance;
  }

  public async generateRoutes(app: Express): Promise<void> {
    try {
      const indexData = await this.sheetManager.loadIndexSheet();

      for (const sheet of indexData.sheets) {
        const headers = await this.sheetManager.parseHeaders(sheet.id);
        this.createSheetEndpoints(app, sheet.id, headers);
      }

      logger.info('Dynamic routes generated successfully');
    } catch (error) {
      logger.error('Error generating routes:', error);
      throw error;
    }
  }

  private createSheetEndpoints(app: Express, sheetId: string, headers: string[]): void {
    const baseRoute = `/api/sheets/${sheetId}`;
    const validationSchema = this.createValidationSchema(headers);

    // GET endpoint with query parameters
    app.get(baseRoute, async (req: Request, res: Response) => {
      try {
        const queryOptions = this.parseQueryOptions(req, validationSchema);
        const data = await this.sheetManager.querySheet(sheetId, queryOptions);
        res.json(data);
      } catch (error) {
        logger.error(`Error in ${baseRoute}:`, error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    });

    // POST endpoint for complex queries
    app.post(`${baseRoute}/query`, async (req: Request, res: Response) => {
      try {
        const queryOptions = this.parseComplexQuery(req.body, headers);
        const data = await this.sheetManager.querySheet(sheetId, queryOptions);
        res.json(data);
      } catch (error) {
        logger.error(`Error in ${baseRoute}/query:`, error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
      }
    });
  }

  private createValidationSchema(headers: string[]): z.ZodObject<any> {
    const filterSchema: Record<string, z.ZodTypeAny> = {};
    
    headers.forEach(header => {
      filterSchema[header] = z.any().optional();
    });

    return z.object({
      filters: z.object(filterSchema).optional(),
      sort: z.string().optional(),
      limit: z.number().min(1).max(1000).optional(),
      offset: z.number().min(0).optional()
    });
  }

  private parseQueryOptions(req: Request, schema: z.ZodObject<any>): QueryOptions {
    const queryOptions: QueryOptions = {};

    if (req.query.filters) {
      queryOptions.filters = JSON.parse(String(req.query.filters));
    }

    if (req.query.sort) {
      queryOptions.sort = String(req.query.sort);
    }

    if (req.query.limit) {
      queryOptions.limit = parseInt(String(req.query.limit));
    }

    if (req.query.offset) {
      queryOptions.offset = parseInt(String(req.query.offset));
    }

    return schema.parse(queryOptions);
  }

  private parseComplexQuery(body: any, headers: string[]): QueryOptions {
    const complexQuerySchema = z.object({
      filters: z.record(z.string(), z.any()).optional(),
      sort: z.array(z.object({
        field: z.string(),
        direction: z.enum(['asc', 'desc'])
      })).optional(),
      pagination: z.object({
        limit: z.number().min(1).max(1000),
        offset: z.number().min(0)
      }).optional()
    });

    const validated = complexQuerySchema.parse(body);
    
    return {
      filters: validated.filters,
      sort: validated.sort?.[0]?.field,
      limit: validated.pagination?.limit,
      offset: validated.pagination?.offset
    };
  }
}