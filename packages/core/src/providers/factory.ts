import { SourceProvider } from '../types';
import { MockRedditProvider } from './reddit/mock-reddit-provider';
import { ExternalSourceProvider } from './external/external-source-provider';

export function getSourceProvider(): SourceProvider {
  const providerType = process.env.SOURCE_PROVIDER || 'mock';
  const externalEnabled = process.env.EXTERNAL_SOURCE_ENABLED === 'true';

  if (providerType === 'external' && externalEnabled) {
    return new ExternalSourceProvider();
  }
  
  // Default to mock for safety
  return new MockRedditProvider();
}
