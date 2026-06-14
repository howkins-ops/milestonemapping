import React, { useState } from "react";
import { useGamification } from "../../hooks/useGamification.js";

export default function GameHUD({ currentPage, onNavigate }) {
  const { xp, rank, nextRank, progress } = useGamification();
  const [pressed, setPressed] = useState(false);

  const handleLogoClick = () => {
    if (currentPage !== "dashboard") {
      onNavigate("dashboard");
    }
  };

  // Don't show HUD on settings page
  if (currentPage === "settings") return null;

  return (
    <div className="game-hud" aria-label="Game HUD" role="banner">
      <div className="game-hud__bar">
        {/* Phoenix logo + app name */}
        <button
          className="game-hud__logo"
          onClick={handleLogoClick}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: currentPage !== "dashboard" ? "pointer" : "default",
            pointerEvents: "all",
          }}
          aria-label="Go to world map"
        >
          <span className="game-hud__logo-phoenix">🔥</span>
          <span className="game-hud__title">MILESTONE</span>
        </button>

        {/* XP bar */}
        <div className="game-hud__xp-section">
          <div
            className="game-hud__xp-track"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="XP progress to next rank"
          >
            <div
              className="game-hud__xp-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Rank badge */}
        <button
          className="game-hud__rank"
          onClick={() => onNavigate("stats")}
          style={{
            background: "transparent",
            border: "none",
            padding: "4px 8px",
            cursor: "pointer",
            pointerEvents: "all",
          }}
          aria-label={`Current rank: ${rank?.name || "Recruit"}. Click to view stats.`}
        >
          ⚔ {rank?.name || "RECRUIT"}
        </button>
      </div>
    </div>
  );
}
