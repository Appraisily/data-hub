import { google } from 'googleapis';
import { logger } from '../utils/logger';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private analytics;

  private constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    this.analytics = google.analytics({ version: 'v3', auth });
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getPageViews(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await this.analytics.data.ga.get({
        'ids': `ga:${process.env.GA_VIEW_ID}`,
        'start-date': startDate,
        'end-date': endDate,
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:pagePath',
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching Analytics data:', error);
      throw error;
    }
  }
}