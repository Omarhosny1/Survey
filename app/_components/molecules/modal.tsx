"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  hideClose?: boolean;
  className?: string;
}

const sizes: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
};

const subscribeMounted = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideClose = false,
  className,
}: ModalProps) {
  const mounted = useSyncExternalStore(subscribeMounted, getMounted, getServerMounted);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink/35 backdrop-blur-[3px] animate-enter-fast"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-float outline-none animate-scale-in sm:rounded-2xl",
          sizes[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-balance pr-2 text-xl leading-snug">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {description}
              </p>
            )}
          </div>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
            >
              <Icon name="x" size={17} />
            </button>
          )}
        </div>
        {children && <div className="px-5 py-4 sm:px-6">{children}</div>}
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-cream/60 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
