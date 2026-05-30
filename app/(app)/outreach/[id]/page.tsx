import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CircleDot,
  Mail,
  MoveRight,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { AthleteSpanishProfile } from "@/components/athlete-spanish-profile";
import { OutreachActions } from "@/components/outreach-actions";
import { StatusBadge } from "@/components/status-badge";
import { OnePager } from "@/components/one-pager";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getAthlete,
  getCoach,
  getOutreach,
  getProgram,
} from "@/lib/store";
import { formatDateTime, scorePct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OutreachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outreach = await getOutreach(id);
  if (!outreach) notFound();

  const [athlete, program, coach] = await Promise.all([
    getAthlete(outreach.athleteId),
    getProgram(outreach.programId),
    getCoach(outreach.coachId),
  ]);
  if (!athlete || !program || !coach) notFound();

  const consentBlocked = athlete.isMinor && !athlete.parentalConsent;

  return (
    <div className="p-6">
      {/* Back */}
      <Link
        href={`/athletes/${athlete.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Volver a {athlete.fullName}
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 rounded-xl border bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <span className="text-lg font-semibold leading-none tabular-nums">
              {scorePct(outreach.matchScore)}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wide opacity-80">
              encaje
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {program.school}
              </h1>
              <Badge variant="outline">{program.division}</Badge>
              <StatusBadge status={outreach.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {coach.name} · {coach.title} · {program.state}
              {program.conference ? ` · ${program.conference}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <OutreachActions id={outreach.id} status={outreach.status} />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground lg:justify-end">
            <UserCheck className="size-3.5" />
            Aprobación humana requerida antes de enviar.
          </p>
        </div>
      </div>

      {/* Compliance banner */}
      {consentBlocked && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>El envío está bloqueado.</strong> {athlete.fullName} es menor
            de edad y no tiene consentimiento parental registrado. LineUp lo
            aplica del lado del servidor — presionar <strong>Enviar</strong> se
            rechaza y el contacto queda marcado como{" "}
            <strong>Bloqueado</strong> hasta registrar el consentimiento.
          </span>
        </div>
      )}

      {/* Why this match */}
      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Sparkles className="size-4 text-brand" />
            Por qué esta coincidencia
          </CardTitle>
          <Badge variant="secondary" className="tabular-nums">
            {scorePct(outreach.matchScore)} encaje
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {outreach.matchReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CircleDot className="mt-0.5 size-3.5 shrink-0 text-brand" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          {program.notes && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Nota del programa:</span>{" "}
              {program.notes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Split-view band */}
      <div className="mt-6 flex items-center gap-3">
        <Badge variant="secondary" className="gap-1.5 font-mono text-[11px]">
          🇪🇸 Perfil en español
        </Badge>
        <MoveRight className="size-4 text-brand" />
        <Badge className="gap-1.5 bg-brand font-mono text-[11px] text-brand-foreground">
          🇺🇸 Contacto en inglés para entrenadores
        </Badge>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
          Generado por LineUp · aprobado por humanos antes de enviar
        </span>
      </div>

      {/* THE SPLIT */}
      <div className="relative mt-3 grid gap-4 lg:grid-cols-2">
        {/* Left — Spanish raw profile */}
        <Card className="lg:border-r-2 lg:border-r-brand/20">
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Perfil del atleta</CardTitle>
            <Badge variant="outline" className="font-mono text-[11px]">
              Español
            </Badge>
          </CardHeader>
          <CardContent>
            <AthleteSpanishProfile athlete={athlete} />
          </CardContent>
        </Card>

        {/* Center arrow (desktop) */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
          <span className="flex size-9 items-center justify-center rounded-full border bg-background shadow-sm">
            <ArrowRight className="size-4 text-brand" />
          </span>
        </div>

        {/* Right — English outreach */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <Mail className="size-4" />
                Email para el entrenador
              </CardTitle>
              <CopyButton
                text={`Subject: ${outreach.subjectLine}\n\n${outreach.draftEmailEn}`}
                label="Copiar email"
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="w-14 shrink-0 text-muted-foreground">Para</span>
                  <span className="font-medium">
                    {coach.name}{" "}
                    <span className="font-normal text-muted-foreground">
                      &lt;{coach.email}&gt;
                    </span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-14 shrink-0 text-muted-foreground">
                    Asunto
                  </span>
                  <span className="font-medium">{outreach.subjectLine}</span>
                </div>
              </div>
              <Separator />
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {outreach.draftEmailEn}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Ficha de una página</CardTitle>
              <Badge variant="outline" className="font-mono text-[11px]">
                Inglés
              </Badge>
            </CardHeader>
            <CardContent>
              <OnePager content={outreach.onePagerEn} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity timeline */}
      {outreach.thread.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {outreach.thread.map((entry, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="text-foreground/90">{entry.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(entry.at)} ·{" "}
                      <span className="capitalize">
                        {entry.kind === "system"
                          ? "sistema"
                          : entry.kind === "outbound"
                            ? "saliente"
                            : "entrante"}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
