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
  private indexSheetId: string;

  private constructor() {
    const auth = GoogleAuth.getInstance().getAuth();
    this.sheets = google.sheets({ version: 'v4', auth });
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL
    this.indexSheetId = process.env.LOG_SPREADSHEET_ID || '';
  }

  // Rest of the code remains the same...
}