"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Grip, Minus, Send, Sparkles, X } from "lucide-react";

export default function ChatbotWidget() {
  const widgetRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);
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

  function openAfterClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    const bounds = widgetRef.current?.getBoundingClientRect();
    if (bounds) {
      const width = Math.min(360, window.innerWidth - 32);
      const height = Math.min(440, window.innerHeight - 32);
      const maxLeft = Math.max(8, window.innerWidth - width - 8);
      const maxTop = Math.max(8, window.innerHeight - height - 8);
      setPosition({
        left: Math.min(maxLeft, Math.max(8, bounds.right - width)),
        top: Math.min(maxTop, Math.max(8, bounds.bottom - height)),
      });
    }
    setExpanded(true);
  }

  function minimizeChat() {
    const bounds = widgetRef.current?.getBoundingClientRect();
    if (bounds) {
      setPosition({
        left: Math.min(window.innerWidth - 72, Math.max(8, bounds.right - 64)),
        top: Math.min(window.innerHeight - 72, Math.max(8, bounds.bottom - 64)),
      });
    }
    setExpanded(false);
  }

  return (
    <section
      ref={widgetRef}
      aria-label="StudyBuddy chatbot"
      style={{
        position: "fixed",
        zIndex: 100,
        ...(position
          ? { left: position.left, top: position.top }
          : { right: 24, bottom: 24 }),
        width: expanded ? "min(360px, calc(100vw - 32px))" : 64,
        height: expanded ? 440 : 64,
        maxHeight: "calc(100vh - 32px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: expanded ? 22 : "50%",
        background: "#fff",
        border: "1px solid #e8eaf0",
        boxShadow: "0 18px 55px rgba(28, 35, 75, 0.22)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#0b1220",
        transition: dragging ? "none" : "width 180ms ease, height 180ms ease, border-radius 180ms ease",
      }}
    >
      {expanded ? (
        <>
          <header
            onPointerDown={startDragging}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "14px 14px 14px 16px",
              background: "linear-gradient(135deg, #f2f3ff, #fff4ed)",
              borderBottom: "1px solid #ececf2",
              cursor: "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                color: "#6c7cf5",
                background: "#fff",
                boxShadow: "0 3px 10px rgba(70, 76, 130, 0.1)",
                flex: "none",
              }}
            >
              <Bot size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>StudyBuddy</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "#73798b",
                  fontSize: 11,
                  marginTop: 3,
                }}
              >
                <Sparkles size={12} color="#8b6fe0" />
                Your study companion
              </div>
            </div>
            <Grip size={16} color="#9ba0af" aria-hidden="true" />
            <button
              type="button"
              aria-label="Minimize chatbot"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={minimizeChat}
              style={controlStyle}
            >
              <Minus size={17} />
            </button>
            <button
              type="button"
              aria-label="Close chatbot"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={minimizeChat}
              style={controlStyle}
            >
              <X size={17} />
            </button>
          </header>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              padding: 24,
              textAlign: "center",
              background:
                "radial-gradient(circle at 50% 44%, #f7f6ff 0, #fff 58%)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 76,
                height: 76,
                borderRadius: 26,
                display: "grid",
                placeItems: "center",
                color: "#6c7cf5",
                background: "linear-gradient(135deg, #eef0ff, #fff0e9)",
              }}
            >
              <Bot size={42} strokeWidth={1.6} />
            </div>
            <div>
              <h2 style={{ margin: "0 0 6px", fontSize: 16 }}>
                Hey, I&apos;m StudyBuddy!
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "#73798b",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                I&apos;m getting ready to help with your studies. Chat will be
                available here soon.
              </p>
            </div>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 12,
              borderTop: "1px solid #ececf2",
              background: "#fff",
            }}
          >
            <input
              aria-label="Chat message"
              disabled
              placeholder="Chat is coming soon…"
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #e8eaf0",
                borderRadius: 14,
                padding: "11px 13px",
                background: "#f8f8fa",
                font: "inherit",
                fontSize: 12,
              }}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled
              style={{
                ...controlStyle,
                width: 38,
                height: 38,
                color: "#fff",
                background: "#6c7cf5",
                opacity: 0.5,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </>
      ) : (
        <button
          type="button"
          aria-label="Open StudyBuddy chatbot"
          onPointerDown={startDragging}
          onClick={openAfterClick}
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
              display: "grid",
              placeItems: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 3px 12px rgba(72, 78, 140, 0.14)",
            }}
          >
            <Bot size={28} strokeWidth={1.7} />
          </span>
        </button>
      )}
    </section>
  );
}

const controlStyle = {
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
