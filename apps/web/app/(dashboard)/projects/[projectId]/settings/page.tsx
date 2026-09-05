import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import { ProjectSettingsForm } from "../../../../../components/ProjectSettingsForm";
import { RunMockScanButton } from "../../../../../components/RunMockScanButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProjectSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const { projectId } = await params;

  // Verify ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href={`/projects/${projectId}/leads`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inbox
        </Link>
        <h1 className="font-terminal text-4xl tracking-wide">Project Settings</h1>
        <p className="text-muted-foreground mt-2">
          Update your project configuration and tracking parameters.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm">
        <ProjectSettingsForm
          projectId={project.id}
          initialName={project.name}
          initialDescription={project.productDescription}
        />
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 shadow-sm">
          <RunMockScanButton projectId={project.id} />
        </div>
      )}
    </div>
  );
}
