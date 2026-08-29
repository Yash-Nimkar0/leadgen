import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExternalSourceProvider } from '../external-source-provider';
import { ConfiguredProvider } from '../configured-provider';

vi.mock('../configured-provider');

describe('ExternalSourceProvider Provenance Upgrades', () => {
  let provider: ExternalSourceProvider;
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    (ConfiguredProvider as any).mockImplementation(function() {
      return { fetch: fetchMock };
    });
    provider = new ExternalSourceProvider();
  });

  it('should upgrade provenance to BOTH for same-source regressions', async () => {
    // Both exact and broad query hit same externalId in same source
    fetchMock.mockImplementation(async ({ query }: { query?: string }) => {
      if (query === 'exact_term') return [{ externalId: 'post_1', title: 'test' }];
      if (query === 'broad_term') return [{ externalId: 'post_1', title: 'test' }];
      return [];
    });

    const posts = await provider.fetchCandidates({
      projectConfig: {
        id: 'p1',
        keywords: ['exact_term'],
        sources: ['reddit_dev'],
        vocabulary: { entities: ['broad_term'] }
      }
    } as any);

    expect(posts.length).toBe(1);
    expect(posts[0]!.provenance).toBe('BOTH');
  });

  it('should upgrade provenance to BOTH for cross-source regressions', async () => {
    // Exact hits in source A, broad hits in source B
    fetchMock.mockImplementation(async ({ query, source }: { query?: string, source?: string }) => {
      if (query === 'exact_term' && source === 'source_A') return [{ externalId: 'post_2', title: 'test' }];
      if (query === 'broad_term' && source === 'source_B') return [{ externalId: 'post_2', title: 'test' }];
      return [];
    });

    const posts = await provider.fetchCandidates({
      projectConfig: {
        id: 'p1',
        keywords: ['exact_term'],
        sources: ['source_A', 'source_B'],
        vocabulary: { entities: ['broad_term'] }
      }
    } as any);

    expect(posts.length).toBe(1);
    expect(posts[0]!.provenance).toBe('BOTH');
  });
});
