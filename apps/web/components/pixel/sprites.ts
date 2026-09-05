/**
 * Hand-authored pixel-art grids for the LeadGen world. Every sprite shares
 * the same three-letter grammar: K = outline, B = body fill, G = signal
 * green. A couple of sprites add one extra accent letter where it earns
 * its keep (A = amber, for the one "valuable find" moment).
 *
 * Kept small (8–14px grids) on purpose — at this resolution every pixel
 * is a deliberate choice, which is what keeps it from reading as a
 * generic "pixel theme" rather than an actual designed sprite.
 */

export const BOT_PALETTE = {
  K: "#7C8A96", // outline — visible against dark, not shouting
  B: "#2E3A44", // body fill
  G: "#3ADD82", // signal green — visor, screen, accents
};

/** The LeadGen explorer — a small scanner-bot, not a human figure, so it
 * stays charming rather than uncanny at this resolution. */
export const EXPLORER_BOT = [
  "....GG....",
  "....KK....",
  "...KKKK...",
  "..KGGGGK..",
  "..KGGGGK..",
  "..KKKKKK..",
  "...KKKK...",
  "..KBBBBK..",
  ".KBBBBBBK.",
  ".KBBGGBBK.",
  ".KBBBBBBK.",
  "..KBBBBK..",
  "..KK..KK..",
  "..KK..KK..",
];

export const TOWER_PALETTE = { K: "#7C8A96", G: "#3ADD82" };
export const SIGNAL_TOWER = [
  "...GG...",
  "..K..K..",
  ".K....K.",
  "..KKKK..",
  "..K..K..",
  ".K....K.",
  "..K..K..",
  ".K....K.",
  "K......K",
  "KKKKKKKK",
];

export const TERMINAL_PALETTE = { K: "#7C8A96", G: "#3ADD82" };
export const PIXEL_TERMINAL = [
  ".KKKKKKKK.",
  "KGGGGGGGGK",
  "KGGGGGGGGK",
  "KGGGGGGGGK",
  "KKKKKKKKKK",
  "..KKKKKK..",
  "..KKKKKK..",
  ".KKKKKKKK.",
];

export const BUBBLE_PALETTE = { K: "#7C8A96", G: "#3ADD82" };
export const CONVERSATION_BUBBLE = [
  "..KKKKKK..",
  ".K......K.",
  "K........K",
  "K.G.G.G..K",
  "K........K",
  ".K......K.",
  "..KK......",
  "...K......",
];

export const CHEST_PALETTE = { K: "#7C8A96", A: "#FFC53D" };
export const OPPORTUNITY_CHEST = [
  "..KKKKKK..",
  ".KAAAAAAK.",
  "KKKKKKKKKK",
  "K........K",
  "K...KK...K",
  "K...KK...K",
  "K........K",
  "KKKKKKKKKK",
];

export const SATELLITE_PALETTE = { K: "#7C8A96", B: "#3A4854", G: "#3ADD82" };
export const SATELLITE = [
  "......GG......",
  "......KK......",
  "..KKKK..KKKK..",
  ".KBBBBKKBBBBK.",
  ".KBBBBKKBBBBK.",
  "..KKKK..KKKK..",
];

/**
 * A pixel planet, generated (not hand-placed) so the circle stays clean —
 * banded like a small gas giant, one lit quadrant for depth. Used as an
 * ambient backdrop element, never interactive.
 */
function pixelPlanet(diameter: number): string[] {
  const r = diameter / 2;
  const rows: string[] = [];
  for (let y = 0; y < diameter; y++) {
    let row = "";
    for (let x = 0; x < diameter; x++) {
      const dx = x - r + 0.5;
      const dy = y - r + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > r) {
        row += ".";
        continue;
      }
      const isEdge = dist > r - 1.15;
      const isHighlight = dx < -1.5 && dy < -1.5 && dist < r - 2.3;
      const isBand = Math.floor((y + 1) / 3) % 2 === 0;
      if (isEdge) row += "K";
      else if (isHighlight) row += "H";
      else if (isBand) row += "R";
      else row += "B";
    }
    rows.push(row);
  }
  return rows;
}

export const PLANET_PALETTE = { K: "#155C36", B: "#2E7D52", R: "#22693F", H: "#7BF0AA" };
export const PLANET = pixelPlanet(22);

