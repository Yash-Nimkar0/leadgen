"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";

export function SignalFactory() {
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
  // TIMELINE MAPPING
  // ----------------------------------------------------
  const p = [
    0.00, // 0 Start
    0.10, // 1 Arrive Scanner
    0.15, // 2 Leave Scanner
    0.25, // 3 Arrive Meter
    0.35, // 4 Leave Meter
    0.45, // 5 Arrive Refinery
    0.60, // 6 Leave Refinery
    0.70, // 7 Arrive Chute
    0.80, // 8 Wait at Chute
    1.00  // 9 Finished Drop
  ];

  // Station coordinates (centers)
  const sigScreen = 35; 
  const s1 = 80;
  const s2 = 150;
  const s3 = 220;
  const s4 = 290;

  // TrackX = sigScreen - stationX
  const trackX = useTransform(scrollYProgress, p, [
    "0vw", 
    `${sigScreen - s1}vw`, `${sigScreen - s1}vw`, 
    `${sigScreen - s2}vw`, `${sigScreen - s2}vw`, 
    `${sigScreen - s3}vw`, `${sigScreen - s3}vw`, 
    `${sigScreen - s4}vw`, `${sigScreen - s4}vw`, `${sigScreen - s4}vw`
  ]);

  // SignalLocalX moves exactly opposite to track to stay at sigScreen
  const signalLocalX = useTransform(scrollYProgress, p, [
    `${sigScreen}vw`, 
    `${s1}vw`, `${s1}vw`, 
    `${s2}vw`, `${s2}vw`, 
    `${s3}vw`, `${s3}vw`, 
    `${s4}vw`, `${s4}vw`, `${s4}vw`
  ]);

  // Signal Y Drop at the end
  const signalLocalY = useTransform(scrollYProgress, [0.80, 0.95], ["0vh", "80vh"]);

  // ----------------------------------------------------
  // BEAT ANIMATIONS
  // ----------------------------------------------------
  
  // Scanner Beam
  const scannerBeamScaleY = useTransform(scrollYProgress, [0.10, 0.12, 0.14, 0.15], [0, 1, 1, 0]);

  // Meter Needle (Mechanical Overshoot Ease)
  const meterNeedleRotate = useTransform(
    scrollYProgress, 
    [0.25, 0.28, 0.31, 0.35], 
    [-50, 95, 75, 80]
  );
  
  // Refinery Transform
  const rawSignalOpacity = useTransform(scrollYProgress, [0.45, 0.50], [1, 0]);
  const refineryPulse = useTransform(scrollYProgress, [0.48, 0.52, 0.55], [0, 1, 0]);
  const cleanSignalOpacity = useTransform(scrollYProgress, [0.52, 0.57], [0, 1]);

  // Blip Logic
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.55) setBlipSprite("blip_found.png");
    else if (latest > 0.10 && latest < 0.15) setBlipSprite("blip_scan.png");
    else setBlipSprite("blip_idle.png");
  });

  const blipX = useTransform(scrollYProgress, p, [
    isMobile ? "10vw" : "15vw", 
    isMobile ? "15vw" : "20vw", isMobile ? "15vw" : "20vw", 
    isMobile ? "15vw" : "20vw", isMobile ? "15vw" : "20vw", 
    isMobile ? "15vw" : "20vw", isMobile ? "15vw" : "20vw", 
    isMobile ? "15vw" : "20vw", isMobile ? "15vw" : "20vw", isMobile ? "15vw" : "20vw"
  ]);

  const blipY = useTransform(scrollYProgress, p, [
    "10vh", 
    "48vh", "48vh", 
    "48vh", "48vh", 
    "48vh", "48vh", 
    "48vh", "48vh", "120vh"
  ]);

  const blipRotate = useTransform(scrollYProgress, [0.25, 0.30, 0.35, 0.75, 0.85], [0, 15, 0, 0, 45]);
  const blipScale = useTransform(scrollYProgress, [0.10, 0.12, 0.15], [1, 1.1, 1]);

  // Conveyor Parallax (Lags behind track movement)
  const conveyorParallax = useTransform(scrollYProgress, [0, 1], ["0vw", "40vw"]);

  if (reduceMotion) {
    return (
      <section className="py-24 border-t-2 border-border bg-card">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-terminal text-3xl mb-4">The Signal Pipeline</h2>
          <p>LeadGen discovers, analyzes, scores, and delivers high-quality leads.</p>
        </div>
      </section>
    );
  }

  // Machine size class for responsive centers
  const mSize = "h-[clamp(120px,20vh,250px)] md:h-[clamp(180px,25vh,350px)]";

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[#0A0D14]" id="signal-factory">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        
        {/* Z-0 Deep Space */}
        <div className="absolute inset-0 opacity-10 bg-[url('/hero/drift_bg.png')] bg-cover bg-center mix-blend-screen pixelated pointer-events-none" />
        
        {/* Z-10 Distant Parallax Fragments */}
        <motion.div style={{ x: useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]) }} className="absolute inset-0 opacity-20 pointer-events-none z-10">
          <img src="/hero/fragment_large.png" className="absolute top-[20%] left-[20%] w-64 brightness-0 pixelated" />
          <img src="/hero/fragment_small.png" className="absolute top-[70%] left-[80%] w-48 brightness-0 pixelated" />
        </motion.div>

        {/* Text Context */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 text-center pointer-events-none w-full px-6">
          <motion.p 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]) }}
            className="font-terminal text-sm tracking-[0.2em] text-muted-foreground uppercase bg-background/50 px-4 py-1 inline-block rounded-sm backdrop-blur-sm"
          >
            The Signal Pipeline
          </motion.p>
        </div>

        {/* Global Blip (Fixed to Screen horizontally) */}
        <motion.div 
          style={{ left: blipX, top: blipY, scale: blipScale, rotate: blipRotate }}
          className="absolute w-24 sm:w-32 origin-center z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <img src={`/hero/${blipSprite}`} className="w-full h-full object-contain pixelated drop-shadow-2xl transition-all duration-150 animate-pixel-bob" />
        </motion.div>

        {/* Handoff Thread */}
        <motion.div 
          style={{ height: useTransform(scrollYProgress, [0.90, 1], ["0%", "100%"]) }}
          className="absolute bottom-0 left-[35vw] w-px bg-gradient-to-b from-signal to-transparent origin-top z-10"
        />

        {/* ============================================================== */}
        {/* THE HORIZONTAL FACTORY TRACK (Z-20 to Z-50)                    */}
        {/* ============================================================== */}
        <motion.div style={{ x: trackX }} className="absolute inset-0 w-[400vw] h-full pointer-events-none">
          
          {/* Z-20 Conveyor Belt (Midground Parallax) */}
          <motion.div style={{ x: conveyorParallax }} className="absolute inset-0 w-[500vw] h-full z-20">
            <div className="absolute top-[55vh] left-0 w-full h-[15vh] bg-[url('/hero/factory_conveyor.png')] bg-repeat-x bg-[length:auto_100%] pixelated opacity-80" />
          </motion.div>

          {/* ============================================================== */}
          {/* Z-30 MACHINE BACK LAYERS                                       */}
          {/* ============================================================== */}
          
          {/* Scanner Back */}
          <div className={`absolute top-[50vh] -translate-x-1/2 -translate-y-1/2 z-30 ${mSize}`} style={{ left: `${s1}vw` }}>
            <img src="/hero/machine_scanner.png" className="w-auto h-full object-contain pixelated drop-shadow-xl" />
          </div>

          {/* Meter Back */}
          <div className={`absolute top-[50vh] -translate-x-1/2 -translate-y-1/2 z-30 ${mSize}`} style={{ left: `${s2}vw` }}>
            <img src="/hero/machine_meter.png" className="w-auto h-full object-contain pixelated drop-shadow-xl" />
          </div>

          {/* Refinery Back */}
          <div className={`absolute top-[50vh] -translate-x-1/2 -translate-y-1/2 z-30 ${mSize}`} style={{ left: `${s3}vw` }}>
            <img src="/hero/machine_refinery.png" className="w-auto h-full object-contain pixelated drop-shadow-xl" />
          </div>

          {/* Chute */}
          <div className={`absolute top-[58vh] -translate-x-1/2 -translate-y-1/2 z-30 ${mSize}`} style={{ left: `${s4}vw` }}>
            <img src="/hero/chute_glow.png" className="w-auto h-full object-contain pixelated drop-shadow-xl" />
          </div>

          {/* ============================================================== */}
          {/* Z-40 SIGNAL (Travels inside the track)                         */}
          {/* ============================================================== */}
          <motion.div 
            style={{ left: signalLocalX, y: signalLocalY }}
            className="absolute top-[50vh] w-12 sm:w-16 h-12 sm:h-16 origin-center -translate-x-1/2 -translate-y-1/2 z-40"
          >
            {/* Raw State */}
            <motion.img style={{ opacity: rawSignalOpacity }} src="/hero/signal_idle.png" className="absolute inset-0 w-full h-full object-contain pixelated drop-shadow-lg" />
            
            {/* Refinery Processing Glow */}
            <motion.div style={{ opacity: refineryPulse, scale: useTransform(refineryPulse, [0,1], [0.5, 2]) }} className="absolute inset-0 bg-signal/60 blur-xl rounded-full mix-blend-screen" />
            
            {/* Clean State */}
            <motion.img style={{ opacity: cleanSignalOpacity }} src="/hero/signal_active.png" className="absolute inset-0 w-full h-full object-contain pixelated drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
          </motion.div>

          {/* ============================================================== */}
          {/* Z-50 MACHINE FRONT MASKS & EFFECTS                             */}
          {/* ============================================================== */}

          {/* Scanner Front Mask (Occludes right half so signal passes through) */}
          <div className={`absolute top-[50vh] -translate-x-1/2 -translate-y-1/2 z-50 ${mSize}`} style={{ left: `${s1}vw` }}>
            <img src="/hero/machine_scanner.png" className="w-auto h-full object-contain pixelated" style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)" }} />
            {/* Beam Effect */}
            <motion.div className="absolute top-[20%] left-[25%] right-[25%] bottom-[20%] bg-signal/30 origin-top mix-blend-screen" style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)", scaleY: scannerBeamScaleY }} />
          </div>

          {/* Meter Needle (Z-50 Overlay) */}
          <div className={`absolute top-[50vh] -translate-x-1/2 -translate-y-1/2 z-50 ${mSize}`} style={{ left: `${s2}vw` }}>
             {/* We use an empty invisible box of the exact same size to map percentage coords perfectly over the PNG */}
             <div className="relative w-auto h-full aspect-square mx-auto">
               <motion.div 
                 style={{ rotate: meterNeedleRotate }}
                 className="absolute top-[25%] left-[50%] w-[4%] h-[25%] origin-bottom -translate-x-1/2 z-50"
               >
                 {/* Pixel-art CSS Needle Construction */}
                 <div className="w-full h-full bg-[#e11d48] border-x border-t border-[#4c0519] shadow-[2px_2px_0px_rgba(0,0,0,0.5)] flex flex-col items-center">
                    <div className="w-[60%] h-[20%] bg-[#fb7185] mt-[10%]" /> {/* Highlight */}
                 </div>
                 {/* Pivot */}
                 <div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[250%] aspect-square bg-[#1e293b] rounded-sm border-2 border-[#0f172a] shadow-inner" />
               </motion.div>
             </div>
          </div>

          {/* Refinery Front Mask (Occludes intake pipe, punches hole for window) */}
          <div className={`absolute top-[50vh] -translate-x-1/2 -translate-y-1/2 z-50 ${mSize}`} style={{ left: `${s3}vw` }}>
            <img src="/hero/machine_refinery.png" className="w-auto h-full object-contain pixelated" style={{ maskImage: "radial-gradient(circle at 50% 50%, transparent 22%, black 24%)", WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 22%, black 24%)" }} />
          </div>

        </motion.div>
      </div>
    </section>
  );
}
