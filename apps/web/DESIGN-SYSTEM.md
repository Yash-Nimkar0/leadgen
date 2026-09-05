# LeadGen Design System

This document is inferred from the strongest, most-finished parts of the product —
the marketing site (`app/page.tsx` and its components) and the lead detail page
(`app/(dashboard)/projects/[projectId]/leads/[leadId]/page.tsx`). Nothing here is
invented; every rule below is a pattern that already exists somewhere in the
codebase and is being made explicit so it can be applied consistently everywhere
else. Where the current code violates its own pattern, that's listed at the
bottom under **Contradictions in the current codebase**, not folded into the
rules themselves.

**How to use this doc:** before touching any screen, check what this file says
about that kind of element. If a screen does something this file doesn't cover,
match it to the nearest covered case rather than inventing a new pattern.

---

## 1. What makes this product distinctive

The whole product is one idea: **finding one real signal inside a wall of
noise.** Not "AI-powered," not "retro for the sake of retro" — specifically the
act of separating something that matters from a lot of things that don't. Every
distinctive visual choice traces back to that:

- The **segmented score meter** (`ScoreDial`) reads like a signal-strength
  meter, not a percentage bar — because the score *is* a signal-strength
  reading.
- The **green / amber / red** system means real-opportunity / needs-a-human-look /
  rejected — it is never used as decoration.
- The **pixel/terminal register** (hard edges, monospace type, bracketed
  commands) reads as an instrument panel, not a toy — it's "mission control,"
  not "video game."
- The **hero scene, radar map, and scan demo** on the marketing site show the
  mechanism (noise dimming, one thing lighting up) instead of describing it in
  a paragraph.

If a proposed change doesn't reinforce "finding the one signal that matters,"
it doesn't belong, no matter how good it looks in isolation.

## 2. Never do this

- Never add a rounded corner. Radius is `0` everywhere, no exceptions. A
  rounded button, rounded card, or rounded pill immediately reads as "generic
  SaaS template" against everything else on the page.
- Never use a soft/blurred drop shadow on a UI element (button, card, badge).
  Shadows here are hard-offset pixel shadows only (see §7). Soft shadows are
  reserved for atmospheric glow behind illustrations, never on interface
  chrome.
- Never introduce a second accent color. Green is the one accent. Amber and
  red exist only as the other two points on the same semantic scale (review /
  rejected), never as decoration or a second "brand color."
- Never use the pixel display font (`font-pixel`, Press Start 2P) for
  anything longer than 2–3 words, or for any real user-generated content
  (lead titles, project names, post bodies). It is unreadable at paragraph
  length by design — that's fine for a hero headline, not fine for a lead
  title.
- Never style real user content (Reddit post titles, post bodies, project
  names users typed in) in the terminal or pixel fonts. That content must
  stay in the plain body sans so it's genuinely easy to read regardless of
  length or characters. The brand voice belongs to *our* labels and copy, not
  to text a stranger on Reddit wrote.
- Never add a generic icon library flourish (gradient blobs, glassmorphism,
  floating 3D shapes, stock illustration, "AI sparkle" icons). If a visual
  needs an icon, it's either a `lucide-react` icon used plainly, or a
  purpose-built pixel sprite from `components/pixel/`.
- Never invent a new visual direction for a screen because it "needs
  something more." Every screen pulls from this system. If the system
  genuinely can't express something, that's a conversation, not a one-off
  workaround.

## 3. Color

One token system, shared by the marketing site and the authenticated app —
there is no separate light theme. Defined in `app/globals.css` (CSS variables)
and `tailwind.config.js` (`ink`, `paper`, `signal`, `amber`).

