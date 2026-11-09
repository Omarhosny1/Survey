import type { ReactNode } from "react";
import { Logo } from "@/components/atoms/logo";

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function StatusPage({ code, title, description, actions }: StatusPageProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 py-16 text-center">
      <Logo size={28} />
      <p className="mt-10 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
        {code}
      </p>
      <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-[13px] leading-relaxed text-ink-soft">{description}</p>
      {actions && <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </main>
  );
}
