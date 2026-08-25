"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Sign out</span>
    </button>
  );
}
