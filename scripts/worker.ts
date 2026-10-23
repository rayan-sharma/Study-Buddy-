// Long-running job runner: `npm run worker` next to `npm run dev`.
// Summarizes calls, texts "time to study" reminders through Chert, and answers iMessage replies.
import { callLinkText, chertConfigured } from "../lib/server/chert";
import { markSummaryFailed } from "../lib/server/conversations";
import { pollReplies, textStudent } from "../lib/server/imessage";
import { claimDueJob, failJob, finishJob, releaseStaleClaims, type Job } from "../lib/server/jobs";
import { getCommitment, markNotified, nudgesPaused } from "../lib/server/study";
import { summarizeConversation } from "../lib/server/summarize";

const TICK_MS = 2_000;
const POLL_MS = 5_000;

const handlers: Record<string, (job: Job) => Promise<string | void>> = {
  async summarize(job) {
    if (!job.ref) throw new Error("summarize job without conversation");
    const summary = await summarizeConversation(job.ref);
    console.log(`[worker] summarized ${job.ref}: ${summary?.title ?? "(empty)"}`);
  },

  // Plan A: text the student a call link through Chert. Plan B, when Chert can't send:
  // the Dashboard shows its "Time to study" banner for any due session, so nothing more is needed here.
  async study_reminder(job) {
    const c = job.commitment_id ? getCommitment(job.commitment_id, job.user_id) : undefined;
    if (!c || c.status !== "scheduled") return; // started, cancelled or already reminded
    if (nudgesPaused(job.user_id)) return;
    const result = await textStudent(
      `Time to study: ${c.topic} (${c.duration_minutes} min). ${callLinkText()}`,
      job.idempotency_key
    );
    markNotified(c.id);
    if (result.ok) {
      console.log(`[worker] texted reminder for "${c.topic}"`);
      return result.id ?? undefined;
    }
    console.log(`[worker] reminder for "${c.topic}" shown in the web app only (${result.reason})`);
  },
};

async function runJob(job: Job) {
  const handler = handlers[job.job_type];
  try {
    if (!handler) throw new Error(`no handler for job type ${job.job_type}`);
    finishJob(job.id, (await handler(job)) ?? undefined);
  } catch (err) {
    const retrying = failJob(job, err);
    console.error(`[worker] ${job.job_type} ${job.id} failed (${retrying ? "will retry" : "giving up"}):`, err);
    if (!retrying && job.job_type === "summarize" && job.ref) markSummaryFailed(job.ref);
  }
}

let running = false;
async function tick() {
  if (running) return; // never overlap ticks
  running = true;
  try {
    releaseStaleClaims();
    for (let job = claimDueJob(); job; job = claimDueJob()) await runJob(job);
  } finally {
    running = false;
  }
}

let polling = false;
async function poll() {
  if (polling || !chertConfigured()) return;
  polling = true;
  try {
    const { handled } = await pollReplies();
    if (handled) console.log(`[worker] answered ${handled} iMessage(s)`);
  } catch (err) {
    console.error("[worker] reading iMessage replies failed:", err instanceof Error ? err.message : err);
  } finally {
    polling = false;
  }
}

console.log(`[worker] started (iMessage via Chert: ${chertConfigured() ? "on" : "off, web app reminders only"})`);
const timers = [setInterval(() => void tick(), TICK_MS), setInterval(() => void poll(), POLL_MS)];
void tick();
void poll();

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    timers.forEach(clearInterval);
    console.log("[worker] stopping");
    process.exit(0);
  });
}
