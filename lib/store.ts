// Postgres-backed store for LineUp (Drizzle). Same accessor names as before,
// but now async. Athletes/programs/coaches/agency are seeded read-only data;
// outreaches are mutable. DB rows use Date for timestamps — domain types use
// ISO strings, so we map at the boundary here.

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  agencies,
  athletes,
  coaches,
  outreaches,
  programs,
} from "@/lib/schema";
import type { Agency, Athlete, Coach, Outreach, Program } from "@/lib/types";

const iso = (d: Date | null): string | null => (d ? d.toISOString() : null);
const isoReq = (d: Date): string => d.toISOString();
const toDate = (s: string | null): Date | null => (s ? new Date(s) : null);

// --- Row -> domain mappers ---

function mapAgency(r: typeof agencies.$inferSelect): Agency {
  return { id: r.id, name: r.name, createdAt: isoReq(r.createdAt) };
}

function mapAthlete(r: typeof athletes.$inferSelect): Athlete {
  return {
    id: r.id,
    agencyId: r.agencyId,
    fullName: r.fullName,
    country: r.country,
    nativeLanguage: r.nativeLanguage,
    isMinor: r.isMinor,
    parentalConsent: r.parentalConsent,
    sport: r.sport,
    position: r.position,
    positions: r.positions,
    gradYear: r.gradYear,
    heightCm: r.heightCm,
    dominantFoot: r.dominantFoot,
    gpaEquivalent: r.gpaEquivalent,
    stats: r.stats,
    videoUrl: r.videoUrl,
    englishTest: r.englishTest,
    ncaaCenterStatus: r.ncaaCenterStatus,
    createdAt: isoReq(r.createdAt),
  };
}

function mapProgram(r: typeof programs.$inferSelect): Program {
  return {
    id: r.id,
    school: r.school,
    division: r.division,
    conference: r.conference ?? undefined,
    state: r.state,
    sport: r.sport,
    level: r.level,
    rosterNeeds: r.rosterNeeds,
    intlFriendly: r.intlFriendly,
    academicMinGpa: r.academicMinGpa,
    notes: r.notes,
  };
}

function mapCoach(r: typeof coaches.$inferSelect): Coach {
  return {
    id: r.id,
    programId: r.programId,
    name: r.name,
    title: r.title,
    email: r.email,
  };
}

function mapOutreach(r: typeof outreaches.$inferSelect): Outreach {
  return {
    id: r.id,
    athleteId: r.athleteId,
    coachId: r.coachId,
    programId: r.programId,
    status: r.status,
    matchScore: r.matchScore,
    matchReasons: r.matchReasons,
    subjectLine: r.subjectLine,
    draftEmailEn: r.draftEmailEn,
    onePagerEn: r.onePagerEn,
    thread: r.thread,
    nextFollowUpAt: iso(r.nextFollowUpAt),
    createdAt: isoReq(r.createdAt),
    sentAt: iso(r.sentAt),
    openedAt: iso(r.openedAt),
    repliedAt: iso(r.repliedAt),
  };
}

// --- Read accessors (seed data) ---

export async function getAgency(): Promise<Agency | undefined> {
  const rows = await db.select().from(agencies).limit(1);
  return rows[0] ? mapAgency(rows[0]) : undefined;
}

export async function getAthletes(): Promise<Athlete[]> {
  const rows = await db.select().from(athletes);
  return rows.map(mapAthlete);
}

export async function getAthlete(id: string): Promise<Athlete | undefined> {
  const rows = await db
    .select()
    .from(athletes)
    .where(eq(athletes.id, id))
    .limit(1);
  return rows[0] ? mapAthlete(rows[0]) : undefined;
}

export async function getPrograms(): Promise<Program[]> {
  const rows = await db.select().from(programs);
  return rows.map(mapProgram);
}

export async function getProgram(id: string): Promise<Program | undefined> {
  const rows = await db
    .select()
    .from(programs)
    .where(eq(programs.id, id))
    .limit(1);
  return rows[0] ? mapProgram(rows[0]) : undefined;
}

export async function getCoaches(): Promise<Coach[]> {
  const rows = await db.select().from(coaches);
  return rows.map(mapCoach);
}

export async function getCoach(id: string): Promise<Coach | undefined> {
  const rows = await db
    .select()
    .from(coaches)
    .where(eq(coaches.id, id))
    .limit(1);
  return rows[0] ? mapCoach(rows[0]) : undefined;
}

export async function getCoachForProgram(
  programId: string,
): Promise<Coach | undefined> {
  const rows = await db
    .select()
    .from(coaches)
    .where(eq(coaches.programId, programId))
    .limit(1);
  return rows[0] ? mapCoach(rows[0]) : undefined;
}

// --- Read accessors (mutable outreaches) ---

export async function getOutreaches(): Promise<Outreach[]> {
  const rows = await db.select().from(outreaches);
  return rows.map(mapOutreach);
}

