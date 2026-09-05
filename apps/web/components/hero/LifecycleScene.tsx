"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ScoreDial } from "../ScoreDial";
import { NoiseCreature } from "../pixel/NoiseCreature";

export function LifecycleScene() {
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
  // TIMELINE MAPPING (300vh)
  // ----------------------------------------------------
  const p = [0.0, 0.1, 0.2, 0.35, 0.45, 0.6, 0.7, 0.85, 0.95, 1.0];
  // 0: Scene starts
  // 1: Arrive S1 (0.1)
  // 2: Leave S1 (0.2)
  // 3: Arrive S2 (0.35)
  // 4: Leave S2 (0.45)
  // 5: Arrive S3 (0.60)
  // 6: Leave S3 (0.70)
  // 7: Fly offscreen right (0.85)

  // Track Y (Pans down through the 3 stations)
  const trackY = useTransform(scrollYProgress, p, [
    "0vh", 
    "0vh", "0vh",
    "-80vh", "-80vh",
    "-160vh", "-160vh",
    "-160vh", "-160vh", "-160vh"
  ]);
  
  // Parallax Background
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  // ----------------------------------------------------
  // BLIP & ORB MOVEMENT (Screen Coordinates)
  // ----------------------------------------------------
  const s1X = isMobile ? 30 : 40;
  const s2X = isMobile ? 60 : 65;
  const s3X = isMobile ? 40 : 45;

  const blipX = useTransform(scrollYProgress, p, [
    `${s1X}vw`, 
    `${s1X}vw`, `${s1X}vw`,
    `${s2X}vw`, `${s2X}vw`,
    `${s3X}vw`, `${s3X}vw`,
    "120vw", "120vw", "120vw"
  ]);

  const blipY = useTransform(scrollYProgress, p, [
    "-20vh", 
    "35vh", "28vh",
    "35vh", "28vh",
    "35vh", "28vh",
    "28vh", "28vh", "28vh"
  ]);
  
  const blipScale = useTransform(scrollYProgress, p, [0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.7) setBlipSprite("blip_idle.png"); // Flying away
    else if (latest > 0.6 && latest < 0.7) setBlipSprite("blip_found.png"); // Deposited
    else if (latest > 0.35 && latest < 0.45) setBlipSprite("blip_scan.png"); // Handing to analyst
    else if (latest > 0.1 && latest < 0.2) setBlipSprite("blip_scan.png"); // Placing in receiver
    else setBlipSprite("blip_idle.png");
  });

  // ----------------------------------------------------
  // ORB LOGIC (Now distributed to the world to prevent floating)
  // ----------------------------------------------------
  // The global orb is ONLY visible when Blip is traveling.
  const globalOrbOpacity = useTransform(scrollYProgress, 
    [0.0, 0.1, 0.11, 0.19, 0.20, 0.35, 0.36, 0.44, 0.45, 0.6, 0.61], 
    [1,   1,   0,    0,    1,    1,    0,    0,    1,    1,   0]
  );
  
  // Local orbs at stations (visible when Blip is paused there)
  const s1OrbOpacity = useTransform(scrollYProgress, [0.1, 0.11, 0.19, 0.2], [0, 1, 1, 0]);
  const s2OrbOpacity = useTransform(scrollYProgress, [0.35, 0.36, 0.44, 0.45], [0, 1, 1, 0]);
  // S3 orb stays permanently after drop
  const s3OrbOpacity = useTransform(scrollYProgress, [0.6, 0.61], [0, 1]);

  // ----------------------------------------------------
  // STATION EFFECTS
  // ----------------------------------------------------
  const s1PingOpacity = useTransform(scrollYProgress, [0.10, 0.15, 0.20], [0, 1, 0]);
  
  const s2HoloOpacity = useTransform(scrollYProgress, [0.35, 0.40, 0.45], [0, 1, 0]);
  const s2HoloScale = useTransform(scrollYProgress, [0.35, 0.40], [0, 1]);

  const s3UiScale = useTransform(scrollYProgress, [0.61, 0.65], [0, 1]);

  if (reduceMotion) {
    return (
      <section className="py-24 border-t-2 border-border bg-[#0A0D14]">
        <div className="container mx-auto text-center px-6">
          <h2 className="font-terminal text-3xl mb-4">The Lead Lifecycle</h2>
          <p>Detected. Understood. Actionable.</p>
        </div>
      </section>
    );
  }

  const mSize = "h-[clamp(140px,25vh,300px)]";
  const mPlat = "w-[clamp(200px,40vw,400px)]";

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#0A0D14]" id="lifecycle">
      <div className="sticky top-0 h-screen overflow-hidden">
        
        {/* Z-0 Deep Space Parallax */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-[150%] opacity-[0.08] bg-[url('/hero/drift_bg.png')] bg-cover bg-center bg-no-repeat mix-blend-screen pixelated pointer-events-none" />
        
        {/* Z-10 TRACK CONTAINER */}
        <motion.div style={{ y: trackY }} className="absolute inset-0 w-full h-full pointer-events-none">
          
          {/* ============================================================== */}
          {/* STATION 1: DETECTED */}
          {/* ============================================================== */}
          <div className="absolute top-[40vh] z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2" style={{ left: `${s1X}vw` }}>
            
            <div className={`relative ${mSize}`}>
              <img src="/hero/station_receiver.png" className="w-auto h-full object-contain pixelated drop-shadow-xl" />
              
              {/* Local Orb */}
              <motion.div style={{ opacity: s1OrbOpacity }} className="absolute top-[15%] left-[42%] w-10 h-10">
                <img src="/hero/signal_active.png" className="w-full h-full object-contain pixelated" />
              </motion.div>

              <motion.div 
                style={{ opacity: s1PingOpacity }}
                className="absolute top-[10%] left-[45%] w-12 h-12 bg-signal/60 rounded-full blur-xl mix-blend-screen"
              />
            </div>
            
            {/* Raw Text (No SaaS cards) */}
            <div className="absolute top-1/3 left-[110%] w-48 text-left">
              <p className="font-terminal text-signal tracking-widest text-sm uppercase mb-1">[ Detected ]</p>
              <p className="text-muted-foreground text-xs font-pixel leading-relaxed">Signal identified from the noise.</p>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STATION 2: UNDERSTOOD */}
          {/* ============================================================== */}
          <div className="absolute top-[120vh] z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2" style={{ left: `${s2X}vw` }}>
            
            <div className="absolute top-[20%] right-[110%] w-52 text-right">
              <p className="font-terminal text-[#a855f7] tracking-widest text-sm uppercase mb-1">[ Understood ]</p>
              <p className="text-muted-foreground text-xs font-pixel leading-relaxed">Context turns mention into intent.</p>
            </div>

            <div className={`relative ${mPlat}`}>
              {/* Desk Setup */}
              <img src="/hero/observatory_platform.png" className="w-full h-auto object-contain pixelated drop-shadow-xl scale-x-[-1] brightness-75" />
              <img src="/hero/observatory_terminal.png" className="absolute bottom-[20%] right-[15%] w-[40%] h-auto object-contain pixelated drop-shadow-lg scale-x-[-1]" />
              
              <div className="absolute bottom-[35%] right-[40%] origin-bottom scale-75">
                <NoiseCreature variant={3} scale="hero" />
              </div>

              {/* Local Orb */}
              <motion.div style={{ opacity: s2OrbOpacity }} className="absolute bottom-[40%] right-[25%] w-10 h-10">
                <img src="/hero/signal_active.png" className="w-full h-full object-contain pixelated" />
              </motion.div>

              {/* Pixel Hologram (Not SaaS spinner) */}
              <motion.div 
                style={{ opacity: s2HoloOpacity, scale: s2HoloScale }}
                className="absolute bottom-[55%] right-[20%] origin-bottom flex flex-col gap-1.5 opacity-80"
              >
                <div className="h-1.5 w-10 bg-[#a855f7] rounded-sm" />
                <div className="h-1.5 w-6 bg-[#a855f7] rounded-sm" />
                <div className="h-1.5 w-12 bg-[#a855f7] rounded-sm" />
              </motion.div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STATION 3: ACTIONABLE */}
          {/* ============================================================== */}
          <div className="absolute top-[200vh] z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2" style={{ left: `${s3X}vw` }}>
            
            <div className={`relative ${mPlat}`}>
              <img src="/hero/observatory_platform.png" className="w-full h-auto object-contain pixelated drop-shadow-xl" />
              <img src="/hero/chute_glow.png" className="absolute bottom-[20%] left-[25%] w-[30%] h-auto object-contain pixelated drop-shadow-lg" />
              
              {/* Local Orb */}
              <motion.div style={{ opacity: s3OrbOpacity }} className="absolute bottom-[35%] left-[33%] w-10 h-10">
                <img src="/hero/signal_active.png" className="w-full h-full object-contain pixelated" />
              </motion.div>
              
              {/* Physical Notification Payoff */}
              <motion.div 
                style={{ scale: s3UiScale }}
                className="absolute bottom-[60%] left-[10%] origin-bottom-left pixel-frame bg-background/95 border-2 border-signal p-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                <p className="font-terminal text-signal uppercase text-[11px] tracking-widest mb-1">[ Actionable ]</p>
                <p className="font-pixel text-foreground text-[10px]">Lead Ready</p>
              </motion.div>
            </div>
            
            <div className="absolute top-[200vh] right-[10vw] z-0 opacity-40">
              <img src="/hero/machine_scanner.png" className="w-[30vw] max-w-[200px] h-auto object-contain pixelated brightness-50" />
            </div>
          </div>

        </motion.div>

        {/* ============================================================== */}
        {/* GLOBAL ACTORS */}
        {/* ============================================================== */}
        
        {/* Global Orb (Visible only during travel) */}
        <motion.div 
          style={{ x: blipX, y: blipY, opacity: globalOrbOpacity }}
          className="absolute w-8 sm:w-10 h-8 sm:h-10 mt-6 sm:mt-8 ml-4 sm:ml-6 origin-center z-30 pointer-events-none"
        >
          <img src="/hero/signal_active.png" className="w-full h-full object-contain pixelated drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
        </motion.div>

        {/* Blip */}
        <motion.div 
          style={{ x: blipX, y: blipY, scale: blipScale }}
          className="absolute w-20 sm:w-28 -ml-10 sm:-ml-14 -mt-10 sm:-mt-14 origin-center z-40 pointer-events-none"
        >
          <img src={`/hero/${blipSprite}`} className="w-full h-full object-contain pixelated drop-shadow-2xl transition-all duration-150 animate-pixel-bob" />
        </motion.div>

      </div>
    </section>
  );
}
