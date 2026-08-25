"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { 
  IngestionPipeline,
  PrismaProjectLeadRepository, 
  PrismaProjectRepository, 
  PrismaIngestionRunRepository,
  PrismaAnalysisRepository,
  PrismaPostRepository,
  MockNotificationProvider, 
  NotificationService
} from "@repo/core";
import { MockRedditProvider } from "@repo/core/src/providers/reddit/mock-reddit-provider";
import { MockLLMProvider } from "@repo/core/src/providers/llm/mock-llm-provider";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function runMockIngestion(projectId?: string) {
  if (process.env.NODE_ENV !== "development") {
    return { error: "This action is only available in development mode." };
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== session.user.id) {
      return { error: "Project not found or access denied" };
    }
  }

  try {
    const projectRepo = new PrismaProjectRepository();
    const leadRepo = new PrismaProjectLeadRepository();
    const runRepo = new PrismaIngestionRunRepository();
    const analysisRepo = new PrismaAnalysisRepository();
    const postRepo = new PrismaPostRepository();

    // Intentionally always mock providers here, regardless of which real API keys happen
    // to be configured in .env - this action's whole purpose is a safe, offline,
    // no-cost way to exercise the pipeline end-to-end (see docs/architecture.md's
    // mock-first principle). Use the LLMRouter/real providers for live ingestion instead.
    const llmProvider = new MockLLMProvider();
    const notificationProvider = new MockNotificationProvider();
    const notificationService = new NotificationService(prisma, notificationProvider);

    const pipeline = new IngestionPipeline(
      new MockRedditProvider(),
      postRepo,
      leadRepo,
      projectRepo,
      runRepo,
      llmProvider,
      analysisRepo,
      notificationService
    );

    await pipeline.run(projectId);

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    if (projectId) {
      revalidatePath(`/projects/${projectId}/leads`);
    }
    return {
      success: true,
      processed: "Check console",
      matched: "Check console"
    };
  } catch (error) {
    console.error("Mock ingestion failed:", error);
    return { error: "Mock ingestion failed" };
  }
}
