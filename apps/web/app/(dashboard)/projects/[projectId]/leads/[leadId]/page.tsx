import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IntentBadge, StatusBadge, FeedbackBadge, OutcomeBadge } from "../../../../../../components/Badges";
import { LeadStatusButtons } from "../../../../../../components/LeadStatusButtons";
import { ArrowLeft, ExternalLink, Calendar, User as UserIcon } from "lucide-react";

export default async function LeadDetailPage({
  params,
}: {
  params: { projectId: string; leadId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const { projectId, leadId } = await params;

  // Verify ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const lead = await prisma.projectLead.findUnique({
    where: { id: leadId },
    include: {
      redditPost: true,
      analysis: true,
    }
  });

  if (!lead || lead.projectId !== projectId) {
    redirect(`/projects/${projectId}/leads`);
  }

  const postDate = new Date(lead.redditPost.publishedAt).toLocaleDateString();

  const alert = await prisma.alert.findFirst({
    where: { projectLeadId: leadId, channel: "EMAIL" }
  });

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
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3">
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
              {alert && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  alert.status === "SENT" ? "bg-green-100 text-green-700" :
                  alert.status === "FAILED" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  Notification: {alert.status}
                </span>
              )}
            </div>
          </div>
          
          <LeadStatusButtons projectId={projectId} leadId={leadId} currentStatus={lead.status} currentFeedback={lead.feedback} currentOutcome={lead.outcome} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          {lead.redditPost.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
          <div className="flex items-center">
            <UserIcon className="mr-1.5 h-4 w-4" />
            {lead.redditPost.authorIdentifier}
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1.5 h-4 w-4" />
            {postDate}
          </div>
          <div className="flex items-center">
            in <span className="ml-1 font-medium text-foreground">r/{lead.redditPost.subreddit}</span>
          </div>
          <a
            href={lead.redditPost.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline ml-auto"
          >
            View on Reddit <ExternalLink className="ml-1.5 h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3">Original Post</h2>
            <div className="rounded-xl border border-border bg-muted/20 p-5 whitespace-pre-wrap text-sm leading-relaxed">
              {lead.redditPost.body || <span className="italic text-muted-foreground">No content provided</span>}
            </div>
          </section>

          {lead.analysis && (
            <section className="space-y-6">
              <h2 className="text-lg font-semibold">AI Analysis</h2>
              
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-background shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Problem Summary</h3>
                  <p className="text-foreground">{lead.analysis.problemSummary}</p>
                </div>
                
                <div className="rounded-lg border border-border p-4 bg-background shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Why It Matters (Commercial Intent)</h3>
                  <p className="text-foreground">{lead.analysis.whyItMatters}</p>
                </div>
                
                <div className="rounded-lg border border-border p-4 bg-background shadow-sm">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Recommended Action</h3>
                  <p className="text-foreground">{lead.analysis.summary}</p>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
            <h3 className="font-semibold pb-3 border-b border-border/50">Lead Details</h3>
            
            <div>
              <span className="block text-xs font-medium text-muted-foreground mb-1">Buying Stage</span>
              <span className="text-sm">{lead.analysis?.buyingStage || "Unknown"}</span>
            </div>
            
            <div>
              <span className="block text-xs font-medium text-muted-foreground mb-1">Score Breakdown</span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{lead.analysis?.finalScore || 0}</span>
                <span className="text-sm text-muted-foreground mb-0.5">/ 100 final score</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Relevance {lead.analysis?.relevanceScore ?? 0} &middot; Intent signal {lead.analysis?.intentScore ?? 0}
              </div>
            </div>
            
            <div>
              <span className="block text-xs font-medium text-muted-foreground mb-1">Matched Keywords</span>
              {lead.analysis?.matchedKeywords && lead.analysis.matchedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {lead.analysis.matchedKeywords.map((kw: any, i: number) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">None identified</span>
              )}
            </div>

            <div>
              <span className="block text-xs font-medium text-muted-foreground mb-1">Mentioned Competitors</span>
              {lead.analysis?.matchedCompetitors && lead.analysis.matchedCompetitors.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {lead.analysis.matchedCompetitors.map((comp: any, i: number) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      {comp}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">None identified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
