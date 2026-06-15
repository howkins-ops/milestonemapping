import React from "react";

export default function MapPath({ pathD, totalHeight, fillPct }) {
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
      </defs>
      <path className="trail-world__path-shadow" d={pathD} />
      <path className="trail-world__path-base" d={pathD} />
      <path
        className="trail-world__path-fill"
        d={pathD}
        pathLength="100"
        strokeDasharray={`${fillPct} ${100 - fillPct}`}
      />
      <path className="trail-world__path-spark" d={pathD} />
    </svg>
  );
}
