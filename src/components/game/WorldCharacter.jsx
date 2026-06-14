import React from "react";
import { TRAINERS } from "../../lib/constants.js";

/* ─── Trainer → body config ──────────────────────────────────────── */
const TRAINER_STYLES = {
  blaze:  { primary: "#FF3EDB", secondary: "#FF6B6B", glow: "#FF3EDB", aura: "#FF3EDB33" },
  sage:   { primary: "#00F0FF", secondary: "#0099CC", glow: "#00F0FF", aura: "#00F0FF33" },
  nova:   { primary: "#D11EFF", secondary: "#8B5CF6", glow: "#D11EFF", aura: "#D11EFF33" },
  titan:  { primary: "#FFD166", secondary: "#FF9500", glow: "#FFD166", aura: "#FFD16633" },
  ember:  { primary: "#00FFBF", secondary: "#00CC99", glow: "#00FFBF", aura: "#00FFBF33" },
  storm:  { primary: "#7B2CFF", secondary: "#5B0EFF", glow: "#7B2CFF", aura: "#7B2CFF33" },
};

const DEFAULT_STYLE = { primary: "#00F0FF", secondary: "#0099CC", glow: "#00F0FF", aura: "#00F0FF33" };

export default function WorldCharacter({ trainerId, rankName, initials, size = 64 }) {
  const trainer = TRAINERS.find(t => t.id === trainerId) || TRAINERS[0];
  const style = TRAINER_STYLES[trainerId] || DEFAULT_STYLE;
  const s = size;
  const scale = s / 64;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      animation: "wc-float 4s ease-in-out infinite",
    }}>
      {/* Rank badge above */}
      <div style={{
        fontSize: 7,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.1em",
        color: style.primary,
        background: `${style.primary}18`,
        border: `1px solid ${style.primary}44`,
        borderRadius: 4,
        padding: "1px 5px",
        textTransform: "uppercase",
        boxShadow: `0 0 6px ${style.aura}`,
        whiteSpace: "nowrap",
      }}>
        ⚔ {rankName || "RECRUIT"}
      </div>

      {/* Trainer icon floating above character */}
      <div style={{
        fontSize: 12 * scale,
        marginBottom: -4,
        filter: `drop-shadow(0 0 6px ${style.glow})`,
        animation: "wc-icon-float 3s ease-in-out infinite",
      }}>
        {trainer.icon}
      </div>

      {/* SVG character body */}
      <div style={{ position: "relative" }}>
        {/* Aura ring */}
        <div style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 60%, ${style.aura} 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "wc-aura-pulse 3s ease-in-out infinite",
        }} />

        <svg
          width={s}
          height={s * 1.4}
          viewBox="0 0 64 90"
          fill="none"
          style={{ display: "block", filter: `drop-shadow(0 0 8px ${style.glow}88)` }}
        >
          {/* Head */}
          <circle cx="32" cy="16" r="11" fill={style.secondary} stroke={style.primary} strokeWidth="1.5" />
          {/* Face visor */}
          <ellipse cx="32" cy="15" rx="7" ry="5" fill={style.primary} opacity="0.25" />
          {/* Eyes */}
          <circle cx="28.5" cy="14.5" r="2" fill={style.primary} />
          <circle cx="35.5" cy="14.5" r="2" fill={style.primary} />
          {/* Eye glow */}
          <circle cx="28.5" cy="14.5" r="1" fill="white" opacity="0.9" />
          <circle cx="35.5" cy="14.5" r="1" fill="white" opacity="0.9" />

          {/* Neck */}
          <rect x="29" y="26" width="6" height="5" fill={style.secondary} rx="1" />

          {/* Torso — armored chest */}
          <path d="M18 31 Q18 28 32 28 Q46 28 46 31 L44 56 Q44 58 32 58 Q20 58 20 56 Z"
            fill={style.secondary} stroke={style.primary} strokeWidth="1.2" />
          {/* Chest plate */}
          <path d="M24 32 Q32 30 40 32 L38 50 Q32 52 26 50 Z"
            fill={style.primary} opacity="0.2" />
          {/* Chest emblem */}
          <circle cx="32" cy="40" r="4" fill={style.primary} opacity="0.5" />
          <circle cx="32" cy="40" r="2" fill={style.primary} />

          {/* Left arm */}
          <path d="M20 31 Q14 35 12 46 Q11 52 14 55 Q17 58 19 55 L22 45 L20 31"
            fill={style.secondary} stroke={style.primary} strokeWidth="1" />
          {/* Left hand */}
          <circle cx="15" cy="56" r="4" fill={style.primary} opacity="0.7" />

          {/* Right arm */}
          <path d="M44 31 Q50 35 52 46 Q53 52 50 55 Q47 58 45 55 L42 45 L44 31"
            fill={style.secondary} stroke={style.primary} strokeWidth="1" />
          {/* Right hand / weapon glow */}
          <circle cx="49" cy="56" r="4" fill={style.primary} opacity="0.7" />
          <circle cx="49" cy="56" r="6" fill={style.primary} opacity="0.15" />

          {/* Belt */}
          <rect x="22" y="56" width="20" height="4" rx="2" fill={style.primary} opacity="0.5" />
          <circle cx="32" cy="58" r="2" fill={style.primary} opacity="0.8" />

          {/* Left leg */}
          <path d="M24 60 L22 80 Q22 84 26 84 Q30 84 30 80 L30 60 Z"
            fill={style.secondary} stroke={style.primary} strokeWidth="1" />
          {/* Left boot */}
          <ellipse cx="26" cy="84" rx="6" ry="3" fill={style.primary} opacity="0.6" />

          {/* Right leg */}
          <path d="M40 60 L42 80 Q42 84 38 84 Q34 84 34 80 L34 60 Z"
            fill={style.secondary} stroke={style.primary} strokeWidth="1" />
          {/* Right boot */}
          <ellipse cx="38" cy="84" rx="6" ry="3" fill={style.primary} opacity="0.6" />

          {/* Ground energy ring */}
          <ellipse cx="32" cy="87" rx="14" ry="3" fill={style.primary} opacity="0.15" />
          <ellipse cx="32" cy="87" rx="10" ry="2" fill={style.primary} opacity="0.25" />
        </svg>
      </div>

      {/* Trainer name below */}
      <div style={{
        fontSize: 7,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.12em",
        color: `${style.primary}88`,
        textTransform: "uppercase",
      }}>
        {trainer.name}
      </div>
    </div>
  );
}
