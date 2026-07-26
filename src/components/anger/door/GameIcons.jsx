import React from "react";

/* ════════════════════════════════════════════════════════════════════════
   GAME ICONS — every glyph in The Door that used to be an emoji.

   THE LAW: this game ships zero emoji. Not in the scene, not in the HUD,
   not on a button, not in a round label. Everything is drawn.

   One <IconSheet/> mounts once per stage and defines every <symbol>.
   <GameIcon name/> then costs a single <use> — no path duplication no
   matter how many times an icon appears.

   Style: 24×24 grid, heavy strokes, chunky silhouettes, a warm/cool two-tone
   so they read as props from the world rather than flat UI furniture.
   Colour comes from `currentColor` (usually --lvacc) unless an icon needs
   its own palette to be legible (blood, sparks, sky states).
   ════════════════════════════════════════════════════════════════════════ */

const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const SOLID = { fill: "currentColor" };

export function IconSheet() {
  return (
    <svg className="dg-iconsheet" aria-hidden focusable="false" width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        {/* ── DOORBELL — mounting plate, lit button, two screws ────────── */}
        <symbol id="dgi-bell" viewBox="0 0 24 24">
          <rect x="6.5" y="2.5" width="11" height="19" rx="3" {...S} />
          <circle cx="12" cy="10" r="4.2" {...S} />
          <circle cx="12" cy="10" r="1.9" {...SOLID} />
          <path d="M12 17.4v1.6" {...S} />
          <circle cx="12" cy="4.6" r=".8" {...SOLID} />
          <circle cx="12" cy="19.6" r=".8" {...SOLID} />
        </symbol>

        {/* ── ROCK — faceted stone, interior break lines ───────────────── */}
        <symbol id="dgi-rock" viewBox="0 0 24 24">
          <path d="M4 13.5 7 5.5l6-2.2 6 4.2 1 7.4-4.6 5.4-8.6-.6z" {...S} />
          <path d="M7 5.5l4.5 5.2 7.5-3.2M11.5 10.7l-.8 9.2M11.5 10.7l7.9 4.2" {...S} strokeWidth="1.4" opacity=".65" />
        </symbol>

        {/* ── CHAINSAW — engine block, guard, bar with teeth ───────────── */}
        <symbol id="dgi-saw" viewBox="0 0 24 24">
          <path d="M2.5 9.5h6.2v5.6H2.5a1.2 1.2 0 0 1-1.2-1.2v-3.2a1.2 1.2 0 0 1 1.2-1.2z" {...S} />
          <path d="M8.7 10.6h9.6a2.4 2.4 0 0 1 0 4.8H8.7z" {...S} />
          <path d="M9.6 10.6v-1.4M11.8 10.6v-1.4M14 10.6v-1.4M16.2 10.6v-1.4M18.4 10.7v-1.5" {...S} strokeWidth="1.5" />
          <path d="M4 9.4V7.2h3.4" {...S} strokeWidth="1.5" />
        </symbol>

        {/* ── FIST — knuckle-side view, four MCP domes ─────────────────── */}
        <symbol id="dgi-fist" viewBox="0 0 24 24">
          <path d="M4.4 10.2a2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 1.9-1.8 1.9 1.9 0 0 1 1.9 1.9v3.6c0 3.4-2.9 6-6.6 6h-2.4c-3.7 0-6.8-2.6-6.8-6.2z" {...S} />
          <path d="M4.5 14.6h15" {...S} strokeWidth="1.3" opacity=".55" />
        </symbol>

        {/* ── BOXING GLOVE ────────────────────────────────────────────── */}
        <symbol id="dgi-glove" viewBox="0 0 24 24">
          <path d="M6.6 4.4h7.2a5.4 5.4 0 0 1 5.4 5.4v2.4a4 4 0 0 1-4 4H6.6z" {...S} />
          <path d="M6.6 10.4H4.4a2 2 0 0 0 0 4h2.2" {...S} />
          <path d="M6.4 16.2h12.2v2a1.6 1.6 0 0 1-1.6 1.6H8a1.6 1.6 0 0 1-1.6-1.6z" {...S} />
        </symbol>

        {/* ── OPEN HAND (the slap) ────────────────────────────────────── */}
        <symbol id="dgi-hand" viewBox="0 0 24 24">
          <path d="M8.6 12V4.6a1.5 1.5 0 0 1 3 0V11M11.6 11V3.4a1.5 1.5 0 0 1 3 0V11M14.6 11.2V5a1.5 1.5 0 0 1 3 0v7.6" {...S} />
          <path d="M8.6 12V8.8a1.5 1.5 0 0 0-3 0v6.4c0 3.2 2.4 5.4 5.8 5.4h1.8c3.4 0 6.4-2.2 6.4-5.8v-2.6" {...S} />
        </symbol>

        {/* ── BOOT (the kick-down) ────────────────────────────────────── */}
        <symbol id="dgi-boot" viewBox="0 0 24 24">
          <path d="M7 3.4h4.6v8.2l6.2 2.8a2.6 2.6 0 0 1 1.6 2.4v1.8H7z" {...S} />
          <path d="M4.6 18.6h15.8v2H4.6z" {...SOLID} />
          <path d="M11.6 7.4h-4M11.6 10.2h-4" {...S} strokeWidth="1.4" opacity=".6" />
        </symbol>

        {/* ── DUCK (hold to dodge) ────────────────────────────────────── */}
        <symbol id="dgi-duck" viewBox="0 0 24 24">
          <circle cx="12" cy="14.6" r="3.4" {...S} />
          <path d="M6.4 16.6c0-4.6 2.5-8 5.6-8s5.6 3.4 5.6 8" {...S} strokeWidth="1.5" opacity=".5" />
          <path d="M7.6 4.2 12 8.4l4.4-4.2" {...S} />
        </symbol>

        {/* ── DOOR ────────────────────────────────────────────────────── */}
        <symbol id="dgi-door" viewBox="0 0 24 24">
          <path d="M5.4 2.6h13.2v18.8H5.4z" {...S} />
          <rect x="8" y="5.4" width="8" height="5.2" rx=".8" {...S} strokeWidth="1.4" opacity=".7" />
          <rect x="8" y="12.6" width="8" height="5.2" rx=".8" {...S} strokeWidth="1.4" opacity=".7" />
          <circle cx="16.4" cy="12" r="1.1" {...SOLID} />
        </symbol>

        {/* ── BLOOD DROP ──────────────────────────────────────────────── */}
        <symbol id="dgi-blood" viewBox="0 0 24 24">
          <path d="M12 2.6c3.6 4.6 6.4 8.2 6.4 11.4A6.4 6.4 0 0 1 12 20.4a6.4 6.4 0 0 1-6.4-6.4c0-3.2 2.8-6.8 6.4-11.4z" {...S} />
          <path d="M9.2 14.2a2.8 2.8 0 0 0 2.8 2.8" {...S} strokeWidth="1.4" opacity=".6" />
        </symbol>

        {/* ── TOILET (the throne) ─────────────────────────────────────── */}
        <symbol id="dgi-throne" viewBox="0 0 24 24">
          <path d="M15.4 2.8h4.2v6.4h-4.2z" {...S} strokeWidth="1.6" />
          <path d="M4.4 9.4h15v2.2c0 3.4-2.6 6.2-6 6.4l-1 2.8H8.8l-1-2.9c-2-.9-3.4-2.9-3.4-5.3z" {...S} />
          <path d="M7.4 12.2h8.4" {...S} strokeWidth="1.4" opacity=".55" />
        </symbol>

        {/* ── BARRIER (the breach) ────────────────────────────────────── */}
        <symbol id="dgi-barrier" viewBox="0 0 24 24">
          <rect x="2.6" y="7" width="18.8" height="5.6" rx="1" {...S} />
          <path d="M6.4 7 3.4 12.6M11 7l-3 5.6M15.6 7l-3 5.6M20.2 7l-3 5.6" {...S} strokeWidth="1.5" opacity=".75" />
          <path d="M5.6 12.6v8M18.4 12.6v8" {...S} />
        </symbol>

        {/* ── RING CAM ────────────────────────────────────────────────── */}
        <symbol id="dgi-cam" viewBox="0 0 24 24">
          <rect x="7" y="2.4" width="10" height="19.2" rx="3.4" {...S} />
          <circle cx="12" cy="8" r="3.2" {...S} />
          <circle cx="12" cy="8" r="1.3" {...SOLID} />
          <circle cx="12" cy="16.6" r="2.2" {...S} strokeWidth="1.5" opacity=".7" />
        </symbol>

        {/* ── SHIELD (solid steel) ────────────────────────────────────── */}
        <symbol id="dgi-shield" viewBox="0 0 24 24">
          <path d="M12 2.4 20 5.4v6.2c0 4.6-3.2 8.4-8 10-4.8-1.6-8-5.4-8-10V5.4z" {...S} />
          <path d="M12 7v8.4" {...S} strokeWidth="1.5" opacity=".6" />
        </symbol>

        {/* ── FENCE / GATE ────────────────────────────────────────────── */}
        <symbol id="dgi-gate" viewBox="0 0 24 24">
          <path d="M3 6.4h18M3 11h18M3 15.6h18" {...S} strokeWidth="1.5" opacity=".5" />
          <path d="M6 3.6v17M12 3.6v17M18 3.6v17" {...S} />
          <path d="M6 3.6 4.4 2M12 3.6 10.4 2M18 3.6 16.4 2" {...S} strokeWidth="1.4" />
        </symbol>

        {/* ── SPARK / HEAT ────────────────────────────────────────────── */}
        <symbol id="dgi-flame" viewBox="0 0 24 24">
          <path d="M13 2.4c.8 3.4-1.2 4.8-2.8 6.4-1.8 1.8-3.4 3.6-3.4 6.4A6.2 6.2 0 0 0 13 21.4a6.2 6.2 0 0 0 6.2-6.2c0-4-2.6-5.6-3.4-8.2-1 1.2-1.6 2-2.4 2.4.4-2.4.2-5-.4-7z" {...S} />
        </symbol>

        {/* ── STAR (Punch-Out power) ──────────────────────────────────── */}
        <symbol id="dgi-star" viewBox="0 0 24 24">
          <path d="m12 2.4 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6L2.4 9.4l6.7-.9z" {...S} />
        </symbol>

        {/* ── X (the NO counter) ──────────────────────────────────────── */}
        <symbol id="dgi-x" viewBox="0 0 24 24">
          <path d="M5.4 5.4 18.6 18.6M18.6 5.4 5.4 18.6" {...S} strokeWidth="2.8" />
        </symbol>

        {/* ── CHEVRON — dodge/walk direction. Flip with .is-flip. ─────── */}
        <symbol id="dgi-chev" viewBox="0 0 24 24">
          <path d="m8.4 3.6 9 8.4-9 8.4" {...S} strokeWidth="3.2" />
        </symbol>

        {/* ── CHECK (cleared) ─────────────────────────────────────────── */}
        <symbol id="dgi-check" viewBox="0 0 24 24">
          <path d="m4.6 12.6 4.8 4.8L19.4 6.4" {...S} strokeWidth="2.8" />
        </symbol>

        {/* ── SKY STATES — morning → 3AM ──────────────────────────────── */}
        <symbol id="dgi-sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4.4" {...S} />
          <path d="M12 1.8v2.6M12 19.6v2.6M22.2 12h-2.6M4.4 12H1.8M19.2 4.8l-1.9 1.9M6.7 17.3l-1.9 1.9M19.2 19.2l-1.9-1.9M6.7 6.7 4.8 4.8" {...S} strokeWidth="1.8" />
        </symbol>
        <symbol id="dgi-sunhaze" viewBox="0 0 24 24">
          <circle cx="10" cy="9" r="3.6" {...S} />
          <path d="M10 2.6v1.8M4.4 9H2.6M15.6 4.4l-1.3 1.3M5.7 13.3 4.4 14.6M5.7 4.7 4.4 3.4" {...S} strokeWidth="1.6" opacity=".8" />
          <path d="M8.4 19.4h9.2a3.2 3.2 0 0 0 0-6.4 4.6 4.6 0 0 0-8.8-1 3.7 3.7 0 0 0-.4 7.4z" {...S} />
        </symbol>
        <symbol id="dgi-sunset" viewBox="0 0 24 24">
          <path d="M6.6 15.4a5.4 5.4 0 0 1 10.8 0" {...S} />
          <path d="M2.4 15.4h19.2" {...S} strokeWidth="2.4" />
          <path d="M4.6 19.2h5.2M13.6 19.2h5.8" {...S} strokeWidth="1.6" opacity=".6" />
          <path d="M12 3.4v2.4M4.9 6.5 6.6 8.2M19.1 6.5 17.4 8.2" {...S} strokeWidth="1.6" opacity=".7" />
        </symbol>
        <symbol id="dgi-moon" viewBox="0 0 24 24">
          <path d="M20.4 14.6A8.8 8.8 0 0 1 9.4 3.6a8.8 8.8 0 1 0 11 11z" {...S} />
        </symbol>
        <symbol id="dgi-night" viewBox="0 0 24 24">
          <path d="M2.4 20.4V12h3.8V8.6H10v-4h4.4v6.2h3.4v3H21.6v6.6z" {...S} />
          <path d="M7.8 14.4v1.6M12 13v1.6M16.4 15.2v1.6" {...S} strokeWidth="1.5" opacity=".7" />
        </symbol>
      </defs>
    </svg>
  );
}

