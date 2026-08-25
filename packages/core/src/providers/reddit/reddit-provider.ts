import { SourceProvider, FetchCandidatesInput, SourcePost } from '../../types';
import { RedditClient } from './reddit-client';
import { RedditTokenManager } from './reddit-auth';
import { mapRedditSearchResponse } from './reddit-mapper';

// Free-tier read: the client_credentials grant caps out around 100 QPM. This
// spacing keeps us comfortably under that even across multiple projects/keywords
// in one ingestion run, without needing to track a request counter.
const MIN_REQUEST_INTERVAL_MS = 700;

export class RedditProvider implements SourceProvider {
  private client: RedditClient;
  private lastRequestAt = 0;

  constructor() {
    const liveEnabled = process.env.REDDIT_LIVE_ENABLED === 'true';
    // NOTE: "authorized" here means "a human has read docs/reddit-data-strategy.md
    // and deliberately enabled live ingestion under Reddit's free, non-commercial
    // developer tier for private testing." It does NOT mean commercial API access
    // has been granted - that is tracked separately and is required before this
    // product can be operated as a paid, public service. See
    // docs/reddit-data-strategy.md for the current status of both.
    const authorized = process.env.REDDIT_AUTHORIZED === 'true';

    if (!liveEnabled || !authorized) {
      throw new Error(
        'Live Reddit ingestion is disabled. Set REDDIT_LIVE_ENABLED=true and REDDIT_AUTHORIZED=true ' +
        'to enable it under the free/non-commercial developer tier for private testing - see docs/reddit-data-strategy.md.'
      );
    }

    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error(
        'REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required for live Reddit ingestion. ' +
        'Create a "script" type app at https://www.reddit.com/prefs/apps to get these.'
      );
    }

    const userAgent = process.env.REDDIT_USER_AGENT || 'Leadgen/1.0';
    const tokenManager = new RedditTokenManager({ clientId, clientSecret, userAgent });
    this.client = new RedditClient({ userAgent, tokenManager });
  }

  private async throttle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    this.lastRequestAt = Date.now();
  }

  async fetchCandidates(input: FetchCandidatesInput): Promise<SourcePost[]> {
    const allPosts: SourcePost[] = [];

    for (const source of input.projectConfig.sources) {
      for (const keyword of input.projectConfig.keywords) {
        try {
          await this.throttle();
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
          throw error;
        }
      }
    }

    return allPosts;
  }
}
