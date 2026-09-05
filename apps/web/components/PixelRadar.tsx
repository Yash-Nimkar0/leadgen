"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { PixelSprite } from "./pixel/PixelSprite";
import { PLANET, PLANET_PALETTE } from "./pixel/sprites";
import { starLayer } from "./pixel/starLayer";

const RADAR_STARS = starLayer(30, 91, "231,236,232", 0.5);

type Point = { top: string; left: string; signal?: { subreddit: string; score: number } };

const POINTS: Point[] = [
  { top: "8%", left: "14%" },
  { top: "16%", left: "42%" },
  { top: "10%", left: "72%" },
  { top: "24%", left: "88%" },
  { top: "30%", left: "22%", signal: { subreddit: "r/SaaS", score: 91 } },
  { top: "38%", left: "58%" },
  { top: "46%", left: "10%" },
  { top: "52%", left: "78%", signal: { subreddit: "r/msp", score: 84 } },
  { top: "60%", left: "34%" },
  { top: "66%", left: "62%" },
  { top: "72%", left: "16%" },
  { top: "80%", left: "48%", signal: { subreddit: "r/consulting", score: 88 } },
  { top: "84%", left: "84%" },
  { top: "18%", left: "60%" },
  { top: "58%", left: "92%" },
  { top: "90%", left: "20%" },
];

/**
 * A live map of a community: mostly noise, a few real signals. Hover or
 * focus a bright point to see why it's flagged — the interaction the
 * product actually performs, made explorable rather than described.
 */
export function PixelRadar() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="pixel-frame relative w-full aspect-[16/10] border-2 border-border bg-card overflow-hidden scanlines">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: RADAR_STARS, backgroundSize: "100% 100%" }} />
      <PixelSprite
        rows={PLANET}
        palette={PLANET_PALETTE}
        className="absolute -bottom-10 -left-10 h-32 w-32 opacity-50 pointer-events-none animate-planet-glow"
        title=""
      />
      {!reduceMotion && (
        <div
          className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] opacity-[0.08] pointer-events-none animate-pixel-spin"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, transparent 320deg, #3ADD82 350deg, transparent 360deg)",
          }}
        />
      )}

      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          color: "#2B3542",
        }}
      />

      {POINTS.map((p, i) => {
        const isSignal = !!p.signal;
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => isSignal && setActive(i)}
            onMouseLeave={() => isSignal && setActive((a) => (a === i ? null : a))}
            onFocus={() => isSignal && setActive(i)}
            onBlur={() => isSignal && setActive((a) => (a === i ? null : a))}
            style={{ top: p.top, left: p.left }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 focus-visible:outline-none",
              isSignal ? "bg-signal cursor-pointer" : "bg-muted-foreground/30 cursor-default"
            )}
            tabIndex={isSignal ? 0 : -1}
            aria-label={isSignal ? `Signal in ${p.signal!.subreddit}, intent score ${p.signal!.score}` : undefined}
          >
            {isSignal && <span className="absolute inset-0 -m-1.5 animate-pixel-pulse bg-signal/25" />}

            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-max border-2 border-signal bg-card px-3 py-2 text-left shadow-pixel-signal"
                >
                  <p className="font-terminal text-sm text-signal tracking-widest uppercase">Signal detected</p>
                  <p className="text-xs text-foreground mt-0.5">{p.signal!.subreddit} &middot; intent {p.signal!.score}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
