"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/Button";
import { ArrowRight } from "lucide-react";
import { ActionScene } from "./ActionScene";

export function ViewportStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Mouse Parallax Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse movement
  const smoothOptions = { damping: 50, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(mouseX, smoothOptions);
  const smoothY = useSpring(mouseY, smoothOptions);

  // Parallax layers (subtle as requested)
  // Background: very small movement (1-2%)
  const bgX = useTransform(smoothX, [-0.5, 0.5], ["-1%", "1%"]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], ["-1%", "1%"]);

  // Midground: slightly more (2-4%)
  const midX = useTransform(smoothX, [-0.5, 0.5], ["-2.5%", "2.5%"]);
  const midY = useTransform(smoothY, [-0.5, 0.5], ["-2.5%", "2.5%"]);

  // Foreground (Action layer): slightly more (4-6%)
  const actionX = useTransform(smoothX, [-0.5, 0.5], ["-4%", "4%"]);
  const actionY = useTransform(smoothY, [-0.5, 0.5], ["-4%", "4%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion || !containerRef.current) return;
    
    // Disable parallax on mobile/touch screens by checking window width (simple heuristic)
    if (window.innerWidth < 768) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - top) / height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[100vh] bg-[#0A0D14] overflow-hidden border-b-2 border-border"
    >
      {/* BACKGROUND WORLD */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ x: bgX, y: bgY }}
      >
        {/* Starfield base */}
        <div className="absolute inset-0 opacity-40 bg-[url('/hero/drift_bg.png')] bg-cover bg-center" style={{ imageRendering: "pixelated" }} />
        {/* We can place distant planets here */}
      </motion.div>

      {/* MIDGROUND WORLD */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ x: midX, y: midY }}
      >
        {/* Floating fragments */}
        <img 
          src="/hero/fragment_small.png" 
          alt="" 
          className="absolute top-[15%] left-[60%] w-[120px] opacity-60 pixelated" 
        />
        <img 
          src="/hero/fragment_large.png" 
          alt="" 
          className="absolute bottom-[-5%] left-[-2%] w-[320px] pixelated" 
        />
      </motion.div>

      {/* CONTENT LAYER (Strictly UI, Stable, No Parallax) */}
      <div className="absolute inset-0 z-20 flex items-center pt-24 md:pt-0">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <p className="signal-dash font-terminal text-lg tracking-[0.2em] text-signal uppercase mb-6 inline-flex">
              [ They leave traces ]
            </p>
            <h1 className="font-terminal text-6xl sm:text-7xl md:text-[5.5rem] tracking-wide leading-[1.05] text-balance mb-8">
              They're already asking.
            </h1>
            <p className="font-terminal text-2xl text-muted-foreground mb-10 max-w-xl text-balance">
              Find the exact conversations where your product is the missing piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
              <a href="/register" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto bg-signal text-primary-foreground shadow-pixel-signal text-lg h-14 px-8" })}>
                [ Start scanning ]
              </a>
              <a href="#demo" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto text-lg h-14 px-8 bg-background/50 backdrop-blur-sm" })}>
                See how it works
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION WORLD (Blip & Signal) */}
      <motion.div 
        className="absolute inset-0 z-30 pointer-events-none"
        style={{ x: actionX, y: actionY }}
      >
        {/* This will hold the complex cinematic Timeline */}
        <ActionScene reducedMotion={prefersReducedMotion} />
      </motion.div>
    </div>
  );
}

