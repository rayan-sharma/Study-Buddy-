// Long-running job runner: `npm run worker` next to `npm run dev`.
// Handles call summaries now; reminders and recaps are added as new job types.
import { markSummaryFailed } from "../lib/server/conversations";
import { claimDueJob, failJob, finishJob, releaseStaleClaims, type Job } from "../lib/server/jobs";
import { summarizeConversation } from "../lib/server/summarize";

const TICK_MS = 2_000;

const handlers: Record<string, (job: Job) => Promise<string | void>> = {
  async summarize(job) {
    if (!job.conversation_id) throw new Error("summarize job without conversation");
    const summary = await summarizeConversation(job.conversation_id);
    console.log(`[worker] summarized ${job.conversation_id}: ${summary?.title ?? "(empty)"}`);
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
    if (!retrying && job.job_type === "summarize" && job.conversation_id) markSummaryFailed(job.conversation_id);
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

console.log("[worker] started");
const timer = setInterval(() => void tick(), TICK_MS);
void tick();

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    clearInterval(timer);
    console.log("[worker] stopping");
    process.exit(0);
  });
}
