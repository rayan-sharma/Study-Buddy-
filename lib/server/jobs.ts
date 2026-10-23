// Durable job queue in SQLite, drained by scripts/worker.ts. Server-only.
import { getDb, nowIso } from "./db";

export type Job = {
  id: string;
  user_id: string;
  commitment_id: string | null;
  ref: string | null; // e.g. the JSON conversation a summarize job is for
  job_type: string;
  due_at: string;
  attempts: number;
  idempotency_key: string;
};

const MAX_ATTEMPTS = 3;
const STALE_CLAIM_MS = 5 * 60_000;

// Atomically take the oldest due job so two ticks can never run the same one.
export function claimDueJob(): Job | undefined {
  const db = getDb();
  return db.transaction(() => {
    const job = db
      .prepare(
        `SELECT id, user_id, commitment_id, ref, job_type, due_at, attempts, idempotency_key
         FROM jobs WHERE status = 'pending' AND due_at <= ? ORDER BY due_at LIMIT 1`
      )
      .get(nowIso()) as Job | undefined;
    if (!job) return undefined;
    db.prepare("UPDATE jobs SET status = 'claimed', claimed_at = ?, attempts = attempts + 1 WHERE id = ?")
      .run(nowIso(), job.id);
    return { ...job, attempts: job.attempts + 1 };
  })();
}

export function finishJob(id: string, providerMessageId?: string) {
  getDb()
    .prepare("UPDATE jobs SET status = 'done', provider_message_id = ?, last_error = NULL WHERE id = ?")
    .run(providerMessageId ?? null, id);
}

export function cancelJob(id: string, reason: string) {
  getDb().prepare("UPDATE jobs SET status = 'cancelled', last_error = ? WHERE id = ?").run(reason, id);
}

// Retry with backoff, keeping the same idempotency key; give up after MAX_ATTEMPTS.
export function failJob(job: Job, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const retry = job.attempts < MAX_ATTEMPTS;
  getDb()
    .prepare("UPDATE jobs SET status = ?, due_at = ?, last_error = ? WHERE id = ?")
    .run(
      retry ? "pending" : "failed",
      retry ? new Date(Date.now() + 30_000 * job.attempts).toISOString() : job.due_at,
      message.slice(0, 500),
      job.id
    );
  return retry;
}

// Jobs left 'claimed' by a crashed worker go back to the queue.
export function releaseStaleClaims() {
  return getDb()
    .prepare("UPDATE jobs SET status = 'pending' WHERE status = 'claimed' AND claimed_at < ?")
    .run(new Date(Date.now() - STALE_CLAIM_MS).toISOString()).changes;
}
