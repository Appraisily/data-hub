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
      // Load required secrets
      process.env.API_KEY = await this.getSecret('DATA_HUB_API_KEY');
      process.env.PENDING_APPRAISALS_SPREADSHEET_ID = await this.getSecret('PENDING_APPRAISALS_SPREADSHEET_ID');
      process.env.GOOGLE_DOCS_CREDENTIALS = await this.getSecret('GOOGLE_DOCS_CREDENTIALS');
      
      logger.info('All secrets loaded successfully');
    } catch (error) {
      logger.error('Error loading secrets:', error);
      throw error;
    }
  }
}