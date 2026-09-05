import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, User as UserIcon, AlertTriangle } from "lucide-react";
import { IntentBadge, StatusBadge, FeedbackBadge, OutcomeBadge } from "../../../../../../components/Badges";
import { ScoreDial } from "../../../../../../components/ScoreDial";
import { formatIntentType } from "../../../../../../components/LeadRow";
import { LeadStatusButtons } from "../../../../../../components/LeadStatusButtons";
import { Button } from "../../../../../../components/ui/Button";

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

  const postDate = new Intl.DateTimeFormat("en-US", { 
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" 
  }).format(new Date(lead.redditPost.publishedAt));

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto w-full min-h-screen bg-background">
      <Link
        href={`/projects/${projectId}/leads`}
        className="inline-flex items-center text-[13px] font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to opportunities
      </Link>
      
      <div className="space-y-12">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <IntentBadge score={lead.analysis?.finalScore || 0} />
            <StatusBadge status={lead.status} />
            <FeedbackBadge feedback={lead.feedback} />
            <OutcomeBadge outcome={lead.outcome} />
            {lead.analysis?.intentType && (
              <span className="font-terminal text-sm tracking-wider text-muted-foreground bg-muted/50 border-2 border-border px-2 py-0.5">
                {formatIntentType(lead.analysis.intentType)}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground leading-[1.1]">
            {lead.redditPost.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium text-muted-foreground">
            <div className="flex items-center">
              <UserIcon className="mr-2 h-4 w-4 opacity-70" />
              u/{lead.redditPost.authorIdentifier}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              {postDate}
            </div>
            <div className="flex items-center">
              in <span className="ml-1 text-foreground">r/{lead.redditPost.subreddit}</span>
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
        </header>

        <hr className="border-border/50" />

        {lead.analysis ? (
          <div className="space-y-12">
            <section className="space-y-3">
              <h2 className="font-terminal text-sm tracking-widest text-muted-foreground uppercase">Why this was surfaced</h2>
              <p className="text-xl md:text-2xl font-medium leading-relaxed tracking-tight text-foreground/90 text-balance">
                {lead.analysis.whyItMatters}
              </p>
            </section>

            <div className="grid sm:grid-cols-2 gap-12">
              <section className="space-y-3">
                <h2 className="font-terminal text-sm tracking-widest text-muted-foreground uppercase">What they appear to need</h2>
                <p className="text-base text-foreground/80 leading-relaxed">
                  {lead.analysis.problemSummary}
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-terminal text-sm tracking-widest text-muted-foreground uppercase">Recommended Action</h2>
                <p className="text-base text-foreground/80 leading-relaxed">
                  {lead.analysis.summary}
                </p>
              </section>
            </div>
            
            <section className="space-y-4">
              <h2 className="font-terminal text-sm tracking-widest text-muted-foreground uppercase">Score Breakdown</h2>
              <div className="flex items-center gap-6 border-2 border-border bg-muted/20 p-5">
                <ScoreDial score={lead.analysis.finalScore} size="lg" />
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Relevance</span>
                      <span className="font-terminal text-foreground">{lead.analysis.relevanceScore}</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden">
                      <div className="h-full bg-foreground/60" style={{ width: `${lead.analysis.relevanceScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Intent signal</span>
                      <span className="font-terminal text-foreground">{lead.analysis.intentScore}</span>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden">
                      <div className="h-full bg-signal" style={{ width: `${lead.analysis.intentScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          // Classification runs synchronously as part of ingestion and any
          // failure is caught and swallowed — there's no queued/async step,
          // so a lead with no analysis was never "still processing"; the
          // classification call for it failed. This is the failed-action
          // treatment, not a neutral one, because that's what actually
          // happened.
          <div className="flex items-start gap-3 border-2 border-destructive/50 bg-destructive/10 p-5 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Analysis unavailable</p>
              <p className="text-sm text-destructive/80">
                This post could not be classified. It won&apos;t appear in scoring or filtering until it&apos;s reprocessed.
              </p>
            </div>
          </div>
        )}

        <hr className="border-border/50" />

        <section className="space-y-4">
          <h2 className="font-terminal text-sm tracking-widest text-muted-foreground uppercase">Original Conversation</h2>
          <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground border-l-2 border-border pl-4">
            {lead.redditPost.body || <span className="italic">No body text.</span>}
          </div>
        </section>

        <hr className="border-border/50" />

        <section className="space-y-4 pb-20">
          <h2 className="font-terminal text-sm tracking-widest text-muted-foreground uppercase">Action</h2>
          <div className="bg-muted/30 border-2 border-border p-6">
            <LeadStatusButtons 
              projectId={projectId} 
              leadId={leadId} 
              currentStatus={lead.status} 
              currentFeedback={lead.feedback} 
              currentOutcome={lead.outcome} 
            />
          </div>
        </section>
      </div>
    </div>
  );
}
