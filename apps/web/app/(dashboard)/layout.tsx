import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import Link from "next/link";
import { User } from "lucide-react";
import { LogoutButton } from "../../components/LogoutButton";
import { Logo } from "../../components/Logo";
import { DashboardNav } from "../../components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground selection:bg-signal selection:text-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r-2 border-border bg-background flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b-2 border-border">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>
        </div>

        <DashboardNav projects={projects} />

        <div className="p-4 mt-auto border-t-2 border-border">
          <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground">
            <div className="flex items-center space-x-3 truncate">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs">{session.user.email}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
