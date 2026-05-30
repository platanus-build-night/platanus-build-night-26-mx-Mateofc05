import Link from "next/link";
import {
  ClipboardList,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAthletes } from "@/lib/store";
import { ApplicationForm } from "./application-form";
import { ClaudeRegisterPanel } from "./claude-register-panel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Postúlate a LineUp — que te vean los programas de fútbol de EE. UU.",
  description:
    "Atletas de fútbol hispanohablantes: envía tu perfil y conecta con programas universitarios de EE. UU. Postúlate con el formulario o deja que un agente de IA lo haga por ti.",
};

const STEPS = [
  {
    icon: ClipboardList,
    title: "Comparte tu perfil",
    body: "Llena el formulario o deja que un agente de IA lo haga — estadísticas, posición, académico, video.",
  },
  {
    icon: Target,
    title: "Encuentra tu match",
    body: "LineUp ordena los programas universitarios de EE. UU. por encaje, necesidades de plantilla y académico.",
  },
  {
    icon: Trophy,
    title: "Los entrenadores te conocen",
    body: "Tu agencia envía un contacto en inglés, listo para entrenadores, en tu nombre.",
  },
];

export default async function ApplyPage() {
  const athletes = await getAthletes();

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(60rem_40rem_at_85%_-10%,var(--brand-muted),transparent_60%)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Inicio de LineUp">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden gap-1.5 border-brand/30 text-brand sm:inline-flex">
            <Sparkles className="size-3.5" />
            Para atletas
          </Badge>
          <Link href="/dashboard" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Acceso para agencias
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-10 pb-8 text-center">
        <Badge variant="secondary" className="mb-5 gap-1.5">
          <Trophy className="size-3.5" />
          {athletes.length} atletas ya en el pipeline
        </Badge>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Llega al{" "}
          <span className="text-brand">fútbol universitario de EE. UU.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          Envía tu perfil en dos minutos. Nuestras agencias aliadas te conectan con
          los programas adecuados y contactan a los entrenadores en inglés — tú
          concéntrate en el fútbol.
        </p>
        <div className="mx-auto mt-7 flex max-w-md flex-wrap items-center justify-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck className="size-3.5 text-brand" />
            Contacto aprobado por humanos
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <ShieldCheck className="size-3.5 text-brand" />
            Consentimiento parental para menores
          </Badge>
        </div>
      </section>

      {/* Dos formas de postularte */}
      <section className="px-6 pb-6">
        <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-2">
          {/* Formulario */}
          <Card className="overflow-hidden py-0">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <ClipboardList className="size-4 text-brand" />
              <span className="text-sm font-medium">Postúlate con el formulario</span>
              <span className="ml-auto text-xs text-muted-foreground">~2 min</span>
            </div>
            <ApplicationForm />
          </Card>

          {/* Registro con agente de IA */}
          <Card className="overflow-hidden py-0">
            <ClaudeRegisterPanel />
          </Card>
        </div>
        <p className="mx-auto mt-3 flex max-w-6xl items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <MessagesSquare className="size-3.5" />
          Ambas vías llegan al mismo panel de la agencia. Elige la que prefieras.
        </p>
      </section>

      {/* Cómo funciona */}
      <section className="px-6 py-12">
        <div className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-xl border bg-card/70 p-5 text-left backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="mt-auto border-t px-6 py-5 text-center text-xs text-muted-foreground">
        LineUp · Operaciones de reclutamiento de fútbol · Postularse es gratis
      </footer>
    </div>
  );
}
