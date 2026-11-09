"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { AppTopbar } from "@/components/organisms/app-topbar";
import { CommandPalette } from "@/components/organisms/command-palette";
import { Logo } from "@/components/atoms/logo";
import { Spinner } from "@/components/atoms/spinner";
import { useSession } from "@/features/auth/store";
import { cn } from "@/lib/utils";

function WorkspaceLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
      <Logo size={34} />
      <Spinner className="text-forest" />
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        Preparing your workspace
      </p>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { profile, hydrated } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("surveyland.sidebar") === "collapsed";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !profile) {
      router.replace("/login");
    }
  }, [hydrated, profile, router]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem("surveyland.sidebar", next ? "collapsed" : "expanded");
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setMobileOpen(false);
  }, []);

  const isCheckingSession = !hydrated || !profile;

  return (
    <>
      {isCheckingSession && (
        <div className="fixed inset-0 z-[100]">
          <WorkspaceLoader />
        </div>
      )}
      <div className="min-h-screen bg-canvas">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-forest focus:px-3 focus:py-2 focus:text-xs focus:font-medium focus:text-white"
        >
          Skip to content
        </a>

        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
          <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 cursor-default bg-ink/35 backdrop-blur-[2px] animate-enter-fast"
            />
            <div className="absolute inset-y-0 left-0 animate-enter-fast shadow-float">
              <AppSidebar
                mobile
                onToggle={() => setMobileOpen(false)}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex min-h-screen flex-col transition-[padding] duration-300 ease-out",
            collapsed ? "lg:pl-[76px]" : "lg:pl-[252px]",
          )}
        >
          <AppTopbar
            onOpenSearch={() => setSearchOpen(true)}
            onOpenMobile={() => setMobileOpen(true)}
            collapsed={collapsed}
            onExpandSidebar={toggleSidebar}
          />
          <main
            id="main-content"
            className="mx-auto w-full max-w-[1420px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            <div key={pathname} className="animate-enter-fast">
              {children}
            </div>
          </main>
        </div>

        {searchOpen && <CommandPalette open onClose={closeSearch} />}
      </div>
    </>
  );
}
