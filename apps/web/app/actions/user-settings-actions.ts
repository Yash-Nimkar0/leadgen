"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function updateNotificationSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const scoreStr = formData.get("minimumIntentScore");
  let score = 80;
  
  if (scoreStr) {
    score = parseInt(scoreStr as string, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      return { error: "Score must be a number between 0 and 100" };
    }
  }

  try {
    await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: { minimumIntentScore: score },
      create: {
        userId: session.user.id,
        minimumIntentScore: score,
        notificationFrequency: "REALTIME"
      }
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    return { error: "Failed to update settings" };
  }
}
