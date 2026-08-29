import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { IngestionPipeline } from './packages/core/src/ingestion/pipeline';
import { ExternalSourceProvider } from './packages/core/src/providers/external/external-source-provider';
import { LLMRouter } from './packages/core/src/providers/llm/llm-router';
import { 
  PrismaPostRepository, 
  PrismaProjectLeadRepository, 
  PrismaProjectRepository, 
  PrismaIngestionRunRepository,
  PrismaAnalysisRepository
} from './packages/core/src/repositories/prisma-repositories';

const prisma = new PrismaClient();

async function run() {
  const pId = '84f71040-7d9c-4906-a93f-63b2aea1373b';

  console.log("--- 3. Configuring Source ---");
  // Delete old sources
  await prisma.monitoredSource.deleteMany({ where: { projectId: pId } });
  
  // Add new sources
  await prisma.monitoredSource.createMany({
    data: [
      { projectId: pId, sourceIdentifier: "SaaS", enabled: true },
      { projectId: pId, sourceIdentifier: "sysadmin", enabled: true },
      { projectId: pId, sourceIdentifier: "msp", enabled: true }
    ]
  });

  console.log("Sources configured: SaaS, sysadmin, msp");

  console.log("\n--- 4. Running Validation Ingestion ---");
  const llmRouter = new LLMRouter();
  const provider = new ExternalSourceProvider();
  
  const postRepo = new PrismaPostRepository();
  const leadRepo = new PrismaProjectLeadRepository();
  const projectRepo = new PrismaProjectRepository();
  const runRepo = new PrismaIngestionRunRepository();
  const analysisRepo = new PrismaAnalysisRepository();
  
  const pipeline = new IngestionPipeline(
    provider, postRepo, leadRepo, projectRepo, runRepo, llmRouter, analysisRepo
  );

  await pipeline.run(pId);
  console.log("Ingestion complete.");

  const p = await prisma.project.findUnique({ where: { id: pId } });

  console.log("\n--- Vocabulary Metadata ---");
  console.log(`vocabularyProvider: ${p.vocabularyProvider}`);
  console.log(`vocabularyModel: ${p.vocabularyModel}`);
  console.log(`vocabularyInputHash: ${p.vocabularyInputHash}`);
  console.log(`vocabularyGeneratedAt: ${p.vocabularyGeneratedAt?.toISOString()}`);

  console.log("\n--- 5. Fresh Ingestion Metrics ---");
  const runData = await prisma.ingestionRun.findFirst({
    where: { projectId: pId },
    orderBy: { startedAt: 'desc' }
  });
  
  console.log(`postsDiscovered: ${runData?.postsDiscovered}`);
  console.log(`postsInvalid: ${runData?.postsInvalid}`);
  console.log(`postsPreFiltered: ${runData?.postsPreFiltered}`);
  console.log(`postsDuplicateLeads: ${runData?.postsDuplicateLeads}`);
  console.log(`postsClassified: ${runData?.postsClassified}`);
  console.log(`leadsCreated: ${runData?.leadsCreated}`);
  console.log(`highIntentLeads: ${runData?.highIntentLeads}`);
  console.log(`startedAt: ${runData?.startedAt?.toISOString()}`);
  console.log(`completedAt: ${runData?.completedAt?.toISOString()}`);

  console.log("\n--- 6. Stage 1 Sample ---");
  async function printSample(min: number, max: number, label: string) {
    let whereClause: any = {
      projectId: pId,
      analysis: { is: { finalScore: { gte: min, lte: max } } },
      discoveredAt: { gte: runData.startedAt }
    };
    if (max < 70) {
      whereClause.analysis = { is: { finalScore: { lt: 70 } } };
    }
    
    const leads = await prisma.projectLead.findMany({
      where: whereClause,
      include: { redditPost: true, analysis: true }
    });
    
    leads.sort(() => Math.random() - 0.5);
    const sample = leads.slice(0, 10);
    console.log(`\nSample: ${label} (${leads.length} available)`);
    for (const lead of sample) {
      console.log(`title: ${lead.redditPost.title}\nbody: ${lead.redditPost.body?.substring(0, 200)}...\nsubreddit: ${lead.redditPost.subreddit}\nfinalScore: ${lead.analysis?.finalScore}\nprovenance: ${lead.provenance}\n---`);
    }
  }

  await printSample(80, 100, "80-100");
  await printSample(70, 79, "70-79");
  await printSample(0, 69, "<70");
}

run().catch(console.error).finally(() => prisma.$disconnect());
