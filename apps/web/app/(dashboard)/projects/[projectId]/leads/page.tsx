import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IntentBadge, StatusBadge, FeedbackBadge, OutcomeBadge } from "../../../../../components/Badges";
import { ArrowLeft, Calendar, ArrowRight } from "lucide-react";
import { LeadSearch } from "../../../../../components/LeadSearch";

export default async function LeadsPage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: { page?: string; status?: string; intent?: string; search?: string; feedback?: string; outcome?: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const { projectId } = await params;

  // Authorization check
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== session.user.id) {
    redirect("/dashboard");
  }

  // Parsing search params for filtering and pagination
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const take = 20;
  const skip = (page - 1) * take;
  
  const statusFilter = resolvedSearchParams.status ? (resolvedSearchParams.status as string) : undefined;
  const searchFilter = resolvedSearchParams.search ? resolvedSearchParams.search : undefined;
  const feedbackFilter = resolvedSearchParams.feedback ? (resolvedSearchParams.feedback as string) : undefined;
  const outcomeFilter = resolvedSearchParams.outcome ? (resolvedSearchParams.outcome as string) : undefined;
  
  let scoreFilter = undefined;
  if (resolvedSearchParams.intent === "HIGH") scoreFilter = { gte: 80 };
  else if (resolvedSearchParams.intent === "MEDIUM") scoreFilter = { gte: 60, lt: 80 };
  else if (resolvedSearchParams.intent === "LOW") scoreFilter = { lt: 60 };

  const whereClause: any = {
    projectId,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(feedbackFilter ? { feedback: feedbackFilter } : {}),
    ...(outcomeFilter ? { outcome: outcomeFilter } : {}),
    ...(scoreFilter ? { analysis: { finalScore: scoreFilter } } : {}),
  };

  if (searchFilter) {
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

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{project.name} Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {leads.length} of {total} leads
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${projectId}/settings`}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-border/50">
        <div className="flex gap-2 text-sm overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <Link 
            href={`/projects/${projectId}/leads`} 
            className={`px-3 py-1.5 rounded-md border whitespace-nowrap ${!resolvedSearchParams.intent && !resolvedSearchParams.status && !resolvedSearchParams.feedback && !resolvedSearchParams.outcome ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
          >
            All
          </Link>
          <Link 
            href={`/projects/${projectId}/leads?status=NEW`} 
            className={`px-3 py-1.5 rounded-md border whitespace-nowrap ${resolvedSearchParams.status === 'NEW' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
          >
            New
          </Link>
          <Link 
            href={`/projects/${projectId}/leads?intent=HIGH`} 
            className={`px-3 py-1.5 rounded-md border whitespace-nowrap ${resolvedSearchParams.intent === 'HIGH' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
          >
            High Intent
          </Link>
          <Link 
            href={`/projects/${projectId}/leads?feedback=GOOD`} 
            className={`px-3 py-1.5 rounded-md border whitespace-nowrap ${resolvedSearchParams.feedback === 'GOOD' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
          >
            Good Feedback
          </Link>
          <Link 
            href={`/projects/${projectId}/leads?outcome=CONVERTED`} 
            className={`px-3 py-1.5 rounded-md border whitespace-nowrap ${resolvedSearchParams.outcome === 'CONVERTED' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
          >
            Converted
          </Link>
        </div>
        
        <div className="w-full sm:w-auto flex-1 max-w-sm">
          <LeadSearch />
        </div>
      </div>

      <div className="space-y-4">
        {leads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
            No leads found matching your criteria.
          </div>
        ) : (
          leads.map((lead: any) => (
            // Plain <a> (full navigation) rather than <Link> (client-side transition) here:
            // this nested dynamic route (/leads/[leadId] under /projects/[projectId]) hits a
            // Next.js 16.3 Turbopack dev router bug where client-side transitions into it
            // silently no-op and bounce back to this list, even though a full page load
            // renders it correctly every time. Scoped to just this link since every other
            // <Link> in the app transitions fine.
            <a
              key={lead.id}
              href={`/projects/${projectId}/leads/${lead.id}`}
              className="block rounded-xl border border-border bg-background p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <IntentBadge score={lead.analysis?.finalScore || 0} />
                    <StatusBadge status={lead.status} />
                    <FeedbackBadge feedback={lead.feedback} />
                    <OutcomeBadge outcome={lead.outcome} />
                    {lead.analysis?.intentType && (
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {lead.analysis.intentType}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {lead.redditPost?.title}
                  </h3>
                  
                  {lead.analysis?.problemSummary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      <span className="font-medium text-foreground">Problem:</span> {lead.analysis.problemSummary}
                    </p>
                  )}
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start text-xs text-muted-foreground shrink-0 gap-2">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(lead.discoveredAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-primary font-medium">
                    View details <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Link
            href={`/projects/${projectId}/leads?page=${Math.max(1, page - 1)}`}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border ${page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
          >
            Previous
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/projects/${projectId}/leads?page=${Math.min(totalPages, page + 1)}`}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border ${page === totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
