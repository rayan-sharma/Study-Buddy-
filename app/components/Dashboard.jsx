
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import D2LCanvas from "./D2LCanvas";
import {
  BookOpen,
  MessageCircle,
  CheckSquare,
  ListChecks,
  PenSquare,
  Settings,
  Plus,
  Circle,
  Clock,
  CheckCircle2,
  StickyNote,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Search,
  ChevronDown,
  CalendarDays,
} from "lucide-react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.db {
  --ink: #0b1220;
  --muted: #6b7280;
  --accent: #6c7cf5;
  --line: #e8eaf0;
  --soft: #f6f7f9;
  --tint: #e9edfd;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
  background: #fafafb;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  -webkit-font-smoothing: antialiased;
}

.db * { box-sizing: border-box; }
.db button { font-family: inherit; cursor: pointer; }
.db :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.db .side {
  background: var(--soft);
  border-right: 1px solid var(--line);
  padding: 24px 14px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.db .brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 17px;
  padding: 0 10px 28px;
}

.db .brand svg { color: var(--accent); }

.db .nav {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #4b5563;
  padding: 11px 12px;
  border-radius: 10px;
  margin-bottom: 4px;
  border: 0;
  background: none;
  width: 100%;
  text-align: left;
}

.db .nav.on {
  background: var(--tint);
  color: var(--ink);
  font-weight: 500;
}

.db .nav.on svg { color: var(--accent); }

.db .me {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
}

.db .me small {
  display: block;
  font-weight: 400;
  color: #9ca3af;
  font-size: 11px;
}

.db .av {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0b27a, #8a5a3c);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 600;
  flex: none;
}

.db .page {
  padding: 28px 40px 48px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 28px;
  align-content: start;
}

.db .head {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.db h1 {
  margin: 0 0 4px;
  font-size: 28px;
  letter-spacing: -.02em;
  font-weight: 700;
}

.db .sub { margin: 0; color: var(--muted); font-size: 14px; }

.db .search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0 12px;
  height: 40px;
  color: #9ca3af;
  min-width: 240px;
}

.db .search input {
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 14px;
  flex: 1;
  background: none;
  color: var(--ink);
  min-width: 0;
}

.db .panel {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
}

.db .tabs {
  display: flex;
  gap: 4px;
  padding: 0 20px;
  border-bottom: 1px solid var(--line);
  overflow-x: auto;
}

.db .tab {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: none;
  padding: 16px 12px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
}

.db .tab[aria-selected="true"] {
  color: var(--ink);
  border-color: var(--accent);
}

.db .tab[aria-selected="true"] svg { color: var(--accent); }

.db .count {
  font-size: 11px;
  background: var(--soft);
  color: #4b5563;
  border-radius: 20px;
  padding: 2px 8px;
  font-weight: 600;
}

.db .tab[aria-selected="true"] .count {
  background: var(--tint);
  color: #4252d6;
}

.db .body { padding: 20px; }

.db .add {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.db .add input,
.db .add select {
  height: 42px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0 12px;
  font: inherit;
  font-size: 14px;
  background: #fff;
  color: var(--ink);
}

.db .add input { flex: 1; min-width: 180px; }

.db .primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--ink);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 0 16px;
  height: 42px;
  font-size: 14px;
  font-weight: 500;
}

.db .list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.db .task {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px 16px;
}

.db .task:hover { border-color: #d3d8f5; }
.db .t-main { flex: 1; min-width: 0; }

.db .t-title {
  font-size: 14.5px;
  font-weight: 500;
  margin: 0 0 6px;
}

.db .done .t-title {
  text-decoration: line-through;
  color: #9ca3af;
}

.db .meta {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
  flex-wrap: wrap;
}

.db .chip {
  background: var(--tint);
  color: #4252d6;
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 500;
}

.db .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
}

.db .acts { display: flex; gap: 6px; }

.db .ib {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: #fff;
  display: grid;
  place-items: center;
  color: #4b5563;
}

.db .ib:hover { background: var(--soft); }

.db .ib.go {
  background: var(--tint);
  border-color: var(--tint);
  color: #4252d6;
}

.db .empty {
  text-align: center;
  color: var(--muted);
  font-size: 14px;
  padding: 44px 0;
}

