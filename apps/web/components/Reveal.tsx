"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * The page's one entrance grammar: fade up, once, on the way into view.
 * Every section uses this same choreography so the scroll rhythm reads as
 * one coherent system rather than a pile of one-off animations.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : y },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

/** A staggered group — wrap direct children in <RevealItem>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ show: { transition: { staggerChildren: reduceMotion ? 0 : stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, y = 18 }: { children: ReactNode; className?: string; y?: number }) {
  const reduceMotion = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : y },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
