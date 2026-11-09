"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/atoms/icon";
import type { ToastMessage, ToastVariant } from "@/types/domain";

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  push: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantConfig: Record<
  ToastVariant,
  { icon: IconName; tile: string; iconColor: string }
> = {
  success: { icon: "checkCircle", tile: "bg-success-soft", iconColor: "text-success" },
  error: { icon: "alert", tile: "bg-danger-soft", iconColor: "text-danger" },
  warning: { icon: "alert", tile: "bg-warning-soft", iconColor: "text-warning" },
  info: { icon: "info", tile: "bg-slate-soft", iconColor: "text-slate" },
};

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    ({ title, description, variant = "success" }: ToastInput) => {
      toastCounter += 1;
      const id = `toast-${toastCounter}`;
      setToasts((current) => [...current.slice(-3), { id, title, description, variant }]);
      const timer = window.setTimeout(
        () => dismiss(id),
        variant === "error" ? 6200 : 4400,
      );
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const currentTimers = timers.current;
    return () => {
      currentTimers.forEach((timer) => window.clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description) => push({ title, description, variant: "success" }),
      error: (title, description) => push({ title, description, variant: "error" }),
      info: (title, description) => push({ title, description, variant: "info" }),
      warning: (title, description) => push({ title, description, variant: "warning" }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-end gap-2 p-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[360px]"
      >
        {toasts.map((toast) => {
          const config = variantConfig[toast.variant];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-lift animate-toast-in"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  config.tile,
                  config.iconColor,
                )}
              >
                <Icon name={config.icon} size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-5 text-ink">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
