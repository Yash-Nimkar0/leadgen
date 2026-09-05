"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectSettings } from "../app/actions/project-settings-actions";
import { Save, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Label } from "./ui/Input";

export function ProjectSettingsForm({
  projectId,
  initialName,
  initialDescription,
}: {
  projectId: string;
  initialName: string;
  initialDescription: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await updateProjectSettings(projectId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="p-6 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="border-2 border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="border-2 border-signal/50 bg-signal/10 p-4 text-sm text-signal">
          Settings updated successfully.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="block">
            Project Name
          </Label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialName}
            className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <Label htmlFor="productDescription" className="block">
            Product Description
          </Label>
          <textarea
            id="productDescription"
            name="productDescription"
            required
            rows={4}
            defaultValue={initialDescription}
            className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <p className="text-sm text-muted-foreground italic pt-2">
          Note: To update keywords or subreddits, please create a new project in this MVP version.
        </p>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
