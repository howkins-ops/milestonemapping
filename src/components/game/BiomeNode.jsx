import React, { useState } from "react";
import { getProjectColorHex } from "../../lib/constants.js";

/* ─── Category → biome visual config ──────────────────────────── */
const BIOME_MAP = {
  Business:         { terrain: "city",      bg: "linear-gradient(160deg,#0a1628 60%,#0d2040)", accent: "#00F0FF", terrainIcon: "🏙️", fogColor: "rgba(0,240,255,0.06)" },
  Fitness:          { terrain: "volcano",   bg: "linear-gradient(160deg,#1a0a0a 60%,#2d0a00)", accent: "#FF3EDB", terrainIcon: "🌋", fogColor: "rgba(255,62,219,0.06)" },
  Money:            { terrain: "vault",     bg: "linear-gradient(160deg,#131000 60%,#1e1800)", accent: "#FACC15", terrainIcon: "🏦", fogColor: "rgba(250,204,21,0.06)" },
  Faith:            { terrain: "temple",    bg: "linear-gradient(160deg,#0d0a1a 60%,#170d2a)", accent: "#D11EFF", terrainIcon: "⛩️", fogColor: "rgba(209,30,255,0.06)" },
  Relationships:    { terrain: "town",      bg: "linear-gradient(160deg,#0a1a10 60%,#0a2015)", accent: "#00FFBF", terrainIcon: "🏘️", fogColor: "rgba(0,255,191,0.06)" },
  "Personal Growth":{ terrain: "forest",   bg: "linear-gradient(160deg,#0a150a 60%,#0d1a0a)", accent: "#00FFBF", terrainIcon: "🌲", fogColor: "rgba(0,255,191,0.05)" },
  Sales:            { terrain: "arena",     bg: "linear-gradient(160deg,#1a0808 60%,#2a0808)", accent: "#FF3B5C", terrainIcon: "⚔️",  fogColor: "rgba(255,59,92,0.06)" },
  Health:           { terrain: "sanctuary", bg: "linear-gradient(160deg,#0a1a14 60%,#061810)", accent: "#00F0FF", terrainIcon: "🏥", fogColor: "rgba(0,240,255,0.05)" },
};

const DEFAULT_BIOME = { terrain: "realm", bg: "linear-gradient(160deg,#0a0a1a 60%,#10102a)", accent: "#8B5CF6", terrainIcon: "🌐", fogColor: "rgba(139,92,246,0.06)" };

/* ─── Progress → visual tier ────────────────────────────────────── */
function getTier(pct) {
  if (pct >= 100) return 4; // completed — crown
  if (pct >= 75)  return 3; // blazing
  if (pct >= 50)  return 2; // active
  if (pct >= 25)  return 1; // emerging
  return 0;                  // ruins
}

const TIER_LABELS = ["RUINS", "EMERGING", "ACTIVE", "BLAZING", "COMPLETED"];
const TIER_BRIGHTNESS = [0.25, 0.5, 0.75, 0.9, 1.0];

