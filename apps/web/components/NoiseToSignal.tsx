"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";

const NOISE = [
  { text: "check out my new profile setup", top: "10%", left: "5%", sprite: "noise_01.png" },
  { text: "anyone else having login issues today", top: "15%", left: "75%", sprite: "noise_02.png" },
  { text: "just hit 10k on this account, feels good", top: "30%", left: "12%", sprite: "noise_03.png" },
  { text: "does this sub allow self promo posts", top: "25%", left: "80%", sprite: "noise_04.png" },
  { text: "what's everyone's favorite feature so far", top: "45%", left: "6%", sprite: "noise_05.png" },
  { text: "following for updates, thanks all", top: "50%", left: "78%", sprite: "noise_06.png" },
  { text: "not sure if this is the right place to ask", top: "65%", left: "8%", sprite: "noise_01.png" },
  { text: "loving the new update, nice work team", top: "70%", left: "82%", sprite: "noise_02.png" },
  { text: "can someone explain how tiers work here", top: "85%", left: "10%", sprite: "noise_03.png" },
  { text: "off topic but happy friday everyone", top: "88%", left: "76%", sprite: "noise_04.png" },
];

const SIGNAL = [
  { text: "evaluating three tools this quarter, budget is approved", tag: "Budget approved", top: "55%", left: "45%", sprite: "signal_idle.png", activeSprite: "signal_active.png" },
];

const LINES = [
  { text: "Every thread looks like this.", range: [0, 0.1, 0.2, 0.3], output: [0, 1, 1, 0] },
  { text: "Most of it isn't about you.", range: [0.35, 0.45, 0.55, 0.65], output: [0, 1, 1, 0] },
  { text: "Until you find the one that is.", range: [0.7, 0.8, 1, 1], output: [0, 1, 1, 1] },
];

function NoiseCreature({ text, top, left, sprite, progress }: { text: string; top: string; left: string; sprite: string; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.3, 0.8], [0.6, 0.05]);
  const scale = useTransform(progress, [0.3, 0.8], [1, 0.9]);
  const filter = useTransform(progress, [0.3, 0.8], ["blur(0px)", "blur(6px)"]);

  const randomDelay = useRef(Math.random() * 2).current;

  return (
    <motion.div
      style={{ top, left, opacity, scale, filter }}
      className="absolute flex flex-col items-center gap-2 max-w-[140px]"
    >
      <motion.img 
        src={`/noise/${sprite}`} 
        alt="noise" 
        className="w-16 h-16 pixelated drop-shadow-lg" 
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: randomDelay }}
      />
      <div className="bg-card/80 backdrop-blur-sm border border-border px-2 py-1.5 text-[10px] leading-tight text-muted-foreground text-center rounded-sm">
        &ldquo;{text}&rdquo;
      </div>
    </motion.div>
  );
}

