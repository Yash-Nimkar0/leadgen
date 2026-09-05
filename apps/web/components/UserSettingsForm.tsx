"use client";

import { useState } from "react";
import { updateNotificationSettings } from "../app/actions/user-settings-actions";
import { Save, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Label } from "./ui/Input";

export function UserSettingsForm({
  initialMinimumIntentScore,
}: {
  initialMinimumIntentScore: number;
}) {
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
      const result = await updateNotificationSettings(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
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
          <Label htmlFor="minimumIntentScore" className="block">
            Notification threshold (Minimum Intent Score)
          </Label>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            Notify me for opportunities scoring at least this value (0-100).
          </p>
          <input
            id="minimumIntentScore"
            name="minimumIntentScore"
            type="number"
            min="0"
            max="100"
            required
            defaultValue={initialMinimumIntentScore}
            className="mt-1 block w-full max-w-[150px] rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
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
