"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TRUST_POINTS = [
  "Every score ships with the reasoning behind it, in plain English.",
  "Every lead links back to the original conversation — nothing is paraphrased away.",
  "You review and correct the model; it's built to be told when it's wrong.",
  "The context is yours — your product, your competitors, your definition of a fit.",
];

export function ZenithScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Subtle Background Parallax
  const planetY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  
  // Blip Timeline
  const blipY = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.50, 0.85, 1],
    ["-40vh", "-30vh", "0vh", "15vh", "15vh", "40vh"]
  );
  
  const blipOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 1],
    [0, 1, 1]
  );
  
  const blipScale = useTransform(
    scrollYProgress,
    [0, 0.50, 0.55, 1],
    [0.8, 0.8, 1, 1] // Tiny landing bounce
  );

  // Asteroid timeline (fades in slightly later than Blip's first appearance)
  const asteroidOpacity = useTransform(scrollYProgress, [0, 0.10], [0, 1]);
  
  // Text Reveal (slow, gentle fade)
  const textOpacity = useTransform(scrollYProgress, [0.45, 0.70], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.45, 0.70], ["20px", "0px"]);

  // Amber Glow Transition to Scene 9
  const amberOpacity = useTransform(scrollYProgress, [0.80, 1], [0, 1]);

  return (
    <section ref={containerRef} className="relative h-[200vh] w-full bg-[#0A0D14]" id="zenith">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* Deep Space Background */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('/hero/drift_bg.png')] bg-cover bg-center bg-no-repeat mix-blend-screen pixelated pointer-events-none" />
        
        {/* Distant Planet */}
        <motion.div 
          className="absolute top-[10%] right-[15%] w-[40vw] max-w-[500px] opacity-10 pointer-events-none"
          style={{ y: planetY }}
        >
          <img src="/hero/planet_large.png" className="w-full h-auto object-contain pixelated" />
        </motion.div>

        {/* Amber Glow Transition to Scene 9 */}
        <motion.div 
          className="absolute -bottom-[20vh] left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-amber-500/10 blur-[100px] pointer-events-none rounded-full"
          style={{ opacity: amberOpacity }}
        />
        <motion.div 
          className="absolute -bottom-[10vh] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-amber-500/20 blur-[80px] pointer-events-none rounded-full"
          style={{ opacity: amberOpacity }}
        />

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          
          {/* Left Side: The Solitary Asteroid & Blip */}
          <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end relative h-[40vh] md:h-full order-2 md:order-1">
            
            {/* Asteroid Base */}
            <motion.div 
              className="absolute w-[60%] max-w-[300px]"
              style={{ opacity: asteroidOpacity, top: "50%" }}
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <img src="/hero/fragment_large.png" className="w-full h-auto object-contain pixelated drop-shadow-2xl brightness-50 contrast-125" />
            </motion.div>

            {/* Blip Landing */}
            <motion.div 
              className="absolute w-[20%] max-w-[100px]"
              style={{ 
                y: blipY, 
                opacity: blipOpacity,
                scale: blipScale,
                left: "40%"
              }}
            >
              <motion.img 
                src="/hero/blip_idle.png" 
                className="w-full h-auto object-contain pixelated drop-shadow-2xl"
                animate={{ y: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
            </motion.div>
            
          </div>

          {/* Right Side: Trust Content */}
          <motion.div 
            className="w-full md:w-1/2 max-w-[500px] order-1 md:order-2 flex flex-col justify-center"
            style={{ opacity: textOpacity, y: textY }}
          >
            <p className="font-terminal text-[10px] sm:text-xs tracking-widest text-signal/70 uppercase mb-4 sm:mb-6">
              [ Why trust the score ]
            </p>
            <h2 className="font-terminal text-4xl sm:text-5xl lg:text-6xl tracking-wide text-balance text-foreground mb-12 sm:mb-16">
              Nothing is a black box.
            </h2>
            
            <div className="flex flex-col gap-6 sm:gap-8">
              {TRUST_POINTS.map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="font-terminal text-[10px] text-muted-foreground mt-1.5 opacity-50">
                    [0{i + 1}]
                  </span>
                  <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
