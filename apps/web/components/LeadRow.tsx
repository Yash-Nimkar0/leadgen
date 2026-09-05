import { MessageSquare, ArrowRight } from "lucide-react";
import { ScoreDial } from "./ScoreDial";
import { FeedbackBadge, OutcomeBadge } from "./Badges";

/** "ALTERNATIVE_SEEKING" -> "Alternative seeking" — readable metadata,
 * not a shouted enum. Exported so the lead-detail page can render the same
 * field in the same calmer casing instead of its own uppercase treatment. */
export function formatIntentType(intentType: string) {
  const spaced = intentType.replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * The inbox's unit of signal: conclusion first, evidence second. The
 * score anchors the row; the reasoning is the dominant line; the actual
 * Reddit content is present but secondary, exactly as it is on the lead
 * detail page. One supporting signal (a named competitor, when we have
 * one) gets real visual weight — everything else stays quiet metadata.
 */
export function LeadRow({ lead }: { lead: any }) {
  const score = lead.analysis?.finalScore || 0;
  const postDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(lead.redditPost.publishedAt));
  const reasoning = lead.analysis?.whyItMatters || lead.analysis?.problemSummary || lead.redditPost.body.substring(0, 100) + "...";
  const competitor: string | undefined = lead.analysis?.matchedCompetitors?.[0];
  const intentLabel = lead.analysis?.intentType ? formatIntentType(lead.analysis.intentType) : null;
  const isUnread = lead.status === "NEW";

  return (
    <a
      href={`/projects/${lead.projectId}/leads/${lead.id}`}
      className="group relative flex items-start sm:items-center gap-4 p-4 pl-5 border-2 border-border bg-card hover:bg-muted/30 transition-all hover:shadow-pixel"
    >
      {/* Unread state: a signal-colored left edge, the same device the
          sidebar uses for "this is where you are" — not another badge. */}
      {isUnread && <span className="absolute inset-y-0 left-0 w-[3px] bg-signal" aria-hidden="true" />}

      <ScoreDial score={score} variant="dense" className="shrink-0 mt-0.5 sm:mt-0" />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* The conclusion — our reasoning, promoted above the raw post. */}
        <p className="text-[15px] font-medium text-foreground leading-snug truncate">
          {reasoning}
        </p>
        {/* The evidence — what they actually said, still readable, now secondary. */}
        <p className="text-sm text-muted-foreground leading-snug truncate">
          &ldquo;{lead.redditPost.title}&rdquo;
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-terminal text-sm text-muted-foreground/70 mt-1">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            r/{lead.redditPost.subreddit}
          </span>
          {competitor && (
            <span className="inline-flex items-center px-1.5 py-0.5 border-2 border-signal/50 bg-signal/10 text-signal text-xs tracking-wide uppercase">
              {competitor}
            </span>
          )}
          {intentLabel && <span>{intentLabel}</span>}
          <span>{postDate}</span>
          <FeedbackBadge feedback={lead.feedback} className="text-xs px-1.5 py-0" />
          <OutcomeBadge outcome={lead.outcome} className="text-xs px-1.5 py-0" />
        </div>
      </div>

      <div className="hidden sm:flex h-8 w-8 items-center justify-center bg-transparent group-hover:bg-background border-2 border-transparent group-hover:border-border transition-all shrink-0">
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
      </div>
    </a>
  );
}
