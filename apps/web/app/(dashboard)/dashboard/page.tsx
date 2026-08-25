import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/database";
import Link from "next/link";
import { ArrowRight, Plus, Activity, Layers } from "lucide-react";

import { MockIngestionTrigger } from "../../../components/MockIngestionTrigger";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { leads: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your projects and high-intent Reddit leads.
          </p>
        </div>
      </div>

      <MockIngestionTrigger />

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center flex flex-col items-center justify-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Create your first project</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start finding high-intent leads by setting up a project with keywords and target subreddits.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/leads`}
              className="group flex flex-col justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {project.productDescription}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center space-x-1 text-sm font-medium">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>{project._count.leads} Leads</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
          
          <Link
            href="/projects/new"
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
          >
            <Plus className="h-8 w-8 mb-2 opacity-50" />
            <span className="font-medium">New Project</span>
          </Link>
        </div>
      )}
    </div>
  );
}
