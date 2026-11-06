import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/app/_lib/utils";

const fieldBase =
  "w-full rounded-md border bg-surface text-ink shadow-[inset_0_1px_0_rgba(21,33,28,0.02)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-ink-faint/80 disabled:cursor-not-allowed disabled:bg-canvas-deep/40 disabled:text-ink-soft";

const fieldIdle =
  "border-line hover:border-line-strong focus:border-forest/50 focus:outline-none focus:ring-4 focus:ring-forest/10";

const fieldInvalid =
  "border-danger/60 bg-danger-soft/20 focus:border-danger focus:ring-4 focus:ring-danger/10";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  invalid?: boolean;
  prefix?: ReactNode;
}

export function Input({ invalid, prefix, className, ...rest }: InputProps) {
  if (prefix) {
    return (
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        >
          {prefix}
        </span>
        <input
          className={cn(fieldBase, invalid ? fieldInvalid : fieldIdle, "h-10 pl-9 pr-3 text-sm", className)}
          aria-invalid={invalid || undefined}
          {...rest}
        />
      </div>
    );
  }

  return (
    <input
      className={cn(fieldBase, invalid ? fieldInvalid : fieldIdle, "h-10 px-3 text-sm", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cn(
        fieldBase,
        invalid ? fieldInvalid : fieldIdle,
        "min-h-[96px] resize-y px-3 py-2.5 text-sm leading-relaxed",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldBase,
          invalid ? fieldInvalid : fieldIdle,
          "h-10 cursor-pointer appearance-none pl-3 pr-9 text-sm",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
