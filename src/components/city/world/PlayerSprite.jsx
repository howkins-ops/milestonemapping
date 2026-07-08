import React from "react";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — the player (Phase 5 · THE SEEKER, ALIVE)
// Same silhouette family as HeroSprite in map-quest/kit (hooded, dark
// body, glowing chest core) but fully articulated: separate cloak, two
// arms, two legs and a head group so CSS can drive a real state machine
// (idle breathe/blink/fidget · walk · run · skid · coil/apex/fall/land).
// Gradient shading + a rim-light stroke on the camera side. The wrapper
// element (owned by WorldScene) carries the engine transform + state
// classes; this component only draws. Still one SVG, still < 4KB.
//
// PHASE-2 CITIZEN HOOK: this is the single render point for the player.
// Avatar cosmetics (variant, gear, aura color from zone identity) land
// here as props when The Citizen ships. `boots` is the first cosmetic —
// the 25km odometer trim (Phase 9).
// ════════════════════════════════════════════════════════════════════════

export default function PlayerSprite({ glow = "#00F0FF", size = 50, boots = false }) {
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
        <linearGradient id="mqwBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#111a2e" />
          <stop offset="100%" stopColor="#070c18" />
        </linearGradient>
        <linearGradient id="mqwCloak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1424" />
          <stop offset="100%" stopColor="#050912" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="30" cy="92" rx="16" ry="3.5" fill={glow} opacity="0.22" />

      {/* back cloak — its own cloth, sways on walk, streams at a run */}
      <g className="mqw-char__cloak">
        <path
          d="M27 24 C18 30 14 44 15 60 C15.5 66 19 68 24 67 C22 52 23 36 30 26 Z"
          fill="url(#mqwCloak)"
          stroke={glow}
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      </g>

      {/* legs — separate paths so the walk cycle can swing them */}
      <g className="mqw-char__leg mqw-char__leg--l">
        <path
          d="M26 58 C25 68 24 78 24 86 L29 86 C29.5 78 30 68 30 60 Z"
          fill="#0a0f1c"
          stroke={glow}
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <path d="M23 86 L30 86 L30 89 L22 89 Z" fill={glow} opacity={boots ? 0.85 : 0.5} />
        {boots ? <path d="M23 84 L30 84 L30 86 L23 86 Z" fill="#FFD166" opacity="0.7" /> : null}
      </g>
      <g className="mqw-char__leg mqw-char__leg--r">
        <path
          d="M34 58 C35 68 36 78 36 86 L31 86 C30.5 78 30 68 30 60 Z"
          fill="#0a0f1c"
          stroke={glow}
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <path d="M30 86 L37 86 L38 89 L30 89 Z" fill={glow} opacity={boots ? 0.85 : 0.5} />
        {boots ? <path d="M30 84 L37 84 L37 86 L30 86 Z" fill="#FFD166" opacity="0.7" /> : null}
      </g>

      {/* back arm (far side — dimmer) */}
      <g className="mqw-char__arm mqw-char__arm--r">
        <path
          d="M38 32 C41 38 42 46 41 52 C40.2 54.5 37.5 54.5 37 52 C37.5 45 37 38 36 33 Z"
          fill="#080d1a"
          stroke={glow}
          strokeOpacity="0.3"
          strokeWidth="0.8"
        />
      </g>

      {/* cloaked body — gradient shade + rim light on the camera side */}
      <path
        d="M30 22 C20 26 17 38 18 56 C18.5 62 23 64 30 64 C37 64 41.5 62 42 56 C43 38 40 26 30 22 Z"
        fill="url(#mqwBody)"
        fillOpacity="0.98"
        stroke={glow}
        strokeOpacity="0.6"
        strokeWidth="1.4"
      />
      {/* rim light — brighter edge facing the camera */}
      <path
        d="M39.5 28 C42 36 42.6 47 42 56"
        fill="none"
        stroke={glow}
        strokeOpacity="0.5"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* front arm (camera side) */}
      <g className="mqw-char__arm mqw-char__arm--l">
        <path
          d="M22 32 C19 38 18 46 19 52 C19.8 54.5 22.5 54.5 23 52 C22.5 45 23 38 24 33 Z"
          fill="#0b1120"
          stroke={glow}
          strokeOpacity="0.42"
          strokeWidth="1"
        />
      </g>

      {/* head group — hood, face, eyes (blinkable) */}
      <g className="mqw-char__head">
        <path
          d="M30 4 C21 4 17 13 18.5 23 C22 18 26 16.5 30 16.5 C34 16.5 38 18 41.5 23 C43 13 39 4 30 4 Z"
          fill="#0a0f1c"
          fillOpacity="0.98"
          stroke={glow}
          strokeOpacity="0.7"
          strokeWidth="1.4"
        />
        <ellipse cx="30" cy="15.5" rx="6" ry="7" fill="#05070d" />
        <g className="mqw-char__eyes">
          <circle cx="27.4" cy="15" r="1.2" fill={glow} />
          <circle cx="32.6" cy="15" r="1.2" fill={glow} />
        </g>
      </g>

      {/* chest core — breathes on idle */}
      <g className="mqw-char__core">
        <circle cx="30" cy="40" r="7" fill="url(#mqwCore)" />
        <circle cx="30" cy="40" r="2.6" fill={glow} />
      </g>
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
