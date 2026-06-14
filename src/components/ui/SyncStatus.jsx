import React, { useEffect, useState } from "react";

const CONFIG = {
  saving: { label: "Saving...", color: "#00F0FF", dot: "●" },
  saved:  { label: "Saved",    color: "#00FFBF", dot: "✓" },
  error:  { label: "Sync failed", color: "#FF3EDB", dot: "✕" },
  offline:{ label: "Offline",  color: "#7B2CFF", dot: "⚠" },
  idle:   null,
};

export default function SyncStatus({ status = "idle" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === "idle") {
      setVisible(false);
      return;
    }
    setVisible(true);
    if (status === "saved") {
      const t = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(t);
    }
  }, [status]);

  if (!visible || !CONFIG[status]) return null;

  const { label, color, dot } = CONFIG[status];

  return (
    <span
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        color,
        background: `${color}14`,
        border: `1px solid ${color}40`,
        borderRadius: "20px",
        padding: "2px 8px",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono, monospace)",
        transition: "opacity 0.3s",
      }}
    >
      <span aria-hidden="true">{dot}</span>
      {label}
    </span>
  );
}
