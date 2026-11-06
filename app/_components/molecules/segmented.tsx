"use client";

import { cn } from "@/app/_lib/utils";

interface SegmentedOption {
  value: string;
  label: string;
  count?: number;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
  size?: "sm" | "md";
}

export function Segmented({ options, value, onChange, className, ariaLabel, size = "sm" }: SegmentedProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-line bg-canvas/70 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-[6px] font-medium transition-colors duration-150",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              active
                ? "bg-surface text-ink shadow-[0_1px_2px_rgba(21,33,28,0.08)]"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {option.label}
            {typeof option.count === "number" && (
              <span className={cn("text-[10px]", active ? "text-ink-faint" : "text-ink-faint/80")}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
