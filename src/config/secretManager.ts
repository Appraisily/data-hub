import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from '../utils/logger';

export class SecretManagerService {
  private static instance: SecretManagerService;
  private client: SecretManagerServiceClient;
  private projectId: string;

  private constructor() {
    // Use default credentials
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
        'PENDING_APPRAISALS_SPREADSHEET_ID',
        'JWT_SECRET'
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