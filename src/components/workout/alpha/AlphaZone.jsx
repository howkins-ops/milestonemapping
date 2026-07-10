import React, { useMemo } from "react";
import { PHASES } from "./data/phases.js";
import { bossesForPhase } from "./data/mythBosses.js";
import { daySlot, dayIdxFromDate } from "./engine/scheduler.js";
import { scheduledWorkoutCount, completedThisWeek } from "./engine/progression.js";
import ScheduleGrid from "./ScheduleGrid.jsx";
import ExerciseImg from "./ExerciseImg.jsx";
import EatingCard from "./EatingCard.jsx";
import FastClock from "./FastClock.jsx";
import HormonePanel from "./HormonePanel.jsx";
import CarbRampMeter from "./CarbRampMeter.jsx";
import { sfxCoin } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   ALPHA ZONE — the daily driver hub for the active phase.
   Today's card (train/cardio/rest + cheat/fast events), the eating
   equation, the fast clock, the hormone codex, the carb ramp
   (PRIME), zone boss challenges, and the month grid.
   ═══════════════════════════════════════════════════════════════ */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AlphaZone({ alpha, workoutData, addXP, settings, onStartWorkout, onFight, onOpenCheat, onOpenCalculator, onOpenStockpile }) {
  const { state } = alpha;
  const phase = PHASES[state.phase];
  const todayIdx = dayIdxFromDate();
  const slot = useMemo(() => daySlot(state.phase, state.week, todayIdx), [state.phase, state.week, todayIdx]);

  const need = scheduledWorkoutCount(state.phase, state.week);
  const done = completedThisWeek(workoutData.sessions, state.phase, state.week);

  const defeated = new Set(state.flags.bossesDefeated || []);
  const challenges = bossesForPhase(state.phase).slice(1)
    .map((b, i) => ({ ...b, unlockWeek: i + 2 }))
    .filter((b) => state.week >= b.unlockWeek || defeated.has(b.id));

  const today = new Date().toDateString();
  const cardioLogged = state.flags.lastCardioDate === today;
  const logCardio = () => {
    sfxCoin(settings);
    alpha.logEvent("cardio", {});
    alpha.patchState({ flags: { ...state.flags, lastCardioDate: today } });
    addXP(5, "Cardio day — recovery is capacity");
  };

  const isSunday = todayIdx === 6;

  if (!phase) return null;

  return (
    <div className="iw-al-zone" style={{ "--iw-al-accent": phase.accent }}>
      {/* zone header */}
      <div className="iw-al-zonehead">
        <div>
          <div className="iw-eyebrow" style={{ color: phase.accent }}>phase {phase.n} · {phase.subtitle}</div>
          <h2 className="iw-display iw-al-zonename">{phase.name}</h2>
        </div>
        <div className="iw-al-weekbadge">
          <span className="iw-al-weekbadge-num">Week {state.week}</span>
          <span className="iw-al-weekbadge-sub">{done}/{need} done</span>
        </div>
      </div>

      {/* TODAY */}
      <div className="iw-al-card iw-al-zone-card iw-al-todaycard">
        <div className="iw-al-today-plate" aria-hidden="true">
          <span className="iw-al-today-plate-ring" />
          <span className="iw-al-today-plate-core" />
          <span className="iw-al-today-plate-cut" />
        </div>
        <div className="iw-al-card-head">
          <span className="iw-eyebrow">today · {DAY_LABELS[todayIdx]}</span>
          <span className="iw-al-todaytags">
            {slot?.nutrition.cheat && <span className="iw-chip iw-chip-ember">cheat day</span>}
            {slot?.nutrition.fullFast && <span className="iw-chip">full fast</span>}
          </span>
        </div>

        {slot?.kind === "workout" && slot.workout && (
          <>
            <div className="iw-al-today-status">
              <span className="iw-al-status-dot" aria-hidden="true" />
              <span>session armed</span>
            </div>
            <div className="iw-al-today-name">{slot.workout.name}</div>
            <div className="iw-al-today-blocks">
              {slot.workout.blocks.map((b) => (
                <span key={b.key} className="iw-set-chip">
                  {b.key} · {b.kind === "density" ? `${b.minutes}min density` : b.kind === "tempo" ? `tempo ${b.tempo?.join("-")}` : b.kind === "totalreps" ? `${b.totalReps} total` : `${b.rounds}×${b.exercises.length > 1 ? ` ${b.exercises.length} lifts` : ` ${b.exercises[0].name}`}`}
                </span>
              ))}
            </div>
            <div className="iw-al-today-thumbs" aria-label="today's moves">
              {[...new Set(slot.workout.blocks.flatMap((b) => b.exercises.map((e) => e.name)))].slice(0, 6).map((name) => (
                <span key={name} className="iw-al-today-thumb" title={name}>
                  <span className="iw-al-today-mono" aria-hidden="true">{name.slice(0, 1)}</span>
                  <ExerciseImg name={name} className="iw-al-today-thumbimg" />
                </span>
              ))}
            </div>
            <button className="iw-btn-ember iw-btn-forge iw-btn-wide" onClick={() => onStartWorkout(slot.workout.id)}>
              <span className="iw-btn-main">ENTER THE 45</span>
              <span className="iw-btn-sub">{slot.workout.name}</span>
            </button>
          </>
        )}

        {slot?.kind === "cardio" && (
          <>
            <div className="iw-al-today-name">Cardio — the long road</div>
            <p className="iw-al-fastline">30–40 easy minutes. Blood flow, recovery, real-world capacity. Not punishment — maintenance on the machine.</p>
            <button className={`iw-btn-ember iw-btn-wide ${cardioLogged ? "iw-btn-off" : ""}`} disabled={cardioLogged} onClick={logCardio}>
              {cardioLogged ? "✓ logged" : "log the road work"}
            </button>
          </>
        )}

        {slot?.kind === "rest" && (
          <>
            <div className="iw-al-today-name">Rest — the second half of the set</div>
            <p className="iw-al-fastline">The muscle is built today, not yesterday. Eat to the ledger, sleep like it's your job.</p>
          </>
        )}

        {slot?.nutrition.cheat && (
          <button className="iw-btn-ghost iw-btn-wide" onClick={onOpenCheat}>
            🔥 open the Refuel — cheat day event
          </button>
        )}
      </div>

      <EatingCard state={state} slot={slot} dayLabel={DAY_LABELS[todayIdx]}
        onOpenCalculator={onOpenCalculator} onOpenFridge={onOpenStockpile} />
      <FastClock alpha={alpha} phase={phase} addXP={addXP} settings={settings} />
      <CarbRampMeter state={state} />
      <HormonePanel alpha={alpha} addXP={addXP} settings={settings} compact />

      {/* Stockpile */}
      <button className={`iw-al-stockcard ${isSunday ? "iw-al-stockcard-sunday" : ""}`} onClick={onOpenStockpile}>
        <span className="iw-al-stock-icon" aria-hidden="true">🧊</span>
        <span className="iw-al-stock-text">
          <span className="iw-al-stock-name">Shop &amp; prep</span>
          <span className="iw-al-stock-sub">{isSunday ? "It's Sunday — fill your fridge for the week" : "grocery list · meal prep · your fridge"}</span>
        </span>
        <span className="iw-plan-go">❯</span>
      </button>

      {/* zone challenges */}
      {challenges.length > 0 && (
        <div className="iw-al-card">
          <div className="iw-eyebrow iw-al-card-title">myths haunting this zone</div>
          <div className="iw-stack">
            {challenges.map((b) => {
              const down = defeated.has(b.id);
              return (
                <button key={b.id} className={`iw-al-challenge ${down ? "iw-al-challenge-down" : ""}`}
                  disabled={down} onClick={() => onFight(b.id)}>
                  <span className="iw-al-challenge-name">{down ? "✓ " : "⚔ "}{b.name}</span>
                  <span className="iw-al-challenge-sub">{down ? "busted" : `“${b.myth.slice(0, 60)}…”`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ScheduleGrid phaseId={state.phase} week={state.week} sessions={workoutData.sessions} />
    </div>
  );
}
