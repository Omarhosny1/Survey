import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line bg-canvas/80 px-1.5 font-mono text-[10px] font-medium text-ink-faint",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

export function Checkbox({ label, description, className, id, ...rest }: CheckboxProps) {
  const inputId = id ?? `check-${rest.name ?? "field"}`;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[4px] accent-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        {...rest}
      />
      {(label || description) && (
        <label htmlFor={inputId} className="cursor-pointer select-none">
          {label && <span className="block text-[13px] leading-5 text-ink-soft">{label}</span>}
          {description && (
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">{description}</span>
          )}
        </label>
      )}
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  id?: string;
}

export function Switch({ checked, onCheckedChange, disabled, label, id }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-forest bg-forest" : "border-line-strong bg-canvas-deep",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[19px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

export function DotSeparator({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-1 w-1 rounded-full bg-line-strong", className)}
      aria-hidden="true"
    />
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint",
        className,
      )}
    >
      {children}
    </p>
  );
}
