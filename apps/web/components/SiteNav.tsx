"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { Button, buttonVariants } from "./ui/Button";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
];

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className="relative py-1 hover:text-foreground transition-colors">
      {label}
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute left-0 right-0 -bottom-1 h-[2px] bg-signal"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
    </Link>
  );
}

/**
 * Sparse by default, compacts on scroll, and tracks which part of the
 * story the reader is in — the only navigation state worth showing.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActive(visible[0] ? `#${visible[0].target.id}` : "");
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-[padding,background-color,backdrop-filter,border-color] duration-300 border-b-2 ${
        scrolled ? "bg-background/90 backdrop-blur-md border-border" : "bg-transparent backdrop-blur-0 border-transparent"
      }`}
    >
      <div className={`container mx-auto max-w-6xl flex items-center justify-between px-6 transition-[height] duration-300 ${scrolled ? "h-14" : "h-16"}`}>
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center space-x-8">
          <nav className="hidden md:flex items-center space-x-8 font-terminal text-lg tracking-wide text-muted-foreground">
            <AnimatePresence initial={false}>
              {LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} active={active === link.href} />
              ))}
            </AnimatePresence>
          </nav>
          <div className="flex items-center space-x-5">
            <Link href="/login" className="font-terminal text-lg tracking-wide text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <a href="/register" className={buttonVariants({ size: "sm" })}>
              [ Get started ]
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