| Token | Value | Meaning / where it's used |
|---|---|---|
| `background` | `hsl(210 22% 6%)` — near-black navy | Page background everywhere |
| `foreground` | `hsl(150 12% 92%)` — phosphor off-white | Default text |
| `card` | `hsl(212 20% 9%)` | Any raised surface: cards, panels, dossier boxes |
| `muted` / `muted-foreground` | `hsl(210 16% 13%)` / `hsl(205 10% 58%)` | Secondary surfaces, secondary text, disabled-ish states |
| `border` | `hsl(208 16% 21%)` | All hairline/hard borders |
| `signal` (`primary`/`accent`) | `#3ADD82` | **The** accent. A real, positive signal: high intent, good lead, converted, primary CTA, focus ring |
| `amber` | `#FFC53D` | Needs a human look: medium-confidence score, "contacted," warnings |
| `destructive` | `hsl(3 100% 68%)` | Rejected, bad lead, errors only — never decorative |
| `ink` / `ink-surface` / `ink-line` | `#0A0D11` / `#121821` / `#2B3542` | Marketing-page-specific dark tones (kept distinct from the semantic tokens above because the marketing shell composes its own scenes; the *authenticated app* should use the semantic tokens, not these directly) |

**Rule:** color always means something. Before using green/amber/red anywhere,
name the state it represents. If you can't name it, use `muted` or `border`
instead.

## 4. Typography

Three fonts, three jobs. Declared in `app/layout.tsx`, mapped in
`tailwind.config.js` as `font-pixel`, `font-terminal`, `font-sans` (default).

| Font | Tailwind class | Job | Never use for |
|---|---|---|---|
| **Press Start 2P** | `font-pixel` | Hero headlines (2–4 words), score digits, the biggest HUD numbers. The one moment of real typographic drama per page. | Anything longer than a short phrase. Any real content. Body copy. |
| **VT323** | `font-terminal` | Everything that is *our* label, not the user's content: nav links, section eyebrows (`[ LIKE THIS ]`), badges, buttons, form labels, HUD readouts, small headings inside product UI (`Score Breakdown`, `Original Conversation`). | Long-form paragraphs a user needs to read comfortably at length; real user-generated content. |
| **Geist Sans** (default `font-sans`) | *(default, no class needed)* | Real content once it's *displayed*: lead/post titles, post bodies, longer descriptive paragraphs, a project/pipeline name shown as a heading. Anywhere legibility matters more than voice. | — |
| Geist Mono | `font-mono` | Not currently used deliberately anywhere — treat as reserved/unused rather than reaching for it. | — |

**Form-control values vs. displayed content:** the active value inside a form
control (`Input`/`Textarea`, per §10) is `font-terminal` regardless of what's
being typed — that includes onboarding fields, search boxes, and settings
inputs. This is not an exception to the rule above; it's a different thing.
Geist Sans governs how a value reads once it becomes *displayed* content — a
saved project name shown as a page heading, a submitted post title, a post
body — not the live typing experience inside a control.

**Page-level headings:** a screen's own title (e.g. "Settings," "Test a
Post," the dashboard greeting) is our interface speaking, not user content —
it takes the terminal Section heading treatment below (`font-terminal
text-4xl tracking-wide`, per the Dashboard). A heading that *is* or *directly
incorporates* real content — a lead title, an onboarding step's own question,
a project name shown as a heading — takes the Geist Sans `font-medium
tracking-tight` treatment instead. The line is ownership, not location: who
authored the words determines the font, not which kind of page they appear
on.

**Sizing:** there's no fixed numeric scale to memorize — match the nearest
canonical example:
- Hero/pixel headline: `text-[1.85rem] sm:text-5xl lg:text-6xl` (see hero `h1`)
- Section heading (terminal): `text-4xl sm:text-5xl tracking-wide`
- Page-level heading in the app (real content, e.g. a lead title): `text-3xl md:text-4xl font-medium tracking-tight`
- Section label / eyebrow (terminal, uppercase): `text-sm tracking-widest uppercase` (labels like "Score Breakdown") or `text-lg tracking-[0.2em] uppercase` (marketing eyebrows)
- Body copy: `text-base` / `text-lg` depending on context, `leading-relaxed`

