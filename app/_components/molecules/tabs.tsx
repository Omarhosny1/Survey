"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
  variant?: "underline" | "pill";
}

export function Tabs({ tabs, value, onChange, className, ariaLabel, variant = "underline" }: TabsProps) {
  if (variant === "pill") {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn("inline-flex flex-wrap items-center gap-1 rounded-lg bg-canvas-deep/50 p-1", className)}
      >
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.value)}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium transition-all duration-150",
                active
                  ? "bg-surface text-ink shadow-soft"
                  : "text-ink-soft hover:bg-surface/60 hover:text-ink",
              )}
            >
              {tab.icon}
              {tab.label}
              {typeof tab.count === "number" && (
                <span className="rounded-full bg-canvas-deep px-1.5 py-0.5 text-[10px] leading-none text-ink-soft">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-6 border-b border-line", className)}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative inline-flex cursor-pointer items-center gap-2 pb-3 pt-1 text-[13px] font-medium transition-colors duration-150",
              active ? "text-ink" : "text-ink-soft hover:text-ink",
            )}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="rounded-full bg-canvas-deep px-1.5 py-0.5 text-[10px] leading-none text-ink-soft">
                {tab.count}
              </span>
            )}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-colors",
                active ? "bg-forest" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
