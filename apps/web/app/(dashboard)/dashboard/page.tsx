import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/database";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Inbox, Zap, CheckCircle2 } from "lucide-react";
import { LeadRow } from "../../../components/LeadRow";
import { Button } from "../../../components/ui/Button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all leads for this user's projects, ordered by score then date
  const recentHighIntentLeads = await prisma.projectLead.findMany({
    where: { 
      project: { userId: session.user.id },
      analysis: { finalScore: { gte: 80 } },
      status: "NEW"
    },
    include: {
      redditPost: true,
      analysis: true,
      project: true,
    },
    orderBy: [
      { analysis: { finalScore: 'desc' } },
      { discoveredAt: 'desc' }
    ],
    take: 5,
  });

  const recentReviewLeads = await prisma.projectLead.findMany({
    where: { 
      project: { userId: session.user.id },
      analysis: { finalScore: { gte: 70, lt: 80 } },
      status: "NEW"
    },
    include: {
      redditPost: true,
      analysis: true,
      project: true,
    },
    orderBy: [
      { analysis: { finalScore: 'desc' } },
      { discoveredAt: 'desc' }
    ],
    take: 5,
  });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id }
  });

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-5xl mx-auto w-full">
      <div className="space-y-1">
        <h1 className="font-terminal text-4xl tracking-wide text-foreground">Good morning.</h1>
        <p className="text-muted-foreground text-lg">Here are your highest-intent opportunities today.</p>
      </div>

      {projects.length === 0 ? (
        <div className="pixel-frame border-2 border-dashed border-border bg-card/40 p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
          <div className="h-16 w-16 border-2 border-border bg-background flex items-center justify-center mb-6">
            <Zap className="h-6 w-6 text-signal" />
          </div>
          <h2 className="font-terminal text-3xl mb-3 tracking-wide">You&apos;re ready to find opportunities.</h2>
          <p className="text-muted-foreground mb-8 text-base">
            Configure your first pipeline to tell us what you sell, and we&apos;ll start surfacing conversations worth your attention.
          </p>
          <Link href="/projects/new">
            <Button size="lg">
              [ Create your first pipeline ]
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {recentHighIntentLeads.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="font-terminal text-lg tracking-widest uppercase text-muted-foreground flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-signal" />
                  High Intent (80+)
                </h2>
              </div>
              <div className="space-y-3">
                {recentHighIntentLeads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </div>
            </section>
          )}

          {recentReviewLeads.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h2 className="font-terminal text-lg tracking-widest uppercase text-muted-foreground flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-amber" />
                  Needs Review (70-79)
                </h2>
              </div>
              <div className="space-y-3">
                {recentReviewLeads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </div>
            </section>
          )}

          {recentHighIntentLeads.length === 0 && recentReviewLeads.length === 0 && (
            <div className="border-2 border-border bg-card p-12 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 border-2 border-border bg-muted/50 flex items-center justify-center mb-4">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-terminal text-xl mb-1">Inbox Zero</h3>
              <p className="text-muted-foreground text-sm">
                No new high-intent opportunities right now. We&apos;ll keep monitoring.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