.db .notes {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 16px;
  min-height: 380px;
}

.db .nlist { display: flex; flex-direction: column; gap: 8px; }

.db .nitem {
  text-align: left;
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
}

.db .nitem[aria-current="true"] {
  background: var(--tint);
  border-color: var(--tint);
}

.db .nitem b {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.db .nitem span { font-size: 12px; color: var(--muted); }

.db .editor {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.db .editor input {
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -.01em;
  width: 100%;
}

.db .editor textarea {
  flex: 1;
  border: 0;
  outline: 0;
  resize: none;
  font: inherit;
  font-size: 14.5px;
  line-height: 1.7;
  color: #374151;
  min-height: 260px;
}

.db .editor .bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
}

.db .rail { display: flex; flex-direction: column; gap: 20px; }

.db .card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 20px;
}

.db .card h2 { margin: 0 0 14px; font-size: 14px; font-weight: 600; }

.db .ring { display: flex; align-items: center; gap: 18px; }
.db .ring p { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.5; }

.db .ring strong {
  display: block;
  font-size: 22px;
  color: var(--ink);
  letter-spacing: -.02em;
}

.db .up {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid var(--line);
  font-size: 13px;
}

.db .up:first-of-type { border-top: 0; }
.db .up svg { color: var(--accent); flex: none; }

.db .up small {
  display: block;
  color: var(--muted);
  font-size: 12px;
  margin-top: 2px;
}

@media (max-width: 1180px) {
  .db .page { grid-template-columns: 1fr; }
  .db .rail { flex-direction: row; flex-wrap: wrap; }
  .db .rail .card { flex: 1; min-width: 260px; }
}

