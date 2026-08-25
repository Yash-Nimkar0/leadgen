import { OpenAIProvider } from './providers/llm/openai-provider';
import { Scorer } from './ingestion/scorer';
import { mockFixtures } from './providers/reddit/fixtures';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function runSmokeTest() {
  console.log('--- Starting Real OpenAI Smoke Test ---');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is missing in .env');
    process.exit(1);
  }

  const provider = new OpenAIProvider();
  const scorer = new Scorer();

  const testConfig = {
    name: 'Reddit Intent',
    description: 'A SaaS that finds Reddit conversations where people are actively expressing a problem, evaluating solutions, asking for recommendations, looking for alternatives, or demonstrating other commercially useful buying intent.',
    keywords: ['lead generation', 'customer support', 'intercom', 'zendesk'],
    competitors: ['intercom', 'zendesk']
  };

  const tests = [
    mockFixtures.ACTIVE_PURCHASE,
    mockFixtures.PASSIVE_DISCUSSION,
    mockFixtures.PROMPT_INJECTION
  ];

  for (const post of tests) {
    console.log(`\n\n=== Testing Post: "${post.title}" ===`);
    try {
      const result = await provider.classify({
        projectConfig: testConfig,
        post: {
          title: post.title,
          body: post.body,
          subreddit: post.subreddit
        }
      });

      const finalScore = scorer.calculateFinalScore(result);

      console.log(`Intent Type:       ${result.intentType}`);
      console.log(`Relevance:         ${result.relevance}`);
      console.log(`Commercial Intent: ${result.commercialIntent}`);
      console.log(`Final Score:       ${finalScore}`);
      console.log(`Summary:           ${result.summary}`);
      console.log(`Reason:            ${result.whyItMatters}`);
      console.log(`Matched Comps:     ${result.matchedCompetitors.join(', ')}`);
      
    } catch (e: any) {
      console.error('❌ Error during classification:', e.message);
    }
  }
}

runSmokeTest();
