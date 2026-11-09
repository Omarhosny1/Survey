"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/atoms/logo";
import { Icon } from "@/components/atoms/icon";
import { Button } from "@/components/atoms/button";
import { useSession } from "@/features/auth/store";
import { cn } from "@/lib/utils";

const links = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Surveys", href: "#surveys" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNav() {
  const { profile, hydrated } = useSession();
  const [open, setOpen] = useState(false);
 const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sessionReady = mounted && hydrated;
  return (
    <header className="sticky top-0 z-50 border-b border-line/75 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-[1180px] items-center gap-8 px-5 sm:px-8">
        <Link href="/" aria-label="SurveyLand home" className="shrink-0">
          <Logo size={30} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-[12.5px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-forest transition-[width] duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {!sessionReady ? (
            <div className="h-9 w-9 animate-pulse rounded-md bg-line/50" />
          ) : profile ? (
            <Button href="/dashboard" variant="secondary" iconRight={<Icon name="arrowRight" size={15} />}>
              Open workspace
            </Button>
          ) : (
            <>
              <Button href="/login" variant="secondary">
                Sign in
              </Button>
              <Button href="/register" iconRight={<Icon name="arrowRight" size={15} />}>
                Start free
              </Button>
            </> 
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="ml-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line bg-surface text-ink-soft md:hidden"
        >
          <Icon name={open ? "x" : "menu"} size={18} />
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-line/70 bg-canvas transition-[max-height] duration-300 md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0",
        )}
      >
        <nav className="space-y-1 px-5 py-4" aria-label="Mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas-deep/60 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <div className="grid gap-2 pt-3">
            {!sessionReady ? (
              <div className="h-9 w-full animate-pulse rounded-md bg-line/50" />
            ) : profile ? (
              <Button href="/dashboard" variant="secondary" iconRight={<Icon name="arrowRight" size={15} />}>
                Open workspace
              </Button>
            ) : (
              <>
                <Button href="/login" variant="secondary">
                  Sign in
                </Button>
                <Button href="/register" iconRight={<Icon name="arrowRight" size={15} />}>
                  Start free
                </Button>
              </>
            )}  
          </div>
        </nav>
      </div>
    </header>
  );
}
