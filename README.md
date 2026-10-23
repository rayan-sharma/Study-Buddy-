# StudyBuddy

An AI study partner you can **FaceTime** and **text**. Schedule a study session, get an iMessage when it's time, tap to call, and study with a voice agent that knows what you planned. Every call is transcribed, summarized and saved to your history, and you can text follow-up questions about it afterwards.

Built on [Chert](https://docs.trychert.com) (FaceTime lines and iMessage), [LiveKit](https://livekit.io) and OpenAI.

> **Prototype:** single demo user, local SQLite + JSON storage, runs on one machine.

## How it works

```
 Dashboard (Next.js)                         Your iPhone
 ───────────────────                         ───────────
 Schedule session ──► worker ──► Chert iMessage: "Time to study! Tap to call…"
                                                │ tap
 /study/[id] "Start call" ─────────────────────►│ FaceTime ──► Chert line ──► LiveKit room
                                                                                 │
                                       my-agent (voice agent, OpenAI realtime) ◄─┘
                                       • asks /api/agent/context for today's topic
                                       • greets on Chert's bridge_ready signal
                                       • on hang-up posts the transcript
                                                 │
 History ◄── data/conversations/*.json ◄── /api/ingest/call ◄─┘
             (transcript + AI summary written by the worker)

 Text the line any time ──► worker polls Chert ──► AI reply based on your call summaries
```

The voice agent lives in a separate repo: **[rayan-sharma/my-agent](https://github.com/rayan-sharma/my-agent)** (`feat/study-buddy-vision` branch).

## Features

| | |
|---|---|
| **Tasks & notes** | Dashboard tasks and notes stored in SQLite (`/api/tasks`, `/api/notes`). |
| **Study sessions** | Alarm button on a task schedules a session; a "Time to study" banner appears when it's due. |
| **Start-call page** | `/study/[id]`: **Start call** (opens FaceTime Video to the agent), **Snooze 10 min**, **Not now**, then back to the Dashboard. |
| **iMessage reminders** | At session time the worker texts your verified phone a call link through Chert. If Chert isn't configured, the in-app banner is the fallback. |
| **Text replies** | Text the line: `CALL` returns the call link, `STOP` / `RESUME` pause reminders, anything else gets a short answer grounded in your recent call summaries. |
| **Call history** | Each FaceTime call is saved as JSON with transcript, summary, topics and "try next" questions, shown under **History**. |
| **Demo button** | "Demo: study time now (linear algebra)" starts a session, texts you and opens FaceTime; the agent opens on linear algebra. |
| **Canvas dashboard** | Active courses and upcoming assignments from Canvas LMS (see below). |

## Quick start

Requirements: **Node.js 24**, a Chert project with a FaceTime line (`chert onboard`), a LiveKit Cloud project and an OpenAI API key.

```bash
npm install
cp .env.example .env.local   # then fill it in, see below
npm run seed                 # demo tasks and notes
npm run dev                  # web app on http://localhost:3000
npm run worker               # second terminal: summaries, reminders, iMessage replies
```

Then start the voice agent (in the `my-agent` repo) in two more terminals:

```bash
npm start                                              # the LiveKit agent
npx @trychert/facetime@0.1.0-beta.10 dev --agent my-agent   # puts it on your Chert line
```

Open <http://localhost:3000/Dashboard> and press **Demo: study time now**, or FaceTime your line.

## Configuration (`.env.local`)

All values are server-only; never prefix them with `NEXT_PUBLIC_` and never commit `.env.local`.

| Variable | What it is |
|---|---|
| `OPENAI_API_KEY` | Used for call summaries and text replies. |
| `OPENAI_TEXT_MODEL` | Defaults to `gpt-5.4-mini`. |
| `INGEST_SECRET` | Shared secret; the same value goes in `my-agent/.env.local` (with `BACKEND_URL=http://localhost:3000`). Protects `/api/ingest/call` and `/api/agent/context`. Generate with `openssl rand -hex 32`. |
| `CHERT_API_KEY` | Chert console → project → Developer → API keys → Create (allow write). Without it, reminders are web-only. |
| `CHERT_PROJECT_ID` | Optional; your Chert project id (sent as `X-Chert-Project-Id`). |
| `CHERT_LINE_ID` | Optional; otherwise the line matching `FACETIME_LINE_ADDRESS` is used. `npm run chert:check` shows it. |
| `CHERT_MAX_PER_HOUR` | Text budget per hour (Chert trial: 10, hackathon: 100). |
| `DEMO_USER_PHONE` | The phone verified with `chert onboard` (E.164). Texts can only go to this number. |
| `FACETIME_LINE_ADDRESS` | Your agent's FaceTime number, used in call links. Update it if `chert onboard` assigns a new line. |
| `DATABASE_PATH`, `DEMO_TIMEZONE`, `DEMO_MODE` | Local SQLite file, display time zone, demo flag. |
| `CANVAS_BASE_URL` | Canvas instance for the course dashboard. |

Check the Chert setup without sending anything: `npm run chert:check`.

## Scripts

| Script | |
|---|---|
| `npm run dev` | Next.js dev server. |
| `npm run worker` | Background worker: summarizes calls, sends reminder texts, answers iMessage replies (polls every 5 s). |
| `npm run seed` | Load the demo tasks and notes (`-- --reset` to start over). |
| `npm run chert:check` | Read-only: lists your Chert lines and recent messages (numbers masked). |
| `npm run lint` / `npm run build` | Lint / production build. |

## API

| Route | Method | Purpose |
|---|---|---|
| `/api/state` | GET | Tasks, notes, next session, active session, call line (Dashboard polls every 3 s). |
| `/api/tasks`, `/api/tasks/[id]` | POST / PATCH / DELETE | Tasks. |
| `/api/notes`, `/api/notes/[id]` | POST / PATCH / DELETE | Notes. |
| `/api/commitments`, `/api/commitments/[id]` | POST / GET / PATCH | Schedule, snooze (`{action:"snooze"}`) or cancel a study session. |
| `/api/calls/start` | POST | Start the session and get the FaceTime link. |
| `/api/demo/start` | POST | Run the linear algebra demo. |
| `/api/conversations`, `/api/conversations/[id]` | GET | Call and iMessage history. |
| `/api/ingest/call` | POST | Voice agent posts a call transcript (`Authorization: Bearer $INGEST_SECRET`). |
| `/api/agent/context` | GET | Voice agent asks for the current session topic (same secret). |
| `/api/canvas/dashboard` | GET | Canvas courses and assignments. |

## Data

Everything is local and git-ignored under `data/`:

- `data/studybuddy.db`: SQLite (tasks, notes, sessions, job queue).
- `data/conversations/<id>.json`: one file per call or iMessage thread (transcript + summary).
- `data/chert-state.json`: which texts were already handled and the hourly send count.

## Canvas course dashboard

The dashboard can load active courses and upcoming assignments from a Canvas LMS instance. Set the server-side instance URL in `.env.local`:

```text
CANVAS_BASE_URL=https://your-school.instructure.com
```

Open the dashboard's D2L section and connect with a personal Canvas access token. The token is sent to this app's backend in an authorization header and is not saved by the app. Treat it like a password, do not put it in source code, and disconnect or close the dashboard when finished. Your Canvas administrator may disable personal access tokens; if so, ask them about an approved Canvas integration.

## Known limitations

- **No outbound calls yet.** Chert's shared lines are inbound-only from the CLI, so "Start call" opens FaceTime on your device and you call the agent.
- **Seeing your camera is not yet verified.** The agent is wired to read your camera on FaceTime Video calls, but whether Chert passes the caller's video into the room hasn't been confirmed. Until it does, the agent says it can't see you rather than guessing.
- **Chert sessions expire.** If calls stop arriving, check `chert onboard --status`; re-verifying may assign a new number (update `FACETIME_LINE_ADDRESS`).
- **Texts:** only to the verified phone, text only, rate-limited per hour.
- **Single demo user;** no real accounts or auth on the web routes yet.
- `npm run build` currently fails type-checking in unused copied files (`app/components/page/ui/*`, `app/components/library/ai/client.ts`); `npm run dev` is unaffected.
