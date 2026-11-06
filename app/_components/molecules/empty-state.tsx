import type { ReactNode } from "react";
import { cn } from "@/app/_lib/utils";
import { Icon, type IconName } from "@/app/_components/atoms/icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon = "layers",
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong/80 bg-cream/50 px-6 text-center",
        compact ? "py-10" : "py-16",
        className,
      )}
    >
      <div className="relative mb-4">
        <span className="absolute inset-0 rounded-full bg-forest-soft blur-xl" aria-hidden="true" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-forest/10 bg-surface text-forest shadow-soft">
          <Icon name={icon} size={20} />
        </span>
      </div>
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-soft">{description}</p>
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
