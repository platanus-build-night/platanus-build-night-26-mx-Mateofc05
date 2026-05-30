import Link from "next/link";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GenerateCampaignButton } from "@/components/generate-campaign-button";
import { initials } from "@/lib/format";
import { countryEs, positionsEs } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Athlete } from "@/lib/types";

export function AthleteCard({
  athlete,
  pipelineCount,
}: {
  athlete: Athlete;
  pipelineCount?: number;
}) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-brand text-brand-foreground text-xs font-medium">
              {initials(athlete.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/athletes/${athlete.id}`}
                className="truncate font-semibold tracking-tight hover:underline"
              >
                {athlete.fullName}
              </Link>
              {typeof pipelineCount === "number" && pipelineCount > 0 && (
                <Badge variant="secondary" className="shrink-0 text-[11px]">
                  {pipelineCount} en pipeline
                </Badge>
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {positionsEs(athlete)} · {countryEs(athlete.country)} · Generación{" "}
              {athlete.gradYear}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Goles" value={athlete.stats.goals} />
          <Stat label="Asistencias" value={athlete.stats.assists} />
          <Stat label="Partidos" value={athlete.stats.matches} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              athlete.parentalConsent
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
            )}
          >
            {athlete.parentalConsent ? (
              <ShieldCheck className="size-3" />
            ) : (
              <ShieldAlert className="size-3" />
            )}
            {athlete.isMinor
              ? athlete.parentalConsent
                ? "Menor · consent. ok"
                : "Menor · sin consent."
              : "Mayor de edad"}
          </span>
          <Badge variant="outline" className="text-[11px] font-normal">
            NCAA: revisión manual
          </Badge>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link
            href={`/athletes/${athlete.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Ver perfil
          </Link>
          <GenerateCampaignButton
            athleteId={athlete.id}
            label="Generar"
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 py-2">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
