"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { submitAthleteApplication, type ApplyState } from "./actions";

// El valor en español se guarda como etiqueta de posición; el servidor lo
// normaliza a una necesidad de plantilla (toRosterNeed reconoce el español).
const POSITIONS = [
  { value: "Extremo", label: "Extremo" },
  { value: "Delantero", label: "Delantero / 9" },
  { value: "Mediocampista", label: "Mediocampista" },
  { value: "Defensa central", label: "Defensa / Central" },
  { value: "Portero", label: "Portero" },
];

// El valor se mantiene en inglés (lo exige el tipo); la etiqueta es español.
const FEET = [
  { value: "Right", label: "Derecho" },
  { value: "Left", label: "Izquierdo" },
  { value: "Both", label: "Ambos" },
];
const ENGLISH_TESTS = ["TOEFL", "IELTS", "Duolingo"];

const SECTION = "text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground";

function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  );
}

const initialState: ApplyState = { ok: false };

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState(
    submitAthleteApplication,
    initialState,
  );
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const lastHandled = useRef<ApplyState | null>(null);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.ok && state.message) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (!state.ok && state.message && state.errors) {
      toast.error(state.message);
    }
  }, [state]);

  const err = state.errors ?? {};
  const f = (name: string) => `${uid}-${name}`;

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-muted text-brand">
          <CheckCircle2 className="size-6" />
        </span>
        <div className="space-y-1.5">
          <h3 className="font-heading text-lg font-semibold">Perfil enviado</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {state.athleteName} ya está en el panel de la agencia, listo para el
            match con programas y el contacto con entrenadores. La elegibilidad
            NCAA sigue siendo una revisión manual.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {state.athleteId ? (
            <Link
              href={`/athletes/${state.athleteId}`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Ver perfil
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            Abrir panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6 px-5 py-5">
      {/* Atleta */}
      <div className="space-y-3">
        <p className={SECTION}>Atleta</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre completo" htmlFor={f("fullName")} error={err.fullName}>
            <Input
              id={f("fullName")}
              name="fullName"
              placeholder="Mateo García"
              aria-invalid={!!err.fullName}
              required
            />
          </Field>
          <Field label="País" htmlFor={f("country")} error={err.country}>
            <Input
              id={f("country")}
              name="country"
              placeholder="México"
              aria-invalid={!!err.country}
              required
            />
          </Field>
        </div>
      </div>

      <Separator />

      {/* En la cancha */}
      <div className="space-y-3">
        <p className={SECTION}>En la cancha</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Posición"
            htmlFor={f("position")}
            error={err.position}
            className="sm:col-span-1"
          >
            <Select id={f("position")} name="position" defaultValue="Extremo">
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Pie hábil" htmlFor={f("dominantFoot")}>
            <Select id={f("dominantFoot")} name="dominantFoot" defaultValue="Right">
              {FEET.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Estatura (cm)" htmlFor={f("heightCm")}>
            <Input
              id={f("heightCm")}
              name="heightCm"
              type="number"
              min={120}
              max={220}
              placeholder="178"
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Goles" htmlFor={f("goals")}>
            <Input id={f("goals")} name="goals" type="number" min={0} placeholder="18" />
          </Field>
          <Field label="Asistencias" htmlFor={f("assists")}>
            <Input id={f("assists")} name="assists" type="number" min={0} placeholder="9" />
          </Field>
          <Field label="Partidos" htmlFor={f("matches")}>
            <Input id={f("matches")} name="matches" type="number" min={0} placeholder="27" />
          </Field>
          <Field label="% de pase" htmlFor={f("passAccuracy")}>
            <Input
              id={f("passAccuracy")}
              name="passAccuracy"
              type="number"
              min={0}
              max={100}
              placeholder="84"
            />
          </Field>
        </div>
        <Field
          label="Enlace de video de jugadas"
          htmlFor={f("videoUrl")}
          hint="YouTube, Veo, Hudl o un enlace compartido."
        >
          <Input
            id={f("videoUrl")}
            name="videoUrl"
            type="url"
            placeholder="https://…"
          />
        </Field>
      </div>

      <Separator />

      {/* Académico */}
      <div className="space-y-3">
        <p className={SECTION}>Académico e inglés</p>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Año de egreso" htmlFor={f("gradYear")} error={err.gradYear}>
            <Input
              id={f("gradYear")}
              name="gradYear"
              type="number"
              min={2024}
              max={2032}
              placeholder="2027"
              defaultValue={2027}
              aria-invalid={!!err.gradYear}
              required
            />
          </Field>
          <Field
            label="GPA (0–4)"
            htmlFor={f("gpaEquivalent")}
            error={err.gpaEquivalent}
          >
            <Input
              id={f("gpaEquivalent")}
              name="gpaEquivalent"
              type="number"
              step="0.1"
              min={0}
              max={4}
              placeholder="3.5"
              aria-invalid={!!err.gpaEquivalent}
            />
          </Field>
          <Field label="Examen de inglés" htmlFor={f("englishTestType")}>
            <Select
              id={f("englishTestType")}
              name="englishTestType"
              defaultValue="TOEFL"
            >
              {ENGLISH_TESTS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Puntaje" htmlFor={f("englishTestScore")}>
            <Input
              id={f("englishTestScore")}
              name="englishTestScore"
              type="number"
              min={0}
              placeholder="82"
            />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Cumplimiento */}
      <div className="space-y-3">
        <p className={SECTION}>Cumplimiento</p>
        <label
          htmlFor={f("isMinor")}
          className="flex items-start gap-2.5 text-sm"
        >
          <Checkbox id={f("isMinor")} name="isMinor" className="mt-0.5" />
          <span>
            Soy menor de 18 años.
            <span className="block text-xs text-muted-foreground">
              Los menores requieren consentimiento parental registrado antes de contactar a cualquier entrenador.
            </span>
          </span>
        </label>
        <label
          htmlFor={f("parentalConsent")}
          className="flex items-start gap-2.5 text-sm"
        >
          <Checkbox id={f("parentalConsent")} name="parentalConsent" className="mt-0.5" />
          <span>
            Un padre/madre o tutor autoriza este envío.
          </span>
        </label>
        <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-brand" />
          El contacto nunca se envía sin aprobación humana, y la elegibilidad NCAA
          siempre es una revisión manual.
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            Enviar mi perfil
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