@media (max-width: 820px) {
  .db { grid-template-columns: 1fr; }
  .db .side { display: none; }
  .db .page { padding: 20px 16px 40px; }
  .db .notes { grid-template-columns: 1fr; }
}
`;

const SUBJECTS = [
  "Math", "Physics", "History", "English", "Chemistry",
  "Biology", "Computer Science", "Art", "Music", "Economics", "Other",
];

const PRI = {
  high: "#ef6b6b",
  med: "#f2b24c",
  low: "#5cc08f",
};

// Tasks and notes live in SQLite behind /api (seed them with `npm run seed`).
const DAY = 86_400_000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// due_at (ISO) -> the short labels the cards show.
function dueLabel(iso) {
  if (!iso) return "This week";
  const d = new Date(iso);
  const days = Math.round((startOfDay(d) - startOfDay(new Date())) / DAY);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function agoLabel(iso) {
  const d = new Date(iso);
  if (Date.now() - d.getTime() < 60_000) return "Just now";
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / DAY);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const toTask = (t) => ({ ...t, due: dueLabel(t.due_at) });
const toNote = (n) => ({ ...n, at: agoLabel(n.updated_at) });

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

const order = ["todo", "doing", "done"];

const TABS = [
  { id: "todo", label: "To do", Icon: Circle },
  { id: "doing", label: "In progress", Icon: Clock },
  { id: "done", label: "Done", Icon: CheckCircle2 },
  { id: "notes", label: "Notes", Icon: StickyNote },
];

const NAV = [
  [MessageCircle, "Chat"],
  [CheckSquare, "Tasks"],
  [ListChecks, "Subjects"],
  [PenSquare, "D2L"],
  [Settings, "Settings"],
];

export default function StudyBuddyDashboard() {
  const [activeNav, setActiveNav] = useState("Tasks");
  const [mathWorkspaceOpen, setMathWorkspaceOpen] = useState(false);
  const [tab, setTab] = useState("todo");
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [sel, setSel] = useState(null);
  // Note being typed into: polling must not overwrite its unsaved text.
  const dirtyNote = useRef(null);
  const saveTimer = useRef(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Math");
  const [q, setQ] = useState("");

  const count = (status) => tasks.filter((t) => t.status === status).length;

  const counts = {
    todo: count("todo"),
    doing: count("doing"),
    done: count("done"),
    notes: notes.length,
  };

  const pct = Math.round((counts.done / Math.max(tasks.length, 1)) * 100);

  const shown = tasks.filter(
    (t) => t.status === tab && t.title.toLowerCase().includes(q.toLowerCase())
  );

  const upcoming = tasks.filter((t) => t.status !== "done").slice(0, 3);
  const note = notes.find((n) => n.id === sel);

  // Latest notes for the debounced save, which runs after this render.
  const notesRef = useRef(notes);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Load from the API and keep polling so changes made elsewhere (iMessage, calls) show up.
  const refresh = useCallback(async () => {
    try {
      const state = await api("/api/state");
      setTasks(state.tasks.map(toTask));
      setNotes((local) =>
        state.notes.map((n) =>
          n.id === dirtyNote.current
            ? local.find((l) => l.id === n.id) ?? toNote(n)
            : toNote(n)
        )
      );
      setSel((s) =>
        s !== null && state.notes.some((n) => n.id === s)
          ? s
          : state.notes[0]?.id ?? null
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 3000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [refresh]);

  // Update the screen at once, then save; on failure, reload what the server has.
  const save = (path, init) => api(path, init).catch((err) => {
    console.error(err);
    refresh();
  });

  const move = (id, direction) => {
    const task = tasks.find((t) => t.id === id);
    const status = task && order[order.indexOf(task.status) + direction];
    if (!status) return;
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
    save(`/api/tasks/${id}`, { method: "PATCH", body: { status } });
  };

  const remove = (id) => {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    save(`/api/tasks/${id}`, { method: "DELETE" });
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const created = await save("/api/tasks", {
      method: "POST",
      body: { title: title.trim(), subject },
    });
    if (created) setTasks((ts) => [toTask(created.task), ...ts]);

    setTitle("");
  };

  const addNote = async () => {
    const created = await save("/api/notes", { method: "POST", body: {} });
    if (!created) return;

    setNotes((ns) => [toNote(created.note), ...ns]);
    setSel(created.note.id);
    setTab("notes");
    setActiveNav("Tasks");
  };

  const editNote = (patch) => {
    const id = sel;
    dirtyNote.current = id;
    setNotes((ns) =>
      ns.map((n) => (n.id === id ? { ...n, ...patch, at: "Just now" } : n))
    );
    // Debounce typing; the latest text is sent once the user pauses.
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const latest = notesRef.current.find((n) => n.id === id);
      if (latest) {
        await save(`/api/notes/${id}`, {
          method: "PATCH",
          body: { title: latest.title || "Untitled note", subject: latest.subject, body: latest.body },
        });
      }
      if (dirtyNote.current === id) dirtyNote.current = null;
    }, 500);
  };

  const deleteNote = () => {
    const id = sel;
    const rest = notes.filter((n) => n.id !== id);
    setNotes(rest);
    setSel(rest[0]?.id ?? null);
    if (id !== null) save(`/api/notes/${id}`, { method: "DELETE" });
  };

  const C = 2 * Math.PI * 30;

  return (
    <div className="db">
      <style>{css}</style>

      <aside className="side">
        <div className="brand">
          <BookOpen size={24} />
          StudyBuddy
        </div>

        {NAV.map(([Icon, label]) => (
          <button
            key={label}
            className={"nav" + (activeNav === label ? " on" : "")}
            aria-current={activeNav === label ? "page" : undefined}
            onClick={() => {
              setActiveNav(label);
              if (label === "Subjects") setMathWorkspaceOpen(false);
              if (label === "Tasks") setTab("todo");
            }}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}

        <div className="me">
          <div className="av">S</div>
          <div style={{ flex: 1 }}>
            Shivam
            <small>Student</small>
          </div>
          <ChevronDown size={14} color="#6b7280" />
        </div>
      </aside>

      {activeNav === "D2L" ? (
        <main className="page" style={{ gridTemplateColumns: "1fr" }}>
          <header className="head">
            <div>
              <h1>DePaul D2L</h1>
              <p className="sub">
                Access your courses and assignments through Brightspace.
              </p>
            </div>
          </header>

          <section className="panel" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <BookOpen size={30} color="#6c7cf5" />
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>Connect to your courses</h2>
                <p className="sub" style={{ marginTop: 6 }}>
                  Open DePaul's official learning platform.
                </p>
              </div>
            </div>

            <p style={{ color: "#6b7280", lineHeight: 1.7, fontSize: 14 }}>
              Your actual course and assignment data is not connected to StudyBuddy yet.
              For automatic syncing, we'll need to set up an approved D2L API integration.
            </p>

            <a
              href="https://d2l.depaul.edu/d2l/home"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#0b1220",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 14,
                marginTop: 12,
              }}
            >
              Open DePaul D2L
              <ArrowRight size={16} />
            </a>
          </section>

        </main>
      ) : activeNav === "Tasks" ? (
        <main className="page">
          <header className="head">
            <div>
              <h1>Your study board</h1>
              <p className="sub">
                {counts.todo + counts.doing} tasks open · {counts.doing} in progress right now
              </p>
            </div>

            <label className="search">
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tasks"
                aria-label="Search tasks"
              />
            </label>
          </header>

          <section className="panel">
            <div className="tabs" role="tablist" aria-label="Dashboard sections">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  role="tab"
                  id={"tab-" + id}
                  aria-selected={tab === id}
                  aria-controls="view"
                  className="tab"
                  onClick={() => setTab(id)}
                >
                  <Icon size={16} />
                  {label}
                  <span className="count">{counts[id]}</span>
                </button>
              ))}
            </div>

            <div
              className="body"
              role="tabpanel"
              id="view"
              aria-labelledby={"tab-" + tab}
            >
              {tab !== "notes" ? (
                <>
                  {tab === "todo" && (
                    <form className="add" onSubmit={addTask}>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a task, e.g. Revise chapter 4"
                        aria-label="New task"
                      />

                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        aria-label="Subject"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>

                      <button className="primary" type="submit">
                        <Plus size={16} />
                        Add task
                      </button>
                    </form>
                  )}

                  {shown.length === 0 ? (
                    <p className="empty">
                      {tab === "todo"
                        ? "Nothing to do. Add a task above."
                        : tab === "doing"
                        ? "Nothing in progress. Start a task from To do."
                        : "No finished tasks yet."}
                    </p>
                  ) : (
                    <ul className="list">
                      {shown.map((t) => (
                        <li
                          key={t.id}
                          className={"task" + (t.status === "done" ? " done" : "")}
                        >
                          <div className="t-main">
                            <p className="t-title">{t.title}</p>

                            <div className="meta">
                              <span className="chip">{t.subject}</span>

                              <span>
                                <CalendarDays
                                  size={12}
                                  style={{ verticalAlign: -2, marginRight: 4 }}
                                />
                                {t.due}
                              </span>

                              <span>
                                <i
                                  className="dot"
                                  style={{ background: PRI[t.pri] }}
                                />
                                {t.pri === "med"
                                  ? "Medium"
                                  : t.pri[0].toUpperCase() + t.pri.slice(1)}{" "}
                                priority
                              </span>
                            </div>
                          </div>

                          <div className="acts">
                            {t.status !== "todo" && (
                              <button
                                className="ib"
                                onClick={() => move(t.id, -1)}
                                aria-label="Move back"
                              >
                                <ArrowLeft size={15} />
                              </button>
                            )}

                            {t.status !== "done" && (
                              <button
                                className="ib go"
                                onClick={() => move(t.id, 1)}
                                aria-label={
                                  t.status === "todo" ? "Start task" : "Mark done"
                                }
                              >
                                {t.status === "todo" ? (
                                  <ArrowRight size={15} />
                                ) : (
                                  <CheckCircle2 size={15} />
                                )}
                              </button>
                            )}

                            <button
                              className="ib"
                              onClick={() => remove(t.id)}
                              aria-label="Delete task"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="notes">
                  <div className="nlist">
                    <button
                      className="primary"
                      onClick={addNote}
                      style={{ justifyContent: "center" }}
                    >
                      <Plus size={16} />
                      New note
                    </button>

                    {notes.map((n) => (
                      <button
                        key={n.id}
                        className="nitem"
                        aria-current={n.id === sel}
                        onClick={() => setSel(n.id)}
                      >
                        <b>{n.title || "Untitled note"}</b>
                        <span>{n.subject} · {n.at}</span>
                      </button>
                    ))}
                  </div>

                  {note ? (
                    <div className="editor">
                      <input
                        value={note.title}
                        onChange={(e) => editNote({ title: e.target.value })}
                        aria-label="Note title"
                      />

                      <textarea
                        value={note.body}
                        onChange={(e) => editNote({ body: e.target.value })}
                        placeholder="Start writing…"
                        aria-label="Note body"
                      />

                      <div className="bar">
                        <select
                          value={note.subject}
                          onChange={(e) => editNote({ subject: e.target.value })}
                          aria-label="Note subject"
                          style={{
                            border: "1px solid var(--line)",
                            borderRadius: 8,
                            padding: "6px 8px",
                            font: "inherit",
                          }}
                        >
                          {SUBJECTS.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>

                        <button
                          className="ib"
                          onClick={deleteNote}
                          aria-label="Delete note"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="empty">No notes yet. Create one to get started.</p>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className="rail">
            <div className="card">
              <h2>Progress</h2>
              <div className="ring">
                <svg
                  width="76"
                  height="76"
                  viewBox="0 0 76 76"
                  role="img"
                  aria-label={`${pct}% of tasks done`}
                >
                  <circle
                    cx="38"
                    cy="38"
                    r="30"
                    fill="none"
                    stroke="#eceef2"
                    strokeWidth="8"
                  />
                  <circle
                    cx="38"
                    cy="38"
                    r="30"
                    fill="none"
                    stroke="#6c7cf5"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - pct / 100)}
                    transform="rotate(-90 38 38)"
                  />
                </svg>

                <p>
                  <strong>{pct}%</strong>
                  {counts.done} of {tasks.length} tasks done
                </p>
              </div>
            </div>

            <div className="card">
              <h2>Up next</h2>

              {upcoming.length === 0 ? (
                <p className="sub">You're all caught up.</p>
              ) : (
                upcoming.map((t) => (
                  <div className="up" key={t.id}>
                    <Clock size={16} />
                    <div>
                      {t.title}
                      <small>{t.subject} · {t.due}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </main>
      ) : activeNav === "Subjects" ? (
        <main className="page" style={{ gridTemplateColumns: "1fr" }}>
          <header className="head">
            <div>
              <h1>{mathWorkspaceOpen ? "Math" : "Subjects"}</h1>
              <p className="sub">
                {mathWorkspaceOpen
                  ? "Explore equations and visualize math concepts."
                  : "Choose a subject workspace to get started."}
              </p>
            </div>
            {mathWorkspaceOpen && (
              <button
                type="button"
                onClick={() => setMathWorkspaceOpen(false)}
                style={{
                  border: "1px solid #e8eaf0",
                  borderRadius: 10,
                  padding: "10px 14px",
                  background: "#fff",
                  color: "#0b1220",
                  font: "inherit",
                }}
              >
                All subjects
              </button>
            )}
          </header>

          {mathWorkspaceOpen ? (
            <D2LCanvas
              title="Desmos graphing calculator"
              description="Create and explore interactive graphs for your math work."
              initialExpression="y=x^2"
            />
          ) : (
            <section
              className="panel"
              style={{
                padding: 24,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              <article
                style={{
                  border: "1px solid #e8eaf0",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    color: "#6c7cf5",
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                  }}
                >
                  Math tool
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>Desmos</h2>
                <p className="sub" style={{ lineHeight: 1.6, marginBottom: 18 }}>
                  Graph equations, compare functions, and explore concepts with
                  an interactive calculator.
                </p>
                <button
                  type="button"
                  onClick={() => setMathWorkspaceOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    border: 0,
                    borderRadius: 10,
                    padding: "11px 16px",
                    background: "#0b1220",
                    color: "#fff",
                    font: "inherit",
                  }}
                >
                  Open math workspace
                  <ArrowRight size={16} />
                </button>
              </article>
            </section>
          )}
        </main>
      ) : (
        <main className="page" style={{ gridTemplateColumns: "1fr" }}>
          <header className="head">
            <div>
              <h1>{activeNav}</h1>
              <p className="sub">
                This section is not built yet. Your task dashboard is available under Tasks.
              </p>
            </div>
          </header>

          <section className="panel" style={{ padding: 24 }}>
            <p>
              The {activeNav} workspace will be added next.
            </p>

            {activeNav === "Subjects" && (
              <p className="sub">
                Your subjects currently appear in the task and notes editors.
              </p>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
