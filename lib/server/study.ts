// Scheduled study sessions ("commitments") and the focus sessions they turn into. Server-only.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { DEMO_USER_ID, getDb, nowIso } from "./db";

export type Commitment = {
  id: string;
  task_id: number | null;
  topic: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "notified" | "started" | "completed" | "cancelled";
};

export type Session = {
  id: string;
  commitment_id: string | null;
  topic: string;
  started_at: string;
  planned_minutes: number;
  status: "running" | "completed" | "abandoned";
};

const COMMITMENT_COLS = "id, task_id, topic, scheduled_at, duration_minutes, status";
const SESSION_COLS = "id, commitment_id, topic, started_at, planned_minutes, status";
const isOpen = (c: Commitment) => c.status === "scheduled" || c.status === "notified";

export const scheduleInput = z.object({
  topic: z.string().trim().min(1).max(200),
  task_id: z.number().int().positive().nullable().optional(),
  start_at: z.iso.datetime({ offset: true }),
  duration_minutes: z.number().int().min(5).max(180).default(25),
});

export const commitmentAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("snooze"), minutes: z.number().int().min(1).max(240).default(10) }),
  z.object({ action: z.literal("cancel") }),
]);

export class StudyError extends Error {}

const reminderKey = (commitmentId: string) => `reminder:${commitmentId}`;

export function scheduleStudy(input: z.infer<typeof scheduleInput>, userId = DEMO_USER_ID): Commitment {
  const startAt = new Date(input.start_at);
  // Allow a minute of clock skew; anything earlier is a mistake.
  if (startAt.getTime() < Date.now() - 60_000) throw new StudyError("start time is in the past");

  const db = getDb();
  const id = randomUUID();
  const scheduledAt = startAt.toISOString(); // normalized UTC so string comparison orders correctly
  return db.transaction(() => {
    db.prepare(
      `INSERT INTO commitments (id, user_id, task_id, topic, scheduled_at, duration_minutes, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?)`
    ).run(id, userId, input.task_id ?? null, input.topic, scheduledAt, input.duration_minutes, nowIso());
    db.prepare(
      `INSERT INTO jobs (id, user_id, commitment_id, job_type, due_at, idempotency_key, created_at)
       VALUES (?, ?, ?, 'study_reminder', ?, ?, ?)`
    ).run(randomUUID(), userId, id, scheduledAt, reminderKey(id), nowIso());
    return getCommitment(id, userId)!;
  })();
}

export function getCommitment(id: string, userId = DEMO_USER_ID): Commitment | undefined {
  return getDb()
    .prepare(`SELECT ${COMMITMENT_COLS} FROM commitments WHERE id = ? AND user_id = ?`)
    .get(id, userId) as Commitment | undefined;
}

// The session to show on the Dashboard: the earliest one not yet started or cancelled.
// Sessions more than two hours overdue are stale and no longer shown.
export function nextCommitment(userId = DEMO_USER_ID): Commitment | undefined {
  return getDb()
    .prepare(
      `SELECT ${COMMITMENT_COLS} FROM commitments
       WHERE user_id = ? AND status IN ('scheduled','notified') AND scheduled_at >= ?
       ORDER BY scheduled_at LIMIT 1`
    )
    .get(userId, new Date(Date.now() - 2 * 3_600_000).toISOString()) as Commitment | undefined;
}

export function snoozeCommitment(id: string, minutes: number, userId = DEMO_USER_ID) {
  const db = getDb();
  return db.transaction(() => {
    const c = getCommitment(id, userId);
    if (!c || !isOpen(c)) return c;
    const at = new Date(Date.now() + minutes * 60_000).toISOString();
    db.prepare("UPDATE commitments SET scheduled_at = ?, status = 'scheduled' WHERE id = ?").run(at, id);
    // Re-arm the same reminder job (same idempotency key) rather than adding another.
    db.prepare(
      `UPDATE jobs SET status = 'pending', due_at = ?, attempts = 0, last_error = NULL
       WHERE idempotency_key = ?`
    ).run(at, reminderKey(id));
    return getCommitment(id, userId);
  })();
}

export function cancelCommitment(id: string, userId = DEMO_USER_ID) {
  const db = getDb();
  return db.transaction(() => {
    const c = getCommitment(id, userId);
    if (!c || !isOpen(c)) return c;
    db.prepare("UPDATE commitments SET status = 'cancelled' WHERE id = ?").run(id);
    db.prepare("UPDATE jobs SET status = 'cancelled' WHERE idempotency_key = ? AND status = 'pending'")
      .run(reminderKey(id));
    return getCommitment(id, userId);
  })();
}

// Idempotent: starting the same commitment twice returns the running session.
export function startSession(commitmentId: string, userId = DEMO_USER_ID): Session | undefined {
  const db = getDb();
  return db.transaction(() => {
    const c = getCommitment(commitmentId, userId);
    if (!c || c.status === "cancelled") return undefined;
    const running = db
      .prepare(`SELECT ${SESSION_COLS} FROM sessions WHERE commitment_id = ? AND status = 'running'`)
      .get(commitmentId) as Session | undefined;
    if (running) return running;

    const id = randomUUID();
    db.prepare(
      `INSERT INTO sessions (id, user_id, commitment_id, topic, started_at, planned_minutes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'running')`
    ).run(id, userId, commitmentId, c.topic, nowIso(), c.duration_minutes);
    db.prepare("UPDATE commitments SET status = 'started' WHERE id = ?").run(commitmentId);
    db.prepare("UPDATE jobs SET status = 'cancelled' WHERE idempotency_key = ? AND status = 'pending'")
      .run(reminderKey(commitmentId));
    return db.prepare(`SELECT ${SESSION_COLS} FROM sessions WHERE id = ?`).get(id) as Session;
  })();
}

export function activeSession(userId = DEMO_USER_ID): Session | undefined {
  return getDb()
    .prepare(
      `SELECT ${SESSION_COLS} FROM sessions WHERE user_id = ? AND status = 'running'
       ORDER BY started_at DESC LIMIT 1`
    )
    .get(userId) as Session | undefined;
}
