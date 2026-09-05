import type { CSSProperties } from "react";

/**
 * Renders hand-authored pixel art from a row/character grid — the base
 * primitive every sprite and icon in the LeadGen world is built from.
 * Pure SVG rects at crisp edges, so it stays sharp at any scale and never
 * ships an image asset.
 */
export function PixelSprite({
  rows,
  palette,
  className,
  style,
  title,
}: {
  /** Each string is one row; each character indexes `palette`. "." is transparent. */
  rows: string[];
  /** Maps a grid character to a CSS color (hex, currentColor, var(...), etc). */
  palette: Record<string, string>;
  className?: string;
  /** For per-instance tweaks like animation-delay — not for layout. */
  style?: CSSProperties;
  title?: string;
}) {
  const cols = rows[0]?.length ?? 0;
  const rowCount = rows.length;

  return (
    <svg
      viewBox={`0 0 ${cols} ${rowCount}`}
      className={className}
      style={style}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rows.map((row, y) =>
        row.split("").map((ch, x) => {
          if (ch === "." || !palette[ch]) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={palette[ch]} />;
        })
      )}
    </svg>
  );
}
