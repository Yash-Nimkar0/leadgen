import { cn } from "../../lib/utils";
import { PixelSprite } from "./PixelSprite";
import { NOISE_VARIANTS, NOISE_SIGNAL, NOISE_PALETTE, NOISE_SIGNAL_PALETTE } from "./sprites";

export function NoiseCreature({
  variant = 1,
  signal = false,
  scale = "ui",
  delayMs = 0,
  className,
  title,
}: {
  variant?: 1 | 2 | 3 | 4 | 5 | 6;
  signal?: boolean;
  scale?: "ui" | "hero";
  delayMs?: number;
  className?: string;
  title?: string;
}) {
  if (scale === "hero") {
    // Determine the PNG path. If signal, it's usually active.
    // If not signal, use idle unless specified.
    const stateSuffix = signal ? "active" : "idle";
    const src = `/hero/creature_0${variant}_${stateSuffix}.png`;
    return (
      <img
        src={src}
        alt={title ?? (signal ? "A useful signal" : "Background noise")}
        className={cn("max-h-full max-w-full object-contain pixelated", !signal && "animate-pixel-bob", className)}
        style={!signal && delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
      />
    );
  }

  const safeVariant = Math.min(Math.max(variant, 1), 5); // 1-5 for UI sprites
  const rows = signal ? NOISE_SIGNAL : NOISE_VARIANTS[safeVariant - 1] ?? NOISE_VARIANTS[0]!;
  return (
    <PixelSprite
      rows={rows}
      palette={signal ? NOISE_SIGNAL_PALETTE : NOISE_PALETTE}
      className={cn("h-full w-full", !signal && "animate-pixel-bob", className)}
      style={!signal && delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
      title={title ?? (signal ? "A useful signal" : "Background noise")}
    />
  );
}