export async function getOutreach(id: string): Promise<Outreach | undefined> {
  const rows = await db
    .select()
    .from(outreaches)
    .where(eq(outreaches.id, id))
    .limit(1);
  return rows[0] ? mapOutreach(rows[0]) : undefined;
}

export async function getOutreachesByAthlete(
  athleteId: string,
): Promise<Outreach[]> {
  const rows = await db
    .select()
    .from(outreaches)
    .where(eq(outreaches.athleteId, athleteId));
  return rows.map(mapOutreach);
}

// --- Mutations ---

/**
 * Insert an athlete submitted through the public application funnel (manual form
 * or chat agent). Idempotent on id. Seed athletes remain untouched.
 */
export async function createAthlete(athlete: Athlete): Promise<Athlete> {
  const values: typeof athletes.$inferInsert = {
    id: athlete.id,
    agencyId: athlete.agencyId,
    fullName: athlete.fullName,
    country: athlete.country,
    nativeLanguage: athlete.nativeLanguage,
    isMinor: athlete.isMinor,
    parentalConsent: athlete.parentalConsent,
    sport: athlete.sport,
    position: athlete.position,
    positions: athlete.positions,
    gradYear: athlete.gradYear,
    heightCm: athlete.heightCm,
    dominantFoot: athlete.dominantFoot,
    gpaEquivalent: athlete.gpaEquivalent,
    stats: athlete.stats,
    videoUrl: athlete.videoUrl,
    englishTest: athlete.englishTest,
    ncaaCenterStatus: athlete.ncaaCenterStatus,
    createdAt: new Date(athlete.createdAt),
  };

  const [row] = await db
    .insert(athletes)
    .values(values)
    .onConflictDoUpdate({ target: athletes.id, set: values })
    .returning();

  return mapAthlete(row);
}

export async function upsertOutreach(outreach: Outreach): Promise<Outreach> {
  const values: typeof outreaches.$inferInsert = {
    id: outreach.id,
    athleteId: outreach.athleteId,
    coachId: outreach.coachId,
    programId: outreach.programId,
    status: outreach.status,
    matchScore: outreach.matchScore,
    matchReasons: outreach.matchReasons,
    subjectLine: outreach.subjectLine,
    draftEmailEn: outreach.draftEmailEn,
    onePagerEn: outreach.onePagerEn,
    thread: outreach.thread,
    nextFollowUpAt: toDate(outreach.nextFollowUpAt),
    createdAt: new Date(outreach.createdAt),
    sentAt: toDate(outreach.sentAt),
    openedAt: toDate(outreach.openedAt),
    repliedAt: toDate(outreach.repliedAt),
  };

  const [row] = await db
    .insert(outreaches)
    .values(values)
    .onConflictDoUpdate({
      target: outreaches.id,
      set: {
        status: values.status,
        matchScore: values.matchScore,
        matchReasons: values.matchReasons,
        subjectLine: values.subjectLine,
        draftEmailEn: values.draftEmailEn,
        onePagerEn: values.onePagerEn,
        thread: values.thread,
        nextFollowUpAt: values.nextFollowUpAt,
        sentAt: values.sentAt,
        openedAt: values.openedAt,
        repliedAt: values.repliedAt,
      },
    })
    .returning();

  return mapOutreach(row);
}

export async function deleteOutreachesByAthlete(
  athleteId: string,
): Promise<void> {
  await db.delete(outreaches).where(eq(outreaches.athleteId, athleteId));
}

/** Clear all outreaches (demo reset). Seed data is left untouched. */
export async function reset(): Promise<void> {
  await db.delete(outreaches);
}

// Outreach joined with its athlete / program / coach for list & table views.
export interface OutreachRow {
  outreach: Outreach;
  athlete?: Athlete;
  program?: Program;
  coach?: Coach;
}

export async function getOutreachRows(): Promise<OutreachRow[]> {
  const [os, as, ps, cs] = await Promise.all([
    getOutreaches(),
    getAthletes(),
    getPrograms(),
    getCoaches(),
  ]);
  const aMap = new Map(as.map((a) => [a.id, a]));
  const pMap = new Map(ps.map((p) => [p.id, p]));
  const cMap = new Map(cs.map((c) => [c.id, c]));
  return os
    .map((o) => ({
      outreach: o,
      athlete: aMap.get(o.athleteId),
      program: pMap.get(o.programId),
      coach: cMap.get(o.coachId),
    }))
    .sort((a, b) => b.outreach.createdAt.localeCompare(a.outreach.createdAt));
}

// Cosmetic demo send quota — displayed as "x/10", never blocks anything.
export const DEMO_SEND_LIMIT = 10;

export async function getSendUsage(): Promise<{ used: number; limit: number }> {
  const all = await getOutreaches();
  const used = all.filter((o) => o.sentAt !== null).length;
  return { used, limit: DEMO_SEND_LIMIT };
}
