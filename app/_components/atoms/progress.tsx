import { cn, clamp } from "@/app/_lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
  height?: "xs" | "sm" | "md";
  label?: string;
  color?: string;
}

const heights = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
};

export function Progress({
  value,
  className,
  barClassName,
  height = "sm",
  label,
  color,
}: ProgressProps) {
  const safe = clamp(value, 0, 100);
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-canvas-deep", heights[height], className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safe)}
      aria-label={label ?? "Progress"}
    >
      <div
        className={cn("h-full rounded-full bg-forest transition-[width] duration-500 ease-out", barClassName)}
        style={{ width: `${safe}%`, backgroundColor: color }}
      />
    </div>
  );
}
