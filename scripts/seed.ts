// Loads the Dashboard's original demo tasks and notes into SQLite.
// Usage: npm run seed            (only if the demo user has no tasks yet)
//        npm run seed -- --reset (wipe the demo user's tasks and notes first)
import { DEMO_USER_ID, getDb, nowIso } from "../lib/server/db";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "Today" | "Tomorrow" | "Fri" ... -> end of that local day, as UTC ISO.
function dueAt(label: string): string {
  const d = new Date();
  if (label === "Tomorrow") d.setDate(d.getDate() + 1);
  const weekday = WEEKDAYS.indexOf(label);
  if (weekday >= 0) d.setDate(d.getDate() + (((weekday - d.getDay()) + 7) % 7 || 7));
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

const tasks = [
  { title: "Finish linear functions worksheet", subject: "Math", due: "Today", pri: "high", status: "doing" },
  { title: "Read chapter 6: Newton's laws", subject: "Physics", due: "Tomorrow", pri: "med", status: "todo" },
  { title: "Outline essay on the Industrial Revolution", subject: "History", due: "Fri", pri: "med", status: "todo" },
  { title: "Practice quadratic equations (20 problems)", subject: "Math", due: "Sat", pri: "low", status: "todo" },
  { title: "Draft lab report introduction", subject: "Physics", due: "Today", pri: "high", status: "doing" },
  { title: "Vocabulary quiz review", subject: "English", due: "Mon", pri: "low", status: "done" },
];

const notes = [
  {
    title: "Slope intuition",
    subject: "Math",
    body: "Slope (m) = rise / run.\n\nPositive m: line goes up to the right.\nNegative m: line goes down.\nThe intercept (b) is where the line crosses the y-axis.",
  },
  {
    title: "Newton's three laws",
    subject: "Physics",
    body: "1. Inertia: objects keep their motion unless a force acts.\n2. F = ma.\n3. Every action has an equal and opposite reaction.",
  },
];

const db = getDb();
const reset = process.argv.includes("--reset");

const seed = db.transaction(() => {
  if (reset) {
    db.prepare("DELETE FROM tasks WHERE user_id = ?").run(DEMO_USER_ID);
    db.prepare("DELETE FROM notes WHERE user_id = ? AND conversation_id IS NULL").run(DEMO_USER_ID);
  }
  const existing = db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE user_id = ?").get(DEMO_USER_ID) as { n: number };
  if (existing.n > 0) return false;

  const now = nowIso();
  const insertTask = db.prepare(
    `INSERT INTO tasks (user_id, title, subject, due_at, pri, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const t of tasks) insertTask.run(DEMO_USER_ID, t.title, t.subject, dueAt(t.due), t.pri, t.status, now, now);

  const insertNote = db.prepare(
    `INSERT INTO notes (user_id, title, subject, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
  );
  // Oldest first so "Slope intuition" stays the most recent, as in the original UI.
  const yesterday = new Date(Date.now() - 86_400_000).toISOString();
  insertNote.run(DEMO_USER_ID, notes[1].title, notes[1].subject, notes[1].body, yesterday, yesterday);
  insertNote.run(DEMO_USER_ID, notes[0].title, notes[0].subject, notes[0].body, now, now);
  return true;
});

console.log(seed() ? "Seeded demo tasks and notes." : "Demo user already has tasks; nothing to do (use --reset).");
