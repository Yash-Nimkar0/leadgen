"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/Button";
import { ArrowRight } from "lucide-react";

export function OutpostScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 0.00-0.20 Outpost Emerges
  const outpostOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const outpostY = useTransform(scrollYProgress, [0, 0.2], ["20vh", "0vh"]);

  // 0.20-0.45 Blip Landing
  const blipY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.45, 1],
    ["-50vh", "-50vh", "0vh", "0vh"]
  );
  const blipOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.3, 1],
    [0, 0, 1, 1]
  );
  const blipScale = useTransform(scrollYProgress, [0, 0.24, 0.25, 0.28, 1], [0.5, 0.8, 1.1, 1, 1]);

  // 0.40-0.65 Gate Activation (Warm Lights)
  const gateLightOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);
  
  // 0.50-0.70 Text & CTA Reveal
  const textOpacity = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.35, 0.45], ["20px", "0px"]);

  return (
    <section ref={containerRef} className="relative h-[300vh] w-full bg-[#0A0D14]" id="outpost">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* Deep Space Constellation Background */}
        <div className="absolute inset-0 opacity-[0.1] bg-[url('/hero/drift_bg.png')] bg-cover bg-center bg-no-repeat mix-blend-screen pixelated pointer-events-none" />
        
        {/* Faint network representing the Drift */}
        <motion.div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ opacity: outpostOpacity }}
        >
          {/* Subtle constellation nodes */}
          <div className="absolute top-[20%] left-[25%] w-1 h-1 bg-white/40 rounded-full" />
          <div className="absolute top-[15%] left-[45%] w-1.5 h-1.5 bg-amber-200/50 rounded-full blur-[1px]" />
          <div className="absolute top-[35%] left-[65%] w-1 h-1 bg-white/40 rounded-full" />
          <div className="absolute top-[25%] left-[80%] w-2 h-2 bg-signal/30 rounded-full blur-[2px]" />
          
          {/* Connecting dashed lines */}
          <svg className="absolute inset-0 w-full h-full" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4">
            <line x1="25%" y1="20%" x2="45%" y2="15%" />
            <line x1="45%" y1="15%" x2="65%" y2="35%" />
            <line x1="65%" y1="35%" x2="80%" y2="25%" />
          </svg>
        </motion.div>

        {/* Content & Outpost Container */}
        <div className="relative z-10 w-full h-full flex flex-col items-center">
          
          {/* Headline & Copy */}
          <motion.div 
            className="absolute top-[15vh] sm:top-[20vh] text-center w-full max-w-4xl px-6 pointer-events-auto z-40"
            style={{ opacity: textOpacity, y: textY }}
          >
            <h2 className="font-terminal text-4xl sm:text-6xl md:text-7xl tracking-wide leading-[1.08] text-balance mb-6 text-foreground drop-shadow-2xl">
              The next customer might already be typing.
            </h2>
            <p className="font-terminal text-lg sm:text-2xl text-muted-foreground drop-shadow-md max-w-xl mx-auto">
              Go find them before someone else replies.
            </p>
          </motion.div>

          {/* The Outpost Environment */}
          <motion.div 
            className="absolute bottom-[5vh] w-full max-w-[800px] flex justify-center items-end h-[40vh] sm:h-[50vh] pointer-events-none"
            style={{ opacity: outpostOpacity, y: outpostY }}
          >
            {/* Platform (Base) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] sm:w-full max-w-[600px]">
              <img src="/hero/observatory_platform.png" className="w-full h-auto object-contain pixelated drop-shadow-2xl" />
              
            </div>

            {/* Terminal (The Gate) */}
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[250px] sm:w-[300px] flex flex-col items-center">
              <img src="/hero/observatory_terminal.png" className="w-full h-auto object-contain pixelated relative z-10" />
              
              {/* Amber Light Activation */}
              <motion.div 
                className="absolute inset-0 bg-amber-500/20 blur-[40px] z-0"
                style={{ opacity: gateLightOpacity }}
              />
              <motion.div 
                className="absolute top-[20%] left-1/2 -translate-x-1/2 w-20 h-16 bg-amber-500/30 blur-[20px] z-20"
                style={{ opacity: gateLightOpacity }}
              />

              {/* Physical CTA Button embedded on the Terminal */}
              <motion.div 
                className="absolute top-[35%] left-1/2 -translate-x-1/2 z-40 scale-[1.1] sm:scale-125 md:scale-150 transform origin-top pointer-events-auto"
                style={{ opacity: textOpacity, y: textY }}
              >
                <div className="group block relative">
                  {/* Physical Gate Frame */}
                  <div className="absolute -inset-1.5 bg-amber-950/80 border border-amber-500/30 shadow-[inset_0_0_10px_rgba(245,158,11,0.2),0_0_20px_rgba(245,158,11,0.3)] rounded-sm z-0 pointer-events-none" />
                  <a href="/register" className={buttonVariants({ size: "lg", className: "relative z-10 bg-[#0A0D14] border border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black hover:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D14] transition-all font-terminal uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_25px_#f59e0b]" })}>
                    [ Start scanning
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    ]
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Blip arriving home */}
            <motion.div 
              className="absolute bottom-[25%] right-[10%] sm:right-[15%] w-[80px] sm:w-[100px] z-20"
              style={{ y: blipY, scale: blipScale, opacity: blipOpacity }}
            >
              <motion.img 
                src="/hero/blip_idle.png" 
                className="w-full h-auto object-contain pixelated drop-shadow-xl"
                animate={{ y: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
