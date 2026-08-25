"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runMockIngestion } from "../app/actions/dev-actions";
import { PlayCircle } from "lucide-react";

export function RunMockScanButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await runMockIngestion(projectId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-3">
      <div>
        <h3 className="text-sm font-medium">Run Mock Scan</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Development only. Runs the ingestion pipeline against mock Reddit fixtures and the
          mock classifier - no real Reddit or LLM API calls, no cost.
        </p>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          Scan complete. New leads (if any matched) will appear in the Leads inbox.
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:opacity-70"
      >
        <PlayCircle className="mr-2 h-4 w-4" />
        {loading ? "Running scan..." : "Run Mock Scan"}
      </button>
    </div>
  );
}
