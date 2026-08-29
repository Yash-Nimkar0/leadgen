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
import { computeVocabularyHash, enforceVocabularyLimits } from './packages/core/src/ingestion/vocabulary';

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();

  console.log("--- 1. Creating Project ---");
  const p = await prisma.project.create({
    data: {
      name: "AI Support Platform",
      productDescription: "AI-powered customer support/helpdesk software for mid-market SaaS and technology companies. Helps support teams automate ticket handling, reduce support workload, improve response times, and resolve repetitive customer issues.",
      idealCustomerProfile: "SaaS/software companies\nmid-market technology companies\nsupport teams\ncustomer-service teams\ncompanies experiencing support volume/backlog",
      exclusionRules: "individual consumers\npersonal customer-service questions\nconsumer shopping\nunrelated retail/ecommerce discussions\njob seekers looking for support roles",
      userId: user!.id,
      keywords: {
        create: [
          { keyword: "customer support", type: "GENERAL" },
          { keyword: "helpdesk", type: "GENERAL" },
          { keyword: "support tickets", type: "GENERAL" },
          { keyword: "ticket automation", type: "GENERAL" },
          { keyword: "AI support", type: "GENERAL" },
          { keyword: "customer service", type: "GENERAL" },
          { keyword: "Zendesk", type: "COMPETITOR" },
          { keyword: "Intercom", type: "COMPETITOR" },
          { keyword: "Freshdesk", type: "COMPETITOR" }
        ]
      },
      sources: {
        create: [
          { sourceIdentifier: "reddit", enabled: true }
        ]
      }
    }
  });

  console.log("Project created with ID:", p.id);

  console.log("\n--- 2 & 3. Verifying Vocabulary & Fresh Ingestion ---");
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

  console.log("Starting ingestion...");
  await pipeline.run(p.id);
  console.log("Ingestion complete.");

  const updatedP = await prisma.project.findUnique({ where: { id: p.id }, include: { keywords: true } });
  
  console.log("\n--- Vocabulary Metadata ---");
  console.log(`vocabularyProvider: ${updatedP.vocabularyProvider}`);
  console.log(`vocabularyModel: ${updatedP.vocabularyModel}`);
  console.log(`vocabularyInputHash: ${updatedP.vocabularyInputHash}`);
  console.log(`vocabularyGeneratedAt: ${updatedP.vocabularyGeneratedAt?.toISOString()}`);

  console.log("\n--- Vocabulary Genericity Checks ---");
  const vocab = updatedP.vocabulary as any;
  const vocabString = JSON.stringify(vocab, null, 2).toLowerCase();
  const hasRealEstate = vocabString.includes("thane") || vocabString.includes("real estate") || vocabString.includes("property") || vocabString.includes("bhk");
  console.log(`Contains Thane/real-estate terms: ${hasRealEstate}`);
  
  let withinLimits = true;
  for (const [category, terms] of Object.entries(vocab)) {
    if (Array.isArray(terms) && terms.length > 20) {
      withinLimits = false;
      console.log(`Category ${category} exceeds limit (length: ${terms.length})`);
    }
  }
  console.log(`Vocabulary remains within configured category limits: ${withinLimits}`);
  console.log("Vocabulary payload excerpt:");
  console.log(JSON.stringify(vocab, null, 2).substring(0, 500) + '...');

  console.log("\n--- Hash/Cache Behavior Checks ---");
  const baseHash = updatedP.vocabularyInputHash;
  
  // unrelated project edit (name)
  const unrelatedEditHash = computeVocabularyHash({
    productDescription: updatedP.productDescription,
    keywords: updatedP.keywords.map(k => k.keyword),
    competitors: updatedP.keywords.filter(k => k.type === 'COMPETITOR').map(k => k.keyword),
    idealCustomerProfile: updatedP.idealCustomerProfile,
    exclusionRules: updatedP.exclusionRules
  });
  console.log(`Unrelated edit hash matches base: ${baseHash === unrelatedEditHash}`);
  
  // relevant ICP edit
  const relevantEditHash = computeVocabularyHash({
    productDescription: updatedP.productDescription,
    keywords: updatedP.keywords.map(k => k.keyword),
    competitors: updatedP.keywords.filter(k => k.type === 'COMPETITOR').map(k => k.keyword),
    idealCustomerProfile: updatedP.idealCustomerProfile + "\nenterprise software",
    exclusionRules: updatedP.exclusionRules
  });
  console.log(`Relevant ICP edit hash matches base: ${baseHash === relevantEditHash} (Should be false)`);

  console.log("\n--- 4. Ingestion Metrics ---");
  const runData = await prisma.ingestionRun.findFirst({
    where: { projectId: p.id },
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

  console.log("\n--- 5. Review Sample ---");
  async function printSample(min: number, max: number, label: string) {
    let whereClause: any = {
      projectId: p.id,
      analysis: { is: { finalScore: { gte: min, lte: max } } },
      discoveredAt: { gte: runData.startedAt }
    };
    
    // For < 70, use lt: 70
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