**Weight:** mostly regular weight (both pixel fonts only ship one weight).
Where Geist Sans is used for real content headings, `font-medium` is the
house weight for emphasis — never `font-bold` (reads generic-template).

## 5. Backgrounds

- Default: flat `bg-background`.
- Raised surface: `bg-card`.
- The marketing site additionally layers atmosphere behind content — the
  `StarField` (gradient sky + drifting stars) and `NoiseField` (animated
  canvas dither) components. **These are marketing-page-only.** The
  authenticated app does not get a starfield or noise canvas behind ordinary
  screens — that atmosphere is the "front door," not the everyday workspace.
  (See §16 for where mission-control atmosphere *is* appropriate inside the
  app.)
- `scanlines` utility (a very faint repeating-gradient texture) may be used
  on panels that represent a "live feed" or scanner readout — not on plain
  content cards.

## 6. Borders

- `border-2 border-border` is the standard border for any contained element
  (card, panel, row, input, badge). Not `border` (too thin to read as
  intentional against this palette) and not `border-4` (too heavy).
- `border-l-2` for a quoted/attributed block (e.g. the original Reddit post
  body).
- Borders are always solid `border-border` (or a semantic color at reduced
  opacity, e.g. `border-signal/50` on a badge) — never dashed, except
  specifically for an empty-state placeholder (see §13), where dashed
  signals "nothing here yet."

## 7. Corner radius

**Zero, everywhere, no exceptions.** `--radius` is `0px` in `globals.css`.
Any `rounded-*` class anywhere in the app is a bug, not a style choice —
see the contradictions list.

## 8. Shadows

Hard-offset pixel shadows only, defined in `tailwind.config.js`:

| Class | Use |
|---|---|
| `shadow-pixel` | Default resting state for cards, buttons (destructive/outline/secondary), rows |
| `shadow-pixel-lg` | Hover-lifted state for the above (paired with `hover:-translate-x-0.5 hover:-translate-y-0.5`) |
| `shadow-pixel-signal` | Resting state specifically for the *primary* action (the one green button, the hero panel) |
| `shadow-pixel-signal-lg` | Hover-lifted state for the primary action |

The interaction is always three discrete states, never an eased blur: **rest
→ lift on hover (shadow grows, element pulls away) → press flush on
click** (`active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`).
See `components/ui/Button.tsx` — that mechanic is canonical and should be
reused (not reinvented) anywhere else something needs to feel pressable.

## 9. Spacing & layout

- No new spacing scale — use Tailwind's default scale as the existing code
  does. Section-level rhythm on the marketing page is `py-24 md:py-32`
  between major sections, `gap-16` inside the hero grid, `space-y-12` between
  major blocks on the lead detail page.
- Content max-widths follow the canonical examples: `max-w-4xl` for a
  reading-focused page (lead detail), `max-w-6xl` for a wide section
  (marketing sections, dashboard lists), `max-w-2xl`/`max-w-3xl` for a single
  centered column (scan demo, final CTA).
- Grid: `grid lg:grid-cols-12` for the two-column hero; simple `grid
  sm:grid-cols-2` / `grid-cols-2 sm:grid-cols-4` for card/stat groups
  elsewhere. Don't invent a different column count without a reason.

## 10. Components

### Buttons
Canonical: `components/ui/Button.tsx`. Variants: `default` (signal green,
the one primary action per screen), `outline`, `secondary`, `destructive`,
`ghost`, `link`. See §11 for exactly when button text gets `[ bracket ]`
treatment.

### Inputs / Labels
Canonical: `components/ui/Input.tsx`. `border-2 border-border`, `font-terminal`
for the typed value, uppercase `font-terminal text-sm tracking-widest` label
above it. No rounded corners, no soft focus glow — `focus-visible:ring-2
ring-primary`.

### Selects
No dedicated Select component exists yet. When one is built, it must follow
Input's exact border/radius/font treatment — a native `<select>` or a custom
one, either way it should be visually indistinguishable in weight from
`Input` (same border, same height, same font), with a plain (not colored)
chevron icon.

### Filters
Canonical intent, current implementation violates it (see contradictions).
The rule: filter controls are the same `border-2`, square-cornered treatment
as everything else — never `rounded-full` pill buttons. A filter that's
currently active should use the `signal` accent (border or background at low
opacity), not the default button fill, so "what's currently filtered" reads
as a signal-state, not just a selected button.

### Badges / status indicators
Canonical: `components/Badges.tsx`. One shared base:
`inline-flex items-center px-2 py-0.5 font-terminal text-sm tracking-widest
uppercase border-2`, colored per the semantic table in §3. Every status
badge in the product should be built from this exact base, not a new
one-off pill.

### Cards
Canonical: `components/ui/Card.tsx` — `border-2 bg-card shadow-pixel`, no
radius. Internal padding via `CardHeader`/`CardContent`/`CardFooter`
(`p-6`).

### Tables / lists
Canonical: `components/LeadRow.tsx`. A list row is a full-width bordered
block (`border-2 border-border bg-card`), not a table with cell borders —
this product doesn't have a "data table" register, it has a "row of
findings" register. Hover state: `hover:bg-muted/30 hover:shadow-pixel`.
Real content (the lead title) stays in default `font-semibold` sans; our
labels (badges, subreddit tag, date) are small and muted around it.

### Sidebar / navigation
Marketing nav (`components/SiteNav.tsx`) is canonical: sparse, `font-terminal`
links, an animated underline on the active section, a compact/blurred state
on scroll. The authenticated app's sidebar (`components/DashboardNav.tsx`)
follows the same structural pattern. **Static/system labels** ("Overview,"
"Settings") take the same `font-terminal` treatment as `SiteNav`.
**User-generated labels** in the same list (a pipeline/project name) stay
Geist Sans — the row's content determines the font, not its position in the
sidebar.

### Modals
None exist in the codebase yet. When one is needed: `border-2 bg-card
shadow-pixel`, square corners, same as `Card` — a modal is a `Card` that
floats, not a new visual object. Backdrop: `bg-background/80` (no blur —
blur reads soft/generic; a flat dim is more in keeping with the hard-edge
system).

