"use client";

import { useEffect, useState } from "react";
import { Blip } from "./pixel/Blip";
import { NoiseCreature } from "./pixel/NoiseCreature";
import { ScoreDial } from "./ScoreDial";

const PHASES = [
  { key: "rest", duration: 300 },
  { key: "search", duration: 1400 },
  { key: "detect", duration: 500 },
  { key: "resolve", duration: 1100 },
  { key: "evidence", duration: 600 },
  { key: "hold", duration: 7000 },
] as const;

// Fixed positions (percent of the stage, 0-100) — used both for the
// absolutely-positioned DOM elements and as SVG line coordinates.
const BLIP_FRAGMENT = { x: -2, y: 55, w: 220, h: 100 }; // Slightly adjusted for larger fragment
const SIGNAL_FRAGMENT = { x: 62, y: 15, w: 120, h: 60 };
const MID_FRAGMENT_A = { x: 28, y: 22, w: 140, h: 70 };
const MID_FRAGMENT_B = { x: 74, y: 44, w: 90, h: 45 };
const FAR_FRAGMENT = { x: 19, y: 6, w: 60, h: 30 };

// thread anchor points
const THREAD_START = { x: BLIP_FRAGMENT.x + 25, y: BLIP_FRAGMENT.y + 12 };
const THREAD_END = { x: SIGNAL_FRAGMENT.x + 12, y: SIGNAL_FRAGMENT.y + 6 };
const DORMANT_THREAD = { x1: MID_FRAGMENT_A.x + 15, y1: MID_FRAGMENT_A.y + 8, x2: MID_FRAGMENT_B.x + 5, y2: MID_FRAGMENT_B.y + 5 };

