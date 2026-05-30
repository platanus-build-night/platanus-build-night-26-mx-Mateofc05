import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PipelineMetrics } from "@/lib/metrics";

type Metric = { label: string; value: number; accent?: string };

export function MetricsGrid({ metrics }: { metrics: PipelineMetrics }) {
  const items: Metric[] = [
    { label: "Atletas activos", value: metrics.activeAthletes },
    { label: "Borradores", value: metrics.draft },
    { label: "Enviados", value: metrics.sent, accent: "text-violet-600" },
    { label: "Abiertos", value: metrics.opened, accent: "text-amber-600" },
    { label: "Respondidos", value: metrics.replied, accent: "text-emerald-600" },
    {
      label: "Bloqueados",
      value: metrics.blocked,
      accent: metrics.blocked > 0 ? "text-red-600" : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((m) => (
        <Card key={m.label}>
          <CardContent className="p-4">
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                m.value > 0 ? m.accent : undefined,
              )}
            >
              {m.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
