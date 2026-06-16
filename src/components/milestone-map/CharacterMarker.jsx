import React from "react";

function AlchemistSVG({ allDone }) {
  const color = allDone ? "#FACC15" : "#00F0FF";
  const glowA = allDone ? "rgba(250,204,21,0.7)" : "rgba(0,240,255,0.7)";
  const glowB = allDone ? "rgba(250,204,21,0.35)" : "rgba(0,240,255,0.35)";

  return (
    <svg
      viewBox="0 0 42 68"
      width="42"
      height="68"
      aria-hidden="true"
      style={{ filter: `drop-shadow(0 0 8px ${glowA}) drop-shadow(0 0 20px ${glowB})` }}
    >
      {/* Head */}
      <ellipse cx="21" cy="11" rx="6.5" ry="7" style={{ fill: `${color}22`, stroke: color, strokeWidth: 1.4 }} />
      {/* Hood peak */}
      <path d="M14 9 Q21 0 28 9 Q24 5 21 4 Q18 5 14 9Z" style={{ fill: color, fillOpacity: 0.55 }} />
      {/* Robe body */}
      <path
        d="M15 20 L10 54 Q21 57 32 54 L27 20 Q24 23 21 23 Q18 23 15 20Z"
        style={{ fill: `${color}12`, stroke: color, strokeWidth: 1.4, strokeLinejoin: "round" }}
      />
      {/* Left arm */}
      <path d="M15 26 Q9 33 11 41" style={{ fill: "none", stroke: color, strokeWidth: 1.4, strokeLinecap: "round" }} />
      {/* Right arm */}
      <path d="M27 26 Q33 33 31 41" style={{ fill: "none", stroke: color, strokeWidth: 1.4, strokeLinecap: "round" }} />
      {/* Left leg */}
      <path d="M18 54 L16 66" style={{ fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" }} />
      {/* Right leg */}
      <path d="M24 54 L26 66" style={{ fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" }} />
      {/* Ground glow */}
      <ellipse cx="21" cy="67" rx="7" ry="1.5" style={{ fill: color, fillOpacity: 0.28, stroke: "none" }} />
      {allDone ? (
        /* Victory star rays */
        <path
          d="M21 2L21-4M29 5L34 1M33 14L38 12"
          style={{ fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round", strokeOpacity: 0.8 }}
        />
      ) : (
        /* Alchemist orb being held */
        <circle cx="11" cy="40" r="3" style={{ fill: "none", stroke: color, strokeWidth: 1.2, strokeOpacity: 0.7 }} />
      )}
    </svg>
  );
}

// Parent sets key={`${currentIndex}-${doneCount}-${allDone}`} to re-trigger entrance animation on move.
export default function CharacterMarker({ point, allDone }) {
  return (
    <div
      className="trail-world__avatar"
      style={{ left: `${point.x}%`, top: point.y + 88 }}
      aria-label="Current reality"
    >
      <span className="trail-world__avatar-figure">
        <AlchemistSVG allDone={allDone} />
      </span>
      <strong>Current Reality</strong>
    </div>
  );
}
