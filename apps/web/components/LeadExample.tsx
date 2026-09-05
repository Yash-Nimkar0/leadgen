"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ScoreDial } from "./ScoreDial";

const TAGS = [
  { label: "Intent", value: "High" },
  { label: "Pain", value: "Support workload" },
  { label: "Signal", value: "Actively evaluating alternatives" },
  { label: "Competitor named", value: "Zendesk" },
];

/**
 * A single, real-looking conversation walked through the product's actual
 * reasoning, framed as a mission dossier — the section meant to make the
 * visitor think "oh, that's what this does," without a dashboard
 * screenshot in sight.
 */
export function LeadExample() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: reduceMotion ? 0 : i * 0.1 },
    }),
  };

  return (
    <div className="pixel-frame border-2 border-border bg-card p-8 sm:p-10 shadow-pixel">
      <p className="font-terminal text-base tracking-widest text-muted-foreground uppercase mb-4">[ r/CustomerSuccess ]</p>
      <motion.p
        variants={reveal}
        custom={0}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        className="text-2xl sm:text-3xl text-foreground leading-snug mb-8 text-balance"
      >
        &ldquo;Anyone have a good alternative to Zendesk? We&apos;re a 12-person team and it&apos;s become overkill.&rdquo;
      </motion.p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        {TAGS.map((tag, i) => (
          <motion.div
            key={tag.label}
            variants={reveal}
            custom={i + 1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
          >
            <p className="font-terminal text-sm tracking-widest text-muted-foreground uppercase mb-1.5">{tag.label}</p>
            <p className="text-sm text-foreground font-medium leading-snug">{tag.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={reveal}
        custom={TAGS.length + 1}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        className="flex items-center justify-between border-t-2 border-border pt-6"
      >
        <div className="flex items-center gap-4">
          <ScoreDial score={91} progressClassName="bg-signal" trackClassName="bg-border" labelClassName="text-signal" />
          <div>
            <p className="text-sm font-semibold text-foreground">Very strong opportunity</p>
            <p className="text-xs text-muted-foreground">Budget pressure, named competitor, team size fits</p>
          </div>
        </div>
        <span className="hidden sm:inline-block font-terminal text-sm tracking-widest text-signal uppercase">
          [ Review lead → ]
        </span>
      </motion.div>
    </div>
  );
}
