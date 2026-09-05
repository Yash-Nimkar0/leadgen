import { ViewportStage } from "../components/hero/ViewportStage";
import { SiteNav } from "../components/SiteNav";
import { NoiseToSignal } from "../components/NoiseToSignal";
import { SignalFactory } from "../components/hero/SignalFactory";
import { TheObservatory } from "../components/hero/TheObservatory";
import { LifecycleScene } from "../components/hero/LifecycleScene";
import { ScanDemoScene } from "../components/hero/ScanDemoScene";
import { ArchipelagoScene } from "../components/hero/ArchipelagoScene";
import { ZenithScene } from "../components/hero/ZenithScene";
import { OutpostScene } from "../components/hero/OutpostScene";
import { EdgeOfTheWorld } from "../components/hero/EdgeOfTheWorld";
import { StarField } from "../components/pixel/StarField";
import { starLayer } from "../components/pixel/starLayer";


export default function LandingPage() {
  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-signal selection:text-background overflow-x-clip">
      <StarField />
      <SiteNav />

      <main>
        {/* HERO */}
        <ViewportStage />

        {/* SCROLL MOMENT: NOISE -> SIGNAL */}
        <NoiseToSignal />

        {/* SIGNAL FACTORY (Scene 3) */}
        <SignalFactory />

        {/* THE OBSERVATORY (Scene 4) */}
        <TheObservatory />

        {/* LEAD LIFECYCLE (Scene 5) */}
        <LifecycleScene />

        {/* SCAN DEMO (Scene 6) */}
        <ScanDemoScene />

        {/* THE ARCHIPELAGO (Scene 7) */}
        <ArchipelagoScene />

                {/* THE QUIET ZENITH (Scene 8) */}
        <ZenithScene />

        {/* FINAL CTA / THE OUTPOST (Scene 9) */}
        <OutpostScene />
      </main>

      {/* EDGE OF THE WORLD (Scene 10) */}
      <EdgeOfTheWorld />
    </div>
  );
}
