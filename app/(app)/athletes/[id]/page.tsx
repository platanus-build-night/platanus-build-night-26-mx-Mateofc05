import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { AthleteSpanishProfile } from "@/components/athlete-spanish-profile";
import { GenerateCampaignButton } from "@/components/generate-campaign-button";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAthlete, getOutreachRows } from "@/lib/store";
import { scorePct } from "@/lib/format";
import { countryEs, positionsEs } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const athlete = await getAthlete(id);
  if (!athlete) notFound();

  const rows = (await getOutreachRows()).filter(
    (r) => r.outreach.athleteId === id,
  );

  return (
    <>
      <PageHeader
        title={athlete.fullName}
        description={`${positionsEs(athlete)} · ${countryEs(athlete.country)} · Generación ${athlete.gradYear}`}
        actions={<GenerateCampaignButton athleteId={athlete.id} />}
      />

      <div className="space-y-4 p-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Volver al centro de control
        </Link>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Spanish raw profile */}
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Perfil del atleta</CardTitle>
              <Badge variant="secondary" className="font-mono text-[11px]">
                ES · entrada original
              </Badge>
            </CardHeader>
            <CardContent>
              <AthleteSpanishProfile athlete={athlete} />
            </CardContent>
          </Card>

          {/* Campaign / matches */}
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Campaña de reclutamiento</CardTitle>
              {rows.length > 0 && (
                <Badge variant="secondary">{rows.length} coincidencias</Badge>
              )}
            </CardHeader>
            <CardContent>
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand-muted text-brand">
                    <Target className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">Aún no hay campaña</p>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                      Genera una campaña para conectar a {athlete.fullName.split(" ")[0]}{" "}
                      con programas de EE. UU. y crear contacto listo para entrenadores.
                    </p>
                  </div>
                  <GenerateCampaignButton
                    athleteId={athlete.id}
                    label="Generar campaña de reclutamiento"
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5 text-brand" />
                    Mejores coincidencias ≥ 60% de encaje. Abre una para ver la
                    transformación español → inglés.
                  </p>
                  {rows.map(({ outreach, program, coach }) => (
                    <Link
                      key={outreach.id}
                      href={`/outreach/${outreach.id}`}
                      className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-md bg-brand text-brand-foreground">
                        <span className="text-sm font-semibold leading-none tabular-nums">
                          {scorePct(outreach.matchScore)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {program?.school}{" "}
                          <span className="text-xs text-muted-foreground">
                            {program?.division}
                          </span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {coach?.name} · {coach?.title}
                        </p>
                      </div>
                      <StatusBadge status={outreach.status} />
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          El estatus del NCAA Eligibility Center requiere revisión manual. LineUp
          no certifica la elegibilidad.
        </p>
      </div>
    </>
  );
}
