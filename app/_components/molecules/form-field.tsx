import type { ReactNode } from "react";
import { cn } from "@/app/_lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  optional,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className={cn("text-[13px] font-medium leading-5 text-ink", labelClassName)}
        >
          {label}
          {required && (
            <span className="ml-1 text-coral" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {optional && <span className="text-[11px] text-ink-faint">Optional</span>}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="flex items-start gap-1.5 text-xs leading-relaxed text-danger">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs leading-relaxed text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordHint({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              index < score
                ? score <= 1
                  ? "bg-danger"
                  : score === 2
                    ? "bg-warning"
                    : "bg-success"
                : "bg-canvas-deep",
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-ink-faint">Password strength: {label}</p>
    </div>
  );
}
