"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Inbox, Settings } from "lucide-react";
import { cn } from "../lib/utils";
import { Button, buttonVariants } from "./ui/Button";

type Project = { id: string; name: string };

/**
 * The active state is a left-edge signal-green rule, not a filled pill —
 * the same "one accent, used sparingly" rule the rest of the system
 * follows. Every row reserves the same border width whether active or
 * not, so nothing shifts when the state changes.
 */
function NavItem({
  href,
  icon: Icon,
  label,
  active,
  labelClassName = "font-terminal",
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  /** Static/system labels ("Overview," "Settings") stay font-terminal, the
   * default. A row whose label is user-generated content (a pipeline name)
   * passes "font-sans" here instead — the row's content decides the font,
   * not its position in the sidebar. */
  labelClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 border-l-2 text-sm font-medium transition-colors",
        active
          ? "border-signal bg-muted/40 text-foreground"
          : "border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-signal" : "opacity-70 group-hover:opacity-100")} />
      <span className={cn("truncate", labelClassName)}>{label}</span>
    </Link>
  );
}

export function DashboardNav({ projects }: { projects: Project[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-8 overflow-y-auto">
      <div className="space-y-0.5">
        <NavItem href="/dashboard" icon={Home} label="Overview" active={pathname === "/dashboard"} />
      </div>

      <div>
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="font-terminal text-sm text-muted-foreground uppercase tracking-widest">
            Pipelines
          </h3>
          <Link href="/projects/new" aria-label="Add pipeline" className={buttonVariants({ variant: "ghost", size: "icon", className: "h-5 w-5 hover:text-signal" })}>
            <Plus className="h-3 w-3" />
          </Link>
        </div>

        <ul className="space-y-0.5">
          {projects.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground/70">
              No pipelines yet.
            </li>
          ) : (
            projects.map((project) => (
              <li key={project.id}>
                <NavItem
                  href={`/projects/${project.id}/leads`}
                  icon={Inbox}
                  label={project.name}
                  active={pathname.startsWith(`/projects/${project.id}`)}
                  labelClassName="font-sans"
                />
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="space-y-0.5">
        <NavItem href="/settings" icon={Settings} label="Settings" active={pathname === "/settings"} />
      </div>
    </nav>
  );
}
