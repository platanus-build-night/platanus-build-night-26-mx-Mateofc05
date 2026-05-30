// Agent tool: list_positions
// Returns the valid soccer positions LineUp matches on, plus a live count of
// open roster needs across U.S. college programs so the agent can guide the
// athlete. Read-only.

import { ROSTER_NEEDS } from "@/lib/applications";
import { preflight, toolJson } from "@/lib/agent-http";
import { getPrograms } from "@/lib/store";
import type { RosterNeed } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

async function payload() {
  const programs = await getPrograms();
  const openRosterNeeds: Record<string, number> = {};
  for (const need of ROSTER_NEEDS) openRosterNeeds[need] = 0;
  for (const p of programs) {
    for (const need of p.rosterNeeds as RosterNeed[]) {
      openRosterNeeds[need] = (openRosterNeeds[need] ?? 0) + 1;
    }
  }
  return {
    ok: true,
    positions: ROSTER_NEEDS,
    openRosterNeeds,
    programCount: programs.length,
    note: "Elige la posición más cercana. Texto libre como 'extremo' o 'lateral derecho' funciona — se normaliza automáticamente.",
  };
}

export async function GET(): Promise<Response> {
  return toolJson(await payload());
}

// Some agent runtimes only issue POST tool calls.
export async function POST(): Promise<Response> {
  return toolJson(await payload());
}
