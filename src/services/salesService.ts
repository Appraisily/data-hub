import { google } from 'googleapis';
import { GoogleAuth } from '../config/google';
import { Sale } from '../types/sale';
import { logger } from '../utils/logger';
import NodeCache from 'node-cache';

interface SaleFilters {
  email?: string;
  sessionId?: string;
  stripeCustomerId?: string;
}

export class SalesService {
  private static instance: SalesService;
  private sheets;
  private cache: NodeCache;
  private spreadsheetId: string;
  private readonly SHEET_NAME = 'Sales';
  private readonly CACHE_KEY = 'sales_data';
  private readonly CACHE_TTL = 300; // 5 minutes

  private constructor() {
    const auth = GoogleAuth.getInstance().getAuth();
    this.sheets = google.sheets({ version: 'v4', auth });
    this.cache = new NodeCache();
    this.spreadsheetId = process.env.SALES_SPREADSHEET_ID || '';
  }

  public static getInstance(): SalesService {
    if (!SalesService.instance) {
      SalesService.instance = new SalesService();
    }
    return SalesService.instance;
  }

  async getSales(filters?: SaleFilters): Promise<Sale[]> {
    try {
      // Generate cache key including filters
      const cacheKey = filters 
        ? `${this.CACHE_KEY}-${JSON.stringify(filters)}` 
        : this.CACHE_KEY;

      // Check cache first
      const cachedData = this.cache.get<Sale[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.SHEET_NAME}!A2:G`, // Columns A-G contain our data
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      let sales: Sale[] = rows.map(row => ({
        sessionId: row[0] || '',
        chargeId: row[1] || '',
        stripeCustomerId: row[2] || '',
        customerName: row[3] || '',
        customerEmail: row[4] || '',
        amount: row[5] || '',
        date: row[6] || ''
      }));

      // Apply filters if provided
      if (filters) {
        sales = sales.filter(sale => {
          const matchesEmail = !filters.email || 
            sale.customerEmail.toLowerCase() === filters.email.toLowerCase();
          const matchesSessionId = !filters.sessionId || 
            sale.sessionId === filters.sessionId;
          const matchesStripeCustomerId = !filters.stripeCustomerId || 
            sale.stripeCustomerId === filters.stripeCustomerId;
          return matchesEmail && matchesSessionId && matchesStripeCustomerId;
        });
      }

      // Store in cache
      this.cache.set(cacheKey, sales, this.CACHE_TTL);

      return sales;
    } catch (error) {
      logger.error('Error fetching sales data:', error);
      throw new Error('Failed to fetch sales data');
    }
  }
}