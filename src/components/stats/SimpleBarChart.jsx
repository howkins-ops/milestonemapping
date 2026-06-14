import React from "react";

// Dependency-free bar chart. bars: [{ label, value, max?, color? }]
export default function SimpleBarChart({ bars = [], height = 120, valueSuffix = "" }) {
  const max = Math.max(1, ...bars.map((b) => b.max ?? b.value));

  if (bars.length === 0) {
    return <p className="soft" style={{ fontSize: 13 }}>No data yet. Execute and return.</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        height,
        overflowX: "auto",
        paddingTop: 8
      }}
      role="img"
      aria-label="Bar chart"
    >
      {bars.map((b, i) => {
        const pct = Math.max(4, Math.round((b.value / max) * 100));
        return (
          <div
            key={`${b.label}-${i}`}
            style={{
              flex: "1 0 34px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              height: "100%",
              justifyContent: "flex-end"
            }}
            title={`${b.label}: ${b.value}${valueSuffix}`}
          >
            <span className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
              {b.value}
              {valueSuffix}
            </span>
            <div
              style={{
                width: "100%",
                maxWidth: 38,
                height: `${pct}%`,
                borderRadius: "6px 6px 2px 2px",
                background: b.color || "linear-gradient(180deg, #00F0FF, #00FFBF)",
                boxShadow: "0 0 10px rgba(0,240,255,0.3)",
                transition: "height 600ms var(--ease-out)"
              }}
            />
            <span
              className="soft"
              style={{
                fontSize: 10,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 56
              }}
            >
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
