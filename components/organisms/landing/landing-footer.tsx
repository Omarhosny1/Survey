import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Logo } from "@/components/atoms/logo";
import { DemoButton } from "./demo-button";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#product" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Survey library", href: "#surveys" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create an account", href: "/register" },
      { label: "Demo workspace", href: "/dashboard" },
      { label: "Live demo survey", href: "/s/customer-experience-pulse" },
    ],
  },
  {
    title: "The details",
    links: [
      { label: "Data and privacy", href: "#faq" },
      { label: "Demo notes", href: "#faq" },
      { label: "Good to know", href: "#faq" },
    ],
  },
];

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-8 sm:py-14">
      <div className="relative overflow-hidden rounded-2xl bg-forest-deep text-center shadow-lift sm:rounded-3xl">
        <div className="gradient-forest grain absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.07] line-grid" aria-hidden="true" />
        <div
          className="absolute -left-16 -top-20 h-64 w-64 rounded-full border border-cream/10"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full border border-cream/10"
          aria-hidden="true"
        />

        <div className="relative px-6 py-14 sm:px-10 sm:py-18">
          <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-cream/65">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            Your next piece of research
          </span>
          <h2 className="mx-auto mt-6 max-w-[680px] text-balance font-display text-[clamp(2.1rem,5vw,3.6rem)] font-light leading-[1.02] tracking-[-0.04em] text-cream">
            Your next decision starts with a better question.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[13.5px] leading-relaxed text-cream/60 sm:text-sm">
            Open the workspace, explore a live survey, and see how calm research can feel.
            It takes about a minute to find your first insight.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Button
              href="/register"
              variant="accent"
              size="lg"
              className="w-full sm:w-auto"
              iconRight={<Icon name="arrowRight" size={16} />}
            >
              Create your first survey
            </Button>
            <DemoButton
              label="Take the demo tour"
              variant="cream"
              size="lg"
              icon={false}
              className="w-full sm:w-auto"
            />
          </div>
          <p className="mt-4 text-[10px] text-cream/40">
            Free to explore · no credit card · data stays in your browser
          </p>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-line/70">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 sm:py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)] md:gap-8">
          <div className="max-w-[280px]">
            <Link href="/" aria-label="SurveyLand home">
              <Logo size={30} />
            </Link>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">
              A considered survey platform for teams who want to ask better questions — and
              actually understand the answers.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-cream/70 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-faint">
                Powered by Supabase
              </span>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[12px] text-ink-soft transition-colors hover:text-forest"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
          <p className="text-[10.5px] text-ink-faint">
            © 2026 SurveyLand. A front-end demonstration — no payments, emails, or remote data.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-display text-[12px] italic text-ink-faint">
              Made for people who ask.
            </span>
            <a
              href="#top"
              className="flex items-center gap-1 text-[10.5px] font-medium text-ink-faint transition-colors hover:text-forest"
            >
              Back to top
              <Icon name="arrowUpRight" size={11} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
