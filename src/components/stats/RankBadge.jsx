import React from "react";
import { useGamification } from "../../hooks/useGamification.js";

const RANK_ICONS = {
  Starter: "🌱",
  Builder: "🧱",
  Operator: "⚙️",
  Warrior: "⚔️",
  Architect: "📐",
  "Empire Builder": "🏛️",
  Legend: "👑"
};

export default function RankBadge({ size = "md" }) {
  const { rank } = useGamification();
  const big = size === "lg";

  return (
    <div className="row" style={{ gap: 10 }}>
      <span
        className="anim-rank-pulse"
        style={{ fontSize: big ? 38 : 26 }}
        aria-hidden="true"
      >
        {RANK_ICONS[rank.name] || "🛡"}
      </span>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: big ? 24 : 17,
            color: "var(--brand-gold)",
            textShadow: "0 0 16px rgba(250,204,21,0.4)"
          }}
        >
          {rank.name}
        </div>
        <div className="soft" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em" }}>
          Current Rank
        </div>
      </div>
    </div>
  );
}
