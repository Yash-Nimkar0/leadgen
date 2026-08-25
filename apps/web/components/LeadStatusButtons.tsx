"use client";

import { updateLeadStatus, updateLeadFeedback, updateLeadOutcome } from "../app/actions/lead-actions";
import { Check, X, Undo, ThumbsUp, ThumbsDown, Slash, Phone, Trophy } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: "NEW" | "VIEWED" | "DISMISSED") => {
    setLoading(true);
    await updateLeadStatus(projectId, leadId, status);
    router.refresh();
    setLoading(false);
  };

  const handleFeedbackChange = async (feedback: "NONE" | "GOOD" | "BAD" | "NOT_RELEVANT") => {
    setLoading(true);
    await updateLeadFeedback(projectId, leadId, feedback);
    router.refresh();
    setLoading(false);
  };

  const handleOutcomeChange = async (outcome: "NONE" | "CONTACTED" | "CONVERTED") => {
    setLoading(true);
    await updateLeadOutcome(projectId, leadId, outcome);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Lifecycle Actions */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Lifecycle</h4>
        <div className="flex flex-wrap gap-2">
          {currentStatus === "NEW" && (
            <button
              disabled={loading}
              onClick={() => handleStatusChange("VIEWED")}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Check className="mr-2 h-4 w-4" />
              Mark Viewed
            </button>
          )}

          {currentStatus === "VIEWED" && (
            <button
              disabled={loading}
              onClick={() => handleStatusChange("NEW")}
              className="inline-flex items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 disabled:opacity-50"
            >
              <Undo className="mr-2 h-4 w-4" />
              Mark Unread
            </button>
          )}

          {currentStatus !== "DISMISSED" && (
            <button
              disabled={loading}
              onClick={() => handleStatusChange("DISMISSED")}
              className="inline-flex items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 disabled:opacity-50"
            >
              <X className="mr-2 h-4 w-4" />
              Dismiss
            </button>
          )}

          {currentStatus === "DISMISSED" && (
            <button
              disabled={loading}
              onClick={() => handleStatusChange("NEW")}
              className="inline-flex items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 disabled:opacity-50"
            >
              <Undo className="mr-2 h-4 w-4" />
              Restore
            </button>
          )}
        </div>
      </div>

      {/* Feedback Actions */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Feedback</h4>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={loading}
            onClick={() => handleFeedbackChange(currentFeedback === "GOOD" ? "NONE" : "GOOD")}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 ${
              currentFeedback === "GOOD" 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Good Lead
          </button>
          
          <button
            disabled={loading}
            onClick={() => handleFeedbackChange(currentFeedback === "BAD" ? "NONE" : "BAD")}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 ${
              currentFeedback === "BAD" 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Bad Lead
          </button>

          <button
            disabled={loading}
            onClick={() => handleFeedbackChange(currentFeedback === "NOT_RELEVANT" ? "NONE" : "NOT_RELEVANT")}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 ${
              currentFeedback === "NOT_RELEVANT" 
                ? "bg-gray-600 text-white hover:bg-gray-700" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Slash className="mr-2 h-4 w-4" />
            Not Relevant
          </button>
        </div>
      </div>

      {/* Outcome Actions */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Outcome</h4>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={loading}
            onClick={() => handleOutcomeChange(currentOutcome === "CONTACTED" ? "NONE" : "CONTACTED")}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 ${
              currentOutcome === "CONTACTED" 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Phone className="mr-2 h-4 w-4" />
            Contacted
          </button>

          <button
            disabled={loading}
            onClick={() => handleOutcomeChange(currentOutcome === "CONVERTED" ? "NONE" : "CONVERTED")}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 ${
              currentOutcome === "CONVERTED" 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Converted
          </button>
        </div>
      </div>

    </div>
  );
}
