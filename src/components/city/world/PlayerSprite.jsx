import React from "react";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — the player
// A walkable Seeker: same silhouette family as HeroSprite in map-quest/kit
// (hooded, dark body, glowing chest core) but drawn with two separate legs
// so CSS can swing them for a real walk cycle. The wrapper element (owned
// by WorldScene) carries the engine transform + facing/walk classes; this
// component only draws.
//
// PHASE-2 CITIZEN HOOK: this is the single render point for the player.
// Avatar cosmetics (variant, gear, aura color from zone identity) land
// here as props when The Citizen ships.
// ════════════════════════════════════════════════════════════════════════

export default function PlayerSprite({ glow = "#00F0FF", size = 50 }) {
  const h = Math.round(size * 1.6);
  return (
    <svg
      className="mqw-char__svg"
      width={size}
      height={h}
      viewBox="0 0 60 96"
      style={{ "--char-glow-soft": `${glow}55` }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mqwCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.9" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="30" cy="92" rx="16" ry="3.5" fill={glow} opacity="0.22" />

      {/* legs — separate paths so the walk cycle can swing them */}
      <g className="mqw-char__leg mqw-char__leg--l">
        <path
          d="M26 58 C25 68 24 78 24 86 L29 86 C29.5 78 30 68 30 60 Z"
          fill="#0a0f1c"
          stroke={glow}
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <path d="M23 86 L30 86 L30 89 L22 89 Z" fill={glow} opacity="0.5" />
      </g>
      <g className="mqw-char__leg mqw-char__leg--r">
        <path
          d="M34 58 C35 68 36 78 36 86 L31 86 C30.5 78 30 68 30 60 Z"
          fill="#0a0f1c"
          stroke={glow}
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <path d="M30 86 L37 86 L38 89 L30 89 Z" fill={glow} opacity="0.5" />
      </g>

      {/* cloaked body */}
      <path
        d="M30 22 C20 26 17 38 18 56 C18.5 62 23 64 30 64 C37 64 41.5 62 42 56 C43 38 40 26 30 22 Z"
        fill="#0a0f1c"
        fillOpacity="0.97"
        stroke={glow}
        strokeOpacity="0.6"
        strokeWidth="1.4"
      />

      {/* hood + face */}
      <path
        d="M30 4 C21 4 17 13 18.5 23 C22 18 26 16.5 30 16.5 C34 16.5 38 18 41.5 23 C43 13 39 4 30 4 Z"
        fill="#0a0f1c"
        fillOpacity="0.98"
        stroke={glow}
        strokeOpacity="0.7"
        strokeWidth="1.4"
      />
      <ellipse cx="30" cy="15.5" rx="6" ry="7" fill="#05070d" />
      <circle cx="27.4" cy="15" r="1.2" fill={glow} />
      <circle cx="32.6" cy="15" r="1.2" fill={glow} />

      {/* chest core */}
      <circle cx="30" cy="40" r="7" fill="url(#mqwCore)" />
      <circle cx="30" cy="40" r="2.6" fill={glow} />
      <path
        d="M23 30 L30 37 L37 30"
        fill="none"
        stroke={glow}
        strokeOpacity="0.5"
        strokeWidth="1"
      />
    </svg>
  );
}
