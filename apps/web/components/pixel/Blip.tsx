import { cn } from "../../lib/utils";
import { PixelSprite } from "./PixelSprite";
import {
  BLIP, BLIP_SCAN, BLIP_FOUND, BLIP_PALETTE_IDLE, BLIP_PALETTE_FOUND,
} from "./sprites";

const GRID = {
  ui: { idle: BLIP, scan: BLIP_SCAN, found: BLIP_FOUND },
} as const;

export function Blip({
  state = "idle",
  scale = "ui",
  glow = true,
  className,
  title = "Blip",
}: {
  state?: "idle" | "scan" | "found";
  scale?: "ui" | "hero";
  glow?: boolean;
  className?: string;
  title?: string;
}) {
  const found = state === "found";
  
  if (scale === "hero") {
    // External artwork integration for Hero
    const srcMap = {
      idle: "/hero/blip_01.png",
      scan: "/hero/blip_02.png",
      found: "/hero/blip_05.png"
    };
    
    return (
      <span className={cn("relative flex items-center justify-center", className)}>
        {found && glow && (
          <span
            className="absolute -inset-2 -z-[1] bg-signal/15 blur-md pointer-events-none animate-planet-glow"
            aria-hidden="true"
          />
        )}
        <img 
          src={srcMap[state]} 
          alt={title}
          className={cn("max-h-full max-w-full object-contain pixelated", !found && "animate-pixel-bob")} 
        />
      </span>
    );
  }

  const palette = found ? BLIP_PALETTE_FOUND : BLIP_PALETTE_IDLE;
  return (
    <span className={cn("relative inline-block", className)}>
      {found && glow && (
        <span
          className="absolute -inset-2 -z-[1] bg-signal/15 blur-md pointer-events-none animate-planet-glow"
          aria-hidden="true"
        />
      )}
      <PixelSprite
        rows={GRID.ui[state]}
        palette={palette}
        className={cn("h-full w-full", !found && "animate-pixel-bob")}
        title={title}
      />
    </span>
  );
}
