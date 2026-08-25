import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import Link from "next/link";
import { Activity, LayoutDashboard, Plus, Settings } from "lucide-react";
import { LogoutButton } from "../../components/LogoutButton";

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
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-muted/20 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">Reddit Intent</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </Link>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Projects
              </h3>
              <Link
                href="/projects/new"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">New Project</span>
              </Link>
            </div>
            
            <ul className="space-y-1">
              {projects.length === 0 ? (
                <li className="px-2 py-1 text-xs text-muted-foreground">
                  No projects yet.
                </li>
              ) : (
                projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}/leads`}
                      className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted truncate"
                    >
                      {project.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium truncate pr-2" title={session.user.email || ""}>
              {session.user.email}
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
