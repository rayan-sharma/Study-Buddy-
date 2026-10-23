"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, RefreshCw } from "lucide-react";

function formatDueDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function CanvasDashboard() {
  const [token, setToken] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function connect(event) {
    event.preventDefault();
    setError("");
    setDashboard(null);
    setLoading(true);

    try {
      const response = await fetch("/api/canvas/dashboard", {
        headers: { Authorization: `Bearer ${token.trim()}` },
        cache: "no-store",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Could not load Canvas. Please try again."
        );
      }

      setDashboard(result);
    } catch (connectionError) {
      setError(
        connectionError instanceof Error
          ? connectionError.message
          : "Could not load Canvas. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    setToken("");
    setDashboard(null);
    setError("");
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section className="panel" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BookOpen size={28} color="#6c7cf5" />
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Canvas course dashboard</h2>
              <p className="sub" style={{ marginTop: 6 }}>
                Your active courses and upcoming assignment deadlines.
              </p>
            </div>
          </div>
          {dashboard && (
            <button
              type="button"
              onClick={disconnect}
              style={secondaryButtonStyle}
            >
              Disconnect
            </button>
          )}
        </div>

        {!dashboard && (
          <>
            <p style={{ color: "#667085", lineHeight: 1.7, fontSize: 14 }}>
              Connect with a Canvas access token to load your course dashboard.
              The token is sent only to this app&apos;s backend for the request;
              it is not saved in a database or browser storage.
            </p>
            <form
              onSubmit={connect}
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              <label
                htmlFor="canvas-token"
                style={{ flex: "1 1 300px", display: "grid", gap: 7 }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Canvas access token
                </span>
                <input
                  id="canvas-token"
                  type="password"
                  autoComplete="off"
                  spellCheck="false"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Paste your personal Canvas token"
                  style={inputStyle}
                />
              </label>
              <button
                type="submit"
                disabled={loading || !token.trim()}
                style={{
                  ...primaryButtonStyle,
                  opacity: loading || !token.trim() ? 0.55 : 1,
                }}
              >
                {loading ? "Connecting…" : "Connect Canvas"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
            <p style={{ margin: "12px 0 0", color: "#667085", fontSize: 12 }}>
              Ask your school&apos;s Canvas administrator if personal access
              tokens are unavailable.
            </p>
          </>
        )}

        {error && (
          <p
            role="alert"
            style={{
              margin: "14px 0 0",
              color: "#b42318",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {error}
          </p>
        )}
      </section>

      {dashboard && (
        <>
          <section
            aria-label="Active Canvas courses"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {dashboard.courses.map((course) => (
              <article
                key={course.id}
                className="panel"
                style={{ padding: 20 }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 12,
                    background: "#e9edfd",
                    color: "#6c7cf5",
                    marginBottom: 14,
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <h2 style={{ margin: 0, fontSize: 16, lineHeight: 1.4 }}>
                  {course.name}
                </h2>
                {course.course_code && (
                  <p className="sub" style={{ margin: "7px 0 0" }}>
                    {course.course_code}
                  </p>
                )}
              </article>
            ))}
            {dashboard.courses.length === 0 && (
              <p className="sub">No active Canvas courses were found.</p>
            )}
          </section>

          <section className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CalendarDays size={21} color="#6c7cf5" />
              <h2 style={{ margin: 0, fontSize: 19 }}>
                Upcoming assignments
              </h2>
            </div>
            {dashboard.assignments.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
                {dashboard.assignments.map((assignment) => (
                  <li
                    key={`${assignment.courseId}-${assignment.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "16px 0",
                      borderTop: "1px solid #e8eaf0",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {assignment.name}
                      </div>
                      <div className="sub" style={{ marginTop: 5 }}>
                        {assignment.courseName}
                        {assignment.points_possible != null &&
                          ` · ${assignment.points_possible} points`}
                      </div>
                    </div>
                    <div
                      style={{
                        flex: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 12,
                        color: "#667085",
                      }}
                    >
                      <span>{formatDueDate(assignment.due_at)}</span>
                      {assignment.html_url && (
                        <a
                          href={assignment.html_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${assignment.name} in Canvas`}
                          style={{ color: "#6c7cf5" }}
                        >
                          <ArrowRight size={16} />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sub" style={{ marginTop: 14 }}>
                No upcoming assignments were found.
              </p>
            )}
            <button
              type="button"
              onClick={connect}
              disabled={loading}
              style={{ ...secondaryButtonStyle, marginTop: 12 }}
            >
              <RefreshCw size={15} />
              Refresh dashboard
            </button>
          </section>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  minWidth: 0,
  border: "1px solid #e8eaf0",
  borderRadius: 10,
  padding: "12px 14px",
  font: "inherit",
  fontSize: 14,
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: 0,
  borderRadius: 10,
  padding: "12px 16px",
  background: "#0b1220",
  color: "#fff",
  font: "inherit",
  fontSize: 14,
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "1px solid #e8eaf0",
  borderRadius: 10,
  padding: "10px 14px",
  background: "#fff",
  color: "#344054",
  font: "inherit",
  fontSize: 13,
};
