import { RedditAuthError, RedditRateLimitError, RedditServerError, RedditTimeoutError, RedditProviderError } from './reddit-errors';

export interface RedditClientConfig {
  userAgent: string;
  accessToken?: string;
}

/**
 * A thin wrapper around fetch for the Reddit API that handles
 * standard error mapping and rate limit headers.
 */
export class RedditClient {
  constructor(private config: RedditClientConfig) {}

  async get(url: string, params?: Record<string, string>): Promise<any> {
    const urlObj = new URL(url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      'User-Agent': this.config.userAgent,
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    let response: Response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      response = await fetch(urlObj.toString(), {
        headers,
        signal: controller.signal,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new RedditTimeoutError();
      }
      throw new RedditProviderError(`Network error: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    try {
      return await response.json();
    } catch (err) {
      throw new RedditProviderError('Failed to parse Reddit JSON response');
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;
    
    if (status === 401 || status === 403) {
      throw new RedditAuthError(`Authentication failed with status ${status}`);
    }

    if (status === 429) {
      const retryAfterStr = response.headers.get('retry-after') || response.headers.get('x-ratelimit-reset');
      const retryAfter = retryAfterStr ? parseInt(retryAfterStr, 10) : undefined;
      throw new RedditRateLimitError(retryAfter);
    }

    if (status >= 500) {
      throw new RedditServerError(`Reddit server error ${status}`);
    }

    throw new RedditProviderError(`Unexpected Reddit API error: ${status}`, status);
  }
}