function SignalCreature({ text, tag, top, left, sprite, progress }: { text: string; tag: string; top: string; left: string; sprite: string; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.4, 0.6], [0.4, 1]);
  const scale = useTransform(progress, [0.5, 0.7], [0.95, 1.1]);
  const glowOpacity = useTransform(progress, [0.83, 0.88], [0, 1]);
  
  return (
    <motion.div
      style={{ top, left, opacity, scale }}
      className="absolute flex flex-col items-center gap-3 max-w-[240px] z-20"
    >
      <div className="relative">
        <motion.div style={{ opacity: glowOpacity }} className="absolute inset-0 bg-signal/30 blur-2xl rounded-full scale-[2]" />
        
        <img src={`/hero/${sprite}`} alt="signal" className="w-24 h-24 pixelated drop-shadow-xl absolute top-0 left-0" />
        <motion.img 
          style={{ opacity: glowOpacity }}
          src={`/hero/signal_active.png`} 
          alt="signal active" 
          className="w-24 h-24 pixelated drop-shadow-[0_0_15px_rgba(34,197,94,0.6)] relative z-10" 
        />
      </div>

      <motion.div 
        style={{ borderColor: useTransform(progress, [0.83, 0.88], ["#222", "#22c55e"]) }}
        className="bg-card px-3 py-2 text-xs leading-snug text-foreground shadow-pixel-signal border-2 transition-colors duration-300"
      >
        &ldquo;{text}&rdquo;
        <motion.p style={{ opacity: glowOpacity }} className="mt-1.5 font-terminal text-[10px] tracking-widest text-signal uppercase">
          [ {tag} ]
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export function NoiseToSignal() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const maxScroll = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > maxScroll.get()) maxScroll.set(latest);
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [blipSprite, setBlipSprite] = useState("blip_idle.png");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useMotionValueEvent(maxScroll, "change", (latest) => {
    if (latest > 0.95) setBlipSprite("blip_found.png");
    else if (latest > 0.72) setBlipSprite("blip_found.png"); // Notice & Dart
    else if (latest > 0.55 && latest <= 0.60) setBlipSprite("blip_scan.png"); // Scan Left Low
    else if (latest > 0.40 && latest <= 0.45) setBlipSprite("blip_scan.png"); // Scan Right Mid
    else if (latest > 0.25 && latest <= 0.30) setBlipSprite("blip_scan.png"); // Scan Left Mid
    else if (latest > 0.10 && latest <= 0.15) setBlipSprite("blip_scan.png"); // Scan Right Top
    else setBlipSprite("blip_idle.png");
  });

  // ----------------------------------------------------
  // CINEMATIC MOTION PATH (14 Phases for deeper meandering)
  // ----------------------------------------------------
  const phases = [0, 0.10, 0.15, 0.25, 0.30, 0.40, 0.45, 0.55, 0.60, 0.68, 0.72, 0.85, 0.95, 1];
  
  const dx = ["-5%", "60%", "62%", "20%", "18%", "65%", "68%", "15%", "13%", "25%", "25%", "41%", "41%", "41%"];
  const dy = ["-5%", "15%", "18%", "30%", "32%", "48%", "50%", "55%", "58%", "45%", "45%", "50%", "50%", "50%"];
  const dScale = [0.5, 0.7, 0.7, 0.9, 0.9, 0.8, 0.8, 1.0, 1.0, 0.9, 0.9, 1.1, 1.0, 1.0];
  const dRotate = [15, -10, 0, -25, 10, 20, -5, -20, 15, 5, -15, -25, 10, 0];

  const mx = ["5%", "40%", "42%", "10%", "8%", "45%", "48%", "15%", "13%", "20%", "20%", "35%", "35%", "35%"];
  const my = ["-5%", "15%", "18%", "30%", "32%", "48%", "50%", "55%", "58%", "45%", "45%", "48%", "48%", "48%"];
  const mScale = [0.5, 0.6, 0.6, 0.75, 0.75, 0.7, 0.7, 0.85, 0.85, 0.8, 0.8, 0.95, 0.85, 0.85];
  const mRotate = [10, -5, 0, -15, 5, 15, -5, -15, 10, 5, -10, -15, 5, 0];

  const blipX = useTransform(maxScroll, phases, isMobile ? mx : dx);
  const blipY = useTransform(maxScroll, phases, isMobile ? my : dy);
  const blipScale = useTransform(maxScroll, phases, isMobile ? mScale : dScale);
  const blipRotate = useTransform(maxScroll, phases, isMobile ? mRotate : dRotate);

  // Flip Blip (rotateY 180) when flying/scanning to the LEFT
  const blipRotateY = useTransform(
    maxScroll, 
    [0, 0.16, 0.17, 0.31, 0.32, 0.46, 0.47, 0.61, 0.62, 1], 
    [0, 0,   180,  180,  0,    0,    180,  180,  0,    0]
  );

  // Scanner Cone mapped perfectly to the 4 scan phases
  const scannerOpacity = useTransform(
    maxScroll, 
    [0, 0.09, 0.10, 0.15, 0.16, 0.24, 0.25, 0.30, 0.31, 0.39, 0.40, 0.45, 0.46, 0.54, 0.55, 0.60, 0.61, 1], 
    [0, 0,    0.8,  0.8,  0,    0,    0.8,  0.8,  0,    0,    0.8,  0.8,  0,    0,    0.8,  0.8,  0,    0]
  );
  
  // Scanner sweeps up and down during the scan phases
  const scannerRotate = useTransform(
    maxScroll,
    [0, 0.10, 0.12, 0.15, 0.25, 0.27, 0.30, 0.40, 0.42, 0.45, 0.55, 0.57, 0.60, 1],
    [0, -20,  20,   -10,  -20,  20,   -10,  -20,  20,   -10,  -20,  20,   -10,  0]
  );
  
  const threadHeight = useTransform(maxScroll, [0, 0.5], ["0%", "100%"]);

  if (reduceMotion) {
    return (
      <section className="py-24 md:py-32 border-t-2 border-border bg-card/40">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <p className="signal-dash font-terminal text-base tracking-[0.2em] text-signal uppercase mb-4 justify-center">
            Finding the signal
          </p>
          <h2 className="font-terminal text-4xl sm:text-5xl tracking-wide text-balance">
            Most of a subreddit isn&apos;t about you. LeadGen reads all of it anyway, and hands you the part that is.
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[300vh] border-t-2 border-border" id="noise-to-signal">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0D14]">
        <div className="absolute inset-0 opacity-20 bg-[url('/hero/drift_bg.png')] bg-cover bg-center mix-blend-screen" style={{ imageRendering: "pixelated" }} />
        
        <motion.div 
          style={{ height: threadHeight }}
          className="absolute top-0 left-1/2 w-px bg-gradient-to-b from-signal/50 to-transparent -translate-x-1/2 z-0" 
        />

        <div className="container mx-auto max-w-7xl h-full px-6 relative z-10 flex flex-col justify-center">
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
            <div className="text-center mt-[-20vh]">
              <p className="font-terminal text-sm tracking-[0.2em] text-muted-foreground uppercase mb-6 bg-background/50 px-4 py-1 inline-block rounded-sm backdrop-blur-sm">
                The Conversation Cloud
              </p>
              <div className="relative h-20 w-[600px] max-w-[90vw] mx-auto flex items-center justify-center bg-background/40 backdrop-blur-sm p-4 rounded-sm border border-border/50">
                {LINES.map((line, idx) => (
                  <motion.h2
                    key={idx}
                    style={{ opacity: useTransform(maxScroll, line.range, line.output) }}
                    className="absolute inset-0 flex items-center justify-center font-terminal text-2xl sm:text-4xl tracking-wide text-balance text-foreground drop-shadow-md"
                  >
                    {line.text}
                  </motion.h2>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {NOISE.map((chip, idx) => (
              <NoiseCreature key={idx} {...chip} progress={maxScroll} />
            ))}

            {SIGNAL.map((chip, idx) => (
              <SignalCreature key={idx} {...chip} progress={maxScroll} />
            ))}

            <motion.div 
              style={{ x: blipX, y: blipY }}
              className="absolute inset-0 z-40 pointer-events-none"
            >
              <motion.div 
                style={{ scale: blipScale, rotate: blipRotate, rotateY: blipRotateY }}
                className="absolute top-0 left-0 w-[100px] origin-center -ml-[50px] -mt-[50px]"
              >
                <img 
                  src={`/hero/${blipSprite}`} 
                  alt="Blip" 
                  className="w-full pixelated drop-shadow-2xl transition-all duration-150" 
                />
                
                {/* Repositioned Scanner: higher up near the eye (top-24%) and originating perfectly */}
                <motion.div 
                  style={{ opacity: scannerOpacity, rotate: scannerRotate }}
                  className="absolute top-[24%] left-[60%] w-[250px] h-[150px] origin-left -translate-y-1/2"
                >
                  <div className="w-full h-full bg-gradient-to-r from-signal/40 to-transparent" 
                       style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)' }} />
                </motion.div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
