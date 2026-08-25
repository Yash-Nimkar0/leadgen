import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { RateLimitAction } from "@prisma/client";

const WINDOW_MS: Record<RateLimitAction, number> = {
  LOGIN: 15 * 60 * 1000, // 15 minutes
  REGISTER: 60 * 60 * 1000, // 1 hour
};

const MAX_ATTEMPTS: Record<RateLimitAction, number> = {
  LOGIN: 8,
  REGISTER: 5,
};

/**
 * Best-effort client IP extraction from the standard proxy headers Vercel sets.
 * Falls back to a constant so a missing header degrades to "everyone shares one
 * bucket" rather than silently disabling the limit.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return (forwardedFor.split(",")[0] || forwardedFor).trim();
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Records this attempt and checks whether `identifier` has exceeded the allowed
 * number of attempts for `action` within the configured time window. Call once
 * per attempt (successful or not) before doing the real work.
 */
export async function checkRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const windowMs = WINDOW_MS[action];
  const windowStart = new Date(Date.now() - windowMs);

  const recentCount = await prisma.rateLimitAttempt.count({
    where: { identifier, action, createdAt: { gte: windowStart } },
  });

  if (recentCount >= MAX_ATTEMPTS[action]) {
    const oldestInWindow = await prisma.rateLimitAttempt.findFirst({
      where: { identifier, action, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
    });
    const retryAfterSeconds = oldestInWindow
      ? Math.max(1, Math.ceil((oldestInWindow.createdAt.getTime() + windowMs - Date.now()) / 1000))
      : Math.ceil(windowMs / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  await prisma.rateLimitAttempt.create({ data: { identifier, action } });
  return { allowed: true };
}

function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function rateLimitMessage(retryAfterSeconds: number): string {
  return `Too many attempts. Please try again in ${formatRetryAfter(retryAfterSeconds)}.`;
}
