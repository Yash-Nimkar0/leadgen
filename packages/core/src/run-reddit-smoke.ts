import { config } from 'dotenv';
import { resolve } from 'path';
import { RedditProvider } from './providers/reddit/reddit-provider';

config({ path: resolve(__dirname, '../../../.env') });

async function main() {
  console.log('--- Reddit Live Ingestion Smoke Test ---');

  let provider: RedditProvider;
  try {
    provider = new RedditProvider();
  } catch (error: any) {
    console.log('Provider not enabled:');
    console.log(`  ${error.message}`);
    process.exit(0);
  }

  console.log('Provider instantiated. Fetching a small live sample from r/test for "hello"...');

  try {
    const posts = await provider.fetchCandidates({
      projectConfig: { id: 'smoke-test', keywords: ['hello'], sources: ['test'] },
    });
    console.log(`✅ Success: fetched ${posts.length} post(s).`);
    if (posts[0]) {
      console.log('Sample post:', {
        title: posts[0].title,
        subreddit: posts[0].subreddit,
        sourceUrl: posts[0].sourceUrl,
      });
    }
  } catch (error: any) {
    console.error('❌ Live fetch failed:');
    console.error(`  ${error.name}: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
