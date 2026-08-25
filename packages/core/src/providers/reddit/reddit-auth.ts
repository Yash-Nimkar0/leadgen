import { RedditAuthError, RedditProviderError, RedditTimeoutError } from './reddit-errors';

export interface RedditAuthConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

/**
 * Fetches and caches an app-only OAuth token via the client_credentials grant.
 * This is Reddit's read-only, no-user-context token type - appropriate for a
 * lead-gen tool that only searches/reads public posts and never acts as a
 * specific Reddit user. Requires a "script" or "web app" type app registered
 * at reddit.com/prefs/apps (client_id + client_secret), NOT a Reddit account
 * password.
 */
export class RedditTokenManager {
  private token: string | null = null;
  private expiresAt = 0;

  constructor(private config: RedditAuthConfig) {}

  async getToken(): Promise<string> {
    // Refresh a little before actual expiry to avoid a request failing mid-flight.
    if (this.token && Date.now() < this.expiresAt - 30_000) {
      return this.token;
    }
    return this.fetchNewToken();
  }

  /** Force a refresh regardless of cached expiry - used after an auth failure. */
  async refresh(): Promise<string> {
    return this.fetchNewToken();
  }

  private async fetchNewToken(): Promise<string> {
    const basicAuth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent,
        },
        body: 'grant_type=client_credentials',
        signal: controller.signal,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new RedditTimeoutError();
      }
      throw new RedditProviderError(`Network error fetching Reddit OAuth token: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new RedditAuthError(
        `Failed to obtain Reddit OAuth token (status ${response.status}). Check REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET. ${body}`.trim()
      );
    }

    const data = (await response.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) {
      throw new RedditAuthError('Reddit OAuth response did not include an access_token.');
    }

    this.token = data.access_token;
    this.expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
    return this.token;
  }
}