/**
 * ============================================================================
 * BLIP — the LeadGen mascot/Scout.
 * ============================================================================
 *
 * Design decision: Blip's head *is* almost entirely one large eye — the
 * character's whole silhouette is built around "a thing that looks," which
 * is the most direct possible expression of what the product does, and
 * reads instantly even at a few pixels tall (the strongest, simplest
 * silhouette wins at this resolution — a body/visor/limbs composition
 * would blur into noise this small).
 *
 * The logo relationship is deliberately NOT literal — Blip's silhouette
 * doesn't try to reproduce the three-bar mark. The connection is behavioral
 * instead: like the logo's third bar, Blip's eye (and antenna tip) is dim
 * and neutral at rest, and becomes the one saturated signal-green thing on
 * screen the moment it finds something. Same meaning, not the same shape.
 *
 * Three grids share one silhouette (antenna, head/eye outline, tapering
 * body, two small "hover" feet with a gap between them — floating, not
 * standing, since a scout scans rather than walks) and differ only in the
 * eye rows:
 *   - BLIP        idle — small centered pupil, at rest
 *   - BLIP_SCAN   glancing — pupil shifted, mid-search
 *   - BLIP_FOUND  wide-eyed — pupil fills most of the eye, "found it"
 *
 * All three use BLIP_PALETTE_IDLE (dim, neutral) except the found state,
 * which swaps to BLIP_PALETTE_FOUND — pupil and antenna tip both become
 * signal green in the same instant. No mouth: at this resolution a mouth
 * reads as a smudge, and the eye alone carries every expression cleanly.
 */

export const BLIP_PALETTE_IDLE = {
  K: "#7C8A96", // outline
  W: "#E7ECE8", // eye white (reuses the existing "paper-dark" tone)
  P: "#5A6672", // pupil — dim, hasn't found anything yet
  H: "#FFFFFF", // a single glint pixel — the cheapest way to make a pixel eye read as glassy/alive
  B: "#2E3A44", // body fill (same body tone as the rest of the pixel cast)
  T: "#7C8A96", // antenna tip — unlit, same as outline
};

export const BLIP_PALETTE_FOUND = {
  K: "#7C8A96",
  W: "#E7ECE8",
  P: "#3ADD82", // pupil — signal green, the "found it" instant
  H: "#FFFFFF",
  B: "#2E3A44",
  T: "#3ADD82", // antenna tip lights up in the same beat as the eye
};

// Revision note: the first pass built the eye as one flat rectangular
// white block with a pupil nearly as wide as it — at this resolution that
// read as a screen/visor, not an eye (closer to the generic "robot with a
// chest panel" cliche the brief explicitly warns against). This version
// tapers the head across more rows for an actual round silhouette, and
// shrinks the pupil to a small dot with one glint pixel offset beside it
// — the standard pixel-art trick for making an eye read as glassy and
// alive rather than as a filled shape.
export const BLIP = [
  ".....T.....",
  ".....K.....",
  "....KKK....",
  "..KWWWWWK..",
  ".KWWWWWWWK.",
  ".KWWHPPWWK.",
  ".KWWWPPWWK.",
  "..KWWWWWK..",
  "....KKK....",
  "...KBBBK...",
  "...KBBBK...",
  "...KBBBK...",
  "....KBK....",
  ".....K.....",
];

export const BLIP_SCAN = [
  ".....T.....",
  ".....K.....",
  "....KKK....",
  "..KWWWWWK..",
  ".KWWWWWWWK.",
  ".KWHPPWWWK.",
  ".KWWPPWWWK.",
  "..KWWWWWK..",
  "....KKK....",
  "...KBBBK...",
  "...KBBBK...",
  "...KBBBK...",
  "....KBK....",
  ".....K.....",
];

export const BLIP_FOUND = [
  ".....T.....",
  ".....K.....",
  "....KKK....",
  "..KWWWWWK..",
  ".KWHPPPPWK.",
  ".KWWPPPPWK.",
  ".KWWPPPPWK.",
  "..KWWWWWK..",
  "....KKK....",
  "...KBBBK...",
  "...KBBBK...",
  "...KBBBK...",
  "....KBK....",
  ".....K.....",
];

