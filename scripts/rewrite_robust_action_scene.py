with open("apps/web/components/hero/ActionScene.tsx", "w") as f:
    f.write('''"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ActionScene({ reducedMotion }: { reducedMotion: boolean | null }) {
  const [phase, setPhase] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Wait until hydration completes
    if (reducedMotion === null) return;
    
    if (reducedMotion) {
      setPhase(8);
      return;
    }

    let isMounted = true;
    
    // Declarative timeline to completely avoid StrictMode async mutation bugs
    const timeline = [
      { p: 1, time: 500 },  // Arrival
      { p: 2, time: 2500 }, // Hover
      { p: 3, time: 3300 }, // Search
      { p: 4, time: 4800 }, // Notice (Signal flickers)
      { p: 5, time: 5800 }, // Approach (Swoops to signal)
      { p: 6, time: 7000 }, // Discovery (Signal pops)
      { p: 7, time: 7600 }, // Transition (Thread drops)
      { p: 8, time: 9000 }  // Complete (Ambient Bob)
    ];

    const timeouts = timeline.map(({ p, time }) => 
      setTimeout(() => { if (isMounted) setPhase(p); }, time)
    );

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [reducedMotion]);

  // Derived states from phase
  const getBlipSprite = () => {
    if (phase === 3) return "/hero/blip_scan.png";
    if (phase === 4 || phase === 6) return "/hero/blip_found.png";
    return "/hero/blip_idle.png";
  };

  const getSignalState = () => {
    if (phase >= 6) return "active";
    if (phase === 4 || phase === 5) return "flicker";
    return "idle";
  };

  // ------------------------------------------
  // Declarative Animation Targets for Blip
  // ------------------------------------------
  let blipX = "80vw";
  let blipY = "-20vh";
  let blipScale = 0.3;
  let blipOpacity = 0;
  let blipRotate = 0;

  if (phase >= 1) blipOpacity = 1;

  if (phase === 1) {
    blipX = isMobile ? "10vw" : "25vw";
    blipY = isMobile ? "20vh" : "30vh";
    blipScale = 1;
    blipRotate = -5; // banks in
  } else if (phase >= 2 && phase <= 4) {
    blipX = isMobile ? "10vw" : "25vw";
    blipY = isMobile ? "20vh" : "30vh";
    blipScale = 1;
    blipRotate = phase === 4 ? -10 : 0; // hops/looks at signal in phase 4
  } else if (phase >= 5) {
    blipX = isMobile ? "25vw" : "55vw"; // next to the island
    blipY = isMobile ? "40vh" : "55vh";
    blipScale = 1.1;
    blipRotate = phase === 5 ? 5 : 0; // banks during approach, levels out
  }

  // ------------------------------------------
  // Declarative Animation Targets for Scanner
  // ------------------------------------------
  let scannerOpacity = 0;
  let scannerScale = 0;
  let scannerRotate = -30;

  if (phase === 3) {
    scannerOpacity = 0.8;
    scannerScale = 1.5;
    scannerRotate = 20;
  }

  // ------------------------------------------
  // Declarative Animation Targets for Thread
  // ------------------------------------------
  let threadScaleY = 0;
  let threadOpacity = 0;

  if (phase >= 7) {
    threadScaleY = 1;
    threadOpacity = 0.8;
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      
      {/* --- SIGNAL ISLAND (Anchored Bottom Right) --- */}
      <div className="absolute bottom-[5%] md:bottom-[15%] right-[5%] md:right-[15%] w-[250px] md:w-[350px]">
        {/* Island Base */}
        <img src="/hero/fragment_large.png" alt="" className="w-full pixelated drop-shadow-3xl" />
        
        {/* Signal Creature */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 md:w-32 z-10">
          <img 
            src={getSignalState() === "active" ? "/hero/signal_active.png" : "/hero/signal_idle.png"} 
            alt="Signal" 
            className="w-full pixelated drop-shadow-xl transition-all duration-300"
            style={{ opacity: getSignalState() === "flicker" ? 0.7 : 1 }}
          />
          {getSignalState() === "active" && (
            <div className="absolute inset-0 bg-signal/30 blur-2xl rounded-full scale-[1.5] animate-pulse" />
          )}
          {getSignalState() === "flicker" && (
            <div className="absolute inset-0 bg-signal/10 blur-xl rounded-full scale-[1.2] animate-pulse" />
          )}

          {/* --- TRANSITION THREAD --- */}
          <motion.div 
            animate={{ scaleY: threadScaleY, opacity: threadOpacity }}
            transition={{ duration: 1.5, ease: "circIn" }}
            className="absolute top-full left-1/2 w-px h-[100vh] bg-gradient-to-b from-signal to-transparent -translate-x-1/2 z-0 origin-top"
          />
        </div>
      </div>

      {/* --- BLIP ACTOR --- */}
      <motion.div 
        animate={{ x: blipX, y: blipY, scale: blipScale, opacity: blipOpacity, rotate: blipRotate }}
        transition={{ 
          duration: phase === 1 ? 2 : phase === 5 ? 1.2 : 0.5,
          ease: phase === 1 ? "circOut" : "easeInOut"
        }}
        className="absolute top-0 left-0 w-[100px] md:w-[130px] z-30"
        style={{ originX: 0.5, originY: 0.5 }}
      >
        {/* Idle Bobbing Animation when sequence completes */}
        <div className={`relative w-full ${phase === 8 ? 'animate-pixel-bob' : ''}`}>
          <img 
            src={getBlipSprite()} 
            alt="Blip" 
            className="w-full pixelated drop-shadow-2xl" 
          />
          
          {/* Scanner Effect */}
          <motion.div 
            animate={{ opacity: scannerOpacity, scale: scannerScale, rotate: scannerRotate }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute top-[24%] left-[60%] w-[200px] h-[100px] origin-left -translate-y-1/2"
          >
            <div className="w-full h-full bg-gradient-to-r from-signal/60 to-transparent" 
                 style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)' }} />
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
}
''')
print("Rewrote ActionScene")
