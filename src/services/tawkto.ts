import axios from 'axios';
import { logger } from '../utils/logger';

export class TawkToService {
  private static instance: TawkToService;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.TAWKTO_API_KEY || '';
  }

  public static getInstance(): TawkToService {
    if (!TawkToService.instance) {
      TawkToService.instance = new TawkToService();
    }
    return TawkToService.instance;
  }

  async getChatLogs(startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await axios.get('https://api.tawk.to/v1/chats', {
        headers: {
          'apiKey': this.apiKey,
        },
        params: {
          startDate,
          endDate,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching Tawk.to logs:', error);
      throw error;
    }
  }
}