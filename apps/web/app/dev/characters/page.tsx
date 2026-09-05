import { notFound } from "next/navigation";
import { Blip } from "../../../components/pixel/Blip";
import { NoiseCreature } from "../../../components/pixel/NoiseCreature";

/**
 * Dev-only character style guide — not part of the marketing site, not
 * linked from anywhere. A place to inspect the LeadGen character cast in
 * isolation (states, sizes, reduced-motion) before it gets built into any
 * real scene. Same dev-gating pattern as RunMockScanButton.
 */
export default function CharacterGalleryPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-10 space-y-16 font-sans">
      <div>
        <h1 className="font-terminal text-3xl tracking-wide text-signal">LeadGen Character Gallery</h1>
        <p className="text-muted-foreground mt-1">Dev-only. Not linked from the site.</p>
      </div>

      {/* BLIP — large */}
      <section>
        <h2 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground mb-4">
          Blip — states, large
        </h2>
        <div className="flex items-end gap-12">
          {(["idle", "scan", "found"] as const).map((state) => (
            <div key={state} className="flex flex-col items-center gap-3">
              <div className="h-32 w-32 border-2 border-border bg-card flex items-center justify-center p-4">
                <Blip state={state} className="h-full w-full" />
              </div>
              <span className="font-terminal text-sm text-muted-foreground uppercase tracking-widest">{state}</span>
            </div>
          ))}
        </div>
      </section>

      {/* BLIP — small, mid, tiny (readability at scale) */}
      <section>
        <h2 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground mb-4">
          Blip — scale test (silhouette readability)
        </h2>
        <div className="flex items-end gap-8">
          {[96, 48, 24, 16].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <div
                className="border-2 border-border bg-card flex items-center justify-center"
                style={{ height: size, width: size }}
              >
                <Blip state="found" className="h-full w-full" />
              </div>
              <span className="font-terminal text-xs text-muted-foreground">{size}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* NOISE CREATURES — all 5 variants */}
      <section>
        <h2 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground mb-4">
          Noise creature family — 5 variants
        </h2>
        <div className="flex items-end gap-8">
          {([1, 2, 3, 4, 5] as const).map((v, i) => (
            <div key={v} className="flex flex-col items-center gap-3">
              <div className="h-24 w-24 border-2 border-border bg-card flex items-center justify-center p-3">
                <NoiseCreature variant={v} delayMs={i * 220} className="h-full w-full" />
              </div>
              <span className="font-terminal text-xs text-muted-foreground">#{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SIGNAL TRANSFORMATION — noise vs. signal, side by side */}
      <section>
        <h2 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground mb-4">
          Signal transformation — variant 1, before / after
        </h2>
        <div className="flex items-end gap-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-28 w-28 border-2 border-border bg-card flex items-center justify-center p-4">
              <NoiseCreature variant={1} className="h-full w-full" />
            </div>
            <span className="font-terminal text-sm text-muted-foreground uppercase tracking-widest">Noise (at rest)</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="h-28 w-28 border-2 border-signal/50 bg-signal/10 flex items-center justify-center p-4">
              <NoiseCreature variant={1} signal className="h-full w-full" />
            </div>
            <span className="font-terminal text-sm text-signal uppercase tracking-widest">Signal (found)</span>
          </div>
        </div>
      </section>

      {/* A crowd, for context — how the field reads together */}
      <section>
        <h2 className="font-terminal text-sm tracking-widest uppercase text-muted-foreground mb-4">
          A field, for context (one signal among noise)
        </h2>
        <div className="border-2 border-border bg-card p-8 flex items-center gap-6 flex-wrap max-w-3xl">
          {[2, 4, 5, 3, 2, 4, 5].map((v, i) => (
            <div key={i} className="h-14 w-14">
              <NoiseCreature variant={v as 1 | 2 | 3 | 4 | 5} delayMs={i * 180} className="h-full w-full" />
            </div>
          ))}
          <div className="h-16 w-16">
            <NoiseCreature variant={1} signal className="h-full w-full" />
          </div>
          {[1, 3, 4, 2].map((v, i) => (
            <div key={`b-${i}`} className="h-14 w-14">
              <NoiseCreature variant={v as 1 | 2 | 3 | 4 | 5} delayMs={(i + 3) * 180} className="h-full w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