export function HeroWorld() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion !== false) return;
    let cancelled = false;
    let i = 0;
    const run = () => {
      if (cancelled) return;
      setPhaseIndex(i);
      const duration = PHASES[i]?.duration ?? 1000;
      window.setTimeout(() => {
        i = (i + 1) % PHASES.length;
        if (i === 0) setCycle((c) => c + 1);
        run();
      }, duration);
    };
    const t = window.setTimeout(run, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [reduceMotion]);

  const effectivePhaseIndex = reduceMotion === false ? phaseIndex : PHASES.length - 1;
  const phase = PHASES[effectivePhaseIndex]?.key ?? "hold";

  const detected = phase !== "rest" && phase !== "search";
  const resolved = phase === "resolve" || phase === "evidence" || phase === "hold";
  const evidenceShown = phase === "evidence" || phase === "hold";
  const searching = phase === "search";
  const blipState = phase === "rest" ? "idle" : phase === "search" ? "scan" : "found";

  return (
    <div className="relative w-[330px] sm:w-[460px] max-w-full shrink-0 h-[400px] sm:h-[480px]">
      {/* Background layer */}
      <div 
        className="absolute inset-0 z-0 opacity-50 pointer-events-none"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 40%, transparent 100%)"
        }}
      >
        <img 
          src="/hero/bg_nebula.png" 
          alt="" 
          className="w-full h-full object-cover pixelated" 
        />
      </div>

      <div
        className="absolute opacity-[0.3] pointer-events-none z-0"
        style={{ left: `${FAR_FRAGMENT.x}%`, top: `${FAR_FRAGMENT.y}%`, width: FAR_FRAGMENT.w, height: FAR_FRAGMENT.h }}
      >
        <img src="/hero/fragment_small.png" alt="" className="w-full h-full object-contain pixelated" />
      </div>

      <svg className="absolute inset-0 z-10 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line
          x1={DORMANT_THREAD.x1} y1={DORMANT_THREAD.y1} x2={DORMANT_THREAD.x2} y2={DORMANT_THREAD.y2}
          stroke="#3ADD82" strokeOpacity="0.08" strokeWidth="0.3" vectorEffect="non-scaling-stroke"
        />
        <line
          x1={THREAD_START.x} y1={THREAD_START.y} x2={THREAD_END.x} y2={THREAD_END.y}
          stroke="#3ADD82"
          strokeOpacity={resolved ? 0.9 : 0.15}
          strokeWidth={phase === "detect" ? 1.5 : 0.6}
          vectorEffect="non-scaling-stroke"
          style={{ transition: "stroke-opacity 600ms ease-out, stroke-width 300ms ease-out" }}
        />
      </svg>

      {/* Midground fragment A */}
      <div
        className="absolute z-20 hidden sm:block"
        style={{ left: `${MID_FRAGMENT_A.x}%`, top: `${MID_FRAGMENT_A.y}%`, width: MID_FRAGMENT_A.w, height: MID_FRAGMENT_A.h }}
      >
        <img src="/hero/fragment_large.png" alt="" className="w-full h-full object-contain pixelated opacity-90" />
        <div className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2" style={{ left: "38%", top: "-10%" }}>
          <NoiseCreature scale="hero" variant={2} delayMs={0} className="h-full w-full" />
        </div>
        <div className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2" style={{ left: "70%", top: "5%" }}>
          <div style={{ transform: "scaleX(-1)" }} className="h-full w-full">
            <NoiseCreature scale="hero" variant={3} delayMs={220} className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* Midground fragment B */}
      <div
        className="absolute z-20 hidden sm:block"
        style={{ left: `${MID_FRAGMENT_B.x}%`, top: `${MID_FRAGMENT_B.y}%`, width: MID_FRAGMENT_B.w, height: MID_FRAGMENT_B.h }}
      >
        <img src="/hero/fragment_small.png" alt="" className="w-full h-full object-contain pixelated opacity-80" />
        <div className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2" style={{ left: "50%", top: "-10%" }}>
          <div style={{ transform: "scaleX(-1)" }} className="h-full w-full">
            <NoiseCreature scale="hero" variant={4} delayMs={400} className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* Blip's fragment */}
      <div
        className="absolute z-30"
        style={{ left: `${BLIP_FRAGMENT.x}%`, top: `${BLIP_FRAGMENT.y}%`, width: BLIP_FRAGMENT.w, height: BLIP_FRAGMENT.h }}
      >
        <img src="/hero/fragment_large.png" alt="" className="w-full h-full object-contain pixelated" />
        {/* Lurking creature */}
        <div className="absolute h-10 w-10 z-0" style={{ left: "75%", top: "25%" }}>
          <NoiseCreature scale="hero" variant={5} delayMs={180} className="h-full w-full" />
        </div>
      </div>

      {/* Blip */}
      <div
        className="absolute z-40 h-[195px] w-[172px] sm:h-[235px] sm:w-[208px] transition-transform duration-700 ease-out"
        style={{ left: "2%", bottom: "16%", transform: `scale(${searching || detected ? 1 : 0.97})` }}
      >
        <div
          className="absolute -bottom-2 left-[25%] h-4 w-[60%] blur-[6px] pointer-events-none bg-black/60 rounded-full"
        />
        <div
          className="absolute inset-0 transition-transform duration-[900ms] ease-out"
          style={{ transform: detected ? "translate(4px, -4px)" : "translate(0, 0)" }}
        >
          <Blip state={blipState} scale="hero" glow={false} className="h-full w-full" />
        </div>
      </div>

      {/* Signal fragment */}
      <div
        className="absolute z-30"
        style={{ left: `${SIGNAL_FRAGMENT.x}%`, top: `${SIGNAL_FRAGMENT.y}%`, width: SIGNAL_FRAGMENT.w, height: SIGNAL_FRAGMENT.h }}
      >
        <img src="/hero/fragment_small.png" alt="" className="w-full h-full object-contain pixelated" />
        <div className="absolute h-16 w-16 sm:h-20 sm:w-20 -translate-x-1/2" style={{ left: "42%", top: "-85%" }}>
          {phase === "detect" && (
            <span
              className="absolute -inset-2 pointer-events-none animate-pixel-pulse"
              style={{ animationDuration: "250ms", animationIterationCount: 2 }}
              aria-hidden="true"
            >
              <span className="block h-full w-full border-2 border-signal/60 rounded-full" />
            </span>
          )}
          {resolved && (
            <span className="absolute -inset-4 -z-[1] bg-signal/25 blur-xl pointer-events-none animate-planet-glow rounded-full" aria-hidden="true" />
          )}
          <span className={`absolute inset-0 transition-opacity duration-500 ${detected ? "opacity-0" : "opacity-100"}`}>
            <NoiseCreature scale="hero" variant={6} className="h-full w-full" />
          </span>
          <span className={`absolute inset-0 transition-opacity duration-500 ${detected ? "opacity-100" : "opacity-0"}`}>
            <NoiseCreature scale="hero" variant={6} signal className="h-full w-full" />
          </span>
        </div>

        {/* Evidence readout */}
        <div
          className={`absolute w-[110px] sm:w-[140px] left-[6%] sm:left-[58%] transition-all duration-500 origin-bottom-left ${
            resolved ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
          }`}
          style={{ top: "-75%", filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.9))" }}
        >
          <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm border-2 border-border p-1.5 shadow-pixel">
            <span className="font-pixel text-[10px] text-signal/70 leading-none">[</span>
            <ScoreDial
              key={resolved ? `dial-${cycle}` : "dial-idle"}
              score={91}
              variant="dense"
              autoAnimate={resolved}
              labelClassName="text-signal"
              trackClassName="bg-muted-foreground/20"
            />
            <span className="font-pixel text-[10px] text-signal/70 leading-none">]</span>
          </div>
          <p
            className={`mt-2 font-terminal text-[11px] leading-tight tracking-widest uppercase text-signal bg-background/90 px-2 py-1 border-2 border-signal/30 inline-block transition-opacity duration-500 ${
              evidenceShown ? "opacity-100" : "opacity-0"
            }`}
          >
            Named competitor
          </p>
        </div>
      </div>

      <p className="absolute bottom-0 right-0 z-30 font-terminal text-[10px] tracking-wide text-muted-foreground/40">
        Illustrative example &middot; not a live feed
      </p>
    </div>
  );
}
