import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings, Play, ArrowLeft, Search } from "lucide-react";

import { LeadSearch } from "../../../../../components/LeadSearch";
import { LeadRow } from "../../../../../components/LeadRow";
import { Button } from "../../../../../components/ui/Button";

export default async function LeadsPage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const take = 20;
  const skip = (page - 1) * take;

  const whereClause: any = { projectId };
  
  if (resolvedSearchParams.status) {
    whereClause.status = resolvedSearchParams.status;
  }
  
  if (resolvedSearchParams.feedback) {
    whereClause.feedback = resolvedSearchParams.feedback;
  }
  
  if (resolvedSearchParams.outcome) {
    whereClause.outcome = resolvedSearchParams.outcome;
  }

  if (resolvedSearchParams.intent === 'HIGH') {
    whereClause.analysis = { finalScore: { gte: 80 } };
  } else if (resolvedSearchParams.intent === 'MEDIUM') {
    whereClause.analysis = { finalScore: { gte: 60, lt: 80 } };
  }

  if (resolvedSearchParams.search) {
    const searchFilter = resolvedSearchParams.search as string;
    whereClause.OR = [
      { redditPost: { title: { contains: searchFilter, mode: "insensitive" } } },
      { redditPost: { content: { contains: searchFilter, mode: "insensitive" } } },
      { analysis: { problemSummary: { contains: searchFilter, mode: "insensitive" } } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.projectLead.findMany({
      where: whereClause,
      include: {
        redditPost: true,
        analysis: true,
      },
      orderBy: [
        { analysis: { finalScore: "desc" } },
        { discoveredAt: "desc" }
      ],
      skip,
      take,
    }),
    prisma.projectLead.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(total / take);

  const hasActiveFilter = Boolean(
    resolvedSearchParams.intent ||
    resolvedSearchParams.status ||
    resolvedSearchParams.feedback ||
    resolvedSearchParams.outcome ||
    resolvedSearchParams.search
  );

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8 w-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[13px] font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Overview
          </Link>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">{project.name}</h1>
          <p className="text-base text-muted-foreground mt-1">
            {total} opportunities identified
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}/test-post`}>
            <Button variant="outline" size="sm">
              <Play className="mr-2 h-3.5 w-3.5" />
              Test Post
            </Button>
          </Link>
          <Link href={`/projects/${projectId}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-3.5 w-3.5" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-4">
        <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
          {[
            { href: `/projects/${projectId}/leads`, label: "All", active: !hasActiveFilter },
            { href: `/projects/${projectId}/leads?status=NEW`, label: "New", active: resolvedSearchParams.status === "NEW" },
            { href: `/projects/${projectId}/leads?intent=HIGH`, label: "High Intent", active: resolvedSearchParams.intent === "HIGH" },
            { href: `/projects/${projectId}/leads?feedback=GOOD`, label: "Good Leads", active: resolvedSearchParams.feedback === "GOOD" },
          ].map((filter) => (
            <Link key={filter.label} href={filter.href}>
              <Button
                variant="outline"
                size="sm"
                className={
                  filter.active
                    ? "border-signal/50 bg-signal/10 text-signal shadow-none hover:border-signal/60 hover:bg-signal/15 hover:text-signal hover:shadow-none hover:translate-x-0 hover:translate-y-0"
                    : "text-muted-foreground"
                }
              >
                {filter.label}
              </Button>
            </Link>
          ))}
        </div>
        
        <div className="w-full md:w-auto flex-1 max-w-sm">
          <LeadSearch />
        </div>
      </div>

      <div className="space-y-3 min-h-[400px]">
        {leads.length === 0 ? (
          <div className="border-2 border-dashed border-border bg-card/40 p-12 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 border-2 border-border bg-muted/50 flex items-center justify-center mb-4">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-terminal text-xl mb-1">No signals found</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {hasActiveFilter
                ? "No leads match these filters."
                : "No leads have been discovered for this pipeline yet."}
            </p>
            {hasActiveFilter && (
              <Link href={`/projects/${projectId}/leads`} className="mt-6">
                <Button variant="outline" size="sm">Clear filters</Button>
              </Link>
            )}
          </div>
        ) : (
          leads.map((lead: any) => (
            <LeadRow key={lead.id} lead={lead} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 pt-6">
          <Link href={`/projects/${projectId}/leads?page=${Math.max(1, page - 1)}`}>
            <Button variant="outline" disabled={page === 1}>Previous</Button>
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Link href={`/projects/${projectId}/leads?page=${Math.min(totalPages, page + 1)}`}>
            <Button variant="outline" disabled={page === totalPages}>Next</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
