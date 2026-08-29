import { describe, it, expect } from 'vitest';
import { ExternalSourceProvider } from '../external-source-provider';

describe('ExternalSourceProvider', () => {
  it('throws an error if no configured sources exist', async () => {
    const provider = new ExternalSourceProvider();
    
    await expect(provider.fetchCandidates({
      projectConfig: {
        id: 'test-1',
        keywords: ['test'],
        sources: []
      }
    })).rejects.toThrow('Configuration Error: At least one source/subreddit must be configured for the project.');
  });

  it('runs normal ingestion if source is configured', async () => {
    const provider = new ExternalSourceProvider();
    
    // We expect it not to throw the Configuration Error.
    const result = await provider.fetchCandidates({
      projectConfig: {
        id: 'test-2',
        keywords: ['test'],
        sources: ['reddit']
      }
    });
    
    expect(Array.isArray(result)).toBe(true);
  });
});
