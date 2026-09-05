"use client";

import { useState } from "react";
import { runMockIngestion } from "../app/actions/dev-actions";
import { Play } from "lucide-react";

export function MockIngestionTrigger() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{processed?: number | string, matched?: number | string, error?: string} | null>(null);

  const handleTrigger = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await runMockIngestion();
      if (res.error) {
        setResult({ error: res.error });
      } else {
        setResult({ processed: res.processed, matched: res.matched });
      }
    } catch (err) {
      setResult({ error: "Failed to run ingestion" });
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-amber-700 dark:text-amber-500 flex items-center">
          <span className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mr-2">DEV</span>
          Mock Ingestion
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Trigger the mock ingestion pipeline to generate test leads for your projects.
        </p>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleTrigger}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:opacity-50"
        >
          <Play className="mr-2 h-4 w-4" />
          {loading ? "Running..." : "Run Mock Ingestion"}
        </button>
        
        {result?.error && (
          <span className="text-xs text-destructive">{result.error}</span>
        )}
        {result?.processed !== undefined && (
          <span className="text-xs text-signal">
            Success: Processed {result.processed} posts, created {result.matched} leads.
          </span>
        )}
      </div>
    </div>
  );
}
