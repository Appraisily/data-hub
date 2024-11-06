import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from '../utils/logger';

export class SecretManagerService {
  private static instance: SecretManagerService;
  private client: SecretManagerServiceClient;
  private projectId: string;

  private constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
  }

  public static getInstance(): SecretManagerService {
    if (!SecretManagerService.instance) {
      SecretManagerService.instance = new SecretManagerService();
    }
    return SecretManagerService.instance;
  }

  private getSecretPath(secretName: string, version = 'latest'): string {
    return `projects/${this.projectId}/secrets/${secretName}/versions/${version}`;
  }

  async getSecret(secretName: string): Promise<string> {
    try {
      const [version] = await this.client.accessSecretVersion({
        name: this.getSecretPath(secretName),
      });

      if (!version.payload?.data) {
        throw new Error(`Secret ${secretName} not found`);
      }

      return version.payload.data.toString();
    } catch (error) {
      logger.error(`Error fetching secret ${secretName}:`, error);
      throw error;
    }
  }

  async loadSecrets(): Promise<void> {
    try {
      // Load all required secrets
      const requiredSecrets = [
        'GOOGLE_DOCS_CREDENTIALS',
        'WORDPRESS_API_URL',
        'SENDGRID_API_KEY',
        'GOOGLE_SHEET_NAME',
        'JWT_SECRET',
        'SHARED_SECRET',
        'PENDING_APPRAISALS_SPREADSHEET_ID',
        'SALES_SPREADSHEET_ID',
        'LOG_SPREADSHEET_ID',
        'wp_username',
        'wp_app_password',
        'GOOGLE_CLIENT_EMAIL',
        'GOOGLE_PRIVATE_KEY',
        'GA_VIEW_ID',
        'TAWKTO_API_KEY',
        'GITHUB_TOKEN'
      ];

      for (const secretName of requiredSecrets) {
        process.env[secretName] = await this.getSecret(secretName);
      }

      logger.info('All secrets loaded successfully');
    } catch (error) {
      logger.error('Error loading secrets:', error);
      throw error;
    }
  }
}