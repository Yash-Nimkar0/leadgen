/** Deterministic PRNG (mulberry32) — same output on server and client,
 * so the starfield never causes a hydration mismatch. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Builds a tileable field of point-stars as a CSS background-image made
 * of many tiny radial-gradients, positioned within one repeating tile. */
export function starLayer(count: number, seed: number, color = "231,236,232", maxOpacity = 0.8) {
  const rand = mulberry32(seed);
  const stops: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (rand() * 100).toFixed(1);
    const y = (rand() * 100).toFixed(1);
    const o = (0.25 + rand() * maxOpacity).toFixed(2);
    const size = rand() > 0.85 ? "1.6px 1.6px" : "1px 1px";
    stops.push(`radial-gradient(${size} at ${x}% ${y}%, rgba(${color},${o}) 1px, transparent 1.5px)`);
  }
  return stops.join(", ");
}
