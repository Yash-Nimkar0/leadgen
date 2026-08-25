import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";
import { UserSettingsForm } from "../../../components/UserSettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const prefs = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and notifications.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm">
        <UserSettingsForm 
          initialMinimumIntentScore={prefs?.minimumIntentScore ?? 80} 
        />
      </div>
    </div>
  );
}
