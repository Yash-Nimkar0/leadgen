with open("apps/web/components/hero/ActionScene.tsx", "w") as f:
    f.write('''"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export function ActionScene({ reducedMotion }: { reducedMotion: boolean | null }) {
  const blipControls = useAnimation();
  const scannerControls = useAnimation();
  const threadControls = useAnimation();
  
  const [blipState, setBlipState] = useState<"idle" | "scan" | "found">("idle");
  const [signalState, setSignalState] = useState<"idle" | "flicker" | "active">("idle");
  const [sequenceComplete, setSequenceComplete] = useState(false);

  useEffect(() => {
    // If reduced motion is preferred, jump straight to the resolved state
    if (reducedMotion) {
      setBlipState("idle"); 
      setSignalState("active");
      
      // Instantly set final positions
      const isMobile = window.innerWidth < 768;
      blipControls.set({ x: isMobile ? "20vw" : "55vw", y: isMobile ? "40vh" : "55vh", scale: 1, opacity: 1, rotate: 0 });
      threadControls.set({ height: "100vh", opacity: 0.8 });
      
      setSequenceComplete(true);
      return;
    }

    const runCinematic = async () => {
      const isMobile = window.innerWidth < 768;

      // 0. RESET (Hide elements initially)
      blipControls.set({ x: "80vw", y: "-20vh", scale: 0.3, opacity: 0 });
      scannerControls.set({ opacity: 0, scale: 0, rotate: -30 });
      threadControls.set({ height: "0vh", opacity: 0 });
      setSignalState("idle");
      setBlipState("idle");

      // SHOT 1 & 2: Establish & Arrival
      // Blip starts far away, then swoops into the midground
      await blipControls.start({ opacity: 1, transition: { duration: 0.5, delay: 0.5 } });
      
      await blipControls.start({
        x: isMobile ? "10vw" : "25vw",
        y: isMobile ? "20vh" : "30vh",
        scale: 1,
        rotate: [15, -5, 0], // banking into a hover
        transition: { duration: 2, ease: "circOut" }
      });

      // SHOT 3: Hover & Settle
      await new Promise((resolve) => setTimeout(resolve, 800));

      // SHOT 4: Search
      setBlipState("scan");
      await scannerControls.start({ 
        opacity: [0, 0.8, 0],
        scale: [0.5, 1.5, 0.5],
        rotate: [-20, 20],
        transition: { duration: 1.2, ease: "easeInOut" }
      });
      setBlipState("idle");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // SHOT 5: Notice
      // A distant point (the signal) behaves slightly differently
      setSignalState("flicker");
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Blip reacts visually (turns/hops)
      setBlipState("found");
      await blipControls.start({ 
        y: isMobile ? "18vh" : "28vh", 
        rotate: -10,
        transition: { duration: 0.3, type: "spring", bounce: 0.6 }
      });
      await new Promise((resolve) => setTimeout(resolve, 600));

      // SHOT 6: Approach
      // Blip flies toward that point
      setBlipState("idle"); // idle is his flying pose
      await blipControls.start({
        x: isMobile ? "25vw" : "55vw", // Next to the island
        y: isMobile ? "40vh" : "55vh",
        scale: 1.1, // Grows slightly as he crosses foreground
        rotate: [-20, 5, 0], // banks heavily then brakes
        transition: { duration: 1.2, ease: "easeInOut" }
      });

      // SHOT 7: Discovery Hint
      // Short visual payoff
      setSignalState("active");
      setBlipState("found"); // reacts to it lighting up
      await new Promise((resolve) => setTimeout(resolve, 600));

      // SHOT 8: Transition
      // A thread extends downward, suggesting more below, handing off to NoiseToSignal
      setBlipState("idle");
      threadControls.start({ height: "100vh", opacity: 0.8, transition: { duration: 1.5, ease: "circIn" } });
      
      // We leave Blip settled here in an ambient hover as part of the resolved hero composition
      setSequenceComplete(true);
    };

    runCinematic();
  }, [reducedMotion, blipControls, scannerControls, threadControls]);

  // Determine Blip's sprite based on state
  const getBlipSprite = () => {
    if (blipState === "scan") return "/hero/blip_scan.png";
    if (blipState === "found") return "/hero/blip_found.png";
    return "/hero/blip_idle.png";
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      
      {/* --- SIGNAL ISLAND (Anchored Bottom Right) --- */}
      <div className="absolute bottom-[5%] md:bottom-[15%] right-[5%] md:right-[15%] w-[250px] md:w-[350px]">
        {/* Island Base */}
        <img src="/hero/fragment_large.png" alt="" className="w-full pixelated drop-shadow-3xl" />
        
        {/* Signal Creature */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 md:w-32 z-10">
          <img 
            src={signalState === "active" ? "/hero/signal_active.png" : "/hero/signal_idle.png"} 
            alt="Signal" 
            className="w-full pixelated drop-shadow-xl transition-all duration-300"
            style={{ opacity: signalState === "flicker" ? 0.7 : 1 }}
          />
          {signalState === "active" && (
            <div className="absolute inset-0 bg-signal/30 blur-2xl rounded-full scale-[1.5] animate-pulse" />
          )}
          {signalState === "flicker" && (
            <div className="absolute inset-0 bg-signal/10 blur-xl rounded-full scale-[1.2] animate-pulse" />
          )}

          {/* --- TRANSITION THREAD --- */}
          {/* Drops from the signal down through the bottom of the hero to connect to NoiseToSignal */}
          <motion.div 
            animate={threadControls}
            initial={{ height: "0vh", opacity: 0 }}
            className="absolute top-full left-1/2 w-px bg-gradient-to-b from-signal to-transparent -translate-x-1/2 z-0 origin-top"
          />
        </div>
      </div>

      {/* --- BLIP ACTOR --- */}
      <motion.div 
        animate={blipControls}
        initial={{ x: "80vw", y: "-20vh", scale: 0.3, opacity: 0 }}
        className="absolute top-0 left-0 w-[100px] md:w-[130px] z-30"
        style={{ originX: 0.5, originY: 0.5 }}
      >
        {/* Idle Bobbing Animation when sequence completes */}
        <div className={`relative w-full ${sequenceComplete ? 'animate-[pixel-bob_3s_ease-in-out_infinite]' : ''}`}>
          <img 
            src={getBlipSprite()} 
            alt="Blip" 
            className="w-full pixelated drop-shadow-2xl" 
          />
          
          {/* Scanner Effect */}
          <motion.div 
            animate={scannerControls}
            initial={{ opacity: 0, scale: 0 }}
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
