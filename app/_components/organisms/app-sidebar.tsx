"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/atoms/logo";
import { Icon } from "@/components/atoms/icon";
import { SectionLabel } from "@/components/atoms/misc";
import { UserMenu } from "@/components/organisms/user-menu";
import { navGroups } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({
  collapsed = false,
  onToggle,
  mobile = false,
  onNavigate,
}: AppSidebarProps) {
  const pathname = usePathname();
  const isCollapsed = mobile ? false : collapsed;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-line bg-surface",
        mobile ? "w-[286px]" : isCollapsed ? "w-[76px]" : "w-[252px]",
      )}
      aria-label="Main navigation"
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-line/70",
          isCollapsed ? "justify-center px-3" : "justify-between px-4",
        )}
      >
        <Link
          href="/dashboard"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
          onClick={onNavigate}
          aria-label="SurveyLand dashboard"
        >
          <Logo size={30} tone={isCollapsed ? "mark" : "default"} />
        </Link>
        {!isCollapsed && onToggle && !mobile && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
          >
            <Icon name="panelLeft" size={15} />
          </button>
        )}
        {mobile && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close navigation"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
          >
            <Icon name="x" size={17} />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-3 pt-4">
          <div className="flex items-center gap-2.5 rounded-lg border border-line bg-cream/70 px-2.5 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-forest text-[11px] font-semibold text-white">
              N
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium text-ink">Northwind Studio</span>
              <span className="block text-[10px] text-ink-faint">Research workspace</span>
            </span>
            <span className="rounded-full border border-line bg-surface px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
              Demo
            </span>
          </div>
        </div>
      )}

      <nav className="scrollbar-none flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <SectionLabel className="mb-2 px-2.5">{group.label}</SectionLabel>
              )}
              {isCollapsed && <div className="mx-auto mb-2 h-px w-6 bg-line" aria-hidden="true" />}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-md py-2 text-[12.5px] font-medium transition-colors duration-150",
                          isCollapsed ? "justify-center px-2" : "px-2.5",
                          active
                            ? "bg-forest-soft/80 text-forest"
                            : "text-ink-soft hover:bg-canvas-deep/45 hover:text-ink",
                        )}
                      >
                        <Icon
                          name={item.icon as never}
                          size={17}
                          strokeWidth={active ? 2 : 1.7}
                          className={cn("shrink-0", active ? "text-forest" : "text-ink-faint group-hover:text-ink-soft")}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                        {!isCollapsed && active && (
                          <span className="ml-auto h-1 w-1 rounded-full bg-forest" aria-hidden="true" />
                        )}
                        {item.href === "/builder/new" && !isCollapsed && (
                          <span className="ml-auto rounded border border-forest/15 bg-surface/80 px-1 py-0.5 font-mono text-[9px] text-forest/80">
                            N
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-line/70 p-3">
        {!isCollapsed && (
          <div className="mb-3 rounded-lg border border-line bg-cream/60 p-3">
            <div className="flex items-center gap-2 text-forest">
              <Icon name="shield" size={14} />
              <p className="text-[11px] font-medium">Local demo workspace</p>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-faint">
              Surveys and responses are stored in your browser. No account or server required.
            </p>
          </div>
        )}
        <UserMenu
          variant="sidebar"
          collapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}
