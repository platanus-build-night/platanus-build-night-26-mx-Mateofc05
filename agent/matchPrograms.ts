// Deterministic program-matching engine for LineUp.
// Produces a 0..1 fit score per program with human-readable reasons.
// No randomness, no dates-at-runtime, no network — fully reproducible.

import { getCoachForProgram, getPrograms } from "@/lib/store";
import type { Athlete, Division, MatchResult, Program } from "@/lib/types";

// Only matches at or above this score should generate outreach.
export const MATCH_THRESHOLD = 0.6;

// Scoring weights (sum to 1.0).
const WEIGHTS = {
  position: 0.3,
  intlFriendly: 0.25,
  academic: 0.15,
  gradYear: 0.1,
  level: 0.1,
  video: 0.05,
  english: 0.05,
} as const;

// Fixed recruiting window so scoring is deterministic (no `new Date()`).
const RECRUITING_GRAD_YEARS = [2026, 2027, 2028];

// Per-division thresholds for the stats-based "level fit".
const PROD_THRESHOLD: Record<Division, number> = {
  D1: 0.45,
  D2: 0.35,
  D3: 0.25,
  NAIA: 0.2,
  NJCAA: 0,
};
const PASS_THRESHOLD: Record<Division, number> = {
  D1: 82,
  D2: 78,
  D3: 74,
  NAIA: 72,
  NJCAA: 0,
};

const DEFENSIVE = new Set(["goalkeeper", "center back"]);

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Does the athlete's stat production fit the program's competitive level? */
function fitsLevel(athlete: Athlete, program: Program): boolean {
  const { stats, positions } = athlete;
  const isDefensive = positions.every((p) => DEFENSIVE.has(p));

  if (isDefensive) {
    // Defenders / keepers: judged on passing reliability + minutes.
    return (
      stats.passAccuracy >= PASS_THRESHOLD[program.division] &&
      stats.matches >= 15
    );
  }

  // Outfield attackers / midfielders: goal contributions per match.
  const perMatch =
    stats.matches > 0 ? (stats.goals + stats.assists) / stats.matches : 0;
  return perMatch >= PROD_THRESHOLD[program.division];
}

/**
 * Score a single program against an athlete. Pure & deterministic.
 * Returns the 0..1 score plus the list of reasons that contributed to it.
 */
export function scoreProgram(
  athlete: Athlete,
  program: Program,
): { matchScore: number; matchReasons: string[] } {
  // Same sport is required — otherwise no match at all.
  if (program.sport !== athlete.sport) {
    return { matchScore: 0, matchReasons: [] };
  }

  let score = 0;
  const reasons: string[] = [];

  // Position fit.
  const matchedNeed = program.rosterNeeds.find((need) =>
    athlete.positions.includes(need),
  );
  if (matchedNeed) {
    score += WEIGHTS.position;
    reasons.push(
      `La necesidad de plantilla de ${matchedNeed} coincide con la posición del atleta`,
    );
  }

  // International-friendly program.
  if (program.intlFriendly) {
    score += WEIGHTS.intlFriendly;
    reasons.push("El programa recluta activamente atletas estudiantes internacionales");
  }

  // Academic fit.
  if (athlete.gpaEquivalent >= program.academicMinGpa) {
    score += WEIGHTS.academic;
    reasons.push(
      `Cumple el mínimo académico (GPA ${athlete.gpaEquivalent} ≥ ${program.academicMinGpa})`,
    );
  }

  // Graduation-year fit (within the active recruiting window).
  if (RECRUITING_GRAD_YEARS.includes(athlete.gradYear)) {
    score += WEIGHTS.gradYear;
    reasons.push(
      `El año de egreso (${athlete.gradYear}) encaja en las generaciones de reclutamiento actuales`,
    );
  }

  // Level fit based on stats.
  if (fitsLevel(athlete, program)) {
    score += WEIGHTS.level;
    reasons.push(
      `La producción (${athlete.stats.goals} G, ${athlete.stats.assists} A en ${athlete.stats.matches} partidos) es consistente con ${program.division}`,
    );
  }

  // Video available.
  if (athlete.videoUrl) {
    score += WEIGHTS.video;
    reasons.push("Video de jugadas disponible para evaluación");
  }

  // English proficiency documented.
  if (athlete.englishTest) {
    score += WEIGHTS.english;
    reasons.push(
      `Dominio del inglés documentado (${athlete.englishTest.type} ${athlete.englishTest.score})`,
    );
  }

  return { matchScore: round2(Math.min(score, 1)), matchReasons: reasons };
}

/**
 * Match an athlete against every program in the store.
 * Returns all same-sport matches with a coach attached, sorted by score
 * (desc), then program id for a stable, deterministic order.
 */
export async function matchPrograms(athlete: Athlete): Promise<MatchResult[]> {
  const programs = await getPrograms();
  const results: MatchResult[] = [];

  for (const program of programs) {
    if (program.sport !== athlete.sport) continue;
    const coach = await getCoachForProgram(program.id);
    if (!coach) continue;

    const { matchScore, matchReasons } = scoreProgram(athlete, program);
    results.push({ program, coach, matchScore, matchReasons });
  }

  results.sort(
    (a, b) =>
      b.matchScore - a.matchScore || a.program.id.localeCompare(b.program.id),
  );
  return results;
}

/** Matches that qualify for outreach (score >= threshold). */
export async function qualifyingMatches(
  athlete: Athlete,
): Promise<MatchResult[]> {
  const all = await matchPrograms(athlete);
  return all.filter((m) => m.matchScore >= MATCH_THRESHOLD);
}
