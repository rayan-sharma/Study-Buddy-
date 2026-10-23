// Tasks and notes shown on /Dashboard. Server-only.
import { z } from "zod";
import { DEMO_USER_ID, getDb, nowIso } from "./db";

export type Task = {
  id: number;
  title: string;
  subject: string;
  due_at: string | null;
  pri: "high" | "med" | "low";
  status: "todo" | "doing" | "done";
};

export type Note = {
  id: number;
  title: string;
  subject: string;
  body: string;
  conversation_id: string | null;
  updated_at: string;
};

const TASK_COLS = "id, title, subject, due_at, pri, status";
const NOTE_COLS = "id, title, subject, body, conversation_id, updated_at";

export const taskCreate = z.object({
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(60),
  due_at: z.iso.datetime({ offset: true }).nullable().optional(),
  pri: z.enum(["high", "med", "low"]).default("med"),
  status: z.enum(["todo", "doing", "done"]).default("todo"),
});
export const taskPatch = z.object({
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(60),
  due_at: z.iso.datetime({ offset: true }).nullable(),
  pri: z.enum(["high", "med", "low"]),
  status: z.enum(["todo", "doing", "done"]),
}).partial();

export const noteCreate = z.object({
  title: z.string().trim().min(1).max(200).default("Untitled note"),
  subject: z.string().trim().min(1).max(60).default("Math"),
  body: z.string().max(20_000).default(""),
});
export const notePatch = z.object({
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(60),
  body: z.string().max(20_000),
}).partial();

export function listTasks(userId = DEMO_USER_ID): Task[] {
  return getDb()
    .prepare(`SELECT ${TASK_COLS} FROM tasks WHERE user_id = ? ORDER BY created_at DESC, id DESC`)
    .all(userId) as Task[];
}

export function createTask(input: z.infer<typeof taskCreate>, userId = DEMO_USER_ID): Task {
  const now = nowIso();
  return getDb()
    .prepare(
      `INSERT INTO tasks (user_id, title, subject, due_at, pri, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING ${TASK_COLS}`
    )
    .get(userId, input.title, input.subject, input.due_at ?? null, input.pri, input.status, now, now) as Task;
}

// Column names come from the zod schema keys, never from raw request input.
function setClause(patch: Record<string, unknown>) {
  const fields = Object.entries(patch).filter(([, v]) => v !== undefined);
  return { sets: fields.map(([k]) => `${k} = ?, `).join(""), values: fields.map(([, v]) => v) };
}

export function updateTask(id: number, patch: z.infer<typeof taskPatch>, userId = DEMO_USER_ID): Task | undefined {
  const { sets, values } = setClause(patch);
  return getDb()
    .prepare(`UPDATE tasks SET ${sets}updated_at = ? WHERE id = ? AND user_id = ? RETURNING ${TASK_COLS}`)
    .get(...values, nowIso(), id, userId) as Task | undefined;
}

export function deleteTask(id: number, userId = DEMO_USER_ID): boolean {
  return getDb().prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(id, userId).changes > 0;
}

export function listNotes(userId = DEMO_USER_ID): Note[] {
  return getDb()
    .prepare(`SELECT ${NOTE_COLS} FROM notes WHERE user_id = ? ORDER BY updated_at DESC, id DESC`)
    .all(userId) as Note[];
}

export function createNote(
  input: z.infer<typeof noteCreate> & { conversation_id?: string | null },
  userId = DEMO_USER_ID
): Note {
  const now = nowIso();
  return getDb()
    .prepare(
      `INSERT INTO notes (user_id, title, subject, body, conversation_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING ${NOTE_COLS}`
    )
    .get(userId, input.title, input.subject, input.body, input.conversation_id ?? null, now, now) as Note;
}

export function updateNote(id: number, patch: z.infer<typeof notePatch>, userId = DEMO_USER_ID): Note | undefined {
  const { sets, values } = setClause(patch);
  return getDb()
    .prepare(`UPDATE notes SET ${sets}updated_at = ? WHERE id = ? AND user_id = ? RETURNING ${NOTE_COLS}`)
    .get(...values, nowIso(), id, userId) as Note | undefined;
}

export function deleteNote(id: number, userId = DEMO_USER_ID): boolean {
  return getDb().prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(id, userId).changes > 0;
}
