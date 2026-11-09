"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/atoms/badge";
import { Icon } from "@/components/atoms/icon";
import { DropdownMenu } from "@/components/molecules/dropdown";
import { ConfirmDialog } from "@/components/molecules/modal";
import { StatusBadge } from "@/components/molecules/status-badge";
import { useToast } from "@/components/molecules/toast";
import { responseCount } from "@/features/analytics/analytics";
import { surveyActions, useSurveyStore } from "@/features/surveys/store";
import type { Survey } from "@/types/domain";
import { cn, formatNumber, formatRelative } from "@/lib/utils";

async function copySurveyLink(survey: Survey, notify: (title: string, description?: string) => void) {
  const url = `${window.location.origin}/s/${survey.slug}`;
  try {
    await navigator.clipboard.writeText(url);
    notify("Public link copied", url);
  } catch {
    notify("Couldn't access the clipboard", `Open the survey and copy ${url} from the address bar.`);
  }
}

export function SurveyActionsMenu({
  survey,
  align = "end",
  triggerClassName,
}: {
  survey: Survey;
  align?: "start" | "end";
  triggerClassName?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  return (
    <>
      <DropdownMenu
        align={align}
        triggerLabel={`Actions for ${survey.title}`}
        triggerClassName={cn(
          "flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-canvas-deep/60 hover:text-ink",
          triggerClassName,
        )}
        trigger={<Icon name="more" size={16} />}
        items={[
          {
            label: "Open in builder",
            icon: "edit",
            onSelect: () => router.push(`/builder/${survey.id}`),
          },
          ...(survey.status !== "draft"
            ? [
                {
                  label: "View live survey",
                  icon: "external" as const,
                  onSelect: () =>
                    window.open(`/s/${survey.slug}`, "_blank", "noopener,noreferrer"),
                },
                {
                  label: "View responses",
                  icon: "inbox" as const,
                  onSelect: () => router.push(`/dashboard/responses?survey=${survey.id}`),
                },
                {
                  label: "Copy public link",
                  icon: "link" as const,
                  onSelect: () => void copySurveyLink(survey, toast.success),
                },
              ]
            : [
                {
                  label: "Publish survey",
                  icon: "globe" as const,
                  onSelect: () => {
                    void surveyActions
                      .publish(survey.id)
                      .then(() =>
                        toast.success("Survey published", "Its public link is ready to share."),
                      )
                      .catch((error: unknown) =>
                        toast.error(
                          "Could not publish this survey",
                          error instanceof Error ? error.message : "Try again in a moment.",
                        ),
                      );
                  },
                },
              ]),
          {
            label: "Duplicate",
            icon: "copy",
            separatorBefore: true,
            onSelect: () => {
              void surveyActions
                .duplicate(survey.id)
                .then((copy) => {
                  if (copy) {
                    toast.success("Survey duplicated", "The copy is saved as a new draft.");
                  }
                })
                .catch((error: unknown) =>
                  toast.error(
                    "Could not duplicate this survey",
                    error instanceof Error ? error.message : "Try again in a moment.",
                  ),
                );
            },
          },
          ...(survey.status === "published"
            ? [
                {
                  label: "Close responses",
                  icon: "lock" as const,
                  onSelect: () => setConfirmClose(true),
                },
              ]
            : survey.status === "closed"
              ? [
                  {
                    label: "Reopen responses",
                    icon: "refresh" as const,
                    onSelect: () => {
                      void surveyActions
                        .reopen(survey.id)
                        .then(() =>
                          toast.success("Survey reopened", "It is accepting responses again."),
                        )
                        .catch((error: unknown) =>
                          toast.error(
                            "Could not reopen this survey",
                            error instanceof Error ? error.message : "Try again in a moment.",
                          ),
                        );
                    },
                  },
                ]
              : []),
          {
            label: "Delete survey",
            icon: "trash",
            danger: true,
            separatorBefore: true,
            onSelect: () => setConfirmDelete(true),
          },
        ]}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          void surveyActions
            .remove(survey.id)
            .then(() => {
              setConfirmDelete(false);
              toast.info("Survey deleted", `“${survey.title}” and its responses were removed.`);
            })
            .catch((error: unknown) => {
              setConfirmDelete(false);
              toast.error(
                "Could not delete this survey",
                error instanceof Error ? error.message : "Try again in a moment.",
              );
            });
        }}
        title="Delete this survey?"
        description={`“${survey.title}” and all of its responses will be permanently removed from your workspace. This can't be undone.`}
        confirmLabel="Delete survey"
      />

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => {
          void surveyActions
            .close(survey.id)
            .then(() => {
              setConfirmClose(false);
              toast.info(
                "Responses closed",
                "The survey remains viewable but no longer accepts replies.",
              );
            })
            .catch((error: unknown) => {
              setConfirmClose(false);
              toast.error(
                "Could not close this survey",
                error instanceof Error ? error.message : "Try again in a moment.",
              );
            });
        }}
        title="Close this survey?"
        description={`“${survey.title}” will stop accepting new responses. You can reopen it at any time.`}
        confirmLabel="Close responses"
        tone="primary"
      />
    </>
  );
}

