"use server";

import { revalidatePath } from "next/cache";
import { generateOutreachCampaign } from "@/agent/outreachAgent";
import { seedDatabase } from "@/data/seed";
import {
  getAthlete,
  getCoach,
  getOutreach,
  reset,
  upsertOutreach,
} from "@/lib/store";
import type { Outreach, OutreachStatus, ThreadEntry } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  message?: string;
  status?: OutreachStatus;
}

// Revalidate every route that surfaces pipeline state, so the UI never goes
// stale after a mutation.
function revalidateAll(athleteId?: string, outreachId?: string) {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/athletes");
  if (athleteId) revalidatePath(`/athletes/${athleteId}`);
  if (outreachId) revalidatePath(`/outreach/${outreachId}`);
}

function appendThread(outreach: Outreach, entry: ThreadEntry): ThreadEntry[] {
  return [...outreach.thread, entry];
}

// --- Demo data ---

export async function seedDemo(): Promise<ActionResult> {
  await seedDatabase();
  revalidateAll();
  return { ok: true, message: "Datos demo recargados." };
}

export async function resetDemo(): Promise<ActionResult> {
  await reset();
  revalidateAll();
  return { ok: true, message: "Pipeline reiniciado. Se borró todo el contacto." };
}

// --- Campaign generation ---

export async function generateCampaign(
  athleteId: string,
): Promise<ActionResult> {
  const athlete = await getAthlete(athleteId);
  if (!athlete) return { ok: false, message: "Atleta no encontrado." };

  const created = await generateOutreachCampaign(athleteId);
  revalidateAll(athleteId);
  return {
    ok: true,
    message: `Se ${created.length === 1 ? "generó" : "generaron"} ${
      created.length
    } borrador${created.length === 1 ? "" : "es"} de contacto para ${
      athlete.fullName
    }.`,
  };
}

// --- Outreach lifecycle ---

export async function approveOutreach(id: string): Promise<ActionResult> {
  const outreach = await getOutreach(id);
  if (!outreach) return { ok: false, message: "Contacto no encontrado." };

  if (outreach.status === "APPROVED") {
    return { ok: true, status: "APPROVED", message: "Ya estaba aprobado." };
  }
  if (outreach.status !== "DRAFT") {
    return {
      ok: false,
      status: outreach.status,
      message: `No se puede aprobar desde el estado ${outreach.status}.`,
    };
  }

  const now = new Date().toISOString();
  const updated = await upsertOutreach({
    ...outreach,
    status: "APPROVED",
    thread: appendThread(outreach, {
      at: now,
      kind: "system",
      text: "Aprobado para envío por la agencia.",
    }),
  });
  revalidateAll(updated.athleteId, updated.id);
  return { ok: true, status: "APPROVED", message: "Contacto aprobado." };
}

export async function sendOutreach(id: string): Promise<ActionResult> {
  const outreach = await getOutreach(id);
  if (!outreach) return { ok: false, message: "Contacto no encontrado." };

  const athlete = await getAthlete(outreach.athleteId);
  if (!athlete) return { ok: false, message: "Atleta no encontrado." };

  // --- Compliance gate (server-side, authoritative) ---
  if (athlete.isMinor && !athlete.parentalConsent) {
    const now = new Date().toISOString();
    const blocked = await upsertOutreach({
      ...outreach,
      status: "BLOCKED",
      thread: appendThread(outreach, {
        at: now,
        kind: "system",
        text: "Envío bloqueado: se requiere consentimiento parental para un atleta menor.",
      }),
    });
    revalidateAll(blocked.athleteId, blocked.id);
    return {
      ok: false,
      status: "BLOCKED",
      message:
        "Bloqueado — se requiere consentimiento parental antes de contactar entrenadores sobre un menor.",
    };
  }

  // Only draft or approved outreach can be sent.
  if (outreach.status !== "DRAFT" && outreach.status !== "APPROVED") {
    return {
      ok: false,
      status: outreach.status,
      message: `No se puede enviar desde el estado ${outreach.status}.`,
    };
  }

  const coach = await getCoach(outreach.coachId);
  const coachLabel = coach ? `${coach.name} (${coach.email})` : "el entrenador";

  // Send for real via Resend if configured; otherwise mock.
  const now = new Date().toISOString();
  let delivery = "Enviado (simulado — sin proveedor de email configurado).";
  if (process.env.RESEND_API_KEY && coach) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: "LineUp <outreach@lineup.demo>",
          to: [coach.email],
          subject: outreach.subjectLine,
          text: outreach.draftEmailEn,
        }),
      });
      delivery = res.ok
        ? "Enviado vía Resend."
        : `Resend devolvió ${res.status}; registrado como enviado (simulado).`;
    } catch {
      delivery = "Error del proveedor de email; registrado como enviado (simulado).";
    }
  }

  const sent = await upsertOutreach({
    ...outreach,
    status: "SENT",
    sentAt: now,
    thread: appendThread(outreach, {
      at: now,
      kind: "outbound",
      text: `Email enviado a ${coachLabel}. ${delivery}`,
    }),
  });
  revalidateAll(sent.athleteId, sent.id);
  return { ok: true, status: "SENT", message: delivery };
}

export async function mockOpen(id: string): Promise<ActionResult> {
  const outreach = await getOutreach(id);
  if (!outreach) return { ok: false, message: "Contacto no encontrado." };

  if (outreach.status !== "SENT") {
    return {
      ok: false,
      status: outreach.status,
      message: "Marca como enviado antes de simular una apertura.",
    };
  }

  const now = new Date().toISOString();
  const updated = await upsertOutreach({
    ...outreach,
    status: "OPENED",
    openedAt: now,
    thread: appendThread(outreach, {
      at: now,
      kind: "system",
      text: "El entrenador abrió el email.",
    }),
  });
  revalidateAll(updated.athleteId, updated.id);
  return { ok: true, status: "OPENED", message: "Marcado como abierto." };
}

export async function mockReply(id: string): Promise<ActionResult> {
  const outreach = await getOutreach(id);
  if (!outreach) return { ok: false, message: "Contacto no encontrado." };

  if (outreach.status !== "SENT" && outreach.status !== "OPENED") {
    return {
      ok: false,
      status: outreach.status,
      message: "Una respuesta solo puede seguir a un email enviado o abierto.",
    };
  }

  const now = new Date().toISOString();
  const updated = await upsertOutreach({
    ...outreach,
    status: "REPLIED",
    openedAt: outreach.openedAt ?? now,
    repliedAt: now,
    thread: appendThread(outreach, {
      at: now,
      kind: "inbound",
      text: "Thanks for reaching out — please send full match footage and the player's academic transcript and we'll take a look.",
    }),
  });
  revalidateAll(updated.athleteId, updated.id);
  return { ok: true, status: "REPLIED", message: "El entrenador respondió." };
}

export async function escalateOutreach(id: string): Promise<ActionResult> {
  const outreach = await getOutreach(id);
  if (!outreach) return { ok: false, message: "Contacto no encontrado." };

  if (outreach.status === "BLOCKED") {
    return {
      ok: false,
      status: "BLOCKED",
      message: "Resuelve el bloqueo de cumplimiento antes de escalar.",
    };
  }

  const now = new Date().toISOString();
  const updated = await upsertOutreach({
    ...outreach,
    status: "ESCALATED",
    thread: appendThread(outreach, {
      at: now,
      kind: "system",
      text: "Escalado a un reclutador senior para seguimiento manual.",
    }),
  });
  revalidateAll(updated.athleteId, updated.id);
  return { ok: true, status: "ESCALATED", message: "Escalado para seguimiento." };
}
