import React from "react";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — Ambient life
// Embers rising off the grid, drones drifting with blinking nav lights and
// tram light-streaks on the mid-rail. All positions are deterministic
// (module-level tables, no RNG) so the city looks the same on every render.
// Density scales with the evolution stage; renders nothing under reduced
// motion — the scene stays complete without it.
// ════════════════════════════════════════════════════════════════════════

// left %, size px, duration s, delay s, drift px
const EMBERS = [
  [6, 3, 11, 0.0, 14], [13, 2, 14, 2.1, -10], [21, 3, 12, 4.4, 8],
  [28, 2, 16, 1.2, -16], [36, 4, 10, 3.3, 12], [43, 2, 15, 5.6, -8],
  [50, 3, 12, 0.8, 18], [57, 2, 13, 2.9, -12], [63, 3, 15, 4.9, 10],
  [70, 2, 11, 1.7, -14], [76, 4, 13, 3.8, 16], [82, 2, 16, 0.4, -9],
  [88, 3, 12, 2.5, 11], [93, 2, 14, 5.1, -15], [17, 2, 17, 6.2, 13],
  [47, 2, 18, 7.0, -11], [67, 3, 16, 6.6, 9], [9, 2, 19, 7.7, -13],
];

// top %, duration s, delay s, scale
const DRONES = [
  [16, 26, 0, 1],
  [24, 34, 9, 0.75],
  [11, 30, 17, 0.9],
];

// top % (rail line), duration s, delay s, direction
const TRAMS = [
  [62, 9, 0, 1],
  [67, 12, 5, -1],
];

const EMBER_DENSITY = { 1: 5, 2: 9, 3: 13, 4: 18 };

export default function CityAmbient({ stage, reducedMotion }) {
  if (reducedMotion) return null;
  const stageId = (stage && stage.id) || 1;

  const embers = EMBERS.slice(0, EMBER_DENSITY[stageId] || 5);
  const drones = stageId >= 4 ? DRONES : stageId >= 2 ? DRONES.slice(0, 2) : [];
  const trams = stageId >= 4 ? TRAMS : stageId >= 3 ? TRAMS.slice(0, 1) : [];

  return (
    <div className="mqc-sc-ambient" aria-hidden="true">
      {embers.map(([x, size, dur, delay, drift], i) => (
        <span
          key={`e${i}`}
          className="mqc-sc-ember"
          style={{
            left: `${x}%`,
            width: size,
            height: size,
            "--dur": `${dur}s`,
            "--delay": `${delay}s`,
            "--drift": `${drift}px`,
          }}
        />
      ))}
      {drones.map(([top, dur, delay, scale], i) => (
        <span
          key={`d${i}`}
          className="mqc-sc-drone"
          style={{
            top: `${top}%`,
            "--dur": `${dur}s`,
            "--delay": `${delay}s`,
            transform: `scale(${scale})`,
          }}
        >
          <span className="mqc-sc-drone__body" />
          <span className="mqc-sc-drone__light" />
        </span>
      ))}
      {trams.map(([top, dur, delay, dir], i) => (
        <span
          key={`t${i}`}
          className={`mqc-sc-tram${dir < 0 ? " mqc-sc-tram--rev" : ""}`}
          style={{ top: `${top}%`, "--dur": `${dur}s`, "--delay": `${delay}s` }}
        />
      ))}
    </div>
  );
}
