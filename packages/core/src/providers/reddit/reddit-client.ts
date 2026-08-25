import { RedditAuthError, RedditRateLimitError, RedditServerError, RedditTimeoutError, RedditProviderError } from './reddit-errors';
import { RedditTokenManager } from './reddit-auth';

export interface RedditClientConfig {
  userAgent: string;
  tokenManager: RedditTokenManager;
}

/**
 * A thin wrapper around fetch for the Reddit API that handles
 * standard error mapping and rate limit headers.
 */
export class RedditClient {
  constructor(private config: RedditClientConfig) {}

  async get(url: string, params?: Record<string, string>): Promise<any> {
    try {
      return await this.doRequest(url, params, false);
    } catch (error) {
      // A cached token can be rejected server-side before our tracked expiry
      // (e.g. revoked). Retry exactly once with a forced refresh.
      if (error instanceof RedditAuthError) {
        return await this.doRequest(url, params, true);
      }
      throw error;
    }
  }

  private async doRequest(url: string, params: Record<string, string> | undefined, forceRefresh: boolean): Promise<any> {
    const urlObj = new URL(url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
      });
    }

    const token = forceRefresh ? await this.config.tokenManager.refresh() : await this.config.tokenManager.getToken();
    const headers: Record<string, string> = {
      'User-Agent': this.config.userAgent,
      Authorization: `Bearer ${token}`,
    };

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
