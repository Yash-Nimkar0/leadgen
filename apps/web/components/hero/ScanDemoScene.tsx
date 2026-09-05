"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { publicScan } from "../../app/actions/marketing-actions";

type Phase = "idle" | "scanning" | "result" | "error";

export function ScanDemoScene() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);

  const runScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) {
      setErrorMsg("NO SIGNAL DETECTED. INPUT REQUIRED.");
      setPhase("error");
      return;
    }

    setPhase("scanning");
    setErrorMsg("");

    const res = await publicScan({ text: inputValue });
    
    if (res.error) {
      setErrorMsg(res.error);
      setPhase("error");
    } else {
      setResult(res);
      setPhase("result");
    }
  };

  const reset = () => {
    setInputValue("");
    setPhase("idle");
    setResult(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runScan();
    }
  };

  const isScanning = phase === "scanning";
  const blipSprite = isScanning ? "blip_scan.png" : phase === "result" ? "blip_found.png" : "blip_idle.png";

  return (
    <section className="relative min-h-[140vh] w-full flex flex-col items-center justify-center bg-[#0A0D14] overflow-hidden py-32" id="demo">
      
      {/* Z-0 Parallax Background */}
      <div className="absolute inset-0 w-full h-full opacity-[0.15] bg-[url('/hero/drift_bg.png')] bg-cover bg-center bg-no-repeat mix-blend-screen pixelated pointer-events-none" />

      {/* The Workstation Group */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16 z-20">
          <p className="signal-dash font-terminal text-lg tracking-[0.2em] text-signal uppercase mb-4">[ Try it yourself ]</p>
          <h2 className="font-terminal text-4xl sm:text-5xl tracking-wide text-balance text-foreground">
            Press scan. See what it sees.
          </h2>
        </div>

        {/* --- PHYSICAL MACHINE --- */}
        <div className="relative w-full max-w-[800px] aspect-[4/3] mt-10">
          
          {/* Radar Dish (Locks to 0 deg when done, spins when scanning) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-auto opacity-70">
            <motion.img 
              src="/hero/machine_scanner.png" 
              className="w-full h-auto object-contain pixelated"
              animate={{ rotate: isScanning ? 360 : 0 }}
              transition={{ repeat: isScanning ? Infinity : 0, duration: 4, ease: "linear" }}
            />
          </div>

          {/* Platform Floor */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%]">
            <img src="/hero/observatory_platform.png" className="w-full h-auto object-contain pixelated drop-shadow-2xl" />
          </div>

          {/* Console / Terminal Base */}
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[60%]">
            <img src="/hero/observatory_terminal.png" className="w-full h-auto object-contain pixelated drop-shadow-xl" />
          </div>

          {/* Blip (Landing in) */}
          <motion.div 
            initial={{ x: -200, y: -200, opacity: 0 }}
            whileInView={{ x: 0, y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", damping: 12, stiffness: 50 }}
            className="absolute bottom-[20%] left-[5%] w-[25%]"
          >
            <img src={`/hero/${blipSprite}`} className={`w-full h-auto object-contain pixelated drop-shadow-lg ${!isScanning ? 'animate-pixel-bob' : ''}`} />
          </motion.div>

          {/* --- INTERACTIVE CONTROL PANEL (Embedded physically in terminal) --- */}
          <div className="absolute bottom-[38%] left-[33%] w-[34%] h-[28%] flex flex-col z-20">
            
            {/* Embedded Terminal Screen (Replaces the drawn screen on the PNG) */}
            <div className="w-full h-full bg-[#051005] border-4 border-[#1a1a1a] p-2 flex flex-col relative overflow-hidden shadow-[inset_0_0_20px_rgba(34,197,94,0.2)]">
              
              {/* Scan Beam Effect (When scanning) */}
              {isScanning && (
                <motion.div 
                  className="absolute inset-0 bg-signal/20 pointer-events-none"
                  animate={{ y: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              )}

              <AnimatePresence mode="wait">
                {phase === "idle" || phase === "error" ? (
                  <motion.form key="input" onSubmit={runScan} className="flex flex-col h-full relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <label htmlFor="scan-input" className="sr-only">Enter a signal to scan</label>
                    <div aria-hidden="true" className="font-terminal text-[8px] sm:text-[9px] text-signal/70 uppercase tracking-widest mb-1">
                      {">"} INPUT SIGNAL
                    </div>
                    <textarea 
                      id="scan-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a mock post here..."
                      className="w-full flex-1 bg-transparent border-none text-signal font-pixel text-[10px] sm:text-xs resize-none focus:outline-none focus:ring-0 placeholder:text-signal/30"
                      disabled={isScanning}
                    />
                    {phase === "error" && (
                      <p className="font-terminal text-destructive text-[8px] sm:text-[9px] mt-1 animate-pulse bg-destructive/10 px-1">ERR: {errorMsg}</p>
                    )}
                  </motion.form>
                ) : phase === "scanning" ? (
                  <motion.div key="scanning" className="flex flex-col h-full items-center justify-center relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="font-terminal text-amber text-[10px] sm:text-xs tracking-widest animate-pulse">
                      TRANSMITTING...
                    </p>
                  </motion.div>
                ) : phase === "result" ? (
                  <motion.div key="result" className="flex flex-col h-full relative z-10 text-signal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex justify-between items-center border-b border-signal/30 pb-1 mb-1">
                      <p className="font-terminal text-[9px] uppercase">SIGNAL LOCKED</p>
                      <p className="font-terminal text-[9px]">SCORE: {result?.finalScore}</p>
                    </div>
                    <p className="font-pixel text-[8px] uppercase text-signal/70 mb-1">INTENT IDENTIFIED</p>
                    <p className="font-terminal text-[9px] leading-snug line-clamp-2">
                      {result?.classification?.buyingStage || "Unknown stage"}
                    </p>
                    <div className="mt-auto">
                      <button 
                        onClick={reset}
                        className="font-terminal text-[8px] uppercase text-black bg-signal px-2 py-0.5 hover:bg-white transition-colors"
                      >
                        [ RESET ]
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Physical Scan Lever / Button (Hangs off the right side of the screen) */}
            {phase !== "result" && (
              <button 
                onClick={runScan}
                disabled={isScanning}
                className={`absolute top-1/2 -right-8 -translate-y-1/2 w-6 h-12 bg-[#b91c1c] border-2 border-[#7f1d1d] shadow-[0_4px_0_#450a0a,-4px_0_0_rgba(0,0,0,0.5)] flex items-center justify-center transition-all ${isScanning ? 'translate-y-1 shadow-[0_0_0_#450a0a,-4px_0_0_rgba(0,0,0,0.5)] opacity-80 cursor-not-allowed' : 'hover:brightness-110 active:translate-y-1 active:shadow-[0_0_0_#450a0a,-4px_0_0_rgba(0,0,0,0.5)] cursor-pointer'}`}
                title="Execute Scan"
              >
                <div className="w-2 h-8 bg-black/20 rounded-full" />
              </button>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}
