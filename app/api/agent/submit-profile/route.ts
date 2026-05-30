// Agent tool: submit_profile
// Creates an athlete profile from a (possibly partial) application payload and
// makes it appear on the agency dashboard. Backs the ChatKit chat agent's
// `submit_profile` client tool AND the public REST surface.

import { revalidatePath } from "next/cache";
import { createAthleteFromApplication } from "@/lib/applications";
import { preflight, readJson, toolJson } from "@/lib/agent-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  const result = await createAthleteFromApplication(body);

  if (!result.ok) {
    return toolJson(
      {
        ok: false,
        error: "validation_failed",
        errors: result.errors,
        message:
          "Faltan algunos campos obligatorios. Se necesita al menos nombre completo, país, posición y año de egreso.",
      },
      { status: 422 },
    );
  }

  // Keep every pipeline surface fresh so the new athlete shows up immediately.
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/athletes");

  const a = result.athlete;
  return toolJson({
    ok: true,
    athleteId: a.id,
    athlete: {
      id: a.id,
      fullName: a.fullName,
      country: a.country,
      position: a.position,
      gradYear: a.gradYear,
      isMinor: a.isMinor,
      parentalConsent: a.parentalConsent,
    },
    profileUrl: `/athletes/${a.id}`,
    message: `El perfil de ${a.fullName} fue agregado al panel de la agencia. La elegibilidad NCAA sigue siendo una revisión manual.`,
  });
}