/* ─── Building rows per tier ─────────────────────────────────────── */
function Buildings({ biome, tier, progress }) {
  const buildings = [];
  const count = Math.max(1, Math.floor(progress / 20)); // 1–5 buildings

  for (let i = 0; i < 5; i++) {
    const active = i < count;
    const h = 20 + i * 8;
    buildings.push(
      <div
        key={i}
        style={{
          width: 6 + i * 2,
          height: active ? h : Math.max(4, h * 0.15),
          background: active
            ? `linear-gradient(to top, ${biome.accent}44, ${biome.accent}99)`
            : "rgba(255,255,255,0.05)",
          borderRadius: "2px 2px 0 0",
          border: active ? `1px solid ${biome.accent}55` : "1px solid rgba(255,255,255,0.04)",
          boxShadow: active ? `0 0 6px ${biome.accent}44` : "none",
          alignSelf: "flex-end",
          transition: "height 0.6s ease, opacity 0.6s",
          opacity: active ? 1 : 0.2,
          position: "relative",
        }}
      >
        {active && tier >= 2 && (
          <div style={{
            position: "absolute",
            top: -2,
            left: "50%",
            transform: "translateX(-50%)",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: biome.accent,
            boxShadow: `0 0 4px ${biome.accent}`,
            animation: "biome-pulse 2s ease-in-out infinite",
          }} />
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 3,
      justifyContent: "center",
      marginBottom: 4,
    }}>
      {buildings}
    </div>
  );
}

/* ─── Fog layer ──────────────────────────────────────────────────── */
function FogLayer({ biome, tier }) {
  const fogOpacity = Math.max(0, 0.85 - tier * 0.2);
  if (fogOpacity <= 0) return null;
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse at 50% 80%, rgba(0,0,0,0.0) 0%, rgba(0,0,0,${fogOpacity * 0.6}) 100%)`,
      pointerEvents: "none",
    }} />
  );
}

/* ─── Main BiomeNode ─────────────────────────────────────────────── */
export default function BiomeNode({ project, progress, milestones, onClick, style }) {
  const [hovered, setHovered] = useState(false);
  const biome = BIOME_MAP[project.category] || DEFAULT_BIOME;
  const tier = getTier(progress);
  const brightness = TIER_BRIGHTNESS[tier];
  const colorHex = getProjectColorHex(project.color);
  const completedMilestones = (milestones || []).filter(m => m.status === "completed").length;
  const totalMilestones = (milestones || []).length;
  const isComplete = tier === 4;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        transform: hovered ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.2s ease",
        ...style,
      }}
    >
      {/* Floating project icon */}
      <div style={{
        fontSize: 22,
        marginBottom: 4,
        filter: `drop-shadow(0 0 8px ${biome.accent}) brightness(${brightness})`,
        animation: isComplete ? "biome-complete-float 3s ease-in-out infinite" : `biome-float-${(project.id.charCodeAt(5) % 3)} 4s ease-in-out infinite`,
      }}>
        {project.icon}
      </div>

      {/* Crown for completed */}
      {isComplete && (
        <div style={{
          position: "absolute",
          top: -18,
          fontSize: 14,
          animation: "biome-crown-spin 4s ease-in-out infinite",
          filter: "drop-shadow(0 0 6px #FACC15)",
        }}>
          👑
        </div>
      )}

      {/* Biome territory card */}
      <div style={{
        width: 88,
        height: 80,
        borderRadius: 10,
        background: biome.bg,
        border: `1.5px solid ${biome.accent}${isComplete ? "cc" : "44"}`,
        boxShadow: hovered
          ? `0 0 20px ${biome.accent}44, inset 0 0 12px rgba(0,0,0,0.3)`
          : isComplete
            ? `0 0 16px ${biome.accent}55`
            : `0 0 8px ${biome.accent}22`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 6px 6px",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        filter: `brightness(${brightness})`,
      }}>
        {/* Fog overlay */}
        <FogLayer biome={biome} tier={tier} />

        {/* Terrain icon in bg */}
        <div style={{
          position: "absolute",
          top: 4,
          right: 6,
          fontSize: 20,
          opacity: 0.12 + tier * 0.06,
          filter: `brightness(${brightness})`,
          pointerEvents: "none",
        }}>
          {biome.terrainIcon}
        </div>

        {/* Buildings */}
        <Buildings biome={biome} tier={tier} progress={progress} />

        {/* Progress bar */}
        <div style={{
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: `linear-gradient(to right, ${biome.accent}88, ${biome.accent})`,
            borderRadius: 2,
            boxShadow: `0 0 4px ${biome.accent}`,
            transition: "width 1s ease",
          }} />
        </div>
      </div>

      {/* Project name */}
      <div style={{
        marginTop: 5,
        fontSize: 9,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.08em",
        color: hovered ? biome.accent : "rgba(234,251,255,0.6)",
        textTransform: "uppercase",
        textAlign: "center",
        maxWidth: 88,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        transition: "color 0.2s",
      }}>
        {project.title}
      </div>

      {/* Tier + milestone dots */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
      }}>
        <span style={{
          fontSize: 7,
          fontFamily: "var(--font-mono, monospace)",
          color: `${biome.accent}99`,
          letterSpacing: "0.06em",
        }}>
          {TIER_LABELS[tier]}
        </span>
        {totalMilestones > 0 && (
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: Math.min(totalMilestones, 5) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: i < completedMilestones ? biome.accent : "rgba(255,255,255,0.12)",
                  boxShadow: i < completedMilestones ? `0 0 3px ${biome.accent}` : "none",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* % label */}
      <div style={{
        fontSize: 8,
        fontFamily: "var(--font-mono, monospace)",
        color: `${biome.accent}88`,
        marginTop: 1,
      }}>
        {progress}%
      </div>
    </button>
  );
}
