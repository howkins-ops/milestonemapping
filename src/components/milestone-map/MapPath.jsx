import React from "react";

export default function MapPath({ pathD, totalHeight, fillPct, positions }) {
  const midpoints = [];
  if (positions && positions.length > 1) {
    for (let i = 0; i < positions.length - 1; i++) {
      midpoints.push({
        x: (positions[i].x + positions[i + 1].x) / 2,
        y: (positions[i].y + positions[i + 1].y) / 2,
      });
    }
  }

  return (
    <svg
      className="trail-world__path"
      viewBox={`0 0 100 ${totalHeight}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="treasureTrailBase" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="45%" stopColor="#D11EFF" />
          <stop offset="100%" stopColor="#FF3EDB" />
        </linearGradient>
        <filter id="treasureTrailGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="trailAuraBlur">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Layer 0: Wide outer aura — creates the broad atmospheric glow */}
      <path className="trail-world__path-aura" d={pathD} filter="url(#trailAuraBlur)" />

      {/* Layer 1: Drop shadow */}
      <path className="trail-world__path-shadow" d={pathD} />

      {/* Layer 2: Dashed base guide */}
      <path className="trail-world__path-base" d={pathD} />

      {/* Layer 3: Progress fill with animated gradient */}
      <path
        className="trail-world__path-fill"
        d={pathD}
        pathLength="100"
        strokeDasharray={`${fillPct} ${100 - fillPct}`}
      />

      {/* Layer 4: Flowing energy sparks */}
      <path className="trail-world__path-spark" d={pathD} />

      {/* Waypoint diamonds at midpoints between nodes */}
      {midpoints.map((pt, i) => (
        <circle
          key={i}
          className="trail-world__waypoint"
          cx={pt.x}
          cy={pt.y}
          r="2"
        />
      ))}
    </svg>
  );
}
