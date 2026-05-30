import type { Outreach, OutreachStatus } from "@/lib/types";

export interface PipelineMetrics {
  activeAthletes: number;
  draft: number;
  approved: number;
  sent: number;
  opened: number;
  replied: number;
  blocked: number;
  escalated: number;
  total: number;
}

export function computeMetrics(
  outreaches: Outreach[],
  activeAthletes: number,
): PipelineMetrics {
  const by = (s: OutreachStatus) =>
    outreaches.filter((o) => o.status === s).length;
  return {
    activeAthletes,
    draft: by("DRAFT"),
    approved: by("APPROVED"),
    sent: by("SENT"),
    opened: by("OPENED"),
    replied: by("REPLIED"),
    blocked: by("BLOCKED"),
    escalated: by("ESCALATED"),
    total: outreaches.length,
  };
}
