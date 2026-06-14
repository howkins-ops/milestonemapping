import React, { useState } from "react";
import Card from "../ui/Card.jsx";

export default function FormulaStepCard({ step, index }) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      variant={open ? "neon" : "glass"}
      className="anim-slide-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          color: "inherit",
          textAlign: "left",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 16
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--brand-cyan)",
            textShadow: "0 0 14px rgba(0,240,255,0.4)",
            minWidth: 38
          }}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 17 }}>{step.title}</h3>
          {!open && (
            <p className="soft" style={{ fontSize: 12.5, marginTop: 3 }}>
              Tap to expand
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          style={{
            color: "var(--brand-cyan)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 250ms var(--ease-out)"
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="anim-fade-in" style={{ marginTop: 16, paddingLeft: 54 }}>
          <p className="muted" style={{ lineHeight: 1.7 }}>{step.explanation}</p>
          <p style={{ marginTop: 12, color: "var(--brand-green)", fontWeight: 600, fontSize: 14 }}>
            ▸ {step.prompt}
          </p>
          <p className="soft" style={{ marginTop: 10, fontSize: 13, fontStyle: "italic" }}>
            Example: {step.example}
          </p>
        </div>
      )}
    </Card>
  );
}