/* Every name the game may reference. Keeping it explicit means a typo in a
   level config fails loudly at review instead of rendering an empty box. */
export const ICONS = [
  "bell", "rock", "saw", "fist", "glove", "hand", "boot", "duck", "door",
  "blood", "throne", "barrier", "cam", "shield", "gate", "flame", "star",
  "x", "check", "chev", "sun", "sunhaze", "sunset", "moon", "night",
];

export function GameIcon({ name, size = 16, className = "", style, title }) {
  if (!name) return null;
  return (
    <svg
      className={`dg-ico ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      style={style}
    >
      {title ? <title>{title}</title> : null}
      <use href={`#dgi-${name}`} />
    </svg>
  );
}

/* ── FIST HUD — replaces the old glyph, with real Bloody-Knuckles stages ──
   Damage is drawn, not filtered: abrasion at 1, an open split at 2, a running
   sheet at 3, exposed bone at 4. Same 0..4 scale the engine already tracks. */
export function FistIcon({ damage = 0, size = 26 }) {
  const d = Math.max(0, Math.min(4, damage));
  return (
    <svg className="dg-fistico" width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <defs>
        <clipPath id={`dgfc-${d}`}>
          <path d="M4.4 10.2a2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 1.9-1.8 1.9 1.9 0 0 1 1.9 1.9v3.6c0 3.4-2.9 6-6.6 6h-2.4c-3.7 0-6.8-2.6-6.8-6.2z" />
        </clipPath>
      </defs>

      {/* hand mass */}
      <path
        d="M4.4 10.2a2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1 1.9-1.8 1.9 1.9 0 0 1 1.9 1.9v3.6c0 3.4-2.9 6-6.6 6h-2.4c-3.7 0-6.8-2.6-6.8-6.2z"
        fill={d >= 4 ? "#c99183" : d >= 2 ? "#d8a08e" : "#e0ae9a"}
        stroke="#6d3b2c"
        strokeWidth="1.1"
      />

      <g clipPath={`url(#dgfc-${d})`}>
        {/* knuckle shading — the 2nd/3rd MCP sit proudest, so they wear first */}
        <ellipse cx="10.4" cy="9.6" rx="2.1" ry="1.7" fill="#00000018" />
        <ellipse cx="14.4" cy="9.6" rx="2.1" ry="1.7" fill="#00000018" />

        {/* 1 RAW — abrasion on the two lead knuckles */}
        {d >= 1 && (
          <>
            <ellipse cx="10.4" cy="9.2" rx="1.7" ry="1.2" fill="#c0392b" opacity=".62" />
            <ellipse cx="14.4" cy="9.2" rx="1.6" ry="1.1" fill="#c0392b" opacity=".55" />
          </>
        )}

        {/* 2 SPLIT — an open laceration across the middle knuckle */}
        {d >= 2 && (
          <>
            <path d="M8.7 9.1c1.2-.7 2.5-.7 3.6 0" stroke="#7e0512" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M12.8 9.3c1-.6 2.1-.6 3.1 0" stroke="#8d0a16" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* 3 DRIPPING — a sheet running down the back of the hand */}
        {d >= 3 && (
          <>
            <path d="M9.4 9.6c-.3 3.2.2 5.6 1 7.6M11.6 9.8c.2 3-.1 5.4-.6 7.2M14.6 10c.3 2.6.2 4.8-.2 6.6" stroke="#8d0a16" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".8" />
            <path d="M6 13.8c4.6 1.5 8.4 1.4 12.4-.2v3.2c-4 1.5-8 1.5-12.4 0z" fill="#7e0512" opacity=".42" />
          </>
        )}

        {/* 4 BONE-DEEP — the wound opens on a grey-white glint */}
        {d >= 4 && (
          <>
            <path d="M8.9 8.9c1.2-.9 2.4-.9 3.5 0-.5.9-1 1.3-1.8 1.3s-1.3-.4-1.7-1.3z" fill="#5c020c" />
            <path d="M9.8 9c.5-.3 1-.3 1.5 0-.2.4-.5.5-.8.5s-.5-.1-.7-.5z" fill="#e8e2d6" />
            <path d="M13.1 9.2c1-.8 2-.8 2.9 0-.4.8-.9 1.1-1.5 1.1s-1-.3-1.4-1.1z" fill="#5c020c" />
          </>
        )}
      </g>
    </svg>
  );
}

export default GameIcon;
