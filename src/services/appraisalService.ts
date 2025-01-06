import { google } from 'googleapis';
import { GoogleAuth } from '../config/google';
import { PendingAppraisal } from '../types/appraisal';
import { logger } from '../utils/logger';
import NodeCache from 'node-cache';

interface AppraisalFilters {
  email?: string;
  sessionId?: string;
  wordpressSlug?: string;
}

export class AppraisalService {
  private static instance: AppraisalService;
  private sheets;
  private cache: NodeCache;
  private spreadsheetId: string;
  private readonly PENDING_SHEET = 'Pending Appraisals';
  private readonly COMPLETED_SHEET = 'Completed Appraisals';
  private readonly PENDING_CACHE_KEY = 'pending_appraisals';
  private readonly COMPLETED_CACHE_KEY = 'completed_appraisals';
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

  private async getAppraisals(sheetName: string, cacheKeyPrefix: string, filters?: AppraisalFilters): Promise<PendingAppraisal[]> {
    try {
      // Generate cache key including filters
      const cacheKey = filters 
        ? `${cacheKeyPrefix}-${JSON.stringify(filters)}` 
        : cacheKeyPrefix;

      // Check cache first
      const cachedData = this.cache.get<PendingAppraisal[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:P`, // Extended to column P for WordPress slug
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
        imagesJson: row[14] || '',
        wordpressSlug: row[15] || ''
      }));

      // Apply filters if provided
      if (filters) {
        appraisals = appraisals.filter(appraisal => {
          const matchesEmail = !filters.email || 
            appraisal.customerEmail.toLowerCase() === filters.email.toLowerCase();
          const matchesSessionId = !filters.sessionId || 
            appraisal.sessionId === filters.sessionId;
          const matchesWordpressSlug = !filters.wordpressSlug || 
            appraisal.wordpressSlug === filters.wordpressSlug;
          return matchesEmail && matchesSessionId && matchesWordpressSlug;
        });
      }

      // Store in cache
      this.cache.set(cacheKey, appraisals, this.CACHE_TTL);

      return appraisals;
    } catch (error) {
      logger.error(`Error fetching ${sheetName}:`, error);
      throw new Error(`Failed to fetch ${sheetName.toLowerCase()}`);
    }
  }

  async getPendingAppraisals(filters?: AppraisalFilters): Promise<PendingAppraisal[]> {
    return this.getAppraisals(this.PENDING_SHEET, this.PENDING_CACHE_KEY, filters);
  }

  async getCompletedAppraisals(filters?: AppraisalFilters): Promise<PendingAppraisal[]> {
    return this.getAppraisals(this.COMPLETED_SHEET, this.COMPLETED_CACHE_KEY, filters);
  }
}