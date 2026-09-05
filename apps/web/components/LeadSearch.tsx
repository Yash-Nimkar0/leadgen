"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";

export function LeadSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (debouncedSearch) {
      current.set("search", debouncedSearch);
      current.set("page", "1"); // Reset pagination on search
    } else {
      current.delete("search");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    
    router.push(`${pathname}${query}`);
  }, [debouncedSearch, pathname, router, searchParams]);

  return (
    <div className="relative max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="text"
        className="block w-full border-2 border-border bg-background/60 py-1.5 pl-10 pr-3 font-terminal text-base tracking-wide placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        placeholder="Search leads..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
