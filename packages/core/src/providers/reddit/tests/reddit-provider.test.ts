import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RedditProvider } from '../reddit-provider';
import { RedditClient } from '../reddit-client';
import { RedditTokenManager } from '../reddit-auth';
import { mapRedditSearchResponse, mapRedditPost } from '../reddit-mapper';
import { RedditAuthError, RedditRateLimitError, RedditServerError, RedditTimeoutError } from '../reddit-errors';
import * as fixtures from './fixtures.json';

function fakeTokenManager(): RedditTokenManager {
  const tm = Object.create(RedditTokenManager.prototype) as RedditTokenManager;
  tm.getToken = vi.fn().mockResolvedValue('fake-token');
  (tm as any).refresh = vi.fn().mockResolvedValue('fake-token');
  return tm;
}

describe('RedditProvider Architecture', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    process.env.REDDIT_LIVE_ENABLED = 'true';
    process.env.REDDIT_AUTHORIZED = 'true';
    process.env.REDDIT_CLIENT_ID = 'test-client-id';
    process.env.REDDIT_CLIENT_SECRET = 'test-client-secret';
  });

  describe('Authorization Gate', () => {
    it('throws if REDDIT_LIVE_ENABLED is not true', () => {
      process.env.REDDIT_LIVE_ENABLED = 'false';
      expect(() => new RedditProvider()).toThrow('Live Reddit ingestion is disabled');
    });

    it('throws if REDDIT_AUTHORIZED is not true', () => {
      process.env.REDDIT_AUTHORIZED = 'false';
      expect(() => new RedditProvider()).toThrow('Live Reddit ingestion is disabled');
    });

    it('throws if REDDIT_CLIENT_ID/SECRET are missing', () => {
      delete process.env.REDDIT_CLIENT_ID;
      expect(() => new RedditProvider()).toThrow('REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required');
    });

    it('initializes if flags and credentials are set', () => {
      expect(() => new RedditProvider()).not.toThrow();
    });
  });

  describe('Reddit Mapper', () => {
    it('correctly maps a successful search response', () => {
      const posts = mapRedditSearchResponse(fixtures.successfulSearch);
      expect(posts).toHaveLength(2);
      expect(posts[0].externalId).toBe('reddit_12345');
      expect(posts[0].title).toBe('Need a good solution for API billing');
      expect(posts[0].authorIdentifier).toBe('dev_founder');
      expect(posts[0].subreddit).toBe('SaaS');
      expect(posts[0].publishedAt.getTime()).toBe(1690000000000); // 1690000000 * 1000
    });

    it('returns empty array for empty search', () => {
      const posts = mapRedditSearchResponse(fixtures.emptySearch);
      expect(posts).toHaveLength(0);
    });

    it('handles missing fields safely', () => {
      const mapped = mapRedditPost({ data: { id: "1" } }); 
      // Title is required by our mapper
      expect(mapped).toBeNull();
    });
  });

  describe('Reddit Client Error Handling', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('throws RedditAuthError on 401', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      const client = new RedditClient({ userAgent: 'test', tokenManager: fakeTokenManager() });
      await expect(client.get('http://test')).rejects.toThrow(RedditAuthError);
    });

    it('throws RedditRateLimitError on 429 with retry-after', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({
          'retry-after': '60'
        })
      });

      const client = new RedditClient({ userAgent: 'test', tokenManager: fakeTokenManager() });
      try {
        await client.get('http://test');
        expect.fail('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(RedditRateLimitError);
        expect(err.retryAfter).toBe(60);
      }
    });

    it('throws RedditServerError on 500', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      });

      const client = new RedditClient({ userAgent: 'test', tokenManager: fakeTokenManager() });
      await expect(client.get('http://test')).rejects.toThrow(RedditServerError);
    });
  });
});
