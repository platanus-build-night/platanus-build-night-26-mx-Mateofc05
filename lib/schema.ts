// Drizzle schema for LineUp — Postgres. Mirrors lib/types.ts.
// jsonb for nested objects, pgEnum for status/division, timestamptz for dates.

import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  AthleteStats,
  EnglishTest,
  RosterNeed,
  ThreadEntry,
} from "@/lib/types";

export const outreachStatus = pgEnum("outreach_status", [
  "DRAFT",
  "APPROVED",
  "SENT",
  "OPENED",
  "REPLIED",
  "ESCALATED",
  "BLOCKED",
]);

export const division = pgEnum("division", ["D1", "D2", "D3", "NAIA", "NJCAA"]);

export const agencies = pgTable("agencies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const athletes = pgTable("athletes", {
  id: text("id").primaryKey(),
  agencyId: text("agency_id")
    .notNull()
    .references(() => agencies.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  country: text("country").notNull(),
  nativeLanguage: text("native_language").notNull().default("es"),
  isMinor: boolean("is_minor").notNull(),
  parentalConsent: boolean("parental_consent").notNull(),
  sport: text("sport").notNull(),
  position: text("position").notNull(),
  positions: jsonb("positions").$type<RosterNeed[]>().notNull(),
  gradYear: integer("grad_year").notNull(),
  heightCm: integer("height_cm").notNull(),
  dominantFoot: text("dominant_foot")
    .$type<"Right" | "Left" | "Both">()
    .notNull(),
  gpaEquivalent: doublePrecision("gpa_equivalent").notNull(),
  stats: jsonb("stats").$type<AthleteStats>().notNull(),
  videoUrl: text("video_url").notNull(),
  englishTest: jsonb("english_test").$type<EnglishTest>().notNull(),
  ncaaCenterStatus: text("ncaa_center_status")
    .notNull()
    .default("MANUAL_REVIEW"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const programs = pgTable("programs", {
  id: text("id").primaryKey(),
  school: text("school").notNull(),
  division: division("division").notNull(),
  conference: text("conference"),
  state: text("state").notNull(),
  sport: text("sport").notNull(),
  level: text("level").notNull(),
  rosterNeeds: jsonb("roster_needs").$type<RosterNeed[]>().notNull(),
  intlFriendly: boolean("intl_friendly").notNull(),
  academicMinGpa: doublePrecision("academic_min_gpa").notNull(),
  notes: text("notes").notNull(),
});

export const coaches = pgTable("coaches", {
  id: text("id").primaryKey(),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  title: text("title").notNull(),
  email: text("email").notNull(),
});

export const outreaches = pgTable("outreaches", {
  id: text("id").primaryKey(),
  athleteId: text("athlete_id")
    .notNull()
    .references(() => athletes.id, { onDelete: "cascade" }),
  coachId: text("coach_id")
    .notNull()
    .references(() => coaches.id, { onDelete: "cascade" }),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  status: outreachStatus("status").notNull().default("DRAFT"),
  matchScore: doublePrecision("match_score").notNull(),
  matchReasons: jsonb("match_reasons").$type<string[]>().notNull(),
  subjectLine: text("subject_line").notNull(),
  draftEmailEn: text("draft_email_en").notNull(),
  onePagerEn: text("one_pager_en").notNull(),
  thread: jsonb("thread").$type<ThreadEntry[]>().notNull().default([]),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  repliedAt: timestamp("replied_at", { withTimezone: true }),
});
