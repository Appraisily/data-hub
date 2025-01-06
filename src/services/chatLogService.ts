import { google } from 'googleapis';
import { GoogleAuth } from '../config/google';
import { ChatLog, ChatLogFilters } from '../types/chatLog';
import { logger } from '../utils/logger';
import NodeCache from 'node-cache';

export class ChatLogService {
  private static instance: ChatLogService;
  private sheets;
  private cache: NodeCache;
  private spreadsheetId: string;
  private readonly SHEET_NAME = 'Chat';
  private readonly CACHE_KEY = 'chat_logs';
  private readonly CACHE_TTL = 300; // 5 minutes

  private constructor() {
    const auth = GoogleAuth.getInstance().getAuth();
    this.sheets = google.sheets({ version: 'v4', auth });
    this.cache = new NodeCache();
    this.spreadsheetId = process.env.SHEETS_ID_MICHELLE_CHAT_LOG || '';
  }

  public static getInstance(): ChatLogService {
    if (!ChatLogService.instance) {
      ChatLogService.instance = new ChatLogService();
    }
    return ChatLogService.instance;
  }

  async getChatLogs(filters?: ChatLogFilters): Promise<ChatLog[]> {
    try {
      // Generate cache key including filters
      const cacheKey = filters 
        ? `${this.CACHE_KEY}-${JSON.stringify(filters)}` 
        : this.CACHE_KEY;

      // Check cache first
      const cachedData = this.cache.get<ChatLog[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.SHEET_NAME}!A2:K`, // A through K columns
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      let logs: ChatLog[] = rows.map(row => ({
        timestamp: row[0] || '',
        clientId: row[1] || '',
        conversationId: row[2] || '',
        duration: parseInt(row[3], 10) || 0,
        messageCount: parseInt(row[4], 10) || 0,
        imageCount: parseInt(row[5], 10) || 0,
        conversation: this.parseConversation(row[6]),
        hasImages: row[7] || 'No',
        type: row[8] || '',
        urgency: row[9] || '',
        labels: (row[10] || '').split(',').map(label => label.trim()),
        disconnectReason: row[11] || ''
      }));

      // Apply date filters if provided
      if (filters) {
        logs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          const startDate = filters.startDate ? new Date(filters.startDate) : null;
          const endDate = filters.endDate ? new Date(filters.endDate) : null;

          return (!startDate || logDate >= startDate) && 
                 (!endDate || logDate <= endDate);
        });

        // Sort by date descending
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      // Store in cache
      this.cache.set(cacheKey, logs, this.CACHE_TTL);

      return logs;
    } catch (error) {
      logger.error('Error fetching chat logs:', error);
      throw new Error('Failed to fetch chat logs');
    }
  }

  private parseConversation(conversationJson: string): any[] {
    try {
      return JSON.parse(conversationJson || '[]');
    } catch (error) {
      logger.error('Error parsing conversation JSON:', error);
      return [];
    }
  }
}