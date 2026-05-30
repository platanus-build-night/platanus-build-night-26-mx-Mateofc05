# Athlete registration via Claude Code

The `/apply` page offers two ways to register an athlete:

1. **The form** — fills `submit_profile` directly via a server action.
2. **An AI agent** — the athlete copies a link and hands it to Claude Code (or any
   agent), which reads a guide and registers them with a direct API call.

Both land the athlete on the same agency dashboard.

## How the AI-agent path works

```
Athlete on /apply                      This app (Next.js)
┌───────────────────────┐  copies      ┌──────────────────────────────────────┐
│ "Apply with an AI      │  the link    │ /register-with-claude-code.md         │
│  agent" panel          │ ───────────▶ │  (served from public/, same origin)   │
└───────────────────────┘              └──────────────────────────────────────┘
        │ pastes link
        ▼
┌───────────────────────┐  GET guide   ┌──────────────────────────────────────┐
│ Claude Code            │ ───────────▶ │ reads fields + API contract           │
│                        │  POST        │ POST /api/agent/submit-profile        │ ─▶ Postgres → dashboard
└───────────────────────┘              └──────────────────────────────────────┘
```

- The copyable link is rendered by [`app/apply/claude-register-panel.tsx`](../app/apply/claude-register-panel.tsx)
  and resolves to `{origin}/register-with-claude-code.md`.
- The guide lives at [`public/register-with-claude-code.md`](../public/register-with-claude-code.md).
  It tells the agent to use the **same origin** as the document for the API, so
  it works on localhost and in production with no configuration.

## The API the agent calls (no auth, CORS-open)

| Endpoint                       | Method   | Purpose                                                                                       |
| ------------------------------ | -------- | --------------------------------------------------------------------------------------------- |
| `/api/agent/submit-profile`    | POST     | Create the athlete on the dashboard. Required: `fullName`, `country`, `position`, `gradYear`. |
| `/api/agent/check-eligibility` | POST     | Read-only readiness assessment (academics, English, grad window, minor consent).              |
| `/api/agent/list-positions`    | GET/POST | Valid positions + live open roster needs across programs.                                     |

Field schema and examples are in the served guide. Routes live under
[`app/api/agent/`](../app/api/agent); shared logic is in
[`lib/applications.ts`](../lib/applications.ts).

## Quick test

```bash
curl -X POST https://lineup-platanus.vercel.app/api/agent/submit-profile \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Test Player","country":"Argentina","position":"extremo","gradYear":2027}'
```

## Notes

- The endpoints are intentionally unauthenticated so any agent can register an
  athlete from the public guide. If you later need to lock them down, add a
  shared-secret check in [`lib/agent-http.ts`](../lib/agent-http.ts).
- Compliance is unchanged: coach outreach is human-approved, minors require
  recorded parental consent, and NCAA eligibility is always a manual review.