### Empty states
Canonical: the dashboard's "no pipelines yet" state — `border-2
border-dashed border-border bg-card/40`, an icon in a small bordered box,
`font-terminal` heading, one clear action button. Dashed border is reserved
specifically for "nothing here yet, here's how to start" — not used
elsewhere.

### Loading states
No canonical pattern exists yet in the app screens (only the marketing
"scan demo" has a designed loading sequence — a progress bar in `amber` plus
a cycling `font-terminal` status line). That *is* the pattern to reuse for
any real loading state in the product: a thin `amber` progress bar and a
one-line status readout, not a generic spinner, wherever the wait is long
enough to need explanation. Where a wait is sub-second, a plain disabled-button
state (already in `Button`) is enough — don't manufacture ceremony for a
400ms request.

### Error states
Canonical pattern (from forms already updated this pass):
`border-2 border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive`.
Plain, short, states what happened — no icon required unless the icon adds
real information.

### Notifications
No in-app toast/notification component exists yet. When built, follow the
error-state block above for structure, swap the color per §3 (signal for
success, amber for warning, destructive for error), and keep it a flat
bordered block anchored to a corner — not a rounded floating pill.

### Score / signal visualization
Canonical: `components/ScoreDial.tsx`. Segmented meter (10 blocks), not a
circular gauge or a plain percentage bar. Counts up from 0 the first time it
scrolls into view. This is the single most distinctive component in the
product — reuse it (with its `trackClassName`/`progressClassName`/
`labelClassName` overrides) rather than building a second score
visualization anywhere.

### Lead rows
Canonical: `components/LeadRow.tsx` (see §10 Tables/lists above).

### Lead detail components
Canonical: the entire lead detail page. The structure — badges row → title
→ metadata line → **Why this was surfaced** (large, prominent) → **What
they need** / **Recommended action** (two-column) → **Score Breakdown**
(`ScoreDial` + relevance/intent bars) → **Original Conversation** (quoted,
`border-l-2`) → **Action** (status buttons in a bordered block) — is the
template for any "here's a finding, here's the evidence, here's what to do"
screen in the product. Section labels are always `font-terminal text-sm
tracking-widest uppercase text-muted-foreground`; section dividers are plain
`<hr className="border-border/50" />`.

### Onboarding
**Not yet on-system — this is fix #1.** Currently plain default styling (see
contradictions). Target: the step titles/descriptions move to the same
voice as the rest of the product (`font-terminal` for the step label/eyebrow,
plain sans for the actual question since it's content the user reads
carefully), the step indicator becomes a segmented/bracketed HUD element in
the spirit of `ScoreDial`, not a generic numbered-circle stepper, and the
whole flow should feel like "configuring an instrument," matching the
promise the marketing site already makes about onboarding.

### Mobile / responsive behavior
No separate mobile design — same components, standard Tailwind responsive
prefixes (`sm:`/`md:`/`lg:`), verified by hand on a 390px viewport for each
new/changed screen. Two things to check specifically on mobile: (1) hero-style
pixel headlines need a smaller base size before any `sm:`/`lg:` step-up, since
Press Start 2P is very wide and wraps aggressively; (2) any absolutely
positioned decorative sprite (planet, satellite, stars) needs to be checked
for overflow/collision at narrow widths, not just assumed to scale down
cleanly.

## 11. The `[ bracket ]` rule

The bracketed-command style (`[ Start scanning ]`) is a **signature device
for commands that matter**, not the default state of every button.

**Use it for:**
- The single primary call-to-action on the marketing site (hero CTA, final
  CTA).
- Section eyebrows (`[ SIGNAL HQ ]`, `[ EXPLORE IT YOURSELF ]`) — these are
  already established as bracketed everywhere on the marketing page.
- Genuinely command-like actions inside the product: "run a scan," "start
  pipeline," things that feel like issuing an instruction to the system.

**Do not use it for:**
- Routine CRUD actions inside the app (save settings, mark as viewed, cancel,
  back). These are common, repeated, low-ceremony actions — bracketing every
  one of them turns a signature device into wallpaper and makes the actual
  signature moments (the marketing CTAs) less special.
- Destructive/secondary actions (dismiss, delete) — plain label only.
- Any button inside a dense list or table row, where the bracket characters
  just add visual noise at small sizes.

**Rule of thumb:** if you'd be comfortable saying the label out loud as a
command to a machine ("start scanning," "run scan"), it can take the
bracket. If it's ordinary app housekeeping ("save," "cancel," "mark
viewed"), it stays plain.

## 12. How "mission control" should show up inside the product (not just marketing)

The marketing site gets the full atmosphere — starfield, noise canvas, pixel
sprites, scan demo — because it's a one-time, attention-grabbing front door.
The authenticated app should **not** import that atmosphere wholesale (see
§5) — a user staring at their lead inbox for twenty minutes a day does not
want a drifting starfield behind it. Instead, the mission-control feeling
inside the product should come from three things that are *already* correct
in the lead detail page and need to be extended everywhere else:

1. **Instrument-grade data display** — `ScoreDial`, segmented meters, and
   `font-terminal` HUD-style labels for our own copy, applied consistently.
2. **Evidence-first structure** — every "finding" (a lead, eventually
   maybe other object types) is presented as *claim → evidence → action*,
   the way the lead detail page already does it.
3. **A calm, square, high-contrast surface** — hard edges and real
   restraint, so the few moments of green accent or motion (a score
   counting up, a status change) read as significant because everything
   around them is quiet.

If a screen needs "more mission control," the fix is almost always
"apply the existing structure more completely," not "add a new decorative
sprite."

## 13. Canonical references — treat these as ground truth

- `app/page.tsx` + `components/SiteNav.tsx`, `SignalHuntScene.tsx`,
  `NoiseToSignal.tsx`, `PixelRadar.tsx`, `ScanDemo.tsx`, `LeadExample.tsx`,
  `LeadLifecycle.tsx` — marketing site, structure and motion language.
- `app/(dashboard)/projects/[projectId]/leads/[leadId]/page.tsx` — the
  lead-detail template described in §10.
- `components/ui/Button.tsx`, `Card.tsx`, `Input.tsx` — primitive contracts.
- `components/Badges.tsx`, `ScoreDial.tsx` — status/score visualization.
- `components/LeadRow.tsx` — list-row template.
- `app/globals.css`, `tailwind.config.js` — the actual token values; if this
  document and the code ever disagree on a number, the code's tokens win and
  this document should be corrected to match.

## 14. Animation & interaction principles

- Entrances: fade-up on scroll via `Reveal`/`RevealGroup`/`RevealItem`
  (`components/Reveal.tsx`) — the one entrance grammar for the marketing
  page. Reuse it rather than writing a new `whileInView` block per section.
- Ambient motion (starfield drift, radar sweep, bob/pulse) is `animation:
  infinite` CSS, not JS-driven — cheap and consistent. Reuse the existing
  `animate-pixel-*` / `animate-star-*` utility classes in `globals.css`
  rather than authoring new keyframes for a similar effect.
- Discrete state changes (score counting up, a button press, a lead scan
  resolving) are the moments that get intentional, once-only animation —
  never looped for its own sake.
- Everything respects `prefers-reduced-motion` — the global CSS override in
  `globals.css` handles CSS animations/transitions automatically; any
  component using Framer Motion or a JS-driven loop (`SignalHuntScene`,
  `ScoreDial`, `NoiseField`, `PixelRadar`) must check
  `useReducedMotion()`/`matchMedia` itself and fall back to a static,
  correct end-state — never a frozen mid-animation frame.

---

## Contradictions in the current codebase

Checked every file above against the rules in this document. These are real,
current violations — not hypothetical risks:

1. **Onboarding (`components/NewProjectWizard.tsx`)** — step titles and
   descriptions render in plain default styling with no `font-terminal`
   treatment at all. The first screen a paying user sees is off-system.
   *(Fix #1.)*
2. **Dashboard sidebar (`app/(dashboard)/layout.tsx`)** — nav items use
   `rounded-lg`, the "add pipeline" button uses `rounded-full`. Violates §7
   (zero radius) in the one piece of chrome visible on every single screen.
   *(Fix #2.)*
3. **Leads list filters (`app/(dashboard)/projects/[projectId]/leads/page.tsx`)**
   — filter buttons use `rounded-full`; the empty-state box uses
   `rounded-2xl`. Violates §7 and doesn't follow the empty-state pattern in
   §10.
4. **Account settings (`app/(dashboard)/settings/page.tsx`)** — wrapper uses
   `rounded-xl border border-border` instead of the `Card` primitive's
   `border-2`, no-radius treatment.
5. **Dev/test tool panels** (`components/ExternalIngestionTrigger.tsx`,
   `components/MockIngestionTrigger.tsx`, `components/TestPostForm.tsx`) —
   mix of `rounded-md`/`rounded-xl` and, in `ExternalIngestionTrigger.tsx`
   specifically, hardcoded `blue-*` colors that don't exist anywhere in the
   color system (§3). Lower priority since these are dev-only tools, but
   listed for completeness.
6. **Bracket-button usage is not yet consistent** — some in-app buttons
   already avoid it correctly (status buttons, form submits), but this
   hasn't been audited screen-by-screen against the rule in §11 yet; worth a
   pass once the higher-priority fixes are done.

Nothing else checked (Button, Card, Input, Badges, ScoreDial, LeadRow, the
lead detail page, the marketing site) contradicts this document — those are
exactly why they're the canonical references.
