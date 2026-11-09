"use client";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input, Select } from "@/components/atoms/input";
import { EmptyState } from "@/components/molecules/empty-state";
import { PageHeader } from "@/components/molecules/section-heading";
import { Segmented } from "@/components/molecules/segmented";
import { useSurveyLibrary } from "@/features/surveys/hooks/use-survey-library";
import { SurveyGrid, SurveyList } from "@/features/surveys/components/survey-card";
import { useSurveyStore } from "@/features/surveys/store";
import { cn, formatNumber } from "@/lib/utils";

export function SurveysPage() {
  const state = useSurveyStore();
  const { surveys } = state;
  const {
    query,
    setQuery,
    status,
    setStatus,
    sort,
    setSort,
    view,
    setView,
    counts,
    visible,
    totalResponses,
    hasFilters,
    resetFilters,
  } = useSurveyLibrary(state);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Survey library"
        title="My surveys"
        description={`${surveys.length} surveys, ${formatNumber(totalResponses)} responses, and one calm place to keep track of all of it.`}
        actions={
          <Button href="/builder/new" iconLeft={<Icon name="plus" size={15} />}>
            New survey
          </Button>
        }
      />

      <div className="rounded-xl border border-line bg-surface p-3 shadow-soft">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[260px]">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search surveys…"
                aria-label="Search surveys"
                className="pr-9"
                prefix={<Icon name="search" size={14} />}
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink"
                >
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>

            <Segmented
              ariaLabel="Filter by survey status"
              value={status}
              onChange={(value) => setStatus(value as typeof status)}
              options={[
                { value: "all", label: "All", count: counts.all },
                { value: "draft", label: "Drafts", count: counts.draft },
                { value: "published", label: "Live", count: counts.published },
                { value: "closed", label: "Closed", count: counts.closed },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="survey-sort" className="sr-only">
              Sort surveys
            </label>
            <Select
              id="survey-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="h-8 w-[152px] text-[11.5px]"
            >
              <option value="updated">Recently updated</option>
              <option value="responses">Most responses</option>
              <option value="title">Title A–Z</option>
            </Select>

            <div className="flex items-center gap-0.5 rounded-md border border-line bg-canvas/70 p-0.5">
              {(
                [
                  { value: "grid" as const, icon: "grid" as const, label: "Grid view" },
                  { value: "list" as const, icon: "list" as const, label: "List view" },
                ]
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                  aria-label={option.label}
                  aria-pressed={view === option.value}
                  className={cn(
                    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] transition-colors",
                    view === option.value
                      ? "bg-surface text-ink shadow-[0_1px_2px_rgba(21,33,28,0.08)]"
                      : "text-ink-faint hover:text-ink-soft",
                  )}
                >
                  <Icon name={option.icon} size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="text-[11px] text-ink-faint">
          Showing <span className="font-medium text-ink-soft">{visible.length}</span> of{" "}
          {surveys.length} surveys
          {status !== "all" && (
            <>
              {" "}
              · <span className="capitalize">{status}</span>
            </>
          )}
          {query.trim() && (
            <>
              {" "}
              matching <span className="font-medium text-ink-soft">“{query.trim()}”</span>
            </>
          )}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex cursor-pointer items-center gap-1 text-[10.5px] font-medium text-forest transition-colors hover:text-forest-deep"
          >
            <Icon name="x" size={11} />
            Clear filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={hasFilters ? "search" : "layers"}
          title={hasFilters ? "No surveys match those filters" : "No surveys yet"}
          description={
            hasFilters
              ? "Try a broader search or clear the status filter to see everything in the library."
              : "Start with a blank survey or borrow a structure from the demo. Your first question is the hardest part."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : (
              <Button href="/builder/new" iconLeft={<Icon name="plus" size={14} />}>
                Create a survey
              </Button>
            )
          }
        />
      ) : view === "grid" ? (
        <SurveyGrid surveys={visible} />
      ) : (
        <SurveyList surveys={visible} />
      )}

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-line bg-cream/50 px-4 py-3 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-[10.5px] text-ink-faint">
          <Icon name="info" size={12} />
          Drafts are private. Publishing creates a public link you can share with anyone.
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-ink-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {counts.published} live · {counts.draft} drafts · {counts.closed} closed
        </p>
      </div>
    </div>
  );
}
