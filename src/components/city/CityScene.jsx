import React from "react";
import CityAmbient from "./CityAmbient.jsx";
import "../../styles/city.css";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — The living scene
// ⚠ SUPERSEDED (2026-07): the walkable street (world/WorldScene.jsx +
// cityWorld.js) replaced this static banner on MapQuestCityPage. Kept for
// reference like SeekerCity — no live imports remain.
// Layered parallax skyline, back to front:
//   sky (time-of-day palette) → stars → aurora (stage 4) → far silhouettes
//   → mid towers w/ lit windows + cranes (stage 1) → ambient life →
//   DISTRICT buildings (tappable, glow follows real progress) → haze →
//   ground reflection.
// Buildings are ALWAYS in the DOM at every stage — evolution only changes
// atmosphere and density, never layout.
// ════════════════════════════════════════════════════════════════════════

// Deterministic star field: x %, y %, size px, twinkle delay s.
const STARS = [
  [4, 8, 2, 0], [11, 22, 1, 1.2], [17, 6, 2, 2.5], [23, 15, 1, 0.7],
  [30, 9, 2, 3.1], [36, 24, 1, 1.8], [41, 5, 1, 2.2], [48, 18, 2, 0.4],
  [54, 10, 1, 2.9], [61, 21, 2, 1.5], [66, 7, 1, 3.4], [72, 14, 2, 0.9],
  [78, 5, 1, 2.0], [84, 19, 2, 1.1], [90, 9, 1, 2.7], [95, 16, 2, 0.2],
  [8, 30, 1, 3.7], [58, 28, 1, 0.6], [88, 27, 1, 1.9], [33, 31, 1, 2.4],
];

// Far silhouette row: left %, width %, height % of scene.
const FAR_TOWERS = [
  [0, 6, 30], [5.5, 4, 40], [9, 5, 26], [14, 4, 46], [17.5, 6, 32],
  [23, 4, 52], [27, 5, 36], [31.5, 4, 28], [35, 5, 44], [40, 4, 34],
  [44, 6, 56], [49.5, 4, 38], [53, 5, 30], [58, 4, 48], [61.5, 6, 36],
  [67, 4, 42], [70.5, 5, 28], [75, 4, 50], [78.5, 6, 34], [84, 4, 44],
  [87.5, 5, 30], [92, 4, 40], [95.5, 4.5, 26],
];

// Mid towers: left %, width %, height %, window tier (1 lights first), neon sign?
const MID_TOWERS = [
  [1, 6.5, 34, 1, false], [8, 5.5, 46, 2, true], [14.5, 6, 30, 1, false],
  [21, 5, 54, 3, false], [26.5, 6.5, 38, 1, true], [33.5, 5.5, 48, 2, false],
  [39.5, 6, 32, 3, false], [51.5, 5.5, 42, 1, false], [57.5, 6, 52, 2, true],
  [64, 5.5, 36, 1, false], [70, 6, 46, 3, true], [76.5, 5.5, 32, 2, false],
  [82.5, 6, 50, 1, false], [89, 5.5, 40, 2, true], [94.5, 5, 34, 3, false],
];

// Height tier (1–5) → building height as % of scene.
const TIER_HEIGHT = { 1: 24, 2: 33, 3: 42, 4: 53, 5: 68 };

export default function CityScene({
  stage,
  timeOfDay,
  buildings = [],
  reducedMotion = false,
  onBuildingTap,
}) {
  const stageClass = (stage && stage.className) || "mqc-stage-1";
  const todClass = (timeOfDay && timeOfDay.className) || "mqc-tod-night";

  return (
    <div
      className={`mqc-scene ${stageClass} ${todClass}${reducedMotion ? " mqc-scene--still" : ""}`}
      role="img"
      aria-label={`Milestone City at ${((timeOfDay && timeOfDay.label) || "night").toLowerCase()} — ${(stage && stage.name) || "Foundations"}`}
    >
      <div className="mqc-sc-sky" aria-hidden="true" />

      <div className="mqc-sc-stars" aria-hidden="true">
        {STARS.map(([x, y, s, d], i) => (
          <span
            key={i}
            className="mqc-sc-star"
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, "--delay": `${d}s` }}
          />
        ))}
      </div>

      <div className="mqc-sc-aurora" aria-hidden="true" />

      <div className="mqc-sc-far" aria-hidden="true">
        {FAR_TOWERS.map(([x, w, h], i) => (
          <span
            key={i}
            className="mqc-sc-fart"
            style={{ left: `${x}%`, width: `${w}%`, height: `${h}%` }}
          />
        ))}
      </div>

      <div className="mqc-sc-mid" aria-hidden="true">
        {MID_TOWERS.map(([x, w, h, tier, neon], i) => (
          <span
            key={i}
            className={`mqc-sc-midt mqc-sc-midt--w${tier}${neon ? " mqc-sc-midt--neon" : ""}`}
            style={{ left: `${x}%`, width: `${w}%`, height: `${h}%` }}
          />
        ))}
        {/* Construction cranes — stage 1 only (CSS-gated) */}
        <span className="mqc-sc-crane" style={{ left: "12%" }} aria-hidden="true" />
        <span className="mqc-sc-crane mqc-sc-crane--flip" style={{ left: "71%" }} aria-hidden="true" />
      </div>

      <CityAmbient stage={stage} reducedMotion={reducedMotion} />

      <div className="mqc-sc-districts">
        {buildings.map((b) => {
          const pos = b.position || {};
          const h = TIER_HEIGHT[pos.h] || TIER_HEIGHT[2];
          return (
            <button
              key={b.id}
              type="button"
              className={`mqc-sc-b is-${b.glowState || "dim"}`}
              style={{
                left: `${pos.x || 0}%`,
                width: `${pos.w || 5}%`,
                height: `${h}%`,
                "--b-color": b.color,
                "--b-glow": b.glow,
              }}
              onClick={() => onBuildingTap && onBuildingTap(b.id)}
              aria-label={`${b.name} district`}
            >
              <span className="mqc-sc-b__beacon" aria-hidden="true" />
              <span className="mqc-sc-b__sign" aria-hidden="true">{b.icon}</span>
              <span className="mqc-sc-b__tower" aria-hidden="true" />
              <span className="mqc-sc-b__name">{b.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mqc-sc-haze" aria-hidden="true" />
      <div className="mqc-sc-ground" aria-hidden="true" />

      <div className="mqc-sc-meta" aria-hidden="true">
        <span className="mqc-sc-meta__stage">{(stage && stage.name) || "Foundations"}</span>
        <span className="mqc-sc-meta__dot">·</span>
        <span className="mqc-sc-meta__tod">{(timeOfDay && timeOfDay.label) || "Night"}</span>
      </div>
    </div>
  );
}
