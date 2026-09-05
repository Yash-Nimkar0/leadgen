"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

const SEGMENTS = 10;
const SEGMENTS_DENSE = 5;

/**
 * The dense variant's 5 segments are not a uniform 1/5 split of 0-100 —
 * that gave every score from 90-100 an identical full bar, right where
 * ranking matters most. Boundaries below 80 sit exactly on the product's
 * two real thresholds (60, 80 — see the color logic below, and
 * NotificationService's default alert threshold / the ingestion
 * pipeline's high-intent counter for where those numbers come from).
 * There's no third business threshold above 80, so the top band is
 * simply bisected at its own midpoint (90) to buy the green zone a
 * second degree of resolution — a presentation choice, not a new score
 * tier, and it never touches `finalScore` itself.
 */
function denseFilledSegments(score: number): number {
  if (score < 30) return 1;
  if (score < 60) return 2;
  if (score < 80) return 3;
  if (score < 90) return 4;
  return 5;
}

/**
 * The signal meter — LeadGen's recurring score device. A segmented HUD
 * bar rather than a smooth gauge: it reads like a signal-strength or
 * health meter, filling and counting up together the first time it
 * enters view instead of appearing pre-filled.
 *
 * `variant="dense"` is the same instrument at list density (the leads
 * inbox): fewer segments, and the score renders immediately rather than
 * counting up — a per-row count-up animation, repeated down a long list,
 * reads as noise rather than the deliberate one-time reveal it's meant
 * to be on the lead-detail page and marketing scenes.
 */
export function ScoreDial({
  score,
  size = "sm",
  variant = "default",
  autoAnimate = false,
  className,
  trackClassName = "bg-muted",
  progressClassName,
  labelClassName = "text-foreground",
}: {
  score: number;
  size?: "sm" | "lg";
  /** "dense" = list/inbox context: fewer segments, no count-up. */
  variant?: "default" | "dense";
  /**
   * Count up immediately on mount instead of dense's "show instantly" or
   * default's "count up on scroll into view." For a single dial whose
   * reveal is driven by a caller's own choreography (e.g. the marketing
   * hero's scripted narrative) rather than list density or scroll timing —
   * mount the component at the moment the count-up should start.
   */
  autoAnimate?: boolean;
  className?: string;
  /** Override the unfilled segment color — for use on light surfaces. */
  trackClassName?: string;
  /** Override the filled segment color instead of the default score tone. */
  progressClassName?: string;
  /** Override the number's color — for use on light surfaces. */
  labelClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const isDense = variant === "dense";
  const [display, setDisplay] = useState(isDense && !autoAnimate ? clamped : 0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dense rows never animate on their own — no observer, no rAF loop,
    // nothing to clean up. A long inbox shouldn't be running twenty of
    // these. autoAnimate opts a single dial back in, still with no observer.
    if (isDense && !autoAnimate) {
      setDisplay(clamped);
      return;
    }

    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplay(clamped);
      return;
    }

    let frame: number;
    const animateTo = () => {
      const start = performance.now();
      const duration = 900;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setDisplay(Math.round(clamped * ease(t)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    if (autoAnimate) {
      animateTo();
      return () => { if (frame) cancelAnimationFrame(frame); };
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          animateTo();
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [clamped, isDense, autoAnimate]);

  const segmentCount = isDense ? SEGMENTS_DENSE : SEGMENTS;
  const filledSegments = isDense ? denseFilledSegments(display) : Math.round((display / 100) * segmentCount);
  const tone = progressClassName ?? (clamped >= 80 ? "bg-signal" : clamped >= 60 ? "bg-amber" : "bg-muted-foreground");

  const segH = isDense ? "h-2.5" : size === "lg" ? "h-9" : "h-3";
  const segW = isDense ? "w-1" : size === "lg" ? "w-3" : "w-1.5";
  const gap = isDense ? "gap-[2px]" : "gap-[3px]";

  return (
    <div ref={ref} className={cn("inline-flex items-center", isDense ? "gap-2" : "gap-3", className)}>
      <div className={cn("flex", gap)} aria-hidden="true">
        {Array.from({ length: segmentCount }).map((_, i) => (
          <span
            key={i}
            className={cn(segH, segW, "transition-colors duration-150", i < filledSegments ? tone : trackClassName)}
          />
        ))}
      </div>
      <span
        className={cn(
          "font-pixel tabular-nums",
          labelClassName,
          isDense ? "text-[10px]" : size === "lg" ? "text-xl" : "text-[10px]"
        )}
      >
        {display}
      </span>
    </div>
  );
}
