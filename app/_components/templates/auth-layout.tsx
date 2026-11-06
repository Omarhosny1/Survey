import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@/app/_components/atoms/avatar";
import { Icon } from "@/app/_components/atoms/icon";
import { Logo } from "@/app/_components/atoms/logo";
import { Sparkline } from "@/app/_components/molecules/charts";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="SurveyLand home">
            <Logo size={30} />
          </Link>
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-[11px] font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            <Icon
              name="arrowLeft"
              size={12}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to website
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[404px]">{children}</div>
        </main>

        <footer className="flex items-center justify-between gap-4 border-t border-line/70 pt-4 text-[10px] text-ink-faint">
          <span>Â© 2026 SurveyLand</span>
          <span className="flex items-center gap-1.5">
            <Icon name="shield" size={11} />
            Demo build Â· data stays local
          </span>
        </footer>
      </div>

      <aside className="relative hidden overflow-hidden bg-forest-deep lg:m-3 lg:ml-0 lg:block lg:rounded-[26px]">
        <div className="gradient-forest grain absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.06] line-grid" aria-hidden="true" />
        <div
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-cream/10"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-cream/10"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute right-8 top-16 select-none font-display text-[180px] leading-none text-cream/[0.06]"
          aria-hidden="true"
        >
          &ldquo;
        </span>

        <div className="relative flex h-full flex-col justify-between p-9 xl:p-12">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/[0.06] px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-cream/65">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              Thoughtful research, made simple
            </span>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-cream/30">
              Est. 2026
            </span>
          </div>

          <div className="my-auto max-w-[430px] py-10">
            <p className="font-display text-[clamp(1.9rem,3.1vw,2.85rem)] font-light leading-[1.08] tracking-[-0.035em] text-cream">
              The questions you ask shape the answers you get.
            </p>
            <p className="mt-4 max-w-[360px] text-[13px] leading-relaxed text-cream/55">
              SurveyLand gives every question a little more care â€” so the answers are worth
              acting on.
            </p>

            <div className="mt-8 rounded-xl border border-cream/15 bg-cream/[0.07] p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-cream/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#69c69e]" />
                  Live survey
                </span>
                <span className="font-mono text-[8px] text-cream/35">Last 14 days</span>
              </div>
              <p className="mt-2.5 font-display text-[17px] tracking-tight text-cream">
                Customer Experience Pulse
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 border-y border-cream/10 py-3">
                {[
                  { value: "384", label: "Responses" },
                  { value: "87.6%", label: "Completion" },
                  { value: "4.8m", label: "Median time" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-[17px] leading-none text-cream">{stat.value}</p>
                    <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.1em] text-cream/35">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div className="flex -space-x-1.5">
                  {["Maya Chen", "Leo Fischer", "Priya Shah", "Jon Bell"].map((name) => (
                    <span key={name} className="rounded-full ring-2 ring-forest-deep">
                      <Avatar name={name} size="xs" className="h-5 w-5 text-[7px]" />
                    </span>
                  ))}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cream/10 font-mono text-[6.5px] text-cream/60 ring-2 ring-forest-deep">
                    +41
                  </span>
                </div>
                <Sparkline
                  data={[8, 12, 10, 17, 14, 21, 18, 26, 22, 31]}
                  color="#9fd8c0"
                  width={84}
                  height={24}
                />
              </div>
              <p className="mt-2 text-[8.5px] text-cream/40">
                12 new responses today Â· every one read by a person
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-cream/10 pt-4">
            <span className="font-display text-[11px] italic text-cream/35">
              Made for people who ask.
            </span>
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-1 w-1 rounded-full bg-cream/25" />
              <span className="h-1 w-1 rounded-full bg-cream/25" />
              <span className="h-1 w-1 rounded-full bg-coral" />
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
