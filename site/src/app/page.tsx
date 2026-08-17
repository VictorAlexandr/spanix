import { ApiSection } from "@/components/api-section";
import { FilmSection } from "@/components/film-section";
import { Footer } from "@/components/footer";
import { GuaranteeSection } from "@/components/guarantee-section";
import { LangProvider } from "@/components/i18n";
import Hero from "@/components/hero";
import { LibrarySection } from "@/components/library-section";
import { PageGround } from "@/components/page-ground";
import { PanelSection } from "@/components/panel-section";
import { ReachSection } from "@/components/reach-section";
import { RoadSection } from "@/components/road-section";
import { Ticker } from "@/components/ticker";

export default function Page() {
  return (
    <LangProvider>
      <PageGround />
      <main>
        <Hero />
        <Ticker />
        <LibrarySection />
        <FilmSection />
        <PanelSection />
        <GuaranteeSection />
        <ApiSection />
        <ReachSection />
        <RoadSection />
      </main>
      <Footer />
    </LangProvider>
  );
}
