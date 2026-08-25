export class RedditProviderError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RedditProviderError';
  }
}

export class RedditRateLimitError extends RedditProviderError {
  constructor(retryAfter?: number) {
    super('Reddit API rate limit exceeded.', 429, retryAfter);
    this.name = 'RedditRateLimitError';
  }
}

export class RedditAuthError extends RedditProviderError {
  constructor(message: string = 'Reddit API authentication failed.') {
    super(message, 401);
    this.name = 'RedditAuthError';
  }
}

export class RedditServerError extends RedditProviderError {
  constructor(message: string = 'Reddit API server error.') {
    super(message, 500);
    this.name = 'RedditServerError';
  }
}

export class RedditTimeoutError extends RedditProviderError {
  constructor() {
    super('Reddit API request timed out.');
    this.name = 'RedditTimeoutError';
  }
}
