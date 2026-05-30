// The athlete's raw profile rendered in SPANISH — their native inputs.
// This is the left half of the wow transformation.

import Link from "next/link";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { countryEs, footEs, positionsEs } from "@/lib/i18n";
import type { Athlete } from "@/lib/types";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed py-1.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">
      {children}
    </p>
  );
}

export function AthleteSpanishProfile({ athlete }: { athlete: Athlete }) {
  const { stats, englishTest } = athlete;
  return (
    <div>
      <SectionTitle>Datos personales</SectionTitle>
      <Field label="Nombre" value={athlete.fullName} />
      <Field label="País" value={countryEs(athlete.country)} />
      <Field label="Idioma nativo" value="Español" />
      <Field label="Deporte" value="Fútbol" />
      <Field label="Posición" value={positionsEs(athlete)} />
      <Field label="Año de graduación" value={athlete.gradYear} />
      <Field label="Altura" value={`${athlete.heightCm} cm`} />
      <Field label="Pie dominante" value={footEs(athlete.dominantFoot)} />

      <SectionTitle>Estadísticas (temporada actual)</SectionTitle>
      <Field label="Goles" value={stats.goals} />
      <Field label="Asistencias" value={stats.assists} />
      <Field label="Partidos" value={stats.matches} />
      <Field label="Precisión de pase" value={`${stats.passAccuracy}%`} />

      <SectionTitle>Perfil académico</SectionTitle>
      <Field label="GPA equivalente (EE. UU.)" value={athlete.gpaEquivalent} />
      <Field
        label="Examen de inglés"
        value={`${englishTest.type} ${englishTest.score}`}
      />

      <SectionTitle>Video</SectionTitle>
      <Link
        href={athlete.videoUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        Ver video de highlights
        <ExternalLink className="size-3.5" />
      </Link>

      <SectionTitle>Cumplimiento</SectionTitle>
      <Field
        label="¿Menor de edad?"
        value={athlete.isMinor ? "Sí" : "No"}
      />
      <div className="flex items-baseline justify-between gap-4 border-b border-dashed py-1.5">
        <span className="text-sm text-muted-foreground">
          Consentimiento parental
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-right text-sm font-medium",
            athlete.parentalConsent ? "text-emerald-600" : "text-red-600",
          )}
        >
          {athlete.parentalConsent ? (
            <ShieldCheck className="size-3.5" />
          ) : (
            <ShieldAlert className="size-3.5" />
          )}
          {athlete.parentalConsent ? "Otorgado" : "Falta"}
        </span>
      </div>
      <Field label="NCAA Eligibility Center" value="Revisión manual" />
    </div>
  );
}
