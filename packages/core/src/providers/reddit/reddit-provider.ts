import { SourceProvider, FetchCandidatesInput, SourcePost } from '../../types';
import { RedditClient } from './reddit-client';
import { mapRedditSearchResponse } from './reddit-mapper';

export class RedditProvider implements SourceProvider {
  private client: RedditClient;

  constructor() {
    // Phase 7A strict authorization gate
    const liveEnabled = process.env.REDDIT_LIVE_ENABLED === 'true';
    const authorized = process.env.REDDIT_AUTHORIZED === 'true';

    if (!liveEnabled || !authorized) {
      throw new Error(
        'Live Reddit ingestion is disabled because commercial authorization has not been configured.'
      );
    }

    this.client = new RedditClient({
      userAgent: process.env.REDDIT_USER_AGENT || 'Leadgen/1.0',
      accessToken: process.env.REDDIT_ACCESS_TOKEN, // Placeholder for Phase 7B
    });
  }

  async fetchCandidates(input: FetchCandidatesInput): Promise<SourcePost[]> {
    const allPosts: SourcePost[] = [];

    // Note: We are architecting this for Phase 7B. We do not run this in Phase 7A.
    for (const source of input.projectConfig.sources) {
      for (const keyword of input.projectConfig.keywords) {
        try {
          const url = `https://oauth.reddit.com/r/${source}/search`;
          const response = await this.client.get(url, {
            q: keyword,
            restrict_sr: 'on',
            sort: 'new',
            limit: '25',
          });

          const posts = mapRedditSearchResponse(response);
          allPosts.push(...posts);
        } catch (error) {
          console.error(`Failed to fetch from r/${source} for keyword "${keyword}":`, error);
          // In a real scenario, we might want to throw if it's a rate limit or auth error,
          // but continue if it's just a 404 for a subreddit.
          throw error; 
        }
      }
    }

    return allPosts;
  }
}
