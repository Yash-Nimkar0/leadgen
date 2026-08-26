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
    const posts: SourcePost[] = [];
    const keywords = input.projectConfig.keywords.slice(0, MAX_KEYWORDS_PER_SOURCE);
    const sources = input.projectConfig.sources.slice(0, MAX_SOURCES_PER_RUN);
    
    // If no specific sources defined for the project, we still want to search keywords globally
    if (sources.length === 0) {
       for (const keyword of keywords) {
         try {
           const results = await this.configuredProvider.fetch({
             query: keyword,
             limit: MAX_RESULTS_PER_REQUEST
           });
           posts.push(...results);
         } catch (error) {
           console.error(`Failed to fetch external candidates for keyword ${keyword}:`, error);
         }
       }
       return posts;
    }

    for (const source of sources) {
      if (keywords.length > 0) {
        for (const keyword of keywords) {
          try {
            const results = await this.configuredProvider.fetch({
              query: keyword,
              source: source,
              limit: MAX_RESULTS_PER_REQUEST
            });
            posts.push(...results);
          } catch (error) {
            console.error(`Failed to fetch external candidates for keyword ${keyword} in source ${source}:`, error);
          }
        }
      } else {
         try {
            const results = await this.configuredProvider.fetch({
              source: source,
              limit: MAX_RESULTS_PER_REQUEST
            });
            posts.push(...results);
          } catch (error) {
            console.error(`Failed to fetch external candidates in source ${source}:`, error);
          }
      }
    }

    return posts;
  }
}
