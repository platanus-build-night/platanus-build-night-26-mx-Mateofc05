// Shared domain types for LineUp. No database — these back the in-memory store.

export type OutreachStatus =
  | "DRAFT"
  | "APPROVED"
  | "SENT"
  | "OPENED"
  | "REPLIED"
  | "ESCALATED"
  | "BLOCKED";

export type Division = "D1" | "D2" | "D3" | "NAIA" | "NJCAA";

export type RosterNeed =
  | "winger"
  | "striker"
  | "center back"
  | "goalkeeper"
  | "midfielder";

export interface AthleteStats {
  goals: number;
  assists: number;
  matches: number;
  passAccuracy: number; // percentage, e.g. 84
}

export interface EnglishTest {
  type: "TOEFL" | "IELTS" | "Duolingo";
  score: number;
}

export interface Agency {
  id: string;
  name: string;
  createdAt: string; // ISO
}

export interface Athlete {
  id: string;
  agencyId: string;
  fullName: string;
  country: string;
  nativeLanguage: string; // default "es"
  isMinor: boolean;
  parentalConsent: boolean;
  sport: string; // "Soccer"
  position: string; // human-readable, e.g. "Winger / Forward"
  positions: RosterNeed[]; // normalized for matching
  gradYear: number;
  heightCm: number;
  dominantFoot: "Right" | "Left" | "Both";
  gpaEquivalent: number;
  stats: AthleteStats;
  videoUrl: string;
  englishTest: EnglishTest;
  ncaaCenterStatus: string; // default "MANUAL_REVIEW"
  createdAt: string; // ISO
}

export interface Coach {
  id: string;
  programId: string;
  name: string;
  title: string;
  email: string;
}

export interface Program {
  id: string;
  school: string;
  division: Division;
  conference?: string;
  state: string;
  sport: string; // "Soccer"
  level: string; // descriptor, e.g. "Competitive D1 program"
  rosterNeeds: RosterNeed[];
  intlFriendly: boolean;
  academicMinGpa: number;
  notes: string;
}

export interface ThreadEntry {
  at: string; // ISO
  kind: "system" | "outbound" | "inbound";
  text: string;
}

export interface Outreach {
  id: string;
  athleteId: string;
  coachId: string;
  programId: string;
  status: OutreachStatus;
  matchScore: number; // 0..1
  matchReasons: string[];
  subjectLine: string;
  draftEmailEn: string;
  onePagerEn: string;
  thread: ThreadEntry[];
  nextFollowUpAt: string | null;
  createdAt: string; // ISO
  sentAt: string | null;
  openedAt: string | null;
  repliedAt: string | null;
}

// A matching result before it becomes a persisted Outreach.
export interface MatchResult {
  program: Program;
  coach: Coach;
  matchScore: number;
  matchReasons: string[];
}
