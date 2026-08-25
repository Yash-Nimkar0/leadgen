import { SourceProvider, FetchCandidatesInput, SourcePost } from '../../types';
import { mockFixtures } from './fixtures';

export class MockRedditProvider implements SourceProvider {
  async fetchCandidates(input: FetchCandidatesInput): Promise<SourcePost[]> {
    // In a real provider, we'd use input.projectConfig to search.
    // For the mock, we just return the full suite of fixtures to test the pipeline.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return Object.values(mockFixtures);
  }
}
