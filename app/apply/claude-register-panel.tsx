"use client";

import { useState } from "react";
import { Check, Copy, Sparkles, Terminal } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

// Always hand out the production guide link so it works no matter where the
// page is viewed (localhost, preview, prod). The agent hits the real API.
const REGISTER_URL =
  "https://lineup-platanus.vercel.app/register-with-claude-code.md";

const STEPS = [
  "Copia el enlace de abajo.",
  "Pégalo en Claude Code (o cualquier agente de IA).",
  "Lee la guía y te registra con una sola llamada a la API.",
];

export function ClaudeRegisterPanel() {
  const url = REGISTER_URL;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Enlace copiado — pégalo en Claude Code.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Selecciona el enlace y cópialo manualmente.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <Sparkles className="size-4 text-brand" />
        <span className="text-sm font-medium">Postúlate con un agente de IA</span>
        <span className="ml-auto text-xs text-muted-foreground">Sin escribir</span>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        <p className="text-sm text-muted-foreground">
          ¿Prefieres que una IA haga el papeleo? Pásale este enlace a{" "}
          <span className="font-medium text-foreground">Claude Code</span> y
          recopilará tus datos y te registrará llamando directamente a la API de
          LineUp — tu perfil llega al mismo panel.
        </p>

        {/* Enlace copiable */}
        <button
          type="button"
          onClick={copy}
          aria-label="Copiar enlace de registro"
          className={cn(
            "group flex items-center gap-3 rounded-xl border bg-muted/40 px-3.5 py-3 text-left transition-colors",
            "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 outline-none",
          )}
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
            <Terminal className="size-[18px]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
              Guía de registro
            </span>
            <span className="block truncate font-mono text-xs text-foreground">
              {url}
            </span>
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "bg-brand text-brand-foreground"
                : "bg-background text-foreground ring-1 ring-foreground/10 group-hover:ring-foreground/20",
            )}
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copiar enlace
              </>
            )}
          </span>
        </button>

        {/* Steps */}
        <ol className="space-y-2.5">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm">
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-[0.7rem] font-semibold text-brand">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-auto rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
          El enlace abre una guía con todo el contrato de nuestra API. El contacto
          con entrenadores siempre es aprobado por humanos y la elegibilidad NCAA
          es una revisión manual.
        </p>
      </div>
    </div>
  );
}
