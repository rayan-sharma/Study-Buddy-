// SQLite access for route handlers and the worker. Server-only: never import from a client component.
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Student',
  phone TEXT UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  messaging_opt_in INTEGER NOT NULL DEFAULT 0,
  recap_opt_in INTEGER NOT NULL DEFAULT 1,
  nudges_paused INTEGER NOT NULL DEFAULT 0,
  tone TEXT NOT NULL DEFAULT 'supportive',
  quiet_start TEXT NOT NULL DEFAULT '22:00',
  quiet_end TEXT NOT NULL DEFAULT '08:00',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  due_at TEXT,
  pri TEXT NOT NULL DEFAULT 'med' CHECK (pri IN ('high','med','low')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  source TEXT NOT NULL CHECK (source IN ('facetime','imessage','web')),
  external_id TEXT UNIQUE,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  title TEXT,
  summary_json TEXT,
  summary_status TEXT NOT NULL DEFAULT 'none'
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (conversation_id, seq)
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  conversation_id TEXT REFERENCES conversations(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  commitment_id TEXT REFERENCES commitments(id),
  topic TEXT NOT NULL,
  started_at TEXT NOT NULL,
  planned_minutes INTEGER NOT NULL,
  ended_at TEXT,
  actual_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'running',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  commitment_id TEXT REFERENCES commitments(id),
  conversation_id TEXT REFERENCES conversations(id),
  job_type TEXT NOT NULL,
  due_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT UNIQUE NOT NULL,
  provider_message_id TEXT,
  last_error TEXT,
  claimed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  received_at TEXT NOT NULL,
  processed_at TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  error TEXT
);

CREATE TABLE IF NOT EXISTS chert_chats (
  chat_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  handle TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mock_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  target TEXT NOT NULL,
  body TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_due ON jobs(status, due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_by_user ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notes_by_user ON notes(user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_commitments_by_user ON commitments(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_by_user ON sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_conversations_by_user ON conversations(user_id, started_at);
`;

// Single-user prototype: every request acts as this user. Real accounts would replace this.
export const DEMO_USER_ID = "demo-user";

export const nowIso = () => new Date().toISOString();

// Reuse one connection across Next.js hot reloads in development.
const globalForDb = globalThis as unknown as { studyBuddyDb?: Database.Database };

export function getDb(): Database.Database {
  if (globalForDb.studyBuddyDb) return globalForDb.studyBuddyDb;
  // The path comes from env at runtime; tell the bundler not to trace the whole project for it.
  const file = resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH || "data/studybuddy.db");
  mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.exec(SCHEMA);
  ensureDemoUser(db);
  globalForDb.studyBuddyDb = db;
  return db;
}

function ensureDemoUser(db: Database.Database) {
  db.prepare(
    `INSERT OR IGNORE INTO users (id, name, phone, timezone, created_at)
     VALUES (?, 'Student', ?, ?, ?)`
  ).run(
    DEMO_USER_ID,
    process.env.DEMO_USER_PHONE || null,
    process.env.DEMO_TIMEZONE || "America/Chicago",
    nowIso()
  );
}
