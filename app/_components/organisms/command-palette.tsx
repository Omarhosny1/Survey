"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/_components/molecules/modal";
import { Icon, type IconName } from "@/app/_components/atoms/icon";
import { Kbd, SectionLabel } from "@/app/_components/atoms/misc";
import { useSurveyStore } from "@/app/_lib/store";
import { cn } from "@/app/_lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface CommandEntry {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  group: string;
  run: () => void;
}

const shortcuts: Array<{ label: string; hint: string; icon: IconName; href: string; group: string }> = [
  { label: "Overview", hint: "Dashboard", icon: "home", href: "/dashboard", group: "Jump to" },
  { label: "My surveys", hint: "All surveys", icon: "layers", href: "/dashboard/surveys", group: "Jump to" },
  { label: "Create survey", hint: "Builder", icon: "plus", href: "/builder/new", group: "Jump to" },
  { label: "Responses", hint: "Inbox", icon: "inbox", href: "/dashboard/responses", group: "Jump to" },
  { label: "Analytics", hint: "Insights", icon: "chart", href: "/dashboard/analytics", group: "Jump to" },
  { label: "Settings", hint: "Account", icon: "settings", href: "/dashboard/settings", group: "Jump to" },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { surveys } = useSurveyStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    const routeEntries: CommandEntry[] = shortcuts
      .filter(
        (item) =>
          !term ||
          item.label.toLowerCase().includes(term) ||
          item.hint.toLowerCase().includes(term) ||
          item.group.toLowerCase().includes(term),
      )
      .map((item) => ({
        id: `route-${item.href}`,
        label: item.label,
        hint: item.hint,
        icon: item.icon,
        group: item.group,
        run: () => router.push(item.href),
      }));

    const surveyEntries: CommandEntry[] = surveys
      .filter(
        (survey) =>
          !term ||
          survey.title.toLowerCase().includes(term) ||
          survey.category.toLowerCase().includes(term),
      )
      .slice(0, term ? 8 : 3)
      .map((survey) => ({
        id: `survey-${survey.id}`,
        label: survey.title,
        hint: `${survey.category} Â· ${survey.questions.length} questions`,
        icon: "file" as IconName,
        group: term ? "Surveys" : "Recent surveys",
        run: () => router.push(`/builder/${survey.id}`),
      }));

    const next: Array<{ label: string; entries: CommandEntry[] }> = [];
    if (term && surveyEntries.length > 0) next.push({ label: "Surveys", entries: surveyEntries });
    if (routeEntries.length > 0) next.push({ label: "Jump to", entries: routeEntries });
    if (!term && surveyEntries.length > 0) next.push({ label: "Recent surveys", entries: surveyEntries });
    return next;
  }, [query, router, surveys]);

  const flat = groups.flatMap((group) => group.entries);
  const safeIndex = flat.length === 0 ? 0 : Math.min(activeIndex, flat.length - 1);

  return (
    <Modal open={open} onClose={onClose} title="Search SurveyLand" description="Find a survey or jump to a page." size="lg">
      <div className="-mx-1">
        <div className="flex items-center gap-2.5 rounded-lg border border-line-strong bg-canvas/60 px-3 py-2.5">
          <Icon name="search" size={17} className="text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex(() => (flat.length === 0 ? 0 : (safeIndex + 1) % flat.length));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex(() => (flat.length === 0 ? 0 : (safeIndex - 1 + flat.length) % flat.length));
              }
              if (event.key === "Enter") {
                const entry = flat[safeIndex];
                if (entry) {
                  event.preventDefault();
                  entry.run();
                  onClose();
                }
              }
            }}
            placeholder="Search surveys, pages, and actionsâ€¦"
            aria-label="Search surveys and pages"
            className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-faint"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div className="mt-3 max-h-[320px] overflow-y-auto pb-1">
          {flat.length === 0 && (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <Icon name="search" size={22} className="text-line-strong" />
              <p className="mt-2 text-[13px] font-medium text-ink">No matches for â€œ{query}â€</p>
              <p className="mt-1 text-xs text-ink-faint">Try a survey title, category, or page name.</p>
            </div>
          )}

          {groups.map((group) => (
            <div key={group.label} className="mb-2">
              <SectionLabel className="px-2.5 py-1.5">{group.label}</SectionLabel>
              {group.entries.map((entry) => {
                const index = flat.findIndex((item) => item.id === entry.id);
                const active = index === safeIndex;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      entry.run();
                      onClose();
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                      active ? "bg-forest-soft/70" : "hover:bg-canvas-deep/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                        active
                          ? "border-forest/15 bg-surface text-forest"
                          : "border-line bg-canvas/60 text-ink-faint",
                      )}
                    >
                      <Icon name={entry.icon} size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-ink">{entry.label}</span>
                      <span className="block truncate text-[10.5px] text-ink-faint">{entry.hint}</span>
                    </span>
                    {active && <Icon name="arrowRight" size={14} className="text-forest" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-line px-1 pt-3 text-[10px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <Kbd className="h-4 min-w-4 px-1">â†‘</Kbd>
            <Kbd className="h-4 min-w-4 px-1">â†“</Kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd className="h-4 px-1">â†µ</Kbd>
            to open
          </span>
        </div>
      </div>
    </Modal>
  );
}
