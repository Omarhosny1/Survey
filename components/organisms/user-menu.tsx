"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu } from "@/components/molecules/dropdown";
import { Avatar } from "@/components/atoms/avatar";
import { Icon } from "@/components/atoms/icon";
import { useToast } from "@/components/molecules/toast";
import { sessionActions, useSession } from "@/features/auth/store";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  variant?: "sidebar" | "topbar";
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function UserMenu({ variant = "sidebar", collapsed = false, onNavigate }: UserMenuProps) {
  const { profile } = useSession();
  const router = useRouter();
  const toast = useToast();

  if (!profile) return null;

  const trigger =
    variant === "sidebar" ? (
      <span
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-canvas-deep/50",
          collapsed && "justify-center",
        )}
      >
        <Avatar name={profile.name} src={profile.avatar} size="sm" />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium text-ink">{profile.name}</span>
              <span className="block truncate text-[10.5px] text-ink-faint">{profile.email}</span>
            </span>
            <Icon name="chevronDown" size={14} className="text-ink-faint" />
          </>
        )}
      </span>
    ) : (
      <span className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-canvas-deep/50">
        <Avatar name={profile.name} src={profile.avatar} size="sm" />
        <span className="hidden text-[12.5px] font-medium text-ink xl:block">
          {profile.name.split(" ")[0]}
        </span>
        <Icon name="chevronDown" size={13} className="hidden text-ink-faint xl:block" />
      </span>
    );

  return (
    <DropdownMenu
      trigger={trigger}
      triggerLabel="Open account menu"
      triggerClassName={cn(variant === "sidebar" ? "w-full rounded-lg" : "rounded-full")}
      items={[
        {
          label: "Account settings",
          icon: "settings",
          onSelect: () => {
            onNavigate?.();
            router.push("/dashboard/settings");
          },
        },
        {
          label: "Back to website",
          icon: "external",
          onSelect: () => {
            onNavigate?.();
            router.push("/");
          },
        },
        {
          label: "Log out",
          icon: "logout",
          danger: true,
          separatorBefore: true,
          onSelect: () => {
            void sessionActions
              .signOut()
              .then(() => {
                toast.info("You're signed out", "Your workspace is ready when you return.");
                onNavigate?.();
                router.push("/login");
              })
              .catch((error: unknown) =>
                toast.error(
                  "Could not sign out",
                  error instanceof Error ? error.message : "Try again in a moment.",
                ),
              );
          },
        },
      ]}
    />
  );
}
