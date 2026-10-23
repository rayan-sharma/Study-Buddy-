// Study conversations (FaceTime call transcripts, iMessage threads), one JSON file each in data/conversations.
// Server-only. Summaries are produced by the worker (job "summarize", ref = conversation id).
import { randomUUID } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
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

export type Message = { role: "user" | "assistant"; text: string; at: string };

export type Conversation = {
  id: string;
  source: "facetime" | "imessage" | "web";
  started_at: string;
  ended_at: string | null;
  title: string | null;
  summary_status: "none" | "pending" | "done" | "failed" | "empty";
  summary: CallSummary | null;
  messages: Message[];
};

export type ConversationListItem = Omit<Conversation, "messages" | "summary"> & {
  message_count: number;
  preview: string | null;
};

const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,120}$/;

const dir = () => resolve(/*turbopackIgnore: true*/ process.env.CONVERSATIONS_DIR || "data/conversations");

// Ids double as file names, so only ever build them from a fixed prefix and sanitized parts.
const conversationId = (source: string, key: string) =>
  `${source}-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100)}`;

export function getConversation(id: string): Conversation | undefined {
  if (!SAFE_ID.test(id)) return undefined;
  try {
    return JSON.parse(readFileSync(join(dir(), `${id}.json`), "utf8")) as Conversation;
  } catch {
    return undefined;
  }
}

// Write to a temp file and rename, so readers never see a half-written conversation.
function save(conversation: Conversation) {
  mkdirSync(dir(), { recursive: true });
  const file = join(dir(), `${conversation.id}.json`);
  const tmp = `${file}.${randomUUID()}.tmp`;
  writeFileSync(tmp, JSON.stringify(conversation, null, 2));
  renameSync(tmp, file);
}

export function listConversations(): ConversationListItem[] {
  let files: string[];
  try {
    files = readdirSync(dir()).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files
    .map((f) => getConversation(f.slice(0, -5)))
    .filter((c): c is Conversation => !!c)
    .map(({ messages, summary, ...rest }) => ({
      ...rest,
      message_count: messages.length,
      preview: summary?.summary ?? messages.at(-1)?.text ?? null,
    }))
    .sort((a, b) => b.started_at.localeCompare(a.started_at));
}

function queueSummary(id: string, messageCount: number, userId: string) {
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO jobs (id, user_id, ref, job_type, due_at, idempotency_key, created_at)
       VALUES (?, ?, ?, 'summarize', ?, ?, ?)`
    )
    .run(randomUUID(), userId, id, nowIso(), `summarize:${id}:${messageCount}`, nowIso());
}

// Idempotent: posting the same call again replaces its transcript and only re-summarizes if it changed.
export function ingestCall(input: z.infer<typeof callIngest>, userId = DEMO_USER_ID) {
  const id = conversationId("facetime", input.call_id);
  const existing = getConversation(id);
  const messages: Message[] = input.messages
    .filter((m) => m.text.trim())
    .map((m) => ({ role: m.role, text: m.text.trim(), at: m.at ?? input.started_at }));

  if (existing && existing.messages.length === messages.length) {
    return { conversationId: id, created: false, changed: false };
  }
  save({
    id,
    source: "facetime",
    started_at: existing?.started_at ?? input.started_at,
    ended_at: input.ended_at ?? null,
    title: existing?.title ?? null,
    summary_status: messages.length ? "pending" : "empty",
    summary: existing?.summary ?? null,
    messages,
  });
  if (messages.length) queueSummary(id, messages.length, userId);
  return { conversationId: id, created: !existing, changed: true };
}

export const threadIdFor = (phone: string) => conversationId("imessage", phone);

// One running iMessage thread per phone number.
export function appendToThread(phone: string, message: Message): Conversation {
  const id = threadIdFor(phone);
  const conversation = getConversation(id) ?? {
    id,
    source: "imessage" as const,
    started_at: message.at,
    ended_at: null,
    title: "iMessage",
    summary_status: "none" as const,
    summary: null,
    messages: [],
  };
  conversation.messages.push(message);
  conversation.ended_at = message.at;
  save(conversation);
  return conversation;
}

export function saveSummary(id: string, summary: CallSummary) {
  const conversation = getConversation(id);
  if (!conversation) return;
  save({ ...conversation, title: summary.title, summary, summary_status: "done" });
}

export function markSummaryFailed(id: string) {
  const conversation = getConversation(id);
  if (conversation) save({ ...conversation, summary_status: "failed" });
}