/**
 * ============================================================================
 * NOISE CREATURES — the crowd.
 * ============================================================================
 *
 * One species, five small variations (silhouette, eye style, size, whether
 * they carry a tiny antenna nub) so the field reads as a living crowd
 * instead of one icon repeated. All muted on purpose — a different, cooler
 * body tone than Blip's (NOISE_PALETTE), so "the crowd" has its own
 * identity but never competes with Blip or, later, the signal.
 *
 * NOISE_SIGNAL reuses variant 1's exact silhouette — the point is that a
 * perfectly ordinary, even sleepy-looking noise creature is the one that
 * turns out to matter, not a differently-shaped "special" creature. Only
 * the eye row (sleepy dot -> wide alert, the same widening grammar as
 * Blip's own found state) and the palette (muted -> signal green, via
 * NOISE_SIGNAL_PALETTE) change.
 */

export const NOISE_PALETTE = {
  K: "#5A6672", // outline — dimmer than Blip's, recedes into the background
  B: "#3A4756", // muted blue-gray body — the crowd's own color, not gray-on-gray
  E: "#8A96A2", // eyes — quiet, unremarkable
  Q: "#5A6672", // tiny antenna nub (variant 2 only) — same weight as the outline
};

export const NOISE_SIGNAL_PALETTE = {
  K: "#3ADD82",
  B: "#8FF0B8", // signal.soft — a softer fill so the outline reads as the highlight
  E: "#3ADD82",
  Q: "#3ADD82",
};

// 1 — round, sleepy (closed-dash eyes). Base shape reused by NOISE_SIGNAL.
export const NOISE_1 = [
  "...KKK...",
  ".KBBBBBK.",
  ".KEBBBEK.",
  ".KBBBBBK.",
  ".KBBBBBK.",
  "..KBBBK..",
  "...KBK...",
];

// Same silhouette as NOISE_1 — only the eyes widen (alert) and the palette
// shifts to signal green.
export const NOISE_SIGNAL = [
  "...KKK...",
  ".KBBBBBK.",
  ".KEEBEEK.",
  ".KBBBBBK.",
  ".KBBBBBK.",
  "..KBBBK..",
  "...KBK...",
];

// 2 — squat, wide-eyed, tiny antenna nub.
export const NOISE_2 = [
  "....Q....",
  "...KKK...",
  ".KBBBBBK.",
  ".KEEBEEK.",
  ".KBBBBBK.",
  ".KBBBBBK.",
  "..KBBBK..",
  "...KBK...",
];

// 3 — tall, narrow, a single centered eye (quirky/asymmetric read).
export const NOISE_3 = [
  "..KKK..",
  ".KBBBK.",
  ".KBEBK.",
  ".KBBBK.",
  ".KBBBK.",
  "..KBK..",
  "...K...",
];

// 4 — squat and flat-topped, close-set eyes.
export const NOISE_4 = [
  "..KKKKK..",
  ".KBBBBBK.",
  ".KBEBEBK.",
  ".KBBBBBK.",
  "..KBBBK..",
  "...KBK...",
];

// 5 — small, leaning (eyes offset left for a lazy, off-kilter read).
export const NOISE_5 = [
  "..KKK..",
  ".KBBBK.",
  ".KEEBK.",
  ".KBBBK.",
  "..KBK..",
  "...K...",
];

export const NOISE_VARIANTS = [NOISE_1, NOISE_2, NOISE_3, NOISE_4, NOISE_5];

/**
 * ============================================================================
 * BLIP — hero scale.
 * ============================================================================
 *
 * The UI-scale BLIP grids above are untouched and stay canonical wherever
 * Blip appears small. This is a dedicated, larger-canvas version for the
 * one place Blip is the protagonist of a scene rather than an icon — more
 * rows buy a rounder eye and one new detail (a thin collar band where the
 * head meets the body, reading as scout gear) without changing the
 * silhouette identity: still one round eye, one antenna, a tapering
 * hover-body, no legs. `C` is a new, deliberately non-semantic tone —
 * texture, not a signal color — so it never competes with green.
 */

export const BLIP_HERO_PALETTE_IDLE = {
  ...BLIP_PALETTE_IDLE,
  C: "#4A5568", // collar band — pure texture, same in every state
};

export const BLIP_HERO_PALETTE_FOUND = {
  ...BLIP_PALETTE_FOUND,
  C: "#4A5568",
};

