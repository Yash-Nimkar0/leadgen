"use client";

import { useState } from "react";
import { updateNotificationSettings } from "../app/actions/user-settings-actions";
import { Save } from "lucide-react";

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
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          Settings updated successfully.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="minimumIntentScore" className="block text-sm font-medium">
            Notification threshold (Minimum Intent Score)
          </label>
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
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-70"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
