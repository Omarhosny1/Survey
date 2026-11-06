import { Icon, type IconName } from "@/app/_components/atoms/icon";
import type { ActivityType } from "@/app/_lib/types";
import { cn } from "@/app/_lib/utils";

export const activityIconName: Record<ActivityType, IconName> = {
  published: "globe",
  created: "plus",
  response: "inbox",
  edited: "edit",
  duplicated: "copy",
  closed: "lock",
  reopened: "refresh",
};

const tones: Record<ActivityType, string> = {
  published: "border-forest/10 bg-forest-soft text-forest",
  created: "border-forest/10 bg-forest-soft text-forest",
  response: "border-slate/10 bg-slate-soft text-slate",
  edited: "border-gold/15 bg-gold-soft text-[#8a6515]",
  duplicated: "border-line bg-canvas-deep/70 text-ink-soft",
  closed: "border-warning/10 bg-warning-soft text-warning",
  reopened: "border-success/10 bg-success-soft text-success",
};

export function ActivityIcon({
  type,
  size = "md",
  className,
}: {
  type: ActivityType;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border",
        size === "sm" ? "h-6 w-6" : "h-7 w-7",
        tones[type],
        className,
      )}
      aria-hidden="true"
    >
      <Icon name={activityIconName[type]} size={size === "sm" ? 12 : 13} />
    </span>
  );
}
