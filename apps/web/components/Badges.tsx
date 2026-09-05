import { cn } from "../lib/utils";

const badgeBase = "inline-flex items-center px-2 py-0.5 font-terminal text-sm tracking-widest uppercase border-2";

export function IntentBadge({ score, className }: { score: number, className?: string }) {
  let label = "LOW RELEVANCE";
  let colorClass = "bg-muted text-muted-foreground border-border";

  if (score >= 80) {
    label = "HIGH INTENT";
    colorClass = "bg-signal/10 text-signal border-signal/50";
  } else if (score >= 70) {
    label = "NEEDS REVIEW";
    colorClass = "bg-amber/10 text-amber border-amber/50";
  }

  return (
    <span className={cn(badgeBase, colorClass, className)}>
      {label}
      <span className="ml-1.5 opacity-70">{score}</span>
    </span>
  );
}

export function StatusBadge({ status, className }: { status: "NEW" | "VIEWED" | "DISMISSED", className?: string }) {
  let colorClass = "bg-muted text-muted-foreground border-border";

  if (status === "NEW") {
    colorClass = "bg-primary/10 text-primary border-primary/50";
  } else if (status === "DISMISSED") {
    colorClass = "bg-muted/50 text-muted-foreground/50 border-border/50 line-through";
  }

  return (
    <span className={cn(badgeBase, colorClass, className)}>
      {status}
    </span>
  );
}

export function FeedbackBadge({ feedback, className }: { feedback: "NONE" | "GOOD" | "BAD" | "NOT_RELEVANT", className?: string }) {
  if (feedback === "NONE") return null;

  let colorClass = "bg-muted text-muted-foreground border-border";
  let label: string = feedback;

  if (feedback === "GOOD") {
    colorClass = "bg-signal/10 text-signal border-signal/50";
    label = "GOOD LEAD";
  } else if (feedback === "BAD") {
    colorClass = "bg-destructive/10 text-destructive border-destructive/50";
  } else if (feedback === "NOT_RELEVANT") {
    colorClass = "bg-muted text-muted-foreground border-border";
    label = "NOT RELEVANT";
  }

  return (
    <span className={cn(badgeBase, colorClass, className)}>
      {label}
    </span>
  );
}

export function OutcomeBadge({ outcome, className }: { outcome: "NONE" | "CONTACTED" | "CONVERTED", className?: string }) {
  if (outcome === "NONE") return null;

  let colorClass = "bg-muted text-muted-foreground border-border";

  if (outcome === "CONTACTED") {
    colorClass = "bg-amber/10 text-amber border-amber/50";
  } else if (outcome === "CONVERTED") {
    colorClass = "bg-signal/10 text-signal border-signal/50";
  }

  return (
    <span className={cn(badgeBase, colorClass, className)}>
      {outcome}
    </span>
  );
}
