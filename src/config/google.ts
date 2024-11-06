import { google } from 'googleapis';
import { logger } from '../utils/logger';

export class GoogleAuth {
  private static instance: GoogleAuth;
  private auth: any;

  private constructor() {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_DOCS_CREDENTIALS || '');
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } catch (error) {
      logger.error('Error initializing Google Auth:', error);
      throw error;
    }
  }

  public static getInstance(): GoogleAuth {
    if (!GoogleAuth.instance) {
      GoogleAuth.instance = new GoogleAuth();
    }
    return GoogleAuth.instance;
  }

  public getAuth() {
    return this.auth;
  }
}