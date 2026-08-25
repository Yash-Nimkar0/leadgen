"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { KeywordType } from "@repo/database";

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const productDescription = formData.get("productDescription") as string;
  const keywordsRaw = formData.get("keywords") as string;
  const sourcesRaw = formData.get("sources") as string;

  if (!name || !productDescription) {
    return { error: "Name and description are required" };
  }

  try {
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name,
        productDescription,
        keywords: {
          create: keywordsRaw
            .split(",")
            .map(k => k.trim())
            .filter(Boolean)
            .map(keyword => ({
              keyword,
              type: KeywordType.SOLUTION
            }))
        },
        sources: {
          create: sourcesRaw
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
            .map(source => ({
              sourceIdentifier: source,
              sourceType: "SUBREDDIT",
              enabled: true
            }))
        }
      }
    });

    revalidatePath("/dashboard");
    return { success: true, projectId: project.id };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { error: "Failed to create project" };
  }
}
