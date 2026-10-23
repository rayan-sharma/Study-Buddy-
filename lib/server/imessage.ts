// Study Buddy over iMessage through Chert: reminders out, replies in. Used by the worker. Server-only.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { callLinkText, chertConfigured, listMessages, sameNumber, sendText } from "./chert";
import { appendToThread, getConversation, threadIdFor } from "./conversations";
import { DEMO_USER_ID, getDb } from "./db";
import { env } from "./env";
import { answerFollowUp } from "./followup";

type State = { primed: boolean; seen: string[]; sentAt: number[] };

const stateFile = () => resolve(/*turbopackIgnore: true*/ process.env.CHERT_STATE_PATH || "data/chert-state.json");

function loadState(): State {
  try {
    return JSON.parse(readFileSync(stateFile(), "utf8")) as State;
  } catch {
    return { primed: false, seen: [], sentAt: [] };
  }
}

function saveState(state: State) {
  state.seen = state.seen.slice(-1000);
  state.sentAt = state.sentAt.filter((t) => t > Date.now() - 3_600_000);
  mkdirSync(dirname(stateFile()), { recursive: true });
  writeFileSync(`${stateFile()}.tmp`, JSON.stringify(state));
  renameSync(`${stateFile()}.tmp`, stateFile());
}

// Chert allows 10 texts/hour on trial (100 for the hackathon); stay under it.
const maxPerHour = () => Number(env("CHERT_MAX_PER_HOUR") ?? 10);

export type TextResult = { ok: true; id: string | null } | { ok: false; reason: string };

// Sends to the verified phone (DEMO_USER_PHONE) and records it in the iMessage conversation.
export async function textStudent(text: string, idempotencyKey?: string): Promise<TextResult> {
  const phone = env("DEMO_USER_PHONE");
  if (!chertConfigured()) return { ok: false, reason: "CHERT_API_KEY not set" };
  if (!phone) return { ok: false, reason: "DEMO_USER_PHONE not set" };
  const state = loadState();
  if (state.sentAt.filter((t) => t > Date.now() - 3_600_000).length >= maxPerHour()) {
    return { ok: false, reason: `hourly limit of ${maxPerHour()} texts reached` };
  }
  const sent = await sendText(phone, text, idempotencyKey);
  state.sentAt.push(Date.now());
  if (sent.id) state.seen.push(sent.id);
  saveState(state);
  appendToThread(phone, { role: "assistant", text, at: new Date().toISOString() });
  return { ok: true, id: sent.id };
}

function setNudgesPaused(paused: boolean) {
  getDb().prepare("UPDATE users SET nudges_paused = ? WHERE id = ?").run(paused ? 1 : 0, DEMO_USER_ID);
}

async function replyTo(text: string, phone: string): Promise<string> {
  if (/^\s*(call|start)\b/i.test(text)) return callLinkText();
  if (/^\s*(stop|pause)\b/i.test(text)) {
    setNudgesPaused(true);
    return "Okay, study reminders are paused. Text RESUME to turn them back on.";
  }
  if (/^\s*resume\b/i.test(text)) {
    setNudgesPaused(false);
    return "Reminders are back on. See you at your next session!";
  }
  const thread = getConversation(threadIdFor(phone))?.messages ?? [];
  return answerFollowUp(text, thread.slice(0, -1));
}

// Reads new texts from the verified phone, saves them and answers each one.
export async function pollReplies() {
  const phone = env("DEMO_USER_PHONE");
  if (!chertConfigured() || !phone) return { handled: 0 };
  const messages = await listMessages();
  const state = loadState();

  // First run: everything already there is history, not something to answer.
  if (!state.primed) {
    saveState({ ...state, primed: true, seen: [...state.seen, ...messages.map((m) => m.id)] });
    return { handled: 0 };
  }

  let handled = 0;
  for (const m of messages.sort((a, b) => a.at.localeCompare(b.at))) {
    if (state.seen.includes(m.id)) continue;
    state.seen.push(m.id);
    saveState(state);
    const fromStudent = m.direction !== "outbound" && (m.handle === null || sameNumber(m.handle, phone));
    if (!fromStudent || !m.text.trim()) continue;

    appendToThread(phone, { role: "user", text: m.text.trim(), at: m.at });
    const reply = await replyTo(m.text, phone);
    const result = await textStudent(reply, `reply:${m.id}`);
    if (!result.ok) console.warn(`[imessage] reply not sent: ${result.reason}`);
    handled++;
  }
  return { handled };
}
