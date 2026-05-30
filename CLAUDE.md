@AGENTS.md

# LineUp — project guide for agents

LineUp is a B2B AI recruitment operations platform for sports scholarship
agencies that place Spanish-speaking soccer athletes (LatAm/Spain) into U.S.
college programs. Hackathon MVP. **Soccer only. Outreach Agent only. Agency-facing.**
Think "usehandle.ai but for international soccer recruitment agencies." It is
**not** a marketplace and **not** NCSA.

## The one thing that matters (the demo's wow moment)

A Spanish athlete profile transforms into coach-ready **English** outreach,
shown **side by side** on `/outreach/[id]` (split view: Spanish profile left →
English email + one-pager right). This screen carries the pitch.

## Architecture (read before coding)

- **Database: PostgreSQL (Railway) via Drizzle ORM.** Connection from
  `DATABASE_URL`. Schema is `lib/schema.ts` (mirrors `lib/types.ts`); client is
  `lib/db.ts` (pooled `pg.Pool` singleton via `globalThis`). Migrations live in
  `drizzle/` (committed). Config: `drizzle.config.ts`.
  - Scripts: `npm run db:generate` (offline SQL from schema), `db:migrate`
    (apply migrations), `db:push` (dev sync), `db:seed` (seed data),
    `db:studio`.
- **Store: `lib/store.ts` is async and Postgres-backed.** Same accessor names as
  before (`getAthletes`, `getAthlete`, `getOutreaches`, `upsertOutreach`,
  `reset`, …) but **all return Promises** — server components and the
  matching/generation agents must `await` them. DB rows use `Date` for
  timestamps; domain types (`lib/types.ts`) use ISO strings — `store.ts` maps at
  the boundary. Athletes/programs/coaches/agency are read-only seed; outreaches
  are mutable.
- **Seed: `data/seed.ts`** holds static seed arrays + `seedDatabase()` (wipes and
  reseeds, FK-safe order). Runner: `scripts/seed.ts`.
- **Object storage: S3-compatible (Railway bucket, private) via `lib/storage.ts`.**
  Uses `@aws-sdk/client-s3` + presigner with `forcePathStyle: true`. Functions:
  `uploadFile()`, `getSignedReadUrl()` (private reads via short-lived presigned
  URLs), `deleteFile()`. Config from `S3_ENDPOINT`, `S3_REGION`,
  `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`.
- **Shared types** live in `lib/types.ts`.
- **Generation is deterministic by default.** `agent/outreachAgent.ts`'s
  `draftCoachEmail()` returns a template result. It only calls an LLM when
  `process.env.USE_LLM === "true"`, and **must** `try/catch` and fall back to the
  template on ANY error. The live demo must never depend on a network call.
- **Email sending** is mocked unless `RESEND_API_KEY` is set.
- **Server actions** mutate the store, then call `revalidatePath()` for every
  affected route (dashboard, athlete detail, outreach detail). Stale UI kills the
  demo payoff.
- **Compliance gate** is server-side in `sendOutreach`: if `athlete.isMinor &&
  !parentalConsent` → status `BLOCKED`, refuse. If status not in
  `{DRAFT, APPROVED}` → refuse. Rate limit is a cosmetic counter only ("8/10"),
  never blocks.

## UI / component rules

- Stack: Next.js App Router + TypeScript + Tailwind + shadcn/ui (Base UI under
  the hood). Premium B2B SaaS look (Linear / Attio / Stripe). Neutral palette,
  strong typography, status badges, pipeline metrics. No childish sports visuals.
- shadcn Button is **Base UI** based — it does NOT support `asChild`. For
  navigation use a `<Link>` styled with `buttonVariants(...)`; for actions use a
  real `<button>`/`<Button>`. Don't give links native button semantics.
- `<html>` has `suppressHydrationWarning` (browser-extension attribute noise).
  Keep render output deterministic: no `Date.now()`, `new Date()`,
  `Math.random()`, or random ids during render — set timestamps in server
  actions only.
- **Zero console errors / zero red overlays** is a hard requirement.

## Phase plan (stop & report after each)

0. Audit + fix console errors + foundation; storage layer migrated to Postgres
   (Drizzle) + S3 (Railway) ✅
1. Types + seed (1 agency, 5 athletes incl. Mateo García, 30 programs, ~30 coaches)
2. Matching engine (`agent/matchPrograms.ts`, deterministic 0–1 score, >= 0.60)
3. Generation agent (`agent/outreachAgent.ts`, deterministic + LLM behind flag)
4. Server actions + compliance gate + `revalidatePath`
5. UI incl. the split-view wow screen
6. Polish (empty/loading states, toasts, badges, demo reset)

## Cut ladder (sacrifice in this order if behind)

1. Real LLM (keep templates). 2. /athletes polish. 3. Animations.
4. One-pager as separate screen (fold into outreach detail). 5. Recent-activity feed.
**Never cut:** dashboard metrics, athlete detail, Generate Campaign → matches,
the outreach split-view + English email, Approve + Send + pipeline status update,
parental-consent send gate.

## Demo script (60 seconds)

Open dashboard → select Mateo García → Generate Campaign → review match scores →
open one outreach (split view) → show English email + one-pager → Approve & Send
→ Mock Open / Reply → back to dashboard, pipeline updated.

## Run

```bash
npm run dev   # http://localhost:3000
```
