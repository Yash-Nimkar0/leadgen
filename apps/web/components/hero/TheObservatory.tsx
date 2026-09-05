"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { LeadExample } from "../LeadExample";

export function TheObservatory() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  
  const [isMobile, setIsMobile] = useState(false);
  const [blipSprite, setBlipSprite] = useState("blip_idle.png");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ----------------------------------------------------
  // TIMELINE MAPPING (200vh)
  // ----------------------------------------------------
  // 0.00 - 0.15 : Arrival from Scene 3
  // 0.15 - 0.35 : Blip/Orb descend & land
  // 0.35 - 0.50 : Terminal activates
  // 0.50 - 0.65 : Lead UI reveals
  // 0.65 - 0.85 : Hold & Read
  // 0.85 - 0.95 : Lead minimizes
  // 0.95 - 1.00 : Blip dives to Scene 5

  // Blip Logic
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.95) setBlipSprite("blip_idle.png");
    else if (latest > 0.60) setBlipSprite("blip_found.png"); // Presenting
    else if (latest > 0.30) setBlipSprite("blip_scan.png"); // Activating terminal
    else setBlipSprite("blip_idle.png"); // Descending
  });

  const blipY = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.85, 0.95, 1],
    ["-100vh", "-30vh", "0vh", "0vh", "10vh", "120vh"]
  );
  
  const blipX = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.85, 0.95, 1],
    ["-10vw", "-5vw", "0vw", "0vw", "0vw", "10vw"]
  );
  
  const blipScale = useTransform(
    scrollYProgress,
    [0, 0.35],
    [0.5, 1]
  );

  const blipRotate = useTransform(
    scrollYProgress,
    [0.30, 0.35, 0.60, 0.65, 0.95, 1],
    [0, 15, 15, 0, 0, 45]
  );

  // Orb Logic
  const orbY = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35],
    ["-100vh", "-20vh", "10vh"]
  );
  const orbScale = useTransform(scrollYProgress, [0, 0.35], [0.5, 1]);
  const orbOpacity = useTransform(scrollYProgress, [0.45, 0.55], [1, 0]);

  // Terminal Activation
  const terminalGlow = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);
  
  // Real UI Reveal
  const uiOpacity = useTransform(scrollYProgress, [0.50, 0.65, 0.85, 0.95], [0, 1, 1, 0]);
  const uiScale = useTransform(scrollYProgress, [0.50, 0.65, 0.85, 0.95], [0.5, 1, 1, 0.5]);
  const uiY = useTransform(scrollYProgress, [0.50, 0.65, 0.85, 0.95], ["10vh", "0vh", "0vh", "20vh"]);
  
  // Projection Beam
  const beamOpacity = useTransform(scrollYProgress, [0.50, 0.65, 0.85, 0.95], [0, 0.6, 0.6, 0]);

  if (reduceMotion) {
    return (
      <section className="py-24 border-t-2 border-border bg-[#0A0D14]" id="observatory">
        <div className="container mx-auto max-w-4xl px-6 flex flex-col items-center">
          <div className="w-32 mb-8">
            <img src="/hero/observatory_terminal.png" className="w-full h-auto pixelated" />
          </div>
          <div className="relative w-full max-w-[360px] sm:max-w-none scale-[0.85] sm:scale-100 origin-top overflow-x-hidden sm:overflow-visible flex justify-center">
            <div className="w-[360px] sm:w-full">
              <LeadExample />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-[200vh] bg-[#0A0D14]" id="observatory">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        
        {/* Z-0 Deep Space */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('/hero/drift_bg.png')] bg-cover bg-center mix-blend-screen pixelated pointer-events-none" />
        <motion.img 
          style={{ y: useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]) }}
          src="/hero/planet_large.png" 
          className="absolute top-[10%] right-[10%] w-[40vw] max-w-[400px] opacity-20 mix-blend-screen pixelated pointer-events-none" 
        />
        
        {/* Z-10 Midground Platforms */}
        <div className="absolute bottom-[-5vh] left-1/2 -translate-x-1/2 w-[90vw] max-w-[700px] z-10">
          <img src="/hero/observatory_platform.png" className="w-full h-auto object-contain pixelated drop-shadow-2xl" />
        </div>

        {/* Z-20 Terminal */}
        <div className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 w-[50vw] max-w-[280px] z-20">
          <img src="/hero/observatory_terminal.png" className="w-full h-auto object-contain pixelated drop-shadow-xl" />
          
          {/* Terminal Activation Glow */}
          <motion.div 
            style={{ opacity: terminalGlow }}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-signal/30 blur-xl mix-blend-screen rounded-full"
          />
        </div>

        {/* Z-25 Projection Beam */}
        <motion.div 
          className="absolute bottom-[20vh] left-1/2 -translate-x-1/2 w-[120vw] max-w-[800px] h-[45vh] bg-gradient-to-t from-signal/20 to-transparent mix-blend-screen pointer-events-none z-25 origin-bottom"
          style={{ clipPath: "polygon(10% 0%, 90% 0%, 55% 100%, 45% 100%)", opacity: beamOpacity }}
        />

        {/* Z-30 Actors (Blip & Orb) */}
        <motion.div 
          style={{ y: orbY, scale: orbScale, opacity: orbOpacity }}
          className="absolute bottom-[20vh] left-1/2 -translate-x-1/2 w-12 sm:w-16 h-12 sm:h-16 z-30"
        >
          <img src="/hero/signal_active.png" className="w-full h-full object-contain pixelated drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
        </motion.div>

        <motion.div 
          style={{ x: blipX, y: blipY, scale: blipScale, rotate: blipRotate }}
          className="absolute bottom-[25vh] left-[20vw] md:left-[35vw] w-20 sm:w-28 origin-center z-30"
        >
          <img src={`/hero/${blipSprite}`} className="w-full h-full object-contain pixelated drop-shadow-2xl transition-all duration-150 animate-pixel-bob" />
        </motion.div>

        {/* Z-40 Real Product Reveal (The Focal Point) */}
        <motion.div 
          style={{ opacity: uiOpacity, scale: uiScale, y: uiY }}
          className="absolute bottom-[22vh] left-1/2 -translate-x-1/2 w-[100vw] sm:w-[90vw] max-w-[800px] origin-bottom z-40 drop-shadow-2xl overflow-x-hidden sm:overflow-visible flex justify-center"
        >
          {/* We wrap LeadExample in a container that handles the visual projection framing, scaling it down on narrow devices to prevent overflow while maintaining readability */}
          <div className="relative w-[360px] sm:w-full scale-[0.85] sm:scale-100 origin-bottom">
            <LeadExample />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
