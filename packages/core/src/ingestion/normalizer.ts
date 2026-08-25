import { SourcePost } from '../types';

export function normalizePost(post: any): SourcePost | null {
  try {
    if (!post || typeof post !== 'object') return null;
    
    const externalId = post.externalId?.trim();
    const sourceUrl = post.sourceUrl?.trim();
    const title = post.title?.trim();
    const authorIdentifier = post.authorIdentifier?.trim();
    const subreddit = post.subreddit?.trim();
    
    if (!externalId || !sourceUrl || !title || !authorIdentifier || !subreddit) {
      return null;
    }

    // Limit body length to prevent massive payloads (e.g. 10,000 characters)
    let body = post.body?.trim() || null;
    if (body && body.length > 10000) {
      body = body.substring(0, 10000) + '...';
    }

    // Ensure publishedAt is a valid Date
    let publishedAt = new Date(post.publishedAt);
    if (isNaN(publishedAt.getTime())) {
      publishedAt = new Date(); // fallback
    }

    return {
      externalId,
      sourceUrl,
      title,
      body,
      authorIdentifier,
      subreddit,
      publishedAt
    };
  } catch (error) {
    return null; // Silent failure for malformed input, effectively skipping it
  }
}
