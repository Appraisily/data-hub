import { google } from 'googleapis';
import { GoogleAuth } from '../config/google';
import { PendingAppraisal } from '../types/appraisal';
import { logger } from '../utils/logger';
import NodeCache from 'node-cache';

interface AppraisalFilters {
  email?: string;
  sessionId?: string;
}

export class AppraisalService {
  private static instance: AppraisalService;
  private sheets;
  private cache: NodeCache;
  private spreadsheetId: string;
  private readonly SHEET_NAME = 'Pending Appraisals';
  private readonly CACHE_KEY = 'pending_appraisals';
  private readonly CACHE_TTL = 300; // 5 minutes

  private constructor() {
    const auth = GoogleAuth.getInstance().getAuth();
    this.sheets = google.sheets({ version: 'v4', auth });
    this.cache = new NodeCache();
    this.spreadsheetId = process.env.PENDING_APPRAISALS_SPREADSHEET_ID || '';
  }

  public static getInstance(): AppraisalService {
    if (!AppraisalService.instance) {
      AppraisalService.instance = new AppraisalService();
    }
    return AppraisalService.instance;
  }

  async getPendingAppraisals(filters?: AppraisalFilters): Promise<PendingAppraisal[]> {
    try {
      // Generate cache key including filters
      const cacheKey = filters 
        ? `${this.CACHE_KEY}-${JSON.stringify(filters)}` 
        : this.CACHE_KEY;

      // Check cache first
      const cachedData = this.cache.get<PendingAppraisal[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.SHEET_NAME}!A2:O`, // Start from A2 to skip headers
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      let appraisals: PendingAppraisal[] = rows.map(row => ({
        date: row[0] || '',
        serviceType: row[1] || '',
        sessionId: row[2] || '',
        customerEmail: row[3] || '',
        customerName: row[4] || '',
        appraisalStatus: row[5] || '',
        appraisalEditLink: row[6] || '',
        imageDescription: row[7] || '',
        customerDescription: row[8] || '',
        appraisalValue: row[9] || '',
        appraisersDescription: row[10] || '',
        finalDescription: row[11] || '',
        pdfLink: row[12] || '',
        docLink: row[13] || '',
        imagesJson: row[14] || ''
      }));

      // Apply filters if provided
      if (filters) {
        appraisals = appraisals.filter(appraisal => {
          const matchesEmail = !filters.email || 
            appraisal.customerEmail.toLowerCase() === filters.email.toLowerCase();
          const matchesSessionId = !filters.sessionId || 
            appraisal.sessionId === filters.sessionId;
          return matchesEmail && matchesSessionId;
        });
      }

      // Store in cache
      this.cache.set(cacheKey, appraisals, this.CACHE_TTL);

      return appraisals;
    } catch (error) {
      logger.error('Error fetching pending appraisals:', error);
      throw new Error('Failed to fetch pending appraisals');
    }
  }
}