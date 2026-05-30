// Shared athlete-application core. Used by BOTH the manual form (server action)
// and the OpenAI agent tools (REST routes), so the validation, position
// normalization, eligibility logic and DB write live in exactly one place.
//
// Pure helpers (validate / normalize / eligibility) have no side effects; only
// createAthleteFromApplication touches the database.

import { createAthlete, getAgency } from "@/lib/store";
import type {
  Athlete,
  AthleteStats,
  EnglishTest,
  RosterNeed,
} from "@/lib/types";

export const ROSTER_NEEDS: RosterNeed[] = [
  "winger",
  "striker",
  "center back",
  "goalkeeper",
  "midfielder",
];

export const DOMINANT_FEET = ["Right", "Left", "Both"] as const;
export const ENGLISH_TESTS = ["TOEFL", "IELTS", "Duolingo"] as const;

// Loose input — every field except the four required ones is optional, so the
// chat agent can submit a partial profile and the form can default the rest.
export interface ApplicationInput {
  fullName?: string;
  country?: string;
  position?: string;
  gradYear?: number | string;
  heightCm?: number | string;
  dominantFoot?: string;
  gpaEquivalent?: number | string;
  englishTestType?: string;
  englishTestScore?: number | string;
  goals?: number | string;
  assists?: number | string;
  matches?: number | string;
  passAccuracy?: number | string;
  videoUrl?: string;
  isMinor?: boolean | string;
  parentalConsent?: boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// --- coercion helpers ---

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function bool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "on", "yes", "1"].includes(v.toLowerCase());
  return false;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "athlete"
  );
}

/** Map any free-text position ("extremo", "right wing", "9", "keeper") to a RosterNeed. */
export function toRosterNeed(position: string): RosterNeed {
  const s = position.toLowerCase();
  if (/keeper|portero|goal|gk|arquero|guardameta/.test(s)) return "goalkeeper";
  if (/wing|extremo|banda|winger|lateral ofensiv/.test(s)) return "winger";
  if (/strik|forward|delanter|nueve|\b9\b|center forward|cf|punta/.test(s))
    return "striker";
  if (/back|defen|central|zaguer|cb|lb|rb|libero/.test(s)) return "center back";
  return "midfielder";
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const s = typeof value === "string" ? value : "";
  const hit = allowed.find((a) => a.toLowerCase() === s.toLowerCase());
  return hit ?? fallback;
}

// --- validation ---

export function validateApplication(input: ApplicationInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.fullName || String(input.fullName).trim().length < 2) {
    errors.fullName = "El nombre completo es obligatorio.";
  }
  if (!input.country || String(input.country).trim().length < 2) {
    errors.country = "El país es obligatorio.";
  }
  if (!input.position || String(input.position).trim().length < 2) {
    errors.position = "La posición es obligatoria.";
  }
  const gradYear = num(input.gradYear);
  if (gradYear < 2024 || gradYear > 2032) {
    errors.gradYear = "El año de egreso debe estar entre 2024 y 2032.";
  }
  if (input.gpaEquivalent !== undefined && input.gpaEquivalent !== "") {
    const gpa = num(input.gpaEquivalent);
    if (gpa < 0 || gpa > 4)
      errors.gpaEquivalent = "El GPA debe estar en una escala de 0 a 4.";
  }
  if (bool(input.isMinor) && !bool(input.parentalConsent)) {
    // Not a hard validation error — we still accept it, but the dashboard
    // compliance gate will block outreach until consent is recorded.
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// --- eligibility (pure, deterministic — also exposed as an agent tool) ---

export interface EligibilityAssessment {
  eligible: boolean;
  ncaaCenterStatus: "MANUAL_REVIEW";
  checks: { label: string; passed: boolean; detail: string }[];
  summary: string;
}

export function assessEligibility(input: ApplicationInput): EligibilityAssessment {
  const gpa = num(input.gpaEquivalent);
  const gradYear = num(input.gradYear);
  const hasEnglish =
    input.englishTestType !== undefined &&
    String(input.englishTestType).trim() !== "" &&
    num(input.englishTestScore) > 0;
  const isMinor = bool(input.isMinor);
  const consent = bool(input.parentalConsent);

  const checks = [
    {
      label: "Nivel académico",
      passed: gpa >= 2.3,
      detail:
        gpa >= 2.3
          ? `El GPA ${gpa.toFixed(2)} cumple el umbral de trabajo de 2.3 para revisión D1/D2.`
          : `El GPA ${gpa.toFixed(2)} está por debajo del umbral de 2.3 — el académico necesita revisión.`,
    },
    {
      label: "Dominio del inglés",
      passed: hasEnglish,
      detail: hasEnglish
        ? `Puntaje de ${input.englishTestType} registrado (${num(input.englishTestScore)}).`
        : "Aún no hay puntaje de inglés — se recomienda TOEFL/IELTS/Duolingo.",
    },
    {
      label: "Ventana de egreso",
      passed: gradYear >= 2025 && gradYear <= 2030,
      detail:
        gradYear >= 2025 && gradYear <= 2030
          ? `La generación ${gradYear} encaja en los ciclos de reclutamiento actuales.`
          : `La generación ${gradYear} está fuera de la ventana típica de reclutamiento.`,
    },
    {
      label: "Consentimiento de menor",
      passed: !isMinor || consent,
      detail: !isMinor
        ? "El atleta es mayor de 18, no requiere consentimiento parental."
        : consent
          ? "Consentimiento parental registrado para un atleta menor."
          : "Atleta menor — se requiere consentimiento parental antes de cualquier contacto con entrenadores.",
    },
  ];

  const eligible = checks.every((c) => c.passed);
  return {
    eligible,
    ncaaCenterStatus: "MANUAL_REVIEW",
    checks,
    summary: eligible
      ? "Parece elegible para el contacto. El estatus final del NCAA Eligibility Center siempre es una revisión manual."
      : "Algunos puntos necesitan atención antes del contacto. El estatus final del NCAA Eligibility Center siempre es una revisión manual.",
  };
}

// --- normalization: ApplicationInput -> Athlete domain object ---

export function normalizeApplication(
  input: ApplicationInput,
  opts: { agencyId: string; id: string; createdAt: string },
): Athlete {
  const positionLabel = String(input.position ?? "").trim();
  const need = toRosterNeed(positionLabel);

  const stats: AthleteStats = {
    goals: Math.max(0, Math.round(num(input.goals))),
    assists: Math.max(0, Math.round(num(input.assists))),
    matches: Math.max(0, Math.round(num(input.matches))),
    passAccuracy: clampPct(num(input.passAccuracy)),
  };

  const englishTest: EnglishTest = {
    type: oneOf(input.englishTestType, ENGLISH_TESTS, "Duolingo"),
    score: Math.max(0, Math.round(num(input.englishTestScore))),
  };

  return {
    id: opts.id,
    agencyId: opts.agencyId,
    fullName: String(input.fullName).trim(),
    country: String(input.country).trim(),
    nativeLanguage: "es",
    isMinor: bool(input.isMinor),
    parentalConsent: bool(input.parentalConsent),
    sport: "Soccer",
    position: positionLabel || need,
    positions: [need],
    gradYear: num(input.gradYear, 2027),
    heightCm: Math.max(0, Math.round(num(input.heightCm))),
    dominantFoot: oneOf(input.dominantFoot, DOMINANT_FEET, "Right"),
    gpaEquivalent: Math.max(0, Math.min(4, num(input.gpaEquivalent))),
    stats,
    videoUrl: String(input.videoUrl ?? "").trim(),
    englishTest,
    ncaaCenterStatus: "MANUAL_REVIEW",
    createdAt: opts.createdAt,
  };
}

export type CreateResult =
  | { ok: true; athlete: Athlete }
  | { ok: false; errors: Record<string, string> };

/**
 * Validate + persist an athlete application. Server-side only (touches the DB).
 * Returns the created athlete or a map of field errors. Does NOT revalidate
 * routes — callers (server action / route handler) own cache invalidation.
 */
export async function createAthleteFromApplication(
  input: ApplicationInput,
): Promise<CreateResult> {
  const { valid, errors } = validateApplication(input);
  if (!valid) return { ok: false, errors };

  const agency = await getAgency();
  const agencyId = agency?.id ?? "agency-1";

  // Server-side id/timestamp generation is allowed (never during render).
  const id = `athlete-${slugify(String(input.fullName))}-${Date.now().toString(36)}`;
  const createdAt = new Date().toISOString();

  const athlete = normalizeApplication(input, { agencyId, id, createdAt });
  const saved = await createAthlete(athlete);
  return { ok: true, athlete: saved };
}
