import React, { useMemo, useState } from "react";
import WorldMap from "./WorldMap.jsx";
import ExerciseHowTo from "./ExerciseHowTo.jsx";
import HL from "./HL.jsx";
import { STEELS } from "../IronWorkout.jsx";
import { STYLE_EXPLAINERS, blockTitle, protocolLine, KIND_BLURBS, estimateMinutes } from "./SessionBriefing.jsx";
import { PHASES, PHASE_ORDER, WORKOUTS } from "./data/phases.js";
import { EXERCISE_GROUPS } from "./data/exercises.js";
import { daySlot, dayIdxFromDate } from "./engine/scheduler.js";

/* ═══════════════════════════════════════════════════════════════
   THE PROGRAM — the full campaign console, on the main nav.
   Everything is READABLE from day one (learning is never gated):
   the Road map, all four phases with eating + rotation tables,
   every workout broken down block by block, the complete exercise
   library, and your own custom plans. Playing still happens on
   the Today tab — this page is the manual.
   ═══════════════════════════════════════════════════════════════ */

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const relAge = (iso) => {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "today"; if (d === 1) return "yesterday";
  if (d < 21) return `${d} days ago`; if (d < 45) return "a month ago";
  return `${Math.round(d / 30)} months ago`;
};

export default function ProgramConsole({ alpha, sessions, plans, onOpenPlan, onNewPlan, onEnterCampaign }) {
  const { state } = alpha;
  const started = Boolean(state.flags.crossingDone);
  const todayIdx = dayIdxFromDate();
  const slot = useMemo(
    () => (started ? daySlot(state.phase, state.week, todayIdx) : null),
    [started, state.phase, state.week, todayIdx]
  );

  return (
    <div className="iw-page iw-page-in iw-pc">
      <div className="iw-eyebrow">the manual · read everything, any time</div>
      <h2 className="iw-display iw-page-title">The Program</h2>

      {/* today strip */}
      {started && slot?.kind === "workout" && slot.workout && (
        <button className="iw-pc-today" onClick={() => onEnterCampaign(null)}>
          <span className="iw-pc-today-text">
            <span className="iw-eyebrow">today · {PHASES[state.phase]?.name} · week {state.week}</span>
            <span className="iw-pc-today-name">⚡ {slot.workout.name}</span>
          </span>
          <span className="iw-pc-today-go">start it on Today ❯</span>
        </button>
      )}
      {!started && (
        <button className="iw-pc-today" onClick={() => onEnterCampaign(null)}>
          <span className="iw-pc-today-text">
            <span className="iw-eyebrow">the campaign has not begun</span>
            <span className="iw-pc-today-name">⚡ Make the Crossing</span>
          </span>
          <span className="iw-pc-today-go">begin on Today ❯</span>
        </button>
      )}

      {/* the road */}
      <section className="iw-pc-section">
        <div className="iw-eyebrow iw-pc-section-title">the roadmap</div>
        <WorldMap alpha={alpha}
          onOpenGate={(phaseId) => onEnterCampaign({ name: "gate", phaseId })}
          onOpenZone={() => onEnterCampaign({ name: "zone" })} />
      </section>

      {/* the four phases */}
      <section className="iw-pc-section">
        <div className="iw-eyebrow iw-pc-section-title">the four phases · 16 weeks</div>
        <div className="iw-stack">
          {PHASE_ORDER.map((pid) => (
            <PhaseCard key={pid} phase={PHASES[pid]} state={state} started={started} />
          ))}
        </div>
      </section>

      {/* exercise library */}
      <section className="iw-pc-section">
        <div className="iw-eyebrow iw-pc-section-title">the exercise library · every move in the program</div>
        <ExerciseLibrary />
      </section>

      {/* custom plans */}
      <section className="iw-pc-section">
        <div className="iw-eyebrow iw-pc-section-title">your own plans · freestyle iron</div>
        <div className="iw-stack">
          {plans.map((p) => {
            const lastRun = sessions.find((s) => s.plan_id === p.id);
            return (
              <button key={p.id} className="iw-plan-card" style={{ background: STEELS.find((x) => x.id === p.steel)?.css }}
                onClick={() => onOpenPlan(p.id)}>
                <div className="iw-plan-emblem">{p.emblem}</div>
                <div className="iw-plan-text">
                  <span className="iw-plan-name">{p.name}</span>
                  <span className="iw-plan-sub">
                    {(p.exercises || []).length} lifts{p.focus ? ` · ${p.focus}` : ""}
                  </span>
                  <span className="iw-plan-last">{lastRun ? `last run ${relAge(lastRun.created_at)}` : "never run — first time under the bar"}</span>
                </div>
                <span className="iw-plan-go">❯</span>
              </button>
            );
          })}
        </div>
        <button className="iw-newplan" onClick={onNewPlan}>＋ forge a new plan</button>
        {plans.length === 0 && (
          <div className="iw-empty">an empty rack is a loud invitation — forge your first plan</div>
        )}
      </section>
    </div>
  );
}

