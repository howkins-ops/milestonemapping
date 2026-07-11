import React from "react";
import MealTimeline from "./MealTimeline.jsx";
import { daySlot, dayIdxFromDate } from "./engine/scheduler.js";
import { PHASES } from "./data/phases.js";
import RecommitLauncher from "../../zone/recommit/RecommitLauncher.jsx";

/* ═══════════════════════════════════════════════════════════════
   TODAY — the right-now hub. ADHD-first: one screen that answers
   "what do I do today?" in time order — today's workout (one big
   action), then today's meals hour-by-hour, then the fasting window.
   Everything else (The Road / journey, the training hall, the
   codex) is one deliberate tap away, never in your face.
   The Road (the hero's-journey map) now lives in the Book.
   ═══════════════════════════════════════════════════════════════ */

const STYLE_LABEL = {
  mrt: "metabolic resistance",
  density: "density",
  tempo: "tempo",
  circuit: "circuit",
  amrap: "AMRAP",
  strength: "strength",
};

function blockCount(workout) {
  return Array.isArray(workout?.blocks) ? workout.blocks.length : 0;
}

export default function AlphaToday({ alpha, onStartWorkout, onOpenRoad, onOpenZone, onOpenCheat, onRecommit }) {
  const { state } = alpha;
  const phase = PHASES[state.phase];
  const slot = daySlot(state.phase, state.week, dayIdxFromDate());
  const workout = slot?.workout || null;
  const nutrition = slot?.nutrition || {};
  const dayName = new Date().toLocaleDateString(undefined, { weekday: "long" });

  return (
    <div className="iw-al-today iw-page-in">
      <div className="iw-eyebrow" style={{ color: phase?.accent }}>
        {dayName.toLowerCase()} · {phase?.name?.toLowerCase()} · week {state.week}
      </div>
      <h2 className="iw-display iw-page-title">Today</h2>

      {/* ── the one big action: today's workout ── */}
      {nutrition.cheat ? (
        <button className="iw-al-today-hero iw-al-today-hero--cheat" onClick={onOpenCheat}>
          <span className="iw-al-today-kicker">refuel day</span>
          <span className="iw-al-today-title">Cheat Day — off the ledger</span>
          <span className="iw-al-today-sub">no clock, no counting. feed the furnace on purpose →</span>
        </button>
      ) : slot?.kind === "workout" && workout ? (
        <div className="iw-al-today-hero iw-al-today-hero--train" style={{ "--iw-al-accent": phase?.accent }}>
          <span className="iw-al-today-kicker">today's training</span>
          <span className="iw-al-today-title">{workout.name}</span>
          <span className="iw-al-today-meta">
            {STYLE_LABEL[workout.style] || workout.style} · {blockCount(workout)} block
            {blockCount(workout) === 1 ? "" : "s"}
          </span>
          <button className="iw-btn-ember iw-btn-forge iw-btn-wide iw-al-today-go" onClick={() => onStartWorkout(workout.id)}>
            <span className="iw-btn-main">ENTER THE 45</span>
            <span className="iw-btn-sub">today's session is live</span>
          </button>
        </div>
      ) : slot?.kind === "cardio" ? (
        <div className="iw-al-today-hero iw-al-today-hero--cardio">
          <span className="iw-al-today-kicker">today</span>
          <span className="iw-al-today-title">Cardio / Movement</span>
          <span className="iw-al-today-sub">get the blood moving — a walk, a ride, anything steady.</span>
        </div>
      ) : (
        <div className="iw-al-today-hero iw-al-today-hero--rest">
          <span className="iw-al-today-kicker">today</span>
          <span className="iw-al-today-title">Rest Day</span>
          <span className="iw-al-today-sub">recovery is where the iron pays off. eat, sleep, come back strong.</span>
        </div>
      )}

      {/* ── fasting window / hydration nudge ── */}
      {!nutrition.cheat && (
        <div className="iw-al-today-strip">
          {nutrition.fullFast ? (
            <span className="iw-chip iw-chip-ember">full fast today · water & salt only</span>
          ) : (
            <span className="iw-chip">fasting {nutrition.fasting}</span>
          )}
          <span className="iw-chip iw-al-today-water">💧 sip through the day</span>
        </div>
      )}

      {/* ── today's meals, hour by hour ── */}
      <div className="iw-al-today-section">
        <div className="iw-eyebrow">today's plate</div>
        <MealTimeline alpha={alpha} />
      </div>

      {/* ── deliberate doorways: journey + training hall ── */}
      <div className="iw-al-today-doors">
        <button className="iw-al-today-door" onClick={onOpenRoad}>
          <span className="iw-al-today-door-title">❖ The Road</span>
          <span className="iw-al-today-door-sub">your journey — now in the Book</span>
        </button>
        <button className="iw-al-today-door" onClick={onOpenZone}>
          <span className="iw-al-today-door-title">⚔ Training hall</span>
          <span className="iw-al-today-door-sub">bosses · cheat · calculator</span>
        </button>
      </div>

      {/* Broke your word? One tap into the Zone's Recommit ritual. */}
      {onRecommit && (
        <div className="iw-al-today-section">
          <RecommitLauncher onClick={onRecommit} />
        </div>
      )}
    </div>
  );
}
