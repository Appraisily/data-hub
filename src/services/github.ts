import { Octokit } from '@octokit/rest';
import { logger } from '../utils/logger';

export class GitHubService {
  private static instance: GitHubService;
  private octokit: Octokit;

  private constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  public static getInstance(): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService();
    }
    return GitHubService.instance;
  }

  async getRepositoryEvents(owner: string, repo: string): Promise<any[]> {
    try {
      const response = await this.octokit.activity.listRepoEvents({
        owner,
        repo,
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching GitHub events:', error);
      throw error;
    }
  }
}