import { PrismaClient, AlertStatus, AlertChannel, ProjectLeadStatus, IntentType } from '@prisma/client';
import { NotificationService } from './notification/NotificationService';
import { MockNotificationProvider } from './providers/notification/mock-notification';
import { ResendEmailProvider } from './providers/notification/resend-provider';

const prisma = new PrismaClient();

async function createLeadWithScore(projectId: string, score: number, status = ProjectLeadStatus.NEW, intentType = IntentType.ACTIVE_PURCHASE) {
  const post = await prisma.redditPost.create({
    data: {
      externalId: `smoke-${Date.now()}-${Math.random()}`,
      sourceUrl: 'http://reddit.com/r/test',
      title: 'Smoke Test Post',
      authorIdentifier: 'user1',
      subreddit: 'test',
      publishedAt: new Date(),
      contentHash: `hash-${Date.now()}-${Math.random()}`
    }
  });

  const lead = await prisma.projectLead.create({
    data: {
      projectId,
      redditPostId: post.id,
      status
    }
  });

  await prisma.analysis.create({
    data: {
      projectLeadId: lead.id,
      model: 'test',
      modelVersion: '1',
      relevanceScore: 100,
      intentScore: score,
      finalScore: score,
      intentType,
      buyingStage: 'AWARENESS',
      summary: 'Test',
      whyItMatters: 'Test',
      recommendedPriority: 'HIGH'
    }
  });

  return lead.id;
}

async function runMockTests(userId: string, projectId: string) {
  console.log("\\n--- Running Notification Logic Tests (Mock) ---");
  const mockProvider = new MockNotificationProvider();
  const notificationService = new NotificationService(prisma, mockProvider);

  // Test 1: Should notify if score is above threshold
  let leadId = await createLeadWithScore(projectId, 85);
  let result = await notificationService.processLead(leadId);
  console.log(`Test 1 (Above threshold): ${result ? 'PASSED' : 'FAILED'}`);
  
  // Test 2: Idempotency (should not send again)
  const result2 = await notificationService.processLead(leadId);
  console.log(`Test 2 (Idempotency): ${!result2 && mockProvider.sentEmails.length === 1 ? 'PASSED' : 'FAILED'}`);

  // Test 3: Should not notify if below threshold
  const leadId2 = await createLeadWithScore(projectId, 79);
  const result3 = await notificationService.processLead(leadId2);
  console.log(`Test 3 (Below threshold): ${!result3 ? 'PASSED' : 'FAILED'}`);

  // Test 4: Concurrency
  leadId = await createLeadWithScore(projectId, 95);
  const results = await Promise.all([
    notificationService.processLead(leadId),
    notificationService.processLead(leadId),
    notificationService.processLead(leadId)
  ]);
  const successes = results.filter(r => r).length;
  console.log(`Test 4 (Concurrency - exactly 1 send): ${successes === 1 ? 'PASSED' : 'FAILED'}`);

  // Test 5: Provider failure and retry
  mockProvider.shouldFail = true;
  mockProvider.failReason = "API timeout";
  mockProvider.transientFailure = true;
  leadId = await createLeadWithScore(projectId, 90);
  
  result = await notificationService.processLead(leadId);
  console.log(`Test 5a (Provider failure caught): ${!result ? 'PASSED' : 'FAILED'}`);
  
  mockProvider.shouldFail = false;
  result = await notificationService.processLead(leadId);
  console.log(`Test 5b (Retry success): ${result ? 'PASSED' : 'FAILED'}`);
}

async function runRealSmokeTest(projectId: string) {
  console.log("\\n--- Running Real Notification Smoke Test ---");
  if (!process.env.RESEND_API_KEY) {
    console.log("NOT VERIFIED — real provider delivery requires RESEND_API_KEY");
    return;
  }

  const realProvider = new ResendEmailProvider();
  const notificationService = new NotificationService(prisma, realProvider);

  console.log(`Sending real test email via NotificationService...`);
  
  const leadId = await createLeadWithScore(projectId, 99);
  const result = await notificationService.processLead(leadId);

  if (result) {
    const alert = await prisma.alert.findFirst({ where: { projectLeadId: leadId } });
    console.log(`✅ Success! Message ID: ${alert?.providerMessageId}`);
  } else {
    const alert = await prisma.alert.findFirst({ where: { projectLeadId: leadId } });
    console.error(`❌ Failed! Status: ${alert?.status}, Reason: ${alert?.failureReason}`);
  }
}

async function main() {
  console.log("Starting notification smoke test suite...");
  
  // Setup user and project for tests
  const user = await prisma.user.create({
    data: {
      email: process.env.TEST_EMAIL || `delivered@resend.dev`,
      password: 'smoke-test-password',
      preferences: {
        create: {
          minimumIntentScore: 80,
          notificationFrequency: 'REALTIME'
        }
      }
    }
  });

  const project = await prisma.project.create({
    data: {
      name: 'Smoke Test Project',
      productDescription: 'Testing',
      userId: user.id
    }
  });

  try {
    await runMockTests(user.id, project.id);
    await runRealSmokeTest(project.id);
  } finally {
    // Clean up
    console.log("\\nCleaning up smoke test data...");
    await prisma.alert.deleteMany({ where: { projectLead: { projectId: project.id } } });
    await prisma.analysis.deleteMany({ where: { projectLead: { projectId: project.id } } });
    await prisma.projectLead.deleteMany({ where: { projectId: project.id } });
    await prisma.project.delete({ where: { id: project.id } });
    await prisma.userPreference.delete({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
    console.log("Cleanup complete.");
  }
}

main().catch(console.error);
