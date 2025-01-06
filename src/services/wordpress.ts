import axios from 'axios';
import { logger } from '../utils/logger';

export class WordPressService {
  private static instance: WordPressService;
  private baseUrl: string;
  private auth: { username: string; password: string };

  private constructor() {
    this.baseUrl = process.env.WORDPRESS_API_URL || '';
    this.auth = {
      username: process.env.wp_username || '',
      password: process.env.wp_app_password || ''
    };
  }

  public static getInstance(): WordPressService {
    if (!WordPressService.instance) {
      WordPressService.instance = new WordPressService();
    }
    return WordPressService.instance;
  }

  async syncPosts(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/posts`, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error('Error syncing WordPress posts:', error);
      throw error;
    }
  }

  async syncAppraisals(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/appraisal`, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error('Error syncing appraisals:', error);
      throw error;
    }
  }
}