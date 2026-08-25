import { IngestionPipeline } from './ingestion/pipeline';
import { MockRedditProvider } from './providers/reddit/mock-reddit-provider';
import { MockLLMProvider } from './providers/llm/mock-llm-provider';
import { 
  PrismaPostRepository, 
  PrismaProjectLeadRepository, 
  PrismaProjectRepository, 
  PrismaIngestionRunRepository,
  PrismaAnalysisRepository
} from './repositories/prisma-repositories';
import { prisma } from '@repo/database';

async function verify() {
  console.log('--- Starting Mock Ingestion Verification ---');
  
  const provider = new MockRedditProvider();
  const postRepo = new PrismaPostRepository();
  const leadRepo = new PrismaProjectLeadRepository();
  const projectRepo = new PrismaProjectRepository();
  const runRepo = new PrismaIngestionRunRepository();
  const llmProvider = new MockLLMProvider();
  const analysisRepo = new PrismaAnalysisRepository();

  const pipeline = new IngestionPipeline(
    provider,
    postRepo,
    leadRepo,
    projectRepo,
    runRepo,
    llmProvider,
    analysisRepo
  );

  // 1. Initial State Check
  const initialLeads = await prisma.projectLead.count();
  console.log(`Initial leads in DB: ${initialLeads}`);

  // 2. Run Pipeline First Time
  console.log('Running pipeline...');
  await pipeline.run();

  const afterFirstRunLeads = await prisma.projectLead.count();
  console.log(`Leads in DB after 1st run: ${afterFirstRunLeads}`);
  
  // 3. Run Pipeline Second Time to Verify Idempotency
  console.log('Running pipeline again to check idempotency...');
  await pipeline.run();

  const afterSecondRunLeads = await prisma.projectLead.count();
  console.log(`Leads in DB after 2nd run: ${afterSecondRunLeads}`);

  if (afterFirstRunLeads === afterSecondRunLeads) {
    console.log('✅ Idempotency verified: No duplicate leads created.');
  } else {
    console.error('❌ Idempotency failed: Duplicate leads were created.');
  }

  // 4. Check IngestionRuns
  const runs = await prisma.ingestionRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 2
  });

  console.log('\nRecent Ingestion Runs:');
  runs.forEach(r => {
    console.log(`- Run ID: ${r.id}, Status: ${r.status}, Discovered: ${r.postsDiscovered}, Filtered: ${r.postsFiltered}`);
  });

  // 5. Output some created leads
  const leads = await prisma.projectLead.findMany({
    include: {
      project: true,
      redditPost: true
    },
    take: 3
  });

  console.log('\nSample Generated Leads:');
  leads.forEach(l => {
    console.log(`[Project: ${l.project.name}] Title: ${l.redditPost.title} (ID: ${l.redditPost.externalId})`);
  });

  console.log('--- Verification Complete ---');
}

verify()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
