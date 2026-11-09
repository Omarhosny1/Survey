"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/atoms/icon";
import { Kbd } from "@/components/atoms/misc";
import { NotificationsMenu } from "@/components/organisms/notifications-menu";
import { UserMenu } from "@/components/organisms/user-menu";
import { pageLabels } from "@/config/navigation";

interface AppTopbarProps {
  onOpenSearch: () => void;
  onOpenMobile: () => void;
  collapsed: boolean;
  onExpandSidebar: () => void;
}

function currentLabel(pathname: string): string {
  if (pathname.startsWith("/builder")) return pageLabels.builder ?? "Survey builder";
  const segments = pathname.split("/").filter(Boolean);
  const key = segments[1] ?? "dashboard";
  return pageLabels[key] ?? "Overview";
}

export function AppTopbar({
  onOpenSearch,
  onOpenMobile,
  collapsed,
  onExpandSidebar,
}: AppTopbarProps) {
  const pathname = usePathname();
  const label = currentLabel(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-canvas/85 px-3 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Open navigation"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-canvas-deep/60 hover:text-ink lg:hidden"
      >
        <Icon name="menu" size={19} />
      </button>

      {collapsed && (
        <button
          type="button"
          onClick={onExpandSidebar}
          aria-label="Expand sidebar"
          className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink lg:flex"
        >
          <Icon name="panelLeft" size={16} />
        </button>
      )}

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
        <Link
          href="/dashboard"
          className="hidden text-[12px] text-ink-faint transition-colors hover:text-ink sm:block"
        >
          Workspace
        </Link>
        <Icon name="chevronRight" size={12} className="hidden text-line-strong sm:block" />
        <span className="truncate text-[12.5px] font-medium text-ink">{label}</span>
      </nav>

      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-line bg-cream/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint xl:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Demo data
        </span>

        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface/70 pl-3 pr-2 text-[12px] text-ink-faint transition-colors hover:border-line-strong hover:text-ink-soft sm:flex"
        >
          <Icon name="search" size={14} />
          <span className="pr-6">Search</span>
          <Kbd>⌘K</Kbd>
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-canvas-deep/60 hover:text-ink sm:hidden"
        >
          <Icon name="search" size={18} />
        </button>

        <NotificationsMenu />

        <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden="true" />

        <UserMenu variant="topbar" />
      </div>
    </header>
  );
}
