"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function updateProjectSettings(projectId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const productDescription = formData.get("productDescription") as string;

  if (!name || !productDescription) {
    return { error: "Name and description are required" };
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { name, productDescription }
    });

    revalidatePath(`/projects/${projectId}/settings`);
    revalidatePath(`/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update project settings:", error);
    return { error: "Failed to update project settings" };
  }
}
