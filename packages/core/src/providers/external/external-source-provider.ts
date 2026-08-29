import { SourceProvider, FetchCandidatesInput, SourcePost } from '../../types';
import { ConfiguredProvider } from './configured-provider';
import { 
  MAX_KEYWORDS_PER_SOURCE, 
  MAX_SOURCES_PER_RUN, 
  MAX_RESULTS_PER_REQUEST 
} from './constants';

export class ExternalSourceProvider implements SourceProvider {
  private configuredProvider: ConfiguredProvider;

  constructor() {
    this.configuredProvider = new ConfiguredProvider();
  }

  async fetchCandidates(input: FetchCandidatesInput): Promise<SourcePost[]> {
    const keywords = input.projectConfig.keywords.slice(0, MAX_KEYWORDS_PER_SOURCE);
    const sources = input.projectConfig.sources.slice(0, MAX_SOURCES_PER_RUN);
    
    // Broad queries generation from vocabulary
    let broadQueries: string[] = [];
    if (input.projectConfig.vocabulary) {
      const vocab = input.projectConfig.vocabulary;
      // Combine entities with synonyms or subtypes
      const pool = [...(vocab.entities || []), ...(vocab.synonyms || []), ...(vocab.subtypes || []), ...(vocab.contexts || [])];
      
      // Select highest value unique terms for broad queries
      broadQueries = Array.from(new Set(pool))
        .filter(t => t.length > 2)
        .slice(0, 5); // Max broad queries = 5
    }

    const fetchedMap = new Map<string, { post: SourcePost; provenance: string }>();

    const updateProvenance = (p: SourcePost, newProvenance: 'EXACT_QUERY' | 'BROAD_QUERY') => {
      const existing = fetchedMap.get(p.externalId);
      if (existing) {
        if (existing.provenance !== newProvenance && existing.provenance !== 'BOTH') {
          existing.provenance = 'BOTH';
        }
      } else {
        fetchedMap.set(p.externalId, { post: p, provenance: newProvenance });
      }
    };

    if (sources.length === 0) {
      throw new Error('Configuration Error: At least one source/subreddit must be configured for the project.');
    }

    for (const source of sources) {
      // 1. Fetch exact queries
      for (const query of keywords) {
        try {
          const results = await this.configuredProvider.fetch({ query, source: source || undefined, limit: MAX_RESULTS_PER_REQUEST });
          for (const p of results) {
            updateProvenance(p, 'EXACT_QUERY');
          }
        } catch (error) {
          console.error(`Failed to fetch exact candidates for query '${query}' in source '${source}':`, error);
        }
      }

      // 2. Fetch broad queries
      for (const query of broadQueries) {
        // Skip if exact query already covers this
        if (keywords.includes(query)) continue;
        
        try {
          const results = await this.configuredProvider.fetch({ query, source: source || undefined, limit: MAX_RESULTS_PER_REQUEST });
          for (const p of results) {
            updateProvenance(p, 'BROAD_QUERY');
          }
        } catch (error) {
          console.error(`Failed to fetch broad candidates for query '${query}' in source '${source}':`, error);
        }
      }
      
      // If no queries at all, fetch source directly (fallback)
      if (keywords.length === 0 && broadQueries.length === 0 && source) {
         try {
            const results = await this.configuredProvider.fetch({ source, limit: MAX_RESULTS_PER_REQUEST });
            for (const p of results) {
              updateProvenance(p, 'EXACT_QUERY');
            }
          } catch (error) {
            console.error(`Failed to fetch external candidates in source '${source}':`, error);
          }
      }
    }

    // Attach provenance and return
    return Array.from(fetchedMap.values()).map(entry => {
      const post = entry.post;
      post.provenance = entry.provenance;
      return post;
    });
  }
}
