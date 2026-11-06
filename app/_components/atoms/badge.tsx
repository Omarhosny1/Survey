import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "neutral"
  | "forest"
  | "coral"
  | "gold"
  | "slate"
  | "success"
  | "warning"
  | "danger"
  | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-canvas-deep/60 text-ink-soft border-transparent",
  forest: "bg-forest-soft text-forest border-forest/10",
  coral: "bg-coral-soft text-coral-deep border-coral/10",
  gold: "bg-gold-soft text-[#8a6515] border-gold/15",
  slate: "bg-slate-soft text-slate border-slate/10",
  success: "bg-success-soft text-success border-success/10",
  warning: "bg-warning-soft text-warning border-warning/10",
  danger: "bg-danger-soft text-danger border-danger/10",
  outline: "bg-transparent text-ink-soft border-line-strong",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({ tone = "neutral", children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 tracking-[0.01em]",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
