# LineUp

**From Spanish athlete profile to coach-ready outreach.**

LineUp is an AI operations layer for international soccer recruitment agencies.
It turns a Spanish-speaking athlete's profile into a ranked list of matching U.S.
college programs, personalized **English** coach emails, and a clean English
one-pager — all behind a human-approved, compliance-aware outreach pipeline.

> Hackathon MVP. **Soccer only. Outreach Agent only. Agency-facing.** Not a
> marketplace, not NCSA. The wow moment: a Spanish athlete profile transforms
> into coach-ready English outreach, shown **side by side** on `/outreach/[id]`.

## Stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS** + **shadcn/ui**
- **PostgreSQL** (Railway) via **Drizzle ORM** — connection from `DATABASE_URL`
- **S3-compatible object storage** (Railway bucket, private) via the AWS SDK
- **Generation is deterministic by default**; a real LLM is used only behind the
  `USE_LLM` flag and always falls back to templates on any error
- **Email** is mocked unless `RESEND_API_KEY` is set

## Getting started

```bash
npm install
cp .env.example .env     # fill in DATABASE_URL and the five S3_* values
npm run db:migrate       # apply the schema to Postgres
npm run db:seed          # seed agency, 5 athletes, 30 programs, 30 coaches
npm run dev              # http://localhost:3000
```

Everything else is optional — without LLM or Resend keys the app runs fully with
deterministic generation and mocked sends.

### Environment variables (`.env.example`)

| Variable                                  | Purpose                                    |
| ----------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`                            | Postgres connection string (Railway)       |
| `S3_ENDPOINT` / `S3_REGION`               | S3-compatible endpoint + region            |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Bucket credentials                       |
| `S3_BUCKET_NAME`                          | Bucket name (private)                       |
| `USE_LLM`                                 | `true` to use a real LLM (default `false`) |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`    | LLM provider (only when `USE_LLM=true`)    |
| `RESEND_API_KEY`                          | Real email sending (optional)              |

## Scripts

| Command              | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Start the dev server                          |
| `npm run build`      | Production build                              |
| `npm run db:generate`| Generate SQL migrations from the schema       |
| `npm run db:migrate` | Apply migrations to Postgres                  |
| `npm run db:seed`    | Seed demo data                                |
| `npm run db:studio`  | Open Drizzle Studio                           |

## Architecture

- `lib/schema.ts` — Drizzle tables (mirror `lib/types.ts`); `lib/db.ts` — pooled
  client; migrations in `drizzle/`.
- `lib/store.ts` — async data accessors (athletes/programs/coaches are read-only
  seed; outreaches are mutable).
- `lib/storage.ts` — S3 upload / presigned-read / delete (`forcePathStyle: true`).
- `agent/matchPrograms.ts` — deterministic 0–1 program matching (≥ 0.60 qualifies).
- `agent/outreachAgent.ts` — campaign generation; deterministic template by
  default, LLM behind `USE_LLM` with template fallback.
- `app/actions.ts` — server actions + the server-side compliance gate; every
  mutation calls `revalidatePath` so the pipeline updates live.

## Compliance

- **Parental-consent gate** (server-side): a minor without parental consent can
  never be contacted — `Send` sets status `BLOCKED` and refuses.
- **Human approval required** before any send.
- **NCAA Eligibility Center** status is always manual review — LineUp never
  auto-certifies eligibility.
- The "x/10 sends today" counter is cosmetic and never blocks.

## Demo script (60 seconds)

1. Open the **dashboard** (`/dashboard`).
2. Select **Mateo García**.
3. Click **Generate Recruitment Campaign**.
4. Review the **match scores** and reasons.
5. Open one **outreach** — the split view (`/outreach/[id]`).
6. Show the **English coach email** and **one-pager** beside the Spanish profile.
7. **Approve & Send**.
8. **Mock Open** / **Mock Reply**.
9. Back to the dashboard — the **pipeline has updated**.

Try the gate too: generating for **Diego Fernández** (a minor without consent)
and pressing **Send** is blocked server-side.

Use **Reset demo** (top-right of the dashboard) to clear the pipeline for a fresh run.
