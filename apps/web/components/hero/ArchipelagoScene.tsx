"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { PixelSprite } from "../pixel/PixelSprite";
import { NOISE_1, NOISE_2, NOISE_3, NOISE_4, NOISE_PALETTE } from "../pixel/sprites";

export function ArchipelagoScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // World horizontal track (Camera)
  // Maps 0-1 vertical scroll to 0 to -280vw horizontal scroll
  const trackX = useTransform(scrollYProgress, [0, 1], ["0vw", "-600vw"]);
  
  // Distant Background Parallax
  const bgX = useTransform(scrollYProgress, [0, 1], ["0vw", "-100vw"]);
  
  // Foreground Debris Parallax
  const fgX = useTransform(scrollYProgress, [0, 1], ["0vw", "-600vw"]);

  // Blip's World Position
  const blipX = useTransform(
    scrollYProgress,
    [0, 0.12, 0.30, 0.40, 0.48, 0.65, 0.70, 0.78, 0.95, 1],
    ["10vw", "55vw", "55vw", "100vw", "155vw", "155vw", "220vw", "345vw", "345vw", "500vw"]
  );
  
  const blipY = useTransform(
    scrollYProgress,
    [0, 0.12, 0.30, 0.40, 0.48, 0.65, 0.70, 0.78, 0.95, 1],
    ["0vh", "-15vh", "-15vh", "-5vh", "5vh", "5vh", "20vh", "-10vh", "-10vh", "-30vh"]
  );

  const blipScale = useTransform(
    scrollYProgress,
    [0, 0.12, 0.30, 0.40, 0.48, 0.65, 0.70, 0.78, 0.95, 1],
    [1, 1, 1, 1, 1, 1, 1.5, 1, 1, 0.5] // Flies close to camera during agency fly-by (0.7)
  );

  // Blip Sprite State
  const [blipSprite, setBlipSprite] = useState("blip_idle.png");
  
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.12 && v < 0.3) setBlipSprite("blip_scan.png"); // Inspecting SaaS
    else if (v > 0.48 && v < 0.65) setBlipSprite("blip_found.png"); // Landed on Real Estate
    else if (v > 0.78 && v < 0.95) setBlipSprite("blip_scan.png"); // Circling Consultants
    else setBlipSprite("blip_idle.png"); // Traveling
  });

  return (
    <section ref={containerRef} className="relative h-[400vh] w-full bg-[#0A0D14]" id="archipelago">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        
        {/* Deep Space Background */}
        <div className="absolute inset-0 opacity-[0.1] bg-[url('/hero/drift_bg.png')] bg-cover bg-center bg-no-repeat mix-blend-screen pixelated pointer-events-none" />
        
        {/* Parallax Distant Layer */}
        <motion.div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40" style={{ x: bgX }}>
          <img src="/hero/fragment_small.png" className="absolute top-[20%] left-[60vw] w-[10vw] object-contain pixelated blur-[2px]" />
          <img src="/hero/fragment_large.png" className="absolute top-[70%] left-[120vw] w-[20vw] object-contain pixelated blur-[3px]" />
          <img src="/hero/planet_large.png" className="absolute top-[10%] left-[200vw] w-[30vw] object-contain pixelated opacity-50" />
        </motion.div>

        {/* --- MAIN CAMERA TRACK --- */}
        <motion.div className="absolute top-0 left-0 w-full h-full flex items-center" style={{ x: trackX }}>
          
          {/* Transition Guide from Scene 6 */}
          <div className="absolute left-[5vw] top-[20%] text-signal/50 font-terminal text-[10px] tracking-widest uppercase">
            [ Entering open space ]
          </div>

          {/* ISLAND 1: SaaS */}
          <div className="absolute left-[50vw] top-[50%] -translate-y-1/2 w-[30vw] min-w-[300px] flex flex-col items-center">
            {/* The Island */}
            <div className="relative w-full aspect-square flex items-center justify-center">
              <img src="/hero/fragment_large.png" className="absolute w-[80%] h-auto bottom-0 pixelated brightness-75 drop-shadow-2xl" />
              <img src="/hero/observatory_terminal.png" className="absolute w-[60%] h-auto bottom-[20%] pixelated drop-shadow-xl" />
              {/* Green Pulse Signal */}
              <motion.div 
                className="absolute w-4 h-4 bg-signal rounded-full blur-md"
                style={{ top: "30%", left: "45%" }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              {/* Character: Builder */}
              <div className="absolute bottom-[35%] left-[25%] w-8 h-8">
                <PixelSprite rows={NOISE_1} palette={NOISE_PALETTE} className="w-full h-full" title="Builder" />
              </div>
            </div>
            {/* Diegetic Label */}
            <div className="mt-4 text-center">
              <p className="font-terminal text-[10px] tracking-widest text-muted-foreground uppercase mb-1">[ VERTICAL: SAAS ]</p>
              <p className="font-pixel text-xs text-foreground/80 leading-relaxed max-w-[200px]">"Our helpdesk is breaking down."</p>
            </div>
          </div>

          {/* ISLAND 2: Real Estate */}
          <div className="absolute left-[150vw] top-[40%] -translate-y-1/2 w-[30vw] min-w-[300px] flex flex-col items-center">
            {/* The Island */}
            <div className="relative w-full aspect-square flex flex-col items-center justify-end pb-20">
              <img src="/hero/observatory_platform.png" className="absolute w-[80%] h-auto bottom-0 pixelated drop-shadow-2xl" />
              
              {/* CSS Composited Skyline (since we couldn't generate the asset) */}
              <div className="absolute bottom-[25%] flex items-end justify-center gap-1 opacity-80">
                <div className="w-6 h-32 bg-[#1A2530] border-t-2 border-r-2 border-[#2E3A44] pixelated overflow-hidden relative">
                  <div className="absolute top-2 left-1 w-1 h-20 border-l border-dashed border-signal/20" />
                </div>
                <div className="w-10 h-20 bg-[#212E3B] border-t-2 border-r-2 border-[#3A4854] pixelated relative">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-signal/50" />
                </div>
                <div className="w-8 h-40 bg-[#141C24] border-t-2 border-l-2 border-[#2E3A44] pixelated relative">
                  <div className="absolute -top-4 left-4 w-0.5 h-4 bg-muted-foreground" />
                </div>
              </div>

              {/* Character: Buyer */}
              <div className="absolute bottom-[20%] right-[30%] w-8 h-8">
                <PixelSprite rows={NOISE_2} palette={NOISE_PALETTE} className="w-full h-full" title="Buyer" />
              </div>
              
              {/* Beacon Signal */}
              <motion.img 
                src="/hero/signal_idle.png" 
                className="absolute bottom-[20%] left-[30%] w-10 h-10 pixelated"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            </div>
            {/* Diegetic Label */}
            <div className="mt-4 text-center">
              <p className="font-terminal text-[10px] tracking-widest text-muted-foreground uppercase mb-1">[ VERTICAL: REAL ESTATE ]</p>
              <p className="font-pixel text-xs text-foreground/80 leading-relaxed max-w-[200px]">"Looking for a 2BHK near the new metro..."</p>
            </div>
          </div>

          {/* ISLAND 3: Agencies */}
          <div className="absolute left-[250vw] top-[55%] -translate-y-1/2 w-[30vw] min-w-[300px] flex flex-col items-center">
            {/* The Island */}
            <div className="relative w-full aspect-square flex items-center justify-center">
              <img src="/hero/fragment_small.png" className="absolute w-[60%] h-auto bottom-[10%] pixelated drop-shadow-2xl brightness-50" />
              <img src="/hero/factory_conveyor.png" className="absolute w-[90%] h-auto bottom-[30%] pixelated drop-shadow-xl origin-center -rotate-12" />
              
              {/* Character: Frustrated Client */}
              <div className="absolute bottom-[40%] right-[40%] w-8 h-8">
                <PixelSprite rows={NOISE_3} palette={NOISE_PALETTE} className="w-full h-full" title="Client" />
              </div>
              
              {/* Flare Signal */}
              <motion.div 
                className="absolute bottom-[50%] left-[20%] w-12 h-12"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <img src="/hero/chute_glow.png" className="w-full h-full object-contain pixelated" />
              </motion.div>
            </div>
            {/* Diegetic Label */}
            <div className="mt-4 text-center">
              <p className="font-terminal text-[10px] tracking-widest text-muted-foreground uppercase mb-1">[ VERTICAL: AGENCIES ]</p>
              <p className="font-pixel text-xs text-foreground/80 leading-relaxed max-w-[200px]">"Our current agency missed another deadline..."</p>
            </div>
          </div>

          {/* ISLAND 4: Consultants */}
          <div className="absolute left-[350vw] top-[50%] -translate-y-1/2 w-[30vw] min-w-[300px] flex flex-col items-center">
            {/* The Island */}
            <div className="relative w-full aspect-square flex flex-col items-center justify-end pb-20">
              <img src="/hero/fragment_large.png" className="absolute w-[90%] h-auto bottom-0 pixelated drop-shadow-2xl" />
              <img src="/hero/machine_scanner.png" className="absolute w-[70%] h-auto bottom-[20%] pixelated drop-shadow-xl" />
              
              {/* Character: Analyst (Bouncing/Reacting) */}
              <motion.div 
                className="absolute bottom-[25%] left-[25%] w-8 h-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, ease: "easeOut" }}
              >
                <PixelSprite rows={NOISE_4} palette={NOISE_PALETTE} className="w-full h-full" title="Analyst" />
              </motion.div>

              {/* Lock-on Signal */}
              <div className="absolute bottom-[60%] right-[30%] w-3 h-3 bg-signal rounded-full shadow-[0_0_15px_#22c55e] animate-ping" />
            </div>
            {/* Diegetic Label */}
            <div className="mt-4 text-center">
              <p className="font-terminal text-[10px] tracking-widest text-muted-foreground uppercase mb-1">[ VERTICAL: CONSULTANTS ]</p>
              <p className="font-pixel text-xs text-foreground/80 leading-relaxed max-w-[200px]">"How do we fix our onboarding funnel?"</p>
            </div>
          </div>

          {/* --- BLIP (The Explorer) --- */}
          <motion.div 
            className="absolute z-50 flex items-center justify-center w-[15vw] min-w-[120px]"
            style={{ 
              left: blipX, 
              top: "50%",
              y: blipY,
              scale: blipScale,
            }}
          >
            <motion.img 
              src={`/hero/${blipSprite}`} 
              className="w-full h-auto object-contain pixelated drop-shadow-2xl"
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
          </motion.div>

        </motion.div>

        {/* Foreground Debris Parallax */}
        <motion.div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 opacity-60" style={{ x: fgX }}>
          <img src="/hero/fragment_small.png" className="absolute top-[80%] left-[80vw] w-[5vw] object-contain pixelated blur-[1px]" />
          <img src="/hero/fragment_large.png" className="absolute top-[15%] left-[220vw] w-[12vw] object-contain pixelated blur-[2px]" />
          <img src="/hero/fragment_small.png" className="absolute top-[60%] left-[320vw] w-[8vw] object-contain pixelated blur-[1px]" />
        </motion.div>
        
        {/* Transition Out to Scene 8 */}
        <motion.div 
          className="absolute inset-0 bg-[#0A0D14] pointer-events-none z-50"
          style={{ opacity: useTransform(scrollYProgress, [0.95, 1], [0, 1]) }}
        />
      </div>
    </section>
  );
}
