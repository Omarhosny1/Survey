import type { Metadata } from "next";
import { LandingNav } from "@/app/_components/organisms/landing/landing-nav";
import { LandingHero } from "@/app/_components/organisms/landing/landing-hero";
import { FeatureBento } from "@/app/_components/organisms/landing/feature-bento";
import {
  HowItWorks,
  Manifesto,
  TemplateLibrary,
} from "@/app/_components/organisms/landing/landing-story";
import { Faq, Pricing } from "@/app/_components/organisms/landing/landing-pricing";
import { FinalCta, LandingFooter } from "@/app/_components/organisms/landing/landing-footer";

export const metadata: Metadata = {
  title: "Surveys that feel like a conversation",
  description:
    "SurveyLand is a considered survey platform: write better questions, share them beautifully, and turn answers into clear decisions. Explore the local demo workspace.",
};

const audiences = [
  "Product teams",
  "Research teams",
  "Design studios",
  "Agencies",
  "People teams",
  "Nonprofits",
];

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-canvas">
      <LandingNav />
      <main>
        <LandingHero />

        <section className="border-y border-line/70 bg-cream/35" aria-label="Who SurveyLand is for">
          <div className="mx-auto flex w-full max-w-295 flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
            <p className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
              Built for teams who ask
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {audiences.map((audience) => (
                <span
                  key={audience}
                  className="font-display text-[13.5px] tracking-tight text-ink-soft/80 transition-colors hover:text-forest"
                >
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </section>

        <FeatureBento />
        <HowItWorks />
        <TemplateLibrary />
        <Manifesto />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
