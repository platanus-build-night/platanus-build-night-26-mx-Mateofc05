// Agent tool: check_eligibility
// Deterministic, read-only assessment of an athlete's readiness for outreach
// (academics, English, graduation window, minor consent). No DB writes.

import { assessEligibility } from "@/lib/applications";
import { preflight, readJson, toolJson } from "@/lib/agent-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(): Response {
  return preflight();
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  const assessment = assessEligibility(body);
  return toolJson({ ok: true, ...assessment });
}
