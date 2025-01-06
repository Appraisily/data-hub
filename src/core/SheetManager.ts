import { google } from 'googleapis';
import { logger } from '../utils/logger';
import { GoogleAuth } from '../config/google';
import { SheetMetadata, IndexSheet, QueryOptions } from '../types/sheet';
import NodeCache from 'node-cache';

export class SheetManager {
  private sheets;
  private cache: NodeCache;
  private metadata: Map<string, SheetMetadata> = new Map();
  private static instance: SheetManager;
  private spreadsheetId: string;
  private readonly SHEET_NAME = 'Pending Appraisals';

  private constructor() {
    const auth = GoogleAuth.getInstance().getAuth();
    this.sheets = google.sheets({ version: 'v4', auth });
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL
    this.spreadsheetId = process.env.PENDING_APPRAISALS_SPREADSHEET_ID || '';
  }

  public static getInstance(): SheetManager {
    if (!SheetManager.instance) {
      SheetManager.instance = new SheetManager();
    }
    return SheetManager.instance;
  }

  public async loadIndexSheet(): Promise<IndexSheet> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.SHEET_NAME}!A2:D`
      });

      const rows = response.data.values || [];
      const departments = [...new Set(rows.map(row => row[0]))];
      const sheets: SheetMetadata[] = rows.map(row => ({
        id: row[1],
        name: row[2],
        headers: [],
        path: row[3],
        department: row[0]
      }));

      return { departments, sheets };
    } catch (error) {
      logger.error('Error loading index sheet:', error);
      throw error;
    }
  }

  public async parseHeaders(sheetId: string): Promise<string[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.SHEET_NAME}!A1:Z1`
      });

      return response.data.values?.[0] || [];
    } catch (error) {
      logger.error('Error parsing headers:', error);
      throw error;
    }
  }

  public async querySheet(sheetId: string, options: QueryOptions = {}): Promise<any[]> {
    try {
      const cacheKey = `${sheetId}-${JSON.stringify(options)}`;
      const cachedData = this.cache.get<any[]>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.SHEET_NAME}!A2:Z`
      });

      let data = response.data.values || [];

      // Apply filters
      if (options.filters) {
        data = this.applyFilters(data, options.filters);
      }

      // Apply sorting
      if (options.sort) {
        data = this.applySort(data, options.sort);
      }

      // Apply pagination
      if (options.limit || options.offset) {
        data = this.applyPagination(data, options.limit, options.offset);
      }

      this.cache.set(cacheKey, data, 300); // Cache for 5 minutes
      return data;
    } catch (error) {
      logger.error('Error querying sheet:', error);
      throw error;
    }
  }

  private applyFilters(data: any[], filters: Record<string, any>): any[] {
    return data.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        const index = this.getHeaderIndex(key);
        return row[index] === value;
      });
    });
  }

  private applySort(data: any[], sort: string): any[] {
    const [field, direction] = sort.split(':');
    const index = this.getHeaderIndex(field);
    
    return [...data].sort((a, b) => {
      const comparison = a[index].localeCompare(b[index]);
      return direction === 'desc' ? -comparison : comparison;
    });
  }

  private applyPagination(data: any[], limit?: number, offset?: number): any[] {
    const start = offset || 0;
    const end = limit ? start + limit : undefined;
    return data.slice(start, end);
  }

  private getHeaderIndex(header: string): number {
    // Implementation depends on how headers are stored
    // This is a simplified version
    return 0; // Replace with actual header index lookup
  }
}