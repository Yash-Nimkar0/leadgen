import 'dotenv/config';
import { ExternalSourceProvider } from './packages/core/src/providers/external/external-source-provider';
async function test() {
  const provider = new ExternalSourceProvider();
  for (const sub of ['SaaS', 'CustomerSuccess', 'startups', 'sysadmin', 'msp']) {
    try {
      const res = await provider.fetchCandidates({
        projectConfig: {
          id: 'test',
          keywords: ['helpdesk'],
          sources: [sub]
        }
      });
      console.log(`Subreddit: ${sub} | Results: ${res.length}`);
    } catch (e: any) {
      console.log(`Subreddit: ${sub} | Error: ${e.message}`);
    }
  }
}
test();
