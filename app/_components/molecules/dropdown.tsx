"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";

export interface DropdownItem {
  label: string;
  icon?: IconName;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
  shortcut?: string;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  triggerLabel: string;
  triggerClassName?: string;
  menuClassName?: string;
  children?: ReactNode;
}

export function DropdownMenu({
  trigger,
  items,
  align = "end",
  triggerLabel,
  triggerClassName,
  menuClassName,
  children,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
    });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className={cn("cursor-pointer", triggerClassName)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={triggerLabel}
          className={cn(
            "absolute top-[calc(100%+6px)] z-50 min-w-[190px] rounded-lg border border-line bg-surface p-1 shadow-lift animate-scale-in",
            align === "end" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {children}
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              {item.separatorBefore && <div className="my-1 h-px bg-line" role="separator" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-[12.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  item.danger
                    ? "text-danger hover:bg-danger-soft"
                    : "text-ink-soft hover:bg-canvas-deep/50 hover:text-ink",
                )}
              >
                {item.icon && <Icon name={item.icon} size={15} className="shrink-0" />}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="font-mono text-[10px] text-ink-faint">{item.shortcut}</span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