/* ── one phase: story, eating, rotation, workouts ── */
function PhaseCard({ phase, state, started }) {
  const [open, setOpen] = useState(started && state.phase === phase.id);
  const here = started && state.phase === phase.id;
  const conquered = started && phase.stage < (PHASES[state.phase]?.stage ?? 0);
  const workouts = Object.values(WORKOUTS).filter((w) => w.phase === phase.id).sort((a, b) => a.n - b.n);
  const e = phase.eating;

  const carbLine = (side) => {
    const c = e.carbs;
    if (c.type === "grams") {
      const tiers = c[side].join(" → ");
      return `${tiers}g by week (the carb ramp)`;
    }
    return `${c[side]}g per lb of lean mass`;
  };

  return (
    <div className={`iw-pc-phase ${open ? "iw-pc-phase-open" : ""}`} style={{ "--iw-al-accent": phase.accent }}>
      <button className="iw-pc-phasehead" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="iw-pc-phase-n" style={{ color: phase.accent }}>{["I", "II", "III", "IV"][phase.n - 1]}</span>
        <span className="iw-pc-phase-text">
          <span className="iw-pc-phase-name">{phase.name}</span>
          <span className="iw-pc-phase-sub">{phase.subtitle} · 4 weeks</span>
        </span>
        {here && <span className="iw-chip iw-chip-ember">you are here · w{state.week}</span>}
        {conquered && <span className="iw-chip">✓ conquered</span>}
        <span className="iw-howto-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="iw-pc-phasebody">
          <p className="iw-body"><HL text={STYLE_EXPLAINERS[phase.trainingStyle] || ""} /></p>

          {/* eating rules */}
          <div className="iw-pc-block">
            <div className="iw-eyebrow">the eating rules · fast {phase.fasting.fastHours} hrs, eat in {phase.fasting.eatHours}</div>
            <div className="iw-pc-eatgrid">
              <div className="iw-pc-eatrow iw-pc-eathead">
                <span></span><span>calories</span><span>protein</span><span>carbs</span>
              </div>
              <div className="iw-pc-eatrow">
                <span className="iw-pc-eatday">training day</span>
                <span><HL text={`${e.workout.calDelta > 0 ? "+" : ""}${e.workout.calDelta} cal`} /></span>
                <span><HL text={`${e.workout.proteinPerLBM}g / lb LBM`} /></span>
                <span><HL text={carbLine("workout")} /></span>
              </div>
              <div className="iw-pc-eatrow">
                <span className="iw-pc-eatday">rest day</span>
                <span><HL text={`${e.rest.calDelta > 0 ? "+" : ""}${e.rest.calDelta} cal`} /></span>
                <span><HL text={`${e.rest.proteinPerLBM}g / lb LBM`} /></span>
                <span><HL text={carbLine("rest")} /></span>
              </div>
            </div>
            <div className="iw-pc-badges">
              {phase.nutritionDays?.cheat != null && <span className="iw-chip iw-chip-ember">🔥 cheat day sundays</span>}
              {phase.nutritionDays?.fullFast != null && <span className="iw-chip">⏳ full-fast mondays (from w{phase.nutritionDays.fastFromWeek ?? 1})</span>}
              {phase.nutritionDays?.epicCheat && <span className="iw-chip iw-chip-ember">the EPIC cheat</span>}
            </div>
          </div>

          {/* rotation grid */}
          <div className="iw-pc-block">
            <div className="iw-eyebrow">the 4-week rotation · which workout lands on which day</div>
            <div className="iw-pc-rotation">
              <div className="iw-pc-rotrow iw-pc-rothead">
                <span>wk</span>
                {DAY_LABELS.map((d, i) => <span key={i}>{d}</span>)}
              </div>
              {phase.rotation.map((week, wi) => (
                <div key={wi} className={`iw-pc-rotrow ${here && state.week === wi + 1 ? "iw-pc-rotnow" : ""}`}>
                  <span className="iw-pc-rotwk">{wi + 1}</span>
                  {week.map((cell, di) => (
                    <span key={di} className={`iw-pc-rotcell ${cell ? (cell === "cardio" ? "iw-pc-rot-cardio" : "iw-pc-rot-lift") : ""}`}>
                      {cell === "cardio" ? "run" : cell ? cell.toUpperCase() : "·"}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* the workouts */}
          <div className="iw-pc-block">
            <div className="iw-eyebrow">the {workouts.length} workouts of {phase.name}</div>
            <div className="iw-stack">
              {workouts.map((w) => <WorkoutBreakdown key={w.id} workout={w} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── one workout: block-by-block breakdown with how-tos ── */
function WorkoutBreakdown({ workout }) {
  const [open, setOpen] = useState(false);
  const mins = estimateMinutes(workout);
  return (
    <div className={`iw-pc-workout ${open ? "iw-pc-workout-open" : ""}`}>
      <button className="iw-pc-wohead" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="iw-pc-wobadge">W{workout.n}</span>
        <span className="iw-pc-wotext">
          <span className="iw-pc-woname">{workout.name}</span>
          <span className="iw-pc-wosub">{workout.styleLabel || `${workout.style} day`} · {workout.blocks.length} blocks · ~{mins} min</span>
        </span>
        <span className="iw-howto-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="iw-pc-wobody">
          {workout.blocks.map((b) => (
            <div key={`${b.key}-${b.exercises[0]?.name}`} className="iw-al-brief-block">
              <div className="iw-al-brief-blockhead">
                <span className="iw-al-brief-key">{b.key}</span>
                <span className="iw-al-brief-blocktitle">{blockTitle(b)}</span>
              </div>
              <div className="iw-al-brief-protocol"><HL text={protocolLine(b)} /></div>
              <p className="iw-al-fastline"><HL text={KIND_BLURBS[b.kind]} /></p>
              <div className="iw-stack">
                {b.exercises.map((ex, i) => (
                  <ExerciseHowTo key={`${b.key}-${i}-${ex.name}`} name={ex.name}
                    title={ex.name} meta={ex.reps} defaultOpen={false} />
                ))}
              </div>
              {b.note && <div className="iw-al-fastline"><HL text={b.note} /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── the full library, grouped by movement family ── */
function ExerciseLibrary() {
  const [openGroup, setOpenGroup] = useState(null);
  const total = EXERCISE_GROUPS.reduce((s, g) => s + g.exercises.length, 0);
  return (
    <div className="iw-pc-lib">
      <div className="iw-al-fastline"><HL text={`${total} moves — tap a family, then tap any move for the full how-to.`} /></div>
      {EXERCISE_GROUPS.map((g) => {
        const open = openGroup === g.id;
        return (
          <div key={g.id} className="iw-pc-libgroup">
            <button className="iw-pc-libhead" onClick={() => setOpenGroup(open ? null : g.id)} aria-expanded={open}>
              <span className="iw-pc-libname">{g.label}</span>
              <span className="iw-pc-libcount">{g.exercises.length} moves</span>
              <span className="iw-howto-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
            </button>
            {open && (
              <div className="iw-stack iw-pc-libstack">
                {g.exercises.map((ex) => (
                  <ExerciseHowTo key={ex.name} name={ex.name} title={ex.name}
                    meta={`${ex.muscles} · ${ex.equipment}`} defaultOpen={false} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
