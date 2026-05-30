import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Languages,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
} from "lucide-react";
import { getAthletes, getOutreaches } from "@/lib/store";
import { computeMetrics } from "@/lib/metrics";

export const dynamic = "force-dynamic";

const LIVE_LABELS: { key: "activeAthletes" | "draft" | "sent" | "replied"; label: string }[] = [
  { key: "activeAthletes", label: "Atletas" },
  { key: "draft", label: "Borradores" },
  { key: "sent", label: "Enviados" },
  { key: "replied", label: "Respuestas" },
];

const STEPS = [
  {
    icon: Languages,
    title: "Entra el perfil en español",
    body: "Los atletas envían su perfil en español — estadísticas, posición, académico, video.",
  },
  {
    icon: Target,
    title: "Programas emparejados",
    body: "LineUp ordena los programas de fútbol universitario de EE. UU. por encaje, necesidades de plantilla y académico.",
  },
  {
    icon: Sparkles,
    title: "Sale el contacto para entrenadores",
    body: "Emails personalizados en inglés y una ficha clara, listos para aprobación humana.",
  },
];

export default async function LandingPage() {
  const [athletes, outreaches] = await Promise.all([
    getAthletes(),
    getOutreaches(),
  ]);
  const metrics = computeMetrics(outreaches, athletes.length);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Fútbol · Agencias B2B
          </Badge>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Abrir panel demo
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <Badge
          variant="outline"
          className="mb-6 gap-1.5 border-brand/30 text-brand"
        >
          <Sparkles className="size-3.5" />
          Capa de operaciones con IA para agencias de reclutamiento
        </Badge>

        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Del perfil del atleta en español al{" "}
          <span className="text-brand">contacto listo para entrenadores.</span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          LineUp ayuda a las agencias a colocar a atletas de fútbol
          hispanohablantes en programas universitarios de EE. UU. — emparejamiento,
          emails personalizados para entrenadores y control de cumplimiento, sin
          perder el toque humano.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Abrir panel demo
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/apply"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Postularme como atleta
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <UserCheck className="size-3.5" />
            Aprobación humana requerida
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            Elegibilidad NCAA = revisión manual
          </Badge>
        </div>

        {/* Live pipeline */}
        <div className="mt-12 grid w-full max-w-2xl grid-cols-4 gap-3">
          {LIVE_LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-xl border bg-card px-3 py-4">
              <p className="text-2xl font-semibold tabular-nums">
                {metrics[key]}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="rounded-xl border bg-card p-5 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t px-6 py-5 text-center text-xs text-muted-foreground">
        LineUp · Operaciones de reclutamiento de fútbol · Demo de hackathon
      </footer>
    </div>
  );
}
