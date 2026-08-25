import { RedditProvider } from './providers/reddit/reddit-provider';

async function main() {
  console.log('--- Phase 7A: Reddit Smoke Test ---');
  
  try {
    // Attempt to instantiate the live provider
    const provider = new RedditProvider();
    
    // If we reach here, it means the gate didn't throw an error
    console.log('Provider instantiated successfully.');
    
    // Test fetch
    // const posts = await provider.fetchCandidates(...);
  } catch (error: any) {
    if (error.message.includes('Live Reddit ingestion is disabled')) {
      console.log('✅ Safely exited:');
      console.log(`   ${error.message}`);
      process.exit(0);
    } else {
      console.error('❌ Unexpected error during smoke test:');
      console.error(error);
      process.exit(1);
    }
  }
}

main().catch(console.error);
