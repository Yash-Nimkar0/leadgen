"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/database";
import { LLMRouter } from "@repo/core/src/providers/llm/llm-router";
import { Scorer } from "@repo/core";
import { checkRateLimit, getClientIp, rateLimitMessage } from "../../lib/rate-limit";

export async function testPost(
  projectId: string,
  input: { title: string; body: string; subreddit: string; competitors: string }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { keywords: true },
  });

  if (!project || project.userId !== session.user.id) {
    return { error: "Project not found or access denied" };
  }

  if (!input.title.trim()) {
    return { error: "Title is required" };
  }

  // Reuses the same DB-backed limiter as login/register - this hits a real LLM API per
  // call, so it needs its own guard against accidental (or deliberate) hammering.
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`${ip}:test-post`, "REGISTER");
  if (!rateLimit.allowed) {
    return { error: rateLimitMessage(rateLimit.retryAfterSeconds!) };
  }

  const competitors = input.competitors
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  try {
    const router = new LLMRouter();
    const classification = await router.classify({
      projectConfig: {
        name: project.name,
        description: project.productDescription,
        keywords: project.keywords.map((k) => k.keyword),
        competitors,
      },
      post: {
        title: input.title.trim(),
        body: input.body.trim() || null,
        subreddit: input.subreddit.trim() || "unknown",
      },
    });

    const finalScore = new Scorer().calculateFinalScore(classification);

    return { success: true, classification, finalScore };
  } catch (error: any) {
    console.error("Test post classification failed:", error);
    return { error: `Classification failed: ${error.message || "unknown error"}` };
  }
}
