"use client";

import { Logo } from "../Logo";
import { motion } from "framer-motion";

export function EdgeOfTheWorld() {
  return (
    <footer className="relative min-h-[50vh] w-full bg-[#0A0D14] flex flex-col justify-between overflow-hidden" id="footer">
      
      {/* Deep Space Background */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url('/hero/drift_bg.png')] bg-cover bg-center bg-no-repeat mix-blend-screen pixelated pointer-events-none" />

            {/* Top Section: The Void & Lonely Rock */}
      <div className="relative w-full flex flex-col items-center justify-center flex-1 pt-12">
        {/* The Rock */}
        <div className="relative w-[50%] max-w-[220px] flex justify-center items-end">
          <img 
            src="/hero/fragment_small.png" 
            className="w-full h-auto object-contain pixelated brightness-75 drop-shadow-2xl" 
            alt="Lonely asteroid"
          />
          
          {/* Transmission Light (Heartbeat) */}
          <motion.div 
            className="absolute top-[50%] right-[30%] w-1.5 h-1.5 bg-red-500/80 rounded-full blur-[1px] shadow-[0_0_10px_rgba(239,68,68,0.8)]"
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />

          {/* Blip Resting */}
          <motion.div 
            className="absolute bottom-[30%] right-[40%] w-[30%] max-w-[60px] z-20"
            animate={{ y: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          >
            <img 
              src="/hero/blip_idle.png" 
              className="w-full h-auto object-contain pixelated drop-shadow-xl" 
              alt="Blip resting"
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom Section: Semantic Footer Content */}
      <div className="relative z-10 w-full mt-24">
        <div className="container mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
          <Logo className="text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
          <p className="font-terminal text-sm sm:text-base text-muted-foreground/40">
            &copy; {new Date().getFullYear()} LeadGen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
