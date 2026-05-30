// Outreach generation agent for LineUp.
// Deterministic by default: draftCoachEmail() returns a template result and only
// calls an LLM when USE_LLM === "true", always falling back to the template on
// ANY error. The live demo must never depend on a network call.

import { qualifyingMatches } from "@/agent/matchPrograms";
import { getAgency, getAthlete, getOutreach, upsertOutreach } from "@/lib/store";
import type {
  Athlete,
  Coach,
  Outreach,
  Program,
  RosterNeed,
  ThreadEntry,
} from "@/lib/types";

// An agency contacts a handful of best-fit coaches per athlete, not dozens.
// The matching engine still evaluates all 30 programs; this only caps drafts.
export const MAX_OUTREACH_PER_CAMPAIGN = 8;

interface EmailContext {
  athlete: Athlete;
  program: Program;
  coach: Coach;
  rosterNeed: RosterNeed;
  agencyName: string;
}

// --- Small helpers ---

function lastName(coachName: string): string {
  const parts = coachName.trim().split(/\s+/);
  return parts[parts.length - 1] || coachName;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function pickRosterNeed(athlete: Athlete, program: Program): RosterNeed {
  return (
    program.rosterNeeds.find((need) => athlete.positions.includes(need)) ??
    athlete.positions[0]
  );
}

type StatCategory = "keeper" | "defender" | "attacker";

function statCategory(athlete: Athlete): StatCategory {
  if (athlete.positions.includes("goalkeeper")) return "keeper";
  if (athlete.positions.every((p) => p === "center back")) return "defender";
  return "attacker";
}

/** Short stat phrase for the subject line (position-aware). */
function statLine(athlete: Athlete): string {
  const { stats } = athlete;
  switch (statCategory(athlete)) {
    case "keeper":
      return `${stats.matches} matches, film available`;
    case "defender":
      return `${stats.matches} matches, film available`;
    default:
      return `${stats.goals}G/${stats.assists}A, film available`;
  }
}

/** Full production sentence for the email body (name-based, no gendered pronouns). */
function productionSentence(athlete: Athlete): string {
  const name = firstName(athlete.fullName);
  const { stats } = athlete;
  switch (statCategory(athlete)) {
    case "keeper":
      return `${name} has featured in ${stats.matches} matches this season with ${stats.passAccuracy}% distribution accuracy`;
    case "defender":
      return `${name} has anchored the back line across ${stats.matches} matches with ${stats.passAccuracy}% pass accuracy`;
    default:
      return `${name} has produced ${stats.goals} goals and ${stats.assists} assists across ${stats.matches} matches`;
  }
}

// --- Deterministic template generation ---

function templateEmail(ctx: EmailContext): {
  subjectLine: string;
  draftEmailEn: string;
} {
  const { athlete, program, coach, rosterNeed, agencyName } = ctx;
  const name = athlete.fullName;
  const first = firstName(name);
  const primaryPos = athlete.positions[0];

  const subjectLine = `${athlete.gradYear} ${primaryPos} from ${athlete.country} — ${statLine(athlete)}`;

  const draftEmailEn = [
    `Hi Coach ${lastName(coach.name)},`,
    ``,
    `I'm reaching out from ${agencyName} on behalf of ${name}, a ${athlete.gradYear} ${athlete.position} from ${athlete.country} who is exploring college soccer opportunities in the U.S.`,
    ``,
    `${productionSentence(athlete)} — a profile that appears to align with ${program.school}'s current need for a ${rosterNeed}.`,
    ``,
    `You can review ${first}'s highlight video here:`,
    `${athlete.videoUrl}`,
    ``,
    `Academically, ${first} holds an estimated U.S. GPA equivalent of ${athlete.gpaEquivalent} and has a documented ${athlete.englishTest.type} score of ${athlete.englishTest.score}.`,
    ``,
    `Would you be open to taking a quick look at ${first}'s profile to see if there could be a fit for your ${athlete.gradYear} recruiting class? I'm happy to share full match footage and references.`,
    ``,
    `Best regards,`,
    `${agencyName}`,
    `Recruitment Team`,
  ].join("\n");

  return { subjectLine, draftEmailEn };
}

function buildOnePager(athlete: Athlete, program: Program): string {
  const { stats, englishTest } = athlete;
  return [
    `# ${athlete.fullName}`,
    `${athlete.position} · Class of ${athlete.gradYear} · ${athlete.country}`,
    ``,
    `## Overview`,
    `${firstName(athlete.fullName)} is a Spanish-speaking ${athlete.position.toLowerCase()} from ${athlete.country}, represented for U.S. college recruitment. Prepared with ${program.school} (${program.division}) in mind.`,
    ``,
    `## Soccer profile`,
    `- Position: ${athlete.position}`,
    `- Dominant foot: ${athlete.dominantFoot}`,
    `- Height: ${athlete.heightCm} cm`,
    `- Graduation year: ${athlete.gradYear}`,
    ``,
    `## Key stats (current season)`,
    `- Goals: ${stats.goals}`,
    `- Assists: ${stats.assists}`,
    `- Matches: ${stats.matches}`,
    `- Pass accuracy: ${stats.passAccuracy}%`,
    ``,
    `## Academic profile`,
    `- Estimated U.S. GPA equivalent: ${athlete.gpaEquivalent}`,
    `- English proficiency: ${englishTest.type} ${englishTest.score}`,
    ``,
    `## Video`,
    `${athlete.videoUrl}`,
    ``,
    `## Recruitment status`,
    `Managed by the agency. Outreach drafted for human review and approval before any contact is sent.`,
    ``,
    `## Compliance`,
    `NCAA Eligibility Center status requires manual review. This profile has not been certified for NCAA eligibility and is provided for evaluation purposes only.`,
  ].join("\n");
}

// --- Optional LLM path (behind USE_LLM flag, always falls back) ---

async function llmEmail(ctx: EmailContext): Promise<{
  subjectLine: string;
  draftEmailEn: string;
}> {
  const { athlete, program, coach, rosterNeed, agencyName } = ctx;

  const prompt = `You are a recruitment coordinator at ${agencyName}, an agency that places international soccer athletes into U.S. college programs. Write a concise, professional, human cold email to a college coach.

Rules:
- Native-level English, warm but professional, no spammy or exaggerated language.
- Write from the agency's perspective.
- Personalize to the coach and school.
- Tie the athlete's stats to the program's roster need.
- Include the highlight video link and a simple call to action.
- Do NOT invent achievements beyond the data provided.
- Use the athlete's name instead of gendered pronouns.

Athlete: ${athlete.fullName}, ${athlete.gradYear} ${athlete.position} from ${athlete.country}. Stats: ${athlete.stats.goals} goals, ${athlete.stats.assists} assists, ${athlete.stats.matches} matches, ${athlete.stats.passAccuracy}% pass accuracy. GPA equivalent ${athlete.gpaEquivalent}. English: ${athlete.englishTest.type} ${athlete.englishTest.score}. Video: ${athlete.videoUrl}.
Coach: ${coach.name} at ${program.school} (${program.division}). Roster need: ${rosterNeed}.

Respond ONLY with strict JSON: {"subject": string, "body": string}.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    let text: string;

    if (anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",
          max_tokens: 700,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}`);
      const data = await res.json();
      text = data?.content?.[0]?.text ?? "";
    } else if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}`);
      const data = await res.json();
      text = data?.choices?.[0]?.message?.content ?? "";
    } else {
      throw new Error("USE_LLM is true but no provider key is set");
    }

    const parsed = JSON.parse(text) as { subject?: string; body?: string };
    if (!parsed.subject || !parsed.body) {
      throw new Error("LLM returned incomplete JSON");
    }
    return { subjectLine: parsed.subject, draftEmailEn: parsed.body };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Generate a coach email. Deterministic template by default; LLM only when
 * USE_LLM === "true", and any failure transparently falls back to the template.
 */
export async function draftCoachEmail(ctx: EmailContext): Promise<{
  subjectLine: string;
  draftEmailEn: string;
}> {
  if (process.env.USE_LLM === "true") {
    try {
      return await llmEmail(ctx);
    } catch {
      // Fall through to the deterministic template on ANY error.
    }
  }
  return templateEmail(ctx);
}

// --- Campaign generation ---

/**
 * Build a recruitment campaign for an athlete: match programs, take the top
 * qualifying matches, and create one DRAFT outreach per match. Never sends.
 * Idempotent — re-running refreshes content while preserving any progressed
 * status/timestamps for outreaches that already exist.
 */
export async function generateOutreachCampaign(
  athleteId: string,
): Promise<Outreach[]> {
  const athlete = await getAthlete(athleteId);
  if (!athlete) {
    throw new Error(`Athlete not found: ${athleteId}`);
  }

  const agency = await getAgency();
  const agencyName = agency?.name ?? "LineUp Recruitment";

  const matches = await qualifyingMatches(athlete);
  const top = matches.slice(0, MAX_OUTREACH_PER_CAMPAIGN);

  const now = new Date().toISOString();
  const created: Outreach[] = [];

  for (const match of top) {
    const { program, coach, matchScore, matchReasons } = match;
    const rosterNeed = pickRosterNeed(athlete, program);

    const { subjectLine, draftEmailEn } = await draftCoachEmail({
      athlete,
      program,
      coach,
      rosterNeed,
      agencyName,
    });
    const onePagerEn = buildOnePager(athlete, program);

    const id = `outreach-${athlete.id}-${program.id}`;
    const existing = await getOutreach(id);

    const thread: ThreadEntry[] = existing?.thread?.length
      ? existing.thread
      : [{ at: now, kind: "system", text: "Borrador generado por LineUp." }];

    const outreach: Outreach = {
      id,
      athleteId: athlete.id,
      coachId: coach.id,
      programId: program.id,
      status: existing?.status ?? "DRAFT",
      matchScore,
      matchReasons,
      subjectLine,
      draftEmailEn,
      onePagerEn,
      thread,
      nextFollowUpAt: existing?.nextFollowUpAt ?? null,
      createdAt: existing?.createdAt ?? now,
      sentAt: existing?.sentAt ?? null,
      openedAt: existing?.openedAt ?? null,
      repliedAt: existing?.repliedAt ?? null,
    };

    created.push(await upsertOutreach(outreach));
  }

  return created;
}
