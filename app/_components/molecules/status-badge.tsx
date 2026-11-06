import { Badge } from "@/components/atoms/badge";
import type { SurveyStatus } from "@/lib/types";

const statusConfig = {
  draft: { label: "Draft", tone: "neutral" as const, dot: true },
  published: { label: "Published", tone: "success" as const, dot: true },
  closed: { label: "Closed", tone: "warning" as const, dot: true },
};

export function StatusBadge({ status }: { status: SurveyStatus }) {
  const config = statusConfig[status];
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}
