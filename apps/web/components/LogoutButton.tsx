"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Sign out</span>
    </button>
  );
}
