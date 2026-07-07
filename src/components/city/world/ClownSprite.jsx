import React from "react";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — the street clowns
// Two flavors of stompable heckler, drawn as loud circus clowns so they
// clash with the neon city on purpose:
//   hater    — hot red/yellow polka suit, wild orange tufts, angry brows
//   naysayer — washed-out blue suit, droopy green hair, sleepy skeptic
//              eyes, and a little picket sign that just says NO
// Pure draw component — StreetEnemies owns patrol, squash and quips.
// ════════════════════════════════════════════════════════════════════════

const PALETTE = {
  hater: {
    suit: "#E23A50",
    suitDark: "#8f1f30",
    dots: "#FACC15",
    hair: "#FF7A1A",
    shoes: "#C21E3A",
    ruff: "#FACC15",
  },
  naysayer: {
    suit: "#3E4E86",
    suitDark: "#232c4e",
    dots: "#7FD1C0",
    hair: "#35C77F",
    shoes: "#2C3862",
    ruff: "#9FB2D8",
  },
};

export default function ClownSprite({ kind = "hater", size = 52 }) {
  const hater = kind !== "naysayer";
  const c = hater ? PALETTE.hater : PALETTE.naysayer;
  const h = Math.round(size * (70 / 56));

  return (
    <svg
      className="mqw-enemy__svg"
      width={size}
      height={h}
      viewBox="0 0 56 70"
      aria-hidden="true"
    >
      {/* ground shadow */}
      <ellipse cx="28" cy="67" rx="16" ry="3" fill="#000" opacity="0.4" />

      {/* comically long shoes */}
      <ellipse cx="16" cy="63.5" rx="12" ry="4.5" fill={c.shoes} stroke={c.suitDark} strokeWidth="1" />
      <ellipse cx="40" cy="63.5" rx="12" ry="4.5" fill={c.shoes} stroke={c.suitDark} strokeWidth="1" />

      {/* stubby legs */}
      <rect x="22" y="51" width="5" height="11" rx="2" fill={c.suitDark} />
      <rect x="29" y="51" width="5" height="11" rx="2" fill={c.suitDark} />

      {/* arms */}
      {hater ? (
        <>
          {/* fists-up hater stance */}
          <path d="M17 40 Q9 36 11 28" fill="none" stroke={c.suit} strokeWidth="4" strokeLinecap="round" />
          <path d="M39 40 Q47 36 45 28" fill="none" stroke={c.suit} strokeWidth="4" strokeLinecap="round" />
          <circle cx="11" cy="27" r="3" fill="#F6F2EA" />
          <circle cx="45" cy="27" r="3" fill="#F6F2EA" />
        </>
      ) : (
        <>
          {/* left arm slumped, right arm holds the NO sign */}
          <path d="M17 40 Q11 45 12 50" fill="none" stroke={c.suit} strokeWidth="4" strokeLinecap="round" />
          <path d="M39 39 Q46 33 46 27" fill="none" stroke={c.suit} strokeWidth="4" strokeLinecap="round" />
          <line x1="46" y1="27" x2="46" y2="9" stroke="#8a6b42" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="36" y="1" width="19" height="12" rx="2" fill="#F6F2EA" stroke="#8a6b42" strokeWidth="1.4" />
          <text
            x="45.5"
            y="10.4"
            textAnchor="middle"
            fontFamily="'Sora', sans-serif"
            fontSize="8.5"
            fontWeight="800"
            fill="#D7263D"
          >
            NO
          </text>
        </>
      )}

      {/* round polka-dot body */}
      <ellipse cx="28" cy="42" rx="13.5" ry="12.5" fill={c.suit} stroke={c.suitDark} strokeWidth="1.4" />
      <circle cx="22" cy="38" r="2" fill={c.dots} opacity="0.9" />
      <circle cx="34" cy="40" r="2" fill={c.dots} opacity="0.9" />
      <circle cx="25" cy="48" r="2" fill={c.dots} opacity="0.9" />
      <circle cx="28" cy="36.5" r="2.2" fill={c.dots} />
      <circle cx="28" cy="43" r="2.2" fill={c.dots} />

      {/* ruff collar */}
      <circle cx="21" cy="30.5" r="3.2" fill={c.ruff} />
      <circle cx="28" cy="31.5" r="3.4" fill={c.ruff} />
      <circle cx="35" cy="30.5" r="3.2" fill={c.ruff} />

      {/* hair tufts */}
      {hater ? (
        <>
          <circle cx="17" cy="14" r="4" fill={c.hair} />
          <circle cx="15" cy="19" r="3.4" fill={c.hair} />
          <circle cx="39" cy="14" r="4" fill={c.hair} />
          <circle cx="41" cy="19" r="3.4" fill={c.hair} />
        </>
      ) : (
        <>
          <ellipse cx="17.5" cy="18" rx="3.2" ry="5.4" fill={c.hair} />
          <ellipse cx="38.5" cy="18" rx="3.2" ry="5.4" fill={c.hair} />
          <path d="M24 10 Q28 6 32 10" fill="none" stroke={c.hair} strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {/* head */}
      <circle cx="28" cy="20" r="10" fill="#F6F2EA" stroke="rgba(10,4,20,0.55)" strokeWidth="1.2" />

      {/* face */}
      {hater ? (
        <>
          {/* angry slanted brows + glare */}
          <line x1="20.5" y1="13.5" x2="26" y2="16" stroke="#33121b" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="35.5" y1="13.5" x2="30" y2="16" stroke="#33121b" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="24" cy="18" r="1.6" fill="#33121b" />
          <circle cx="32" cy="18" r="1.6" fill="#33121b" />
          {/* big painted frown */}
          <path d="M22 27 Q28 22.5 34 27" fill="none" stroke="#B3122E" strokeWidth="2.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* one raised skeptical brow, half-lidded eyes */}
          <line x1="20" y1="12.5" x2="26" y2="14.5" stroke="#1d2438" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="30" y1="14.5" x2="36" y2="13.5" stroke="#1d2438" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M21.5 17.5 h5" stroke="#1d2438" strokeWidth="2" strokeLinecap="round" />
          <path d="M29.5 17.5 h5" stroke="#1d2438" strokeWidth="2" strokeLinecap="round" />
          {/* unimpressed wavy mouth */}
          <path d="M22 26 q3 2 6 0 q3 -2 6 0" fill="none" stroke="#4A5BD7" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* the nose — non-negotiable */}
      <circle cx="28" cy="21.5" r="3" fill="#FF2E4C" />
      <circle cx="27" cy="20.6" r="0.9" fill="#ffb3c0" />

      {/* tiny hat */}
      {hater ? (
        <>
          <path d="M23.5 10.5 L28 2.5 L32.5 10.5 Z" fill={c.dots} stroke={c.suitDark} strokeWidth="1" />
          <circle cx="28" cy="2.5" r="1.8" fill={c.suit} />
        </>
      ) : (
        <>
          <ellipse cx="28" cy="10.5" rx="7" ry="1.8" fill="#232c4e" />
          <rect x="24" y="5" width="8" height="6" rx="1.5" fill="#232c4e" />
        </>
      )}
    </svg>
  );
}
