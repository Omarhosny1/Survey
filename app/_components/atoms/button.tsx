import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/app/_lib/utils";
import { Spinner } from "./spinner";

type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "dark"
  | "cream";

type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-forest text-white shadow-soft hover:bg-forest-deep active:bg-forest-deep border border-forest/20",
  accent:
    "bg-coral text-white shadow-soft hover:bg-coral-deep active:bg-coral-deep border border-coral/20",
  secondary:
    "bg-surface text-ink border border-line hover:border-line-strong hover:bg-cream active:bg-canvas-deep/60",
  ghost: "text-ink-soft hover:bg-canvas-deep/60 hover:text-ink",
  outline:
    "bg-transparent text-forest border border-forest/25 hover:bg-forest-soft/70 hover:border-forest/40",
  danger:
    "bg-danger text-white border border-danger/20 hover:bg-[#a93b27] active:bg-[#983522]",
  dark: "bg-ink text-cream border border-ink hover:bg-forest-deep active:bg-forest-deep",
  cream:
    "bg-cream text-forest-deep border border-cream shadow-soft hover:bg-white active:bg-canvas",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12.5px] gap-1.5 rounded-sm",
  md: "h-10 px-4 text-[13.5px] gap-2 rounded-md",
  lg: "h-11 px-5 text-sm gap-2 rounded-md",
  icon: "h-9 w-9 rounded-md",
  "icon-sm": "h-8 w-8 rounded-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  href,
  target,
  rel,
  type = "button",
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex select-none items-center justify-center font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&>svg]:shrink-0",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {loading ? <Spinner size={15} label="Loading" /> : iconLeft}
      {children}
      {!loading && iconRight}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={classes}
        aria-disabled={disabled || loading}
        {...(rest as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
