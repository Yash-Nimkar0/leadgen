import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, ArrowDown, Activity, Zap, CheckCircle2, MessageSquare, Tag } from "lucide-react";
import { IntentBadge } from "../components/Badges";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight">Reddit Intent</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
                  <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                  Monitor Reddit for high-intent conversations
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Find customers when they are <span className="text-blue-600">ready to buy</span>.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Stop wasting time manually searching. Reddit Intent automatically monitors discussions, scores them using AI, and delivers high-value leads directly to your inbox.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full border-t border-border py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-[700px] text-center space-y-2 mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">See it in action</h2>
              <p className="text-muted-foreground">
                A Reddit thread with buying intent, automatically turned into a scored, prioritized lead.
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-6">
                <div className="flex-1 rounded-xl border border-border bg-background p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    r/SaaS &middot; posted by u/founder_throwaway
                  </div>
                  <h3 className="font-semibold leading-snug">
                    Looking for a cheaper Intercom alternative right now
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    &ldquo;We&apos;re spending $500/mo on Intercom and it&apos;s way too expensive for our
                    stage. Does anyone have recommendations for a cheaper AI support tool?
                    Ready to buy today.&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-center shrink-0">
                  <div className="rounded-full border border-border bg-muted p-2">
                    <ArrowDown className="h-4 w-4 text-muted-foreground lg:-rotate-90" />
                  </div>
                </div>

                <div className="flex-1 rounded-xl border border-primary/30 bg-background p-5 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <IntentBadge score={94} />
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      ACTIVE_PURCHASE
                    </span>
                  </div>
                  <h3 className="font-semibold leading-snug">
                    Looking for a cheaper Intercom alternative right now
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Why it matters:</span> Actively
                    comparing tools with budget in hand and explicit purchase timing &mdash;
                    ready to buy this week.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span className="bg-muted px-1.5 py-0.5 rounded">customer support</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded">Intercom</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Example for illustration &mdash; not a live customer post or dashboard screenshot.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full border-t border-border bg-muted/30 py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Monitor</h3>
                <p className="text-muted-foreground">Track thousands of subreddits continuously for your keywords and competitors.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Analyze</h3>
                <p className="text-muted-foreground">AI scores every post for buying intent and categorizes the exact problem.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Prioritize</h3>
                <p className="text-muted-foreground">Focus only on high-intent leads delivered straight to your dashboard.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-border py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-14 md:flex-row md:py-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Reddit Intent. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
