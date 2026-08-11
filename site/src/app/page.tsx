import Hero from "@/components/hero";
import { LibrarySection } from "@/components/library-section";
import { PageGround } from "@/components/page-ground";
import { PricingSection } from "@/components/pricing-section";
import { PanelSection } from "@/components/panel-section";
import { Ticker } from "@/components/ticker";

export default function Page() {
  return (
    <>
      <PageGround />
      <main>
        <Hero />
        <Ticker />
        <LibrarySection />
        <PanelSection />
        <PricingSection />
      </main>
    </>
  );
}