function SurveyCard({ survey }: { survey: Survey }) {
  const state = useSurveyStore();
  const toast = useToast();
  const count = responseCount(state, survey.id);
  const canShare = survey.status !== "draft";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-soft transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card">
      <div className="h-1 w-full" style={{ backgroundColor: survey.theme.accent }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="slate">{survey.category}</Badge>
            <StatusBadge status={survey.status} />
          </div>
          <SurveyActionsMenu survey={survey} />
        </div>

        <Link href={`/builder/${survey.id}`} className="mt-3 block rounded-sm">
          <h3 className="line-clamp-1 font-display text-[19px] leading-tight tracking-tight text-ink transition-colors group-hover:text-forest">
            {survey.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[12px] leading-relaxed text-ink-soft">
            {survey.description || "No description yet — add one in the builder."}
          </p>
        </Link>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line/80 pt-3">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">Responses</p>
            <p className="mt-0.5 font-display text-[17px] leading-none text-ink">
              {formatNumber(count)}
            </p>
          </div>
          <div className="border-l border-line/80 pl-3">
            <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">Questions</p>
            <p className="mt-0.5 font-display text-[17px] leading-none text-ink">
              {survey.questions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line/80 bg-cream/35 px-4 py-2.5">
        <span className="truncate font-mono text-[8.5px] uppercase tracking-[0.06em] text-ink-faint">
          Updated {formatRelative(survey.updatedAt)}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {canShare && (
            <button
              type="button"
              onClick={() => void copySurveyLink(survey, toast.success)}
              aria-label="Copy public survey link"
              title="Copy public link"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface hover:text-forest"
            >
              <Icon name="link" size={13} />
            </button>
          )}
          <Link
            href={canShare ? `/s/${survey.slug}` : `/builder/${survey.id}`}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10.5px] font-medium text-forest transition-colors hover:bg-surface"
          >
            {canShare ? "View" : "Edit"}
            <Icon name="arrowRight" size={11} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function SurveyRow({ survey }: { survey: Survey }) {
  const state = useSurveyStore();
  const count = responseCount(state, survey.id);
  return (
    <div className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas/50">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
        style={{
          backgroundColor: `${survey.theme.accent}12`,
          borderColor: `${survey.theme.accent}22`,
          color: survey.theme.accent,
        }}
      >
        <Icon name="file" size={14} />
      </span>
      <Link href={`/builder/${survey.id}`} className="min-w-0 flex-1 rounded-sm">
        <p className="truncate text-[12.5px] font-medium text-ink transition-colors group-hover:text-forest">
          {survey.title}
        </p>
        <p className="mt-0.5 truncate font-mono text-[8.5px] uppercase tracking-[0.06em] text-ink-faint">
          {survey.category} · updated {formatRelative(survey.updatedAt)}
        </p>
      </Link>
      <div className="hidden shrink-0 text-right md:block">
        <p className="font-mono text-[11px] text-ink">{formatNumber(count)}</p>
        <p className="font-mono text-[7.5px] uppercase tracking-wide text-ink-faint">responses</p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <StatusBadge status={survey.status} />
      </div>
      <SurveyActionsMenu survey={survey} />
    </div>
  );
}

export function SurveyGrid({ surveys }: { surveys: Survey[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {surveys.map((survey) => (
        <SurveyCard key={survey.id} survey={survey} />
      ))}
    </div>
  );
}

export function SurveyList({ surveys }: { surveys: Survey[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
      <div className="hidden items-center gap-3 border-b border-line/80 bg-cream/40 px-4 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-faint md:flex">
        <span className="w-8" />
        <span className="flex-1">Survey</span>
        <span className="w-16 text-right">Responses</span>
        <span className="w-20 text-center sm:block">Status</span>
        <span className="w-7" />
      </div>
      <div className="divide-y divide-line/80">
        {surveys.map((survey) => (
          <SurveyRow key={survey.id} survey={survey} />
        ))}
      </div>
    </div>
  );
}
