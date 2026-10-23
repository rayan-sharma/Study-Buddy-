"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Grip,
  MessageCircleQuestion,
  Minus,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const filters = ["To ask", "Done", "All"];

export default function QuestionListWidget() {
  const widgetRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState("To ask");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    function moveWidget(event) {
      const drag = dragRef.current;
      const widget = widgetRef.current;
      if (!drag || !widget || event.pointerId !== drag.pointerId) return;

      if (
        Math.abs(event.clientX - drag.pointerX) > 4 ||
        Math.abs(event.clientY - drag.pointerY) > 4
      ) {
        movedRef.current = true;
      }

      const maxLeft = Math.max(8, window.innerWidth - widget.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - widget.offsetHeight - 8);
      setPosition({
        left: Math.max(
          8,
          Math.min(maxLeft, drag.left + event.clientX - drag.pointerX)
        ),
        top: Math.max(
          8,
          Math.min(maxTop, drag.top + event.clientY - drag.pointerY)
        ),
      });
    }

    function stopDragging(event) {
      if (dragRef.current?.pointerId === event.pointerId) {
        suppressClickRef.current = movedRef.current;
        dragRef.current = null;
        setDragging(false);
      }
    }

    window.addEventListener("pointermove", moveWidget);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointermove", moveWidget);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, []);

  const visibleQuestions = questions.filter((question) => {
    if (filter === "To ask") return !question.done;
    if (filter === "Done") return question.done;
    return true;
  });

  function startDragging(event) {
    if (event.button !== 0) return;
    const bounds = widgetRef.current?.getBoundingClientRect();
    if (!bounds) return;

    dragRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: bounds.left,
      top: bounds.top,
    };
    movedRef.current = false;
    setDragging(true);
    setPosition({ left: bounds.left, top: bounds.top });
  }

  function toggleAfterClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const bounds = widgetRef.current?.getBoundingClientRect();
    if (!expanded && bounds) {
      const width = Math.min(380, window.innerWidth - 32);
      const height = Math.min(500, window.innerHeight - 32);
      setPosition({
        left: Math.min(
          window.innerWidth - width - 8,
          Math.max(8, bounds.left)
        ),
        top: Math.min(
          window.innerHeight - height - 8,
          Math.max(8, bounds.bottom - height)
        ),
      });
    }
    setExpanded((current) => !current);
  }

  function minimize() {
    const bounds = widgetRef.current?.getBoundingClientRect();
    if (bounds) {
      setPosition({
        left: Math.min(window.innerWidth - 72, Math.max(8, bounds.left)),
        top: Math.min(window.innerHeight - 72, Math.max(8, bounds.bottom - 64)),
      });
    }
    setExpanded(false);
  }

  function addQuestion(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setQuestions((current) => [
      { id: `${Date.now()}-${Math.random()}`, text, done: false },
      ...current,
    ]);
    setDraft("");
    setFilter("To ask");
  }

  function saveEdit(event, id) {
    event.preventDefault();
    const text = editDraft.trim();
    if (!text) return;
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, text } : question
      )
    );
    setEditingId(null);
    setEditDraft("");
  }

  return (
    <section
      ref={widgetRef}
      aria-label="Questions to ask"
      style={{
        position: "fixed",
        zIndex: 99,
        ...(position
          ? { left: position.left, top: position.top }
          : { left: 24, bottom: 104 }),
        width: expanded ? "min(380px, calc(100vw - 32px))" : 64,
        height: expanded ? 500 : 64,
        maxHeight: "calc(100vh - 32px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #e8eaf0",
        borderRadius: expanded ? 22 : "50%",
        background: "#fff",
        color: "#0b1220",
        boxShadow: "0 18px 55px rgba(28, 35, 75, 0.2)",
        fontFamily: "Inter, system-ui, sans-serif",
        transition: dragging
          ? "none"
          : "width 180ms ease, height 180ms ease, border-radius 180ms ease",
      }}
    >
      {expanded ? (
        <>
          <header
            onPointerDown={startDragging}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 14px 14px 16px",
              background: "linear-gradient(135deg, #f2f3ff, #fff4ed)",
              borderBottom: "1px solid #ececf2",
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 38,
                height: 38,
                display: "grid",
                placeItems: "center",
                borderRadius: 14,
                color: "#6c7cf5",
                background: "#fff",
              }}
            >
              <MessageCircleQuestion size={21} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                Questions to ask
              </div>
              <div style={{ color: "#73798b", fontSize: 11, marginTop: 3 }}>
                Keep track of what you want to learn
              </div>
            </div>
            <Grip size={16} color="#9ba0af" aria-hidden="true" />
            <button
              type="button"
              aria-label="Minimize question list"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={minimize}
              style={iconButtonStyle}
            >
              <Minus size={17} />
            </button>
            <button
              type="button"
              aria-label="Close question list"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={minimize}
              style={iconButtonStyle}
            >
              <X size={17} />
            </button>
          </header>

          <div style={{ padding: 14, borderBottom: "1px solid #ececf2" }}>
            <form
              onSubmit={addQuestion}
              style={{ display: "flex", gap: 8 }}
            >
              <input
                aria-label="New question"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="What do you want to ask?"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "1px solid #e8eaf0",
                  borderRadius: 11,
                  padding: "10px 12px",
                  font: "inherit",
                  fontSize: 12,
                }}
              />
              <button
                type="submit"
                aria-label="Add question"
                disabled={!draft.trim()}
                style={{
                  ...iconButtonStyle,
                  width: 40,
                  height: 40,
                  color: "#fff",
                  background: "#6c7cf5",
                  opacity: draft.trim() ? 1 : 0.5,
                }}
              >
                <Plus size={18} />
              </button>
            </form>
          </div>

          <div
            role="tablist"
            aria-label="Filter questions"
            style={{
              display: "flex",
              gap: 6,
              padding: "10px 14px",
              borderBottom: "1px solid #ececf2",
            }}
          >
            {filters.map((option) => {
              const count =
                option === "All"
                  ? questions.length
                  : option === "Done"
                    ? questions.filter((question) => question.done).length
                    : questions.filter((question) => !question.done).length;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={filter === option}
                  onClick={() => setFilter(option)}
                  style={{
                    border: 0,
                    borderRadius: 999,
                    padding: "7px 10px",
                    color: filter === option ? "#4b55c5" : "#667085",
                    background: filter === option ? "#e9edfd" : "transparent",
                    font: "inherit",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {option} <span>{count}</span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {visibleQuestions.length === 0 ? (
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  minHeight: 150,
                  padding: 20,
                  textAlign: "center",
                  color: "#73798b",
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {questions.length === 0
                  ? "Your list is empty. Add a question to remember what you want to ask."
                  : filter === "Done"
                    ? "No completed questions yet."
                    : "You’re all caught up. No questions left to ask."}
              </div>
            ) : (
              <ul
                aria-label="Question list"
                style={{
                  display: "grid",
                  gap: 8,
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {visibleQuestions.map((question) => (
                  <li
                    key={question.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: 10,
                      border: "1px solid #e8eaf0",
                      borderRadius: 13,
                      background: question.done ? "#fafafb" : "#fff",
                    }}
                  >
                    <button
                      type="button"
                      aria-label={
                        question.done
                          ? "Mark question undone"
                          : "Mark question done"
                      }
                      onClick={() =>
                        setQuestions((current) =>
                          current.map((item) =>
                            item.id === question.id
                              ? { ...item, done: !item.done }
                              : item
                          )
                        )
                      }
                      style={{
                        ...iconButtonStyle,
                        flex: "none",
                        width: 28,
                        height: 28,
                        border: question.done
                          ? "1px solid #69b98a"
                          : "1px solid #d7dbea",
                        color: question.done ? "#218653" : "#7d8495",
                        background: question.done ? "#eaf8ef" : "#fff",
                      }}
                    >
                      {question.done ? <Check size={15} /> : null}
                    </button>

                    {editingId === question.id ? (
                      <form
                        onSubmit={(event) => saveEdit(event, question.id)}
                        style={{
                          flex: 1,
                          display: "flex",
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        <input
                          aria-label="Edit question"
                          autoFocus
                          value={editDraft}
                          onChange={(event) => setEditDraft(event.target.value)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            border: "1px solid #c9cef1",
                            borderRadius: 8,
                            padding: "7px 8px",
                            font: "inherit",
                            fontSize: 12,
                          }}
                        />
                        <button
                          type="submit"
                          aria-label="Save question"
                          style={{
                            ...iconButtonStyle,
                            width: 30,
                            height: 30,
                            color: "#218653",
                          }}
                        >
                          <Check size={15} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            paddingTop: 5,
                            color: question.done ? "#9298a6" : "#344054",
                            fontSize: 12,
                            lineHeight: 1.5,
                            textDecoration: question.done
                              ? "line-through"
                              : "none",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {question.text}
                        </span>
                        <button
                          type="button"
                          aria-label="Edit question"
                          onClick={() => {
                            setEditingId(question.id);
                            setEditDraft(question.text);
                          }}
                          style={{
                            ...iconButtonStyle,
                            flex: "none",
                            width: 28,
                            height: 28,
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      aria-label="Delete question"
                      onClick={() =>
                        setQuestions((current) =>
                          current.filter((item) => item.id !== question.id)
                        )
                      }
                      style={{
                        ...iconButtonStyle,
                        flex: "none",
                        width: 28,
                        height: 28,
                        color: "#9a5060",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <button
          type="button"
          aria-label="Open question list"
          onPointerDown={startDragging}
          onClick={toggleAfterClick}
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            border: 0,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e9ecff, #fff0e8)",
            color: "#6c7cf5",
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 3px 12px rgba(72, 78, 140, 0.14)",
              position: "relative",
            }}
          >
            <MessageCircleQuestion size={26} />
            {questions.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -4,
                  minWidth: 17,
                  height: 17,
                  display: "grid",
                  placeItems: "center",
                  padding: "0 4px",
                  borderRadius: 999,
                  background: "#6c7cf5",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                {questions.filter((question) => !question.done).length}
              </span>
            )}
          </span>
        </button>
      )}
    </section>
  );
}

const iconButtonStyle = {
  display: "grid",
  placeItems: "center",
  width: 30,
  height: 30,
  padding: 0,
  border: 0,
  borderRadius: 9,
  background: "transparent",
  color: "#667085",
  cursor: "pointer",
};