export const BLIP_HERO = [
  ".......T.......",
  ".......K.......",
  ".....KKKKK.....",
  "...KWWWWWWWK...",
  ".KWWWWWWWWWWWK.",
  ".KWWWWHPPPWWWK.",
  ".KWWWWWPPPWWWK.",
  ".KWWWWWWWWWWWK.",
  "...KWWWWWWWK...",
  ".....KKKKK.....",
  "....KCCCCCK....",
  "....KBBBBBK....",
  "....KBBBBBK....",
  "....KBBBBBK....",
  ".....KBBBK.....",
  "......KBK......",
  ".......K.......",
];

export const BLIP_HERO_SCAN = [
  ".......T.......",
  ".......K.......",
  ".....KKKKK.....",
  "...KWWWWWWWK...",
  ".KWWWWWWWWWWWK.",
  ".KWWHPPPWWWWWK.",
  ".KWWWPPPWWWWWK.",
  ".KWWWWWWWWWWWK.",
  "...KWWWWWWWK...",
  ".....KKKKK.....",
  "....KCCCCCK....",
  "....KBBBBBK....",
  "....KBBBBBK....",
  "....KBBBBBK....",
  ".....KBBBK.....",
  "......KBK......",
  ".......K.......",
];

/**
 * A small floating rock/outcrop — not a platform slab, an irregular
 * fragment, so it reads as "a piece of the digital landscape" rather than
 * another rectangle. Wide flat-ish top for Blip to stand on, tapering
 * unevenly to a point — deliberately asymmetric silhouette.
 */
export const OUTCROP_PALETTE = { K: "#7C8A96", B: "#2B3542" };
export const OUTCROP = [
  "..KKKKKKKKKKKKKK..",
  ".KBBBBBBBBBBBBBBK.",
  ".KBBBBBBBBBBBBBBK.",
  "..KBBBBBBBBBBBBK..",
  "....KBBBBBBBBK....",
  ".......KBBBBK.....",
  ".........KBK......",
];

/** A second, smaller/flatter fragment silhouette — paired with OUTCROP so
 * the Drift's fragments read as genuinely different pieces of debris,
 * not one shape copy-pasted at different sizes. */
export const OUTCROP_SMALL = [
  "..KKKKKKKK..",
  ".KBBBBBBBBK.",
  ".KBBBBBBBBK.",
  "...KBBBBK...",
  ".....KBK....",
];

/**
 * Blip's hand-scanner — small enough to read as carried, not furniture.
 * The tip (T) is unlit gray at rest, signal green once he's found
 * something, echoing his own eye's color behavior.
 */
export const SCANNER_PALETTE_IDLE = { K: "#7C8A96", B: "#2E3A44", T: "#7C8A96" };
export const SCANNER_PALETTE_FOUND = { K: "#7C8A96", B: "#2E3A44", T: "#3ADD82" };
export const SCANNER = [
  "...T...",
  "..KKK..",
  ".KBBBK.",
  ".KBBBK.",
  "..KKK..",
  "...K...",
  "...K...",
  "...K...",
];

/**
 * A small console/terminal — Blip's instrument, purpose-built for the
 * hero scene rather than reusing the generic PIXEL_TERMINAL prop. Rows
 * 1-6 are deliberately left transparent (".") — that's the screen. The
 * real evidence content (ScoreDial + text) is positioned to sit inside
 * that hole from outside the sprite, so it reads as something displayed
 * on a physical object in the world, not text floating over the art.
 */
export const CONSOLE_PALETTE = { K: "#7C8A96", B: "#2E3A44" };
export const CONSOLE = [
  ".KKKKKKKKKKK.",
  ".K.........K.",
  ".K.........K.",
  ".K.........K.",
  ".K.........K.",
  ".K.........K.",
  ".K.........K.",
  ".KKKKKKKKKKK.",
  ".....KBK.....",
  "....KBBBK....",
];

export const BLIP_HERO_FOUND = [
  ".......T.......",
  ".......K.......",
  ".....KKKKK.....",
  "...KWWWWWWWK...",
  ".KWWWHPPPPPWWK.",
  ".KWWWWPPPPPWWK.",
  ".KWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWK.",
  "...KWWWWWWWK...",
  ".....KKKKK.....",
  "....KCCCCCK....",
  "....KBBBBBK....",
  "....KBBBBBK....",
  "....KBBBBBK....",
  ".....KBBBK.....",
  "......KBK......",
  ".......K.......",
];

