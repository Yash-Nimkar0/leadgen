import { SourcePost } from '../../types';

export function mapRedditPost(rawData: any): SourcePost | null {
  if (!rawData || !rawData.data || !rawData.data.id) {
    return null;
  }

  const { data } = rawData;

  // Title and ID are strictly required by our mapping
  if (!data.title) {
    return null;
  }

  // Handle created_utc (Reddit returns seconds, we need milliseconds)
  const publishedAt = data.created_utc 
    ? new Date(data.created_utc * 1000) 
    : new Date();

  return {
    externalId: `reddit_${data.id}`,
    sourceUrl: data.permalink ? `https://reddit.com${data.permalink}` : '',
    title: data.title,
    body: data.selftext || null,
    authorIdentifier: data.author || '[deleted]',
    subreddit: data.subreddit || 'unknown',
    publishedAt,
  };
}

export function mapRedditSearchResponse(jsonResponse: any): SourcePost[] {
  if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data.children)) {
    return [];
  }

  const posts: SourcePost[] = [];
  for (const child of jsonResponse.data.children) {
    const mapped = mapRedditPost(child);
    if (mapped) {
      posts.push(mapped);
    }
  }

  return posts;
}
