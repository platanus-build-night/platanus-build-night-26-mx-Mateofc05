import { cn } from "@/lib/utils";
import type { OutreachStatus } from "@/lib/types";

const STYLES: Record<OutreachStatus, { label: string; className: string; dot: string }> = {
  DRAFT: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  APPROVED: {
    label: "Aprobado",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    dot: "bg-blue-500",
  },
  SENT: {
    label: "Enviado",
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900",
    dot: "bg-violet-500",
  },
  OPENED: {
    label: "Abierto",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    dot: "bg-amber-500",
  },
  REPLIED: {
    label: "Respondido",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },
  ESCALATED: {
    label: "Escalado",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900",
    dot: "bg-orange-500",
  },
  BLOCKED: {
    label: "Bloqueado",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
    dot: "bg-red-500",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: OutreachStatus;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        s.className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
