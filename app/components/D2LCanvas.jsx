"use client";

import { useEffect, useRef, useState } from "react";
import { createToolManager } from "./library/ai/canvas/tools";
import { loadDesmosScript } from "./library/ai/canvas/desmos-loader";

const examples = [
  { label: "Linear", latex: "y=2x+1" },
  { label: "Parabola", latex: "y=x^2" },
  { label: "Sine", latex: "y=sin(x)" },
];

export default function D2LCanvas({
  title = "Interactive math canvas",
  description = "Explore graphs while you work through your course material.",
  initialExpression = "y=x^2",
}) {
  const graphRef = useRef(null);
  const [manager] = useState(() => createToolManager());
  const [status, setStatus] = useState("loading");
  const [expression, setExpression] = useState("");

  useEffect(() => {
    let disposed = false;
    let calculator;

    loadDesmosScript()
      .then(() => {
        if (disposed) return;
        if (!window.Desmos?.GraphingCalculator) {
          throw new Error("The Desmos Graphing Calculator API is unavailable.");
        }

        calculator = window.Desmos.GraphingCalculator(graphRef.current, {
          expressions: true,
          settingsMenu: false,
          zoomButtons: true,
        });
        manager.desmos.setCalculator(calculator);
        manager.execute({
          action: "desmos.setExpression",
          id: "starter-graph",
          latex: initialExpression,
        });
        setStatus("ready");
      })
      .catch((error) => {
        if (disposed) return;
        console.error("[d2l-canvas] Failed to initialize the graph:", error);
        setStatus("error");
      });

    return () => {
      disposed = true;
      calculator?.destroy();
    };
  }, [initialExpression, manager]);

  const addExpression = (latex) => {
    const normalized = latex.trim();
    if (!normalized) return;

    manager.execute({
      action: "desmos.setExpression",
      id: `d2l-expression-${Date.now()}`,
      latex: normalized,
    });
    setExpression("");
  };

  const clearGraph = () => manager.execute({ action: "desmos.clear" });

  return (
    <section
      aria-labelledby="canvas-heading"
      style={{
        background: "#fff",
        border: "1px solid #e8eaf0",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "22px 24px",
          borderBottom: "1px solid #e8eaf0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 id="canvas-heading" style={{ margin: 0, fontSize: 20 }}>
            {title}
          </h2>
          <p className="sub" style={{ marginTop: 6 }}>
            {description}
          </p>
        </div>
        <span
          role="status"
          style={{
            color: status === "error" ? "#b42318" : "#667085",
            fontSize: 13,
          }}
        >
          {status === "loading" && "Loading graph…"}
          {status === "ready" && "Desmos ready"}
          {status === "error" && "The graph could not be loaded. Please try again later."}
        </span>
      </div>

      <div style={{ padding: 20 }}>
        <div
          ref={graphRef}
          aria-label="Interactive Desmos graph"
          style={{
            height: 420,
            minHeight: 300,
            border: "1px solid #e8eaf0",
            borderRadius: 12,
            overflow: "hidden",
          }}
        />

        <form
          onSubmit={(event) => {
            event.preventDefault();
            addExpression(expression);
          }}
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <label htmlFor="d2l-canvas-expression" className="sr-only">
            Graph expression
          </label>
          <input
            id="d2l-canvas-expression"
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            placeholder="Enter an expression, e.g. y=2x+1"
            disabled={status !== "ready"}
            style={{
              flex: "1 1 260px",
              minWidth: 0,
              border: "1px solid #e8eaf0",
              borderRadius: 10,
              padding: "11px 14px",
              font: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={status !== "ready" || !expression.trim()}
            style={{
              border: 0,
              borderRadius: 10,
              padding: "11px 16px",
              background: "#0b1220",
              color: "#fff",
              font: "inherit",
              opacity: status !== "ready" || !expression.trim() ? 0.5 : 1,
            }}
          >
            Add graph
          </button>
          <button
            type="button"
            onClick={clearGraph}
            disabled={status !== "ready"}
            style={{
              border: "1px solid #e8eaf0",
              borderRadius: 10,
              padding: "11px 16px",
              background: "#fff",
              color: "#0b1220",
              font: "inherit",
            }}
          >
            Clear
          </button>
        </form>

        <div
          aria-label="Example graphs"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
        >
          {examples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => addExpression(example.latex)}
              disabled={status !== "ready"}
              style={{
                border: "1px solid #e8eaf0",
                borderRadius: 999,
                padding: "7px 12px",
                background: "#f6f7f9",
                color: "#344054",
                font: "inherit",
                fontSize: 13,
              }}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
