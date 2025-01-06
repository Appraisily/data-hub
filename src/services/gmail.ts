import { google } from 'googleapis';
import { logger } from '../utils/logger';

export class GmailService {
  private static instance: GmailService;
  private gmail;

  private constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    });

    this.gmail = google.gmail({ version: 'v1', auth });
  }

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  async getEmails(query: string): Promise<any[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
      });

      return response.data.messages || [];
    } catch (error) {
      logger.error('Error fetching Gmail messages:', error);
      throw error;
    }
  }
}