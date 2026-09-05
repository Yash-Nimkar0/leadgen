import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestPostForm } from "../../../../../components/TestPostForm";

export default async function TestPostPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}/leads`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inbox
        </Link>
        <p className="text-sm text-muted-foreground mb-1">{project.name}</p>
        <h1 className="font-terminal text-4xl tracking-wide">Test a Post</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manually validate the classifier against real posts you find yourself.
        </p>
      </div>

      <TestPostForm projectId={projectId} />
    </div>
  );
}
