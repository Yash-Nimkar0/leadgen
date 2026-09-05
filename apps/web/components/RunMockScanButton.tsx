"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runMockIngestion } from "../app/actions/dev-actions";
import { PlayCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";

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
        <h3 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground">Run Mock Scan</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Development only. Runs the ingestion pipeline against mock Reddit fixtures and the
          mock classifier - no real Reddit or LLM API calls, no cost.
        </p>
      </div>
      {error && (
        <div className="border-2 border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="border-2 border-signal/50 bg-signal/10 p-3 text-sm text-signal">
          Scan complete. New leads (if any matched) will appear in the Leads inbox.
        </div>
      )}
      <Button type="button" variant="outline" onClick={handleClick} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
        {loading ? "Running scan..." : "Run Mock Scan"}
      </Button>
    </div>
  );
}
