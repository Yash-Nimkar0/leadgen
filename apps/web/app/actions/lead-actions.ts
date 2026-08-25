"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

async function verifyOwnership(projectId: string, leadId?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  // Verify project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project || project.userId !== session.user.id) {
    return { error: "Project not found or access denied" };
  }

  // Verify lead ownership if leadId provided
  if (leadId) {
    const lead = await prisma.projectLead.findUnique({
      where: { id: leadId }
    });
    if (!lead || lead.projectId !== projectId) {
      return { error: "Lead not found or does not belong to this project" };
    }
  }

  return { success: true };
}

export async function updateLeadStatus(projectId: string, leadId: string, status: "NEW" | "VIEWED" | "DISMISSED") {
  const auth = await verifyOwnership(projectId, leadId);
  if (auth.error) {
    return { error: auth.error };
  }

  try {
    await prisma.projectLead.update({
      where: { id: leadId },
      data: { status }
    });

    revalidatePath(`/projects/${projectId}/leads`);
    revalidatePath(`/projects/${projectId}/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update lead status:", error);
    return { error: "Failed to update lead status" };
  }
}

export async function updateLeadFeedback(projectId: string, leadId: string, feedback: "NONE" | "GOOD" | "BAD" | "NOT_RELEVANT") {
  const auth = await verifyOwnership(projectId, leadId);
  if (auth.error) {
    return { error: auth.error };
  }

  try {
    await prisma.projectLead.update({
      where: { id: leadId },
      data: { feedback }
    });

    revalidatePath(`/projects/${projectId}/leads`);
    revalidatePath(`/projects/${projectId}/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update lead feedback:", error);
    return { error: "Failed to update lead feedback" };
  }
}

export async function updateLeadOutcome(projectId: string, leadId: string, outcome: "NONE" | "CONTACTED" | "CONVERTED") {
  const auth = await verifyOwnership(projectId, leadId);
  if (auth.error) {
    return { error: auth.error };
  }

  try {
    await prisma.projectLead.update({
      where: { id: leadId },
      data: { outcome }
    });

    revalidatePath(`/projects/${projectId}/leads`);
    revalidatePath(`/projects/${projectId}/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update lead outcome:", error);
    return { error: "Failed to update lead outcome" };
  }
}
