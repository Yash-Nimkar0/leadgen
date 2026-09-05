"use client";

import { updateLeadStatus, updateLeadFeedback, updateLeadOutcome } from "../app/actions/lead-actions";
import { Check, X, Undo, ThumbsUp, ThumbsDown, Slash, Phone, Trophy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

export function LeadStatusButtons({
  projectId,
  leadId,
  currentStatus,
  currentFeedback,
  currentOutcome
}: {
  projectId: string;
  leadId: string;
  currentStatus: "NEW" | "VIEWED" | "DISMISSED";
  currentFeedback: "NONE" | "GOOD" | "BAD" | "NOT_RELEVANT";
  currentOutcome: "NONE" | "CONTACTED" | "CONVERTED";
}) {
  const router = useRouter();
  // Tracks which specific action is in flight (e.g. "status:VIEWED") rather
  // than a single boolean — every other button still disables while any
  // action is pending, but only the one actually clicked shows a spinner.
  const [pending, setPending] = useState<string | null>(null);
  const loading = pending !== null;

  const handleStatusChange = async (status: "NEW" | "VIEWED" | "DISMISSED") => {
    setPending(`status:${status}`);
    await updateLeadStatus(projectId, leadId, status);
    router.refresh();
    setPending(null);
  };

  const handleFeedbackChange = async (feedback: "NONE" | "GOOD" | "BAD" | "NOT_RELEVANT") => {
    setPending(`feedback:${feedback}`);
    await updateLeadFeedback(projectId, leadId, feedback);
    router.refresh();
    setPending(null);
  };

  const handleOutcomeChange = async (outcome: "NONE" | "CONTACTED" | "CONVERTED") => {
    setPending(`outcome:${outcome}`);
    await updateLeadOutcome(projectId, leadId, outcome);
    router.refresh();
    setPending(null);
  };

  return (
    <div className="grid sm:grid-cols-3 gap-8">
      
      {/* Lifecycle Actions */}
      <div className="space-y-3">
        <h4 className="font-terminal text-sm uppercase tracking-widest text-muted-foreground">Lifecycle</h4>
        <div className="flex flex-col gap-2">
          {currentStatus === "NEW" && (
            <Button
              disabled={loading}
              onClick={() => handleStatusChange("VIEWED")}
              className="w-full justify-start"
            >
              {pending === "status:VIEWED" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Mark Viewed
            </Button>
          )}

          {currentStatus === "VIEWED" && (
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => handleStatusChange("NEW")}
              className="w-full justify-start border-transparent bg-muted/50 hover:bg-muted"
            >
              {pending === "status:NEW" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Undo className="mr-2 h-4 w-4" />}
              Mark Unread
            </Button>
          )}

          {currentStatus !== "DISMISSED" && (
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => handleStatusChange("DISMISSED")}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              {pending === "status:DISMISSED" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
              Dismiss
            </Button>
          )}

          {currentStatus === "DISMISSED" && (
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => handleStatusChange("NEW")}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              {pending === "status:NEW" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Undo className="mr-2 h-4 w-4" />}
              Restore
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Actions */}
      <div className="space-y-3">
        <h4 className="font-terminal text-sm uppercase tracking-widest text-muted-foreground">Feedback</h4>
        <div className="flex flex-col gap-2">
          <Button
            disabled={loading}
            variant={currentFeedback === "GOOD" ? "default" : "outline"}
            onClick={() => handleFeedbackChange(currentFeedback === "GOOD" ? "NONE" : "GOOD")}
            className={`w-full justify-start ${currentFeedback === "GOOD" ? "bg-signal hover:brightness-110 text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {pending === `feedback:${currentFeedback === "GOOD" ? "NONE" : "GOOD"}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
            Good Lead
          </Button>

          <Button
            disabled={loading}
            variant={currentFeedback === "BAD" ? "default" : "outline"}
            onClick={() => handleFeedbackChange(currentFeedback === "BAD" ? "NONE" : "BAD")}
            className={`w-full justify-start ${currentFeedback === "BAD" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {pending === `feedback:${currentFeedback === "BAD" ? "NONE" : "BAD"}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
            Bad Lead
          </Button>

          <Button
            disabled={loading}
            variant={currentFeedback === "NOT_RELEVANT" ? "secondary" : "outline"}
            onClick={() => handleFeedbackChange(currentFeedback === "NOT_RELEVANT" ? "NONE" : "NOT_RELEVANT")}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            {pending === `feedback:${currentFeedback === "NOT_RELEVANT" ? "NONE" : "NOT_RELEVANT"}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Slash className="mr-2 h-4 w-4" />}
            Not Relevant
          </Button>
        </div>
      </div>

      {/* Outcome Actions */}
      <div className="space-y-3">
        <h4 className="font-terminal text-sm uppercase tracking-widest text-muted-foreground">Outcome</h4>
        <div className="flex flex-col gap-2">
          <Button
            disabled={loading}
            variant={currentOutcome === "CONTACTED" ? "default" : "outline"}
            onClick={() => handleOutcomeChange(currentOutcome === "CONTACTED" ? "NONE" : "CONTACTED")}
            className={`w-full justify-start ${currentOutcome === "CONTACTED" ? "bg-amber hover:brightness-110 text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {pending === `outcome:${currentOutcome === "CONTACTED" ? "NONE" : "CONTACTED"}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
            Contacted
          </Button>

          <Button
            disabled={loading}
            variant={currentOutcome === "CONVERTED" ? "default" : "outline"}
            onClick={() => handleOutcomeChange(currentOutcome === "CONVERTED" ? "NONE" : "CONVERTED")}
            className={`w-full justify-start ${currentOutcome === "CONVERTED" ? "bg-signal hover:brightness-110 text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {pending === `outcome:${currentOutcome === "CONVERTED" ? "NONE" : "CONVERTED"}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trophy className="mr-2 h-4 w-4" />}
            Converted
          </Button>
        </div>
      </div>

    </div>
  );
}
