import { SourcePost, SourceFetchInput } from '../../types';
import { ExternalHttpClient } from './http-client';

// MANUAL INTEGRATION POINT
//
// This file intentionally contains the vendor-specific adapter.
// Add the external provider's:
// 1. base URL
// 2. authentication header
// 3. endpoint paths
// 4. query parameters
// 5. response-to-SourcePost mapping
//
// Do not put vendor-specific logic anywhere else.

export class ConfiguredProvider {
  private client: ExternalHttpClient;

  constructor() {
    this.client = new ExternalHttpClient({
      baseUrl: process.env.EXTERNAL_SOURCE_BASE_URL,
      headers: process.env.EXTERNAL_SOURCE_API_KEY 
        ? { Authorization: `Bearer ${process.env.EXTERNAL_SOURCE_API_KEY}` }
        : {},
      timeoutMs: 15000,
    });
  }

  async fetch(input: SourceFetchInput): Promise<SourcePost[]> {
    // ----------------------------------------------------------------------
    // TODO: VENDOR-SPECIFIC IMPLEMENTATION
    // ----------------------------------------------------------------------
    
    // Example path configuration (replace with vendor's path)
    const endpointPath = '/api/reddit/search'; 
    
    // Example query parameter mapping (replace with vendor's parameter names)
    const queryParams: Record<string, string> = {
      q: input.query || '',
      limit: input.limit.toString(),
    };
    if (input.source) {
       queryParams.subreddit = input.source;
    }
    if (input.cursor) {
       queryParams.after = input.cursor;
    }

     
    const response: any = await this.client.get(endpointPath, queryParams);

    // ----------------------------------------------------------------------
    // MAPPING VENDOR RESPONSE TO SourcePost[]
    // ----------------------------------------------------------------------
    const posts: SourcePost[] = [];
    
    // Example mapping (replace with vendor's response structure)
     
    const items = response?.posts || [];
    
     
    for (const item of items) {
      posts.push({
        externalId: item.name || item.id,
        sourceUrl: `https://www.reddit.com${item.permalink}`,
        title: item.title || '',
        body: item.text || null,
        authorIdentifier: item.author || 'unknown',
        subreddit: item.subreddit || input.source || 'unknown',
        publishedAt: new Date((item.created_utc || (Date.now()/1000)) * 1000),
      });
    }

    return posts;
  }
}
