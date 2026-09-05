"use server";

import { LLMRouter } from "@repo/core/src/providers/llm/llm-router";
import { Scorer } from "@repo/core";
import { checkRateLimit, getClientIp, rateLimitMessage } from "../../lib/rate-limit";

export async function publicScan(input: { text: string }) {
  if (!input.text.trim()) {
    return { error: "No signal detected. Please enter text." };
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`${ip}:public-scan`, "REGISTER"); // use existing limit
  if (!rateLimit.allowed) {
    return { error: rateLimitMessage(rateLimit.retryAfterSeconds!) };
  }

  try {
    const router = new LLMRouter();
    // Use a generic "SaaS" project config for the marketing demo
    const classification = await router.classify({
      projectConfig: {
        name: "LeadGen Marketing Demo",
        description: "B2B SaaS tool for finding leads on Reddit",
        keywords: ["alternative", "cheaper", "recommendation", "tool", "software"],
        competitors: ["competitor A", "competitor B"],
      },
      post: {
        title: input.text.trim(),
        body: null,
        subreddit: "marketing",
      },
    });

    const finalScore = new Scorer().calculateFinalScore(classification);

    return { success: true, classification, finalScore };
  } catch (error: any) {
    console.error("Public scan failed:", error);
    return { error: "Analysis failed. Please try again later." };
  }
}
