import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
            {eyebrow}
          </p>
        )}
        <h1 className={cn("text-balance text-[28px] leading-[1.12] tracking-[-0.03em] sm:text-[32px]", titleClassName)}>
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-pretty text-[13.5px] leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

type PageHeaderProps = SectionHeadingProps;

export function PageHeader(props: PageHeaderProps) {
  return <SectionHeading {...props} className={cn("mb-7", props.className)} />;
}
