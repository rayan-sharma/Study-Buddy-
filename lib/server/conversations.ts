// Study conversations: FaceTime call transcripts now, iMessage and web chat threads later. Server-only.
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { DEMO_USER_ID, getDb, nowIso } from "./db";

export const callIngest = z.object({
  call_id: z.string().trim().min(1).max(200),
  room: z.string().max(200).optional(),
  started_at: z.iso.datetime({ offset: true }),
  ended_at: z.iso.datetime({ offset: true }).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(10_000),
        at: z.iso.datetime({ offset: true }).optional(),
      })
    )
    .max(2_000),
});

// Same shape as SessionSummarySchema in app/components/library/ai/client.ts, plus title and follow-ups.
export const callSummary = z.object({
  title: z.string(),
  summary: z.string(),
  topicsCovered: z.array(z.string()),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  followUps: z.array(z.string()),
  engagementScore: z.number().min(0).max(1),
  comprehensionScore: z.number().min(0).max(1),
});
export type CallSummary = z.infer<typeof callSummary>;

export type ConversationRow = {
  id: string;
  source: "facetime" | "imessage" | "web";
  started_at: string;
  ended_at: string | null;
  title: string | null;
  summary_status: "none" | "pending" | "done" | "failed" | "empty";
  message_count: number;
};

export type Message = { seq: number; role: "user" | "assistant"; text: string; created_at: string };

// Idempotent: posting the same call again replaces its transcript and only re-summarizes if it changed.
export function ingestCall(input: z.infer<typeof callIngest>, userId = DEMO_USER_ID) {
  const db = getDb();
  const externalId = `facetime:${input.call_id}`;
  const messages = input.messages.filter((m) => m.text.trim());

  return db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT c.id, (SELECT COUNT(*) FROM conversation_messages m WHERE m.conversation_id = c.id) AS n
         FROM conversations c WHERE c.external_id = ?`
      )
      .get(externalId) as { id: string; n: number } | undefined;

    if (existing && existing.n === messages.length) {
      return { conversationId: existing.id, created: false, changed: false };
    }

    const id = existing?.id ?? randomUUID();
    const status = messages.length ? "pending" : "empty";
    if (existing) {
      db.prepare("UPDATE conversations SET ended_at = ?, summary_status = ? WHERE id = ?")
        .run(input.ended_at ?? null, status, id);
      db.prepare("DELETE FROM conversation_messages WHERE conversation_id = ?").run(id);
    } else {
      db.prepare(
        `INSERT INTO conversations (id, user_id, source, external_id, started_at, ended_at, summary_status)
         VALUES (?, ?, 'facetime', ?, ?, ?, ?)`
      ).run(id, userId, externalId, input.started_at, input.ended_at ?? null, status);
    }

    const insert = db.prepare(
      `INSERT INTO conversation_messages (conversation_id, seq, role, text, created_at) VALUES (?, ?, ?, ?, ?)`
    );
    messages.forEach((m, seq) => insert.run(id, seq, m.role, m.text.trim(), m.at ?? input.started_at));

    if (messages.length) {
      db.prepare(
        `INSERT OR IGNORE INTO jobs (id, user_id, conversation_id, job_type, due_at, idempotency_key, created_at)
         VALUES (?, ?, ?, 'summarize', ?, ?, ?)`
      ).run(randomUUID(), userId, id, nowIso(), `summarize:${id}:${messages.length}`, nowIso());
    }
    return { conversationId: id, created: !existing, changed: true };
  })();
}

export function listConversations(userId = DEMO_USER_ID): ConversationRow[] {
  return getDb()
    .prepare(
      `SELECT c.id, c.source, c.started_at, c.ended_at, c.title, c.summary_status,
              (SELECT COUNT(*) FROM conversation_messages m WHERE m.conversation_id = c.id) AS message_count
       FROM conversations c WHERE c.user_id = ? ORDER BY c.started_at DESC`
    )
    .all(userId) as ConversationRow[];
}

export function getConversation(id: string, userId = DEMO_USER_ID) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, source, started_at, ended_at, title, summary_status, summary_json
       FROM conversations WHERE id = ? AND user_id = ?`
    )
    .get(id, userId) as (Omit<ConversationRow, "message_count"> & { summary_json: string | null }) | undefined;
  if (!row) return undefined;
  const messages = db
    .prepare("SELECT seq, role, text, created_at FROM conversation_messages WHERE conversation_id = ? ORDER BY seq")
    .all(id) as Message[];
  const { summary_json, ...rest } = row;
  return { ...rest, summary: summary_json ? (JSON.parse(summary_json) as CallSummary) : null, messages };
}

export function saveSummary(id: string, summary: CallSummary) {
  getDb()
    .prepare("UPDATE conversations SET title = ?, summary_json = ?, summary_status = 'done' WHERE id = ?")
    .run(summary.title, JSON.stringify(summary), id);
}

export function markSummaryFailed(id: string) {
  getDb().prepare("UPDATE conversations SET summary_status = 'failed' WHERE id = ?").run(id);
}
