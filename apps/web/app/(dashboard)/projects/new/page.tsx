"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "../../../actions/project-actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createProject(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.projectId) {
        router.push(`/projects/${result.projectId}/leads`);
        router.refresh();
      }
    } catch (err: unknown) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Overview
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create a Project</h1>
        <p className="text-muted-foreground mt-2">
          Define what you&apos;re looking for, and we&apos;ll monitor Reddit for leads.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm">
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Project Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g., LeadGen SaaS"
                className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="productDescription" className="block text-sm font-medium">
                Product Description
              </label>
              <textarea
                id="productDescription"
                name="productDescription"
                required
                rows={3}
                placeholder="Briefly describe what your product does, who it's for, and what problems it solves."
                className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This helps the AI understand if a conversation is relevant to your product.
              </p>
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-medium">
                Keywords (Comma separated)
              </label>
              <input
                id="keywords"
                name="keywords"
                type="text"
                placeholder="e.g., b2b lead generation, cold email, sales intelligence"
                className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="sources" className="block text-sm font-medium">
                Target Subreddits (Comma separated)
              </label>
              <input
                id="sources"
                name="sources"
                type="text"
                placeholder="e.g., saas, sideproject, startups"
                className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
