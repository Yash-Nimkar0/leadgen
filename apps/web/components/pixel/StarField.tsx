"use client";

import { useReducedMotion } from "framer-motion";
import { starLayer } from "./starLayer";

const FAR = starLayer(40, 11, "231,236,232", 0.5);
const NEAR = starLayer(14, 83, "58,221,130", 0.9);

/**
 * A fixed, full-viewport backdrop that sits behind every section — an
 * aurora gradient sky (indigo → teal → near-black), a soft dither grain
 * over it for that authentic dusty-pixel-gradient look, and two star
 * layers drifting at different speeds (trimmed from three during the hero
 * rework — the atmosphere should support the hero, not compete with it).
 * This is what turns "dark background" into an actual place, not a flat fill.
 */
export function StarField({ shootingStars = true }: { shootingStars?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background" aria-hidden="true">
      {/* aurora gradient sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 30% -10%, rgba(124,92,222,0.28) 0%, transparent 55%), " +
            "radial-gradient(ellipse 70% 50% at 85% 8%, rgba(58,221,130,0.16) 0%, transparent 60%), " +
            "linear-gradient(180deg, #120B26 0%, #0B1C2E 28%, #07211D 52%, #061512 72%, #05080A 100%)",
        }}
      />
      {/* dither grain so the gradient reads as pixel-dithered, not a smooth CSS blend */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 2px)",
        }}
      />

      <div
        className={reduceMotion ? "absolute -inset-[10%]" : "absolute -inset-[10%] animate-star-drift"}
        style={{ backgroundImage: FAR, backgroundSize: "400px 400px", backgroundRepeat: "repeat" }}
      />
      <div
        className={reduceMotion ? "absolute -inset-[10%] opacity-70" : "absolute -inset-[10%] opacity-70 animate-star-drift-near"}
        style={{ backgroundImage: NEAR, backgroundSize: "400px 400px", backgroundRepeat: "repeat" }}
      />

      {shootingStars && !reduceMotion && (
        <>
          <span className="absolute top-[15%] left-[70%] h-px w-16 bg-gradient-to-r from-transparent via-paper-dark to-transparent animate-shooting-star" style={{ animationDelay: "1.5s" }} />
          <span className="absolute top-[55%] left-[40%] h-px w-12 bg-gradient-to-r from-transparent via-signal to-transparent animate-shooting-star" style={{ animationDelay: "5s" }} />
        </>
      )}

      {/* vignette so content stays legible over the field */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(5,8,10,0.5) 75%)" }} />
    </div>
  );
}
