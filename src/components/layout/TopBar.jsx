import React from "react";
import { formatDisplayDate } from "../../lib/dates.js";
import { useGamification } from "../../hooks/useGamification.js";
import Badge from "../ui/Badge.jsx";

export default function TopBar({ onNavigate }) {
  const { rank, xp, progress } = useGamification();

  return (
    <header className="topbar">
      <span className="topbar__date">{formatDisplayDate()}</span>
      <div className="topbar__right">
        <Badge tone="gold">🛡 {rank.name}</Badge>
        <button
          type="button"
          className="nav-item"
          style={{ padding: "6px 12px" }}
          onClick={() => onNavigate("stats")}
          aria-label={`${xp} XP — view stats`}
        >
          <span className="mono" style={{ fontSize: 12, color: "var(--brand-purple)" }}>
            ✦ {xp.toLocaleString()} XP
            {progress.next ? ` · ${progress.needed} to ${progress.next.name}` : " · MAX"}
          </span>
        </button>
      </div>
    </header>
  );
}
