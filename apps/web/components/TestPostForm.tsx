"use client";

import { useState } from "react";
import { testPost } from "../app/actions/test-post-actions";
import { IntentBadge } from "./Badges";
import { FlaskConical, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Label } from "./ui/Input";
import { ScoreDial } from "./ScoreDial";

type Result = {
  finalScore: number;
  classification: {
    intentType: string;
    relevance: number;
    commercialIntent: number;
    problemSummary: string | null;
    whyItMatters: string;
    summary: string;
    buyingStage: string;
    matchedKeywords: string[];
    matchedCompetitors: string[];
  };
};

export function TestPostForm({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await testPost(projectId, {
        title: (formData.get("title") as string) || "",
        body: (formData.get("body") as string) || "",
        subreddit: (formData.get("subreddit") as string) || "",
        competitors: (formData.get("competitors") as string) || "",
      });
      if (res.error) {
        setError(res.error);
      } else {
        setResult(res as Result);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-background shadow-sm">
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-start gap-3">
            <FlaskConical className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold">Test a real post</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Paste in a Reddit post you found by browsing yourself and see exactly how this
                project&apos;s classifier and scorer would treat it - real LLM call, same pipeline
                a live lead would go through. Nothing here gets saved as a lead.
              </p>
            </div>
          </div>

          {error && (
            <div className="border-2 border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div>
            <Label htmlFor="title" className="block">Post title</Label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Looking for a cheaper alternative to X"
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <Label htmlFor="body" className="block">Post body (optional)</Label>
            <textarea
              id="body"
              name="body"
              rows={4}
              placeholder="Paste the post text here"
              className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subreddit" className="block">Subreddit (optional)</Label>
              <input
                id="subreddit"
                name="subreddit"
                type="text"
                placeholder="e.g. SaaS"
                className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="competitors" className="block">Named competitors mentioned (optional)</Label>
              <input
                id="competitors"
                name="competitors"
                type="text"
                placeholder="Comma separated, e.g. Intercom, Zendesk"
                className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Classifying..." : "Test this post"}
            </Button>
          </div>
        </form>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <IntentBadge score={result.finalScore} />
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {result.classification.intentType}
              </span>
            </div>

            <div className="rounded-lg border border-border p-4 bg-background shadow-sm">
              <h3 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground mb-1">Problem Summary</h3>
              <p className="text-foreground text-sm">{result.classification.problemSummary || "None identified"}</p>
            </div>

            <div className="rounded-lg border border-border p-4 bg-background shadow-sm">
              <h3 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground mb-1">Why It Matters (Commercial Intent)</h3>
              <p className="text-foreground text-sm">{result.classification.whyItMatters}</p>
            </div>

            <div className="rounded-lg border border-border p-4 bg-background shadow-sm">
              <h3 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground mb-1">Recommended Action</h3>
              <p className="text-foreground text-sm">{result.classification.summary}</p>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
              <h3 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground pb-3 border-b border-border/50">Lead Details</h3>

              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Buying Stage</span>
                <span className="text-sm">{result.classification.buyingStage}</span>
              </div>

              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Score Breakdown</span>
                <ScoreDial score={result.finalScore} />
                <div className="mt-1 text-xs text-muted-foreground">
                  Relevance {result.classification.relevance} &middot; Intent signal {result.classification.commercialIntent}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1">Matched Keywords</span>
                {result.classification.matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.classification.matchedKeywords.map((kw, i) => (
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
                {result.classification.matchedCompetitors.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.classification.matchedCompetitors.map((comp, i) => (
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
      )}
    </div>
  );
}
