"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu } from "@/components/molecules/dropdown";
import { Icon, type IconName } from "@/components/atoms/icon";
import { SectionLabel } from "@/components/atoms/misc";
import { useSurveyStore } from "@/features/surveys/store";
import type { ActivityType } from "@/types/domain";

const activityIcons: Record<ActivityType, IconName> = {
  published: "globe",
  created: "plus",
  response: "inbox",
  edited: "edit",
  duplicated: "copy",
  closed: "lock",
  reopened: "refresh",
};

export function NotificationsMenu() {
  const { activity } = useSurveyStore();
  const router = useRouter();
  const recent = activity.slice(0, 3);

  return (
    <DropdownMenu
      triggerLabel="Notifications"
      triggerClassName="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas-deep/60 hover:text-ink"
      menuClassName="w-[312px]"
      trigger={
        <span className="relative flex">
          <Icon name="bell" size={17} />
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-coral ring-2 ring-canvas" />
        </span>
      }
      items={[
        ...recent.map((item) => ({
          label: `${item.surveyTitle} — ${item.message}`,
          icon: activityIcons[item.type],
          onSelect: () => {
            if (item.type === "response") router.push("/dashboard/responses");
            else if (item.surveyId) router.push(`/builder/${item.surveyId}`);
            else router.push("/dashboard/surveys");
          },
        })),
        {
          label: "View all activity",
          icon: "clock",
          separatorBefore: true,
          onSelect: () => router.push("/dashboard"),
        },
      ]}
    >
      <div className="px-2.5 pb-1.5 pt-2">
        <SectionLabel>Recent activity</SectionLabel>
      </div>
    </DropdownMenu>
  );
}
