"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Phone } from "lucide-react";

// Past study calls and iMessage threads, stored as JSON by the backend (/api/conversations).
const POLL_MS = 5000;

const css = `
.db .hist { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 20px; align-items: start; }
.db .hist-list { display: flex; flex-direction: column; gap: 8px; }
.db .hist-item {
  text-align: left; border: 1px solid var(--line); background: #fff; border-radius: 14px;
  padding: 12px 14px; font: inherit; cursor: pointer; display: grid; gap: 4px;
}
.db .hist-item[aria-current="true"] { border-color: var(--accent); box-shadow: 0 0 0 3px var(--tint); }
.db .hist-item b { font-size: 14px; font-weight: 600; color: var(--ink); }
.db .hist-item p { margin: 0; font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.db .hist-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
.db .hist-meta svg { color: var(--accent); }
.db .hist-detail { padding: 24px; display: grid; gap: 18px; }
.db .hist-detail h2 { margin: 0; font-size: 20px; }
.db .hist-summary { background: var(--soft); border-radius: 14px; padding: 16px; display: grid; gap: 10px; font-size: 14px; line-height: 1.6; }
.db .hist-summary h3 { margin: 0; font-size: 13px; font-weight: 600; color: var(--muted); }
.db .hist-summary ul { margin: 0; padding-left: 18px; }
.db .hist-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.db .hist-msgs { display: flex; flex-direction: column; gap: 8px; }
.db .hist-msg { max-width: 75%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
.db .hist-msg.assistant { align-self: flex-start; background: var(--soft); }
.db .hist-msg.user { align-self: flex-end; background: var(--accent); color: #fff; }
.db .hist-msg small { display: block; font-size: 11px; opacity: .7; margin-bottom: 2px; }
@media (max-width: 900px) { .db .hist { grid-template-columns: 1fr; } }
`;

const when = (iso) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const SOURCE = {
  facetime: { Icon: Phone, label: "FaceTime call" },
  imessage: { Icon: MessageSquare, label: "iMessage" },
  web: { Icon: MessageSquare, label: "Chat" },
};

async function getJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export default function HistoryView() {
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    try {
      const { conversations } = await getJson("/api/conversations");
      setItems(conversations);
      setSelected((s) => (s && conversations.some((c) => c.id === s) ? s : conversations[0]?.id ?? null));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Keep the list fresh: new calls and iMessage replies arrive while the page is open.
  useEffect(() => {
    const first = setTimeout(load, 0);
    const timer = setInterval(load, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    const fetchDetail = async () => {
      try {
        const { conversation } = await getJson(`/api/conversations/${selected}`);
        if (!cancelled) setDetail(conversation);
      } catch (err) {
        console.error(err);
      }
    };
    const first = setTimeout(fetchDetail, 0);
    const timer = setInterval(fetchDetail, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [selected]);

  const shown = detail && detail.id === selected ? detail : null;

  return (
    <>
      <style>{css}</style>
      <header className="head">
        <div>
          <h1>History</h1>
          <p className="sub">Your study calls and iMessage conversations with Study Buddy.</p>
        </div>
      </header>

      {items === null ? (
        <p className="sub">Loading…</p>
      ) : items.length === 0 ? (
        <section className="panel" style={{ padding: 28 }}>
          <p className="sub">No conversations yet. Finish a study call and it will show up here.</p>
        </section>
      ) : (
        <div className="hist">
          <div className="hist-list">
            {items.map((c) => {
              const { Icon, label } = SOURCE[c.source] ?? SOURCE.web;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="hist-item"
                  aria-current={c.id === selected}
                  onClick={() => setSelected(c.id)}
                >
                  <span className="hist-meta">
                    <Icon size={14} /> {label} · {when(c.started_at)}
                  </span>
                  <b>{c.title || label}</b>
                  {c.preview && <p>{c.preview}</p>}
                </button>
              );
            })}
          </div>

          <section className="panel hist-detail">
            {!shown ? (
              <p className="sub">Loading…</p>
            ) : (
              <>
                <div>
                  <h2>{shown.title || SOURCE[shown.source]?.label}</h2>
                  <p className="sub">
                    {SOURCE[shown.source]?.label} · {when(shown.started_at)} · {shown.messages.length} messages
                  </p>
                </div>

                {shown.summary ? (
                  <div className="hist-summary">
                    <div>
                      <h3>Summary</h3>
                      {shown.summary.summary}
                    </div>
                    {shown.summary.topicsCovered.length > 0 && (
                      <div className="hist-chips">
                        {shown.summary.topicsCovered.map((t) => (
                          <span className="chip" key={t}>{t}</span>
                        ))}
                      </div>
                    )}
                    {shown.summary.followUps.length > 0 && (
                      <div>
                        <h3>Try next</h3>
                        <ul>
                          {shown.summary.followUps.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : shown.summary_status === "pending" ? (
                  <p className="sub">Summarizing this call…</p>
                ) : null}

                <div className="hist-msgs">
                  {shown.messages.map((m, i) => (
                    <div key={i} className={`hist-msg ${m.role}`}>
                      <small>{m.role === "user" ? "You" : "Study Buddy"}</small>
                      {m.text}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
