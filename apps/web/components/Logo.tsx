import { cn } from "../lib/utils";

/**
 * The brand mark: three bars rising out of the noise, the last one
 * signal green — a pixel VU-meter reading. Squared off, no rounding, so
 * it holds up at favicon scale. One mark, one place it's defined — this
 * is what keeps the marketing site and the app looking like the same
 * product.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className={cn("shrink-0", className)} shapeRendering="crispEdges">
      <rect x="1" y="10" width="3" height="9" fill="currentColor" opacity="0.3" />
      <rect x="7.5" y="5" width="3" height="14" fill="currentColor" opacity="0.6" />
      <rect x="14" y="0.5" width="3" height="18.5" className="fill-signal" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="font-terminal text-[19px] leading-none tracking-wide">LeadGen</span>
    </span>
  );
}
