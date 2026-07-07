import React, { useMemo } from "react";
import ExerciseHowTo from "./ExerciseHowTo.jsx";
import { exerciseInfo } from "./data/exercises.js";

/* ═══════════════════════════════════════════════════════════════
   MISSION BRIEFING — the wizard's first screen.
   Before a single set: what today's protocol is and why, every
   block laid out in plain language, what equipment to stage, and
   a rough clock. Tap any lift to open its how-to right here.
   Also exports the protocol-language helpers the block intro
   cards reuse mid-session.
   ═══════════════════════════════════════════════════════════════ */

export const STYLE_EXPLAINERS = {
  mrt: "Metabolic circuits. You move from lift to lift with almost no rest, but never hit the same muscle twice in a row — so you stay fast without burning out. Fat loss and conditioning in one engine.",
  density: "Density work. Each block is a fixed clock: alternate the lifts, a few reps at a time, cramming in as much total iron as the minutes allow. Then the block runs AGAIN, heavier. You against your own ghost.",
  tempo: "Slow-burn tempo work. The cadence is the exercise — ride the count on every rep to flood the muscle and spike growth hormone. Lighter weights than usual; the clock makes them heavy.",
  strength: "Pure strength. Heavy pairs, five sets of five, resting until you're actually recovered. You're not supposed to hit every rep — the total across five sets tells you exactly what the bar should weigh next time.",
  rotation: "All four systems in one week — circuits, density, tempo, strength. Today is one piece of that rotation.",
};

const KIND_TITLES = {
  circuit: "The Circuit",
  straight: "Straight Sets",
  totalreps: "The Count",
  density: "The Density Run",
  tempo: "The Cadence",
};

export function blockTitle(block) {
  if (block.bookend) return "The Bookend";
  if (block.closer) return "The Closer";
  if (block.autoregulate) return "The Heavy Pair";
  return KIND_TITLES[block.kind] || "The Work";
}

/* one plain-language line describing exactly how a block runs */
export function protocolLine(block) {
  const n = block.exercises.length;
  switch (block.kind) {
    case "circuit": {
      const bits = [`${block.rounds} round${block.rounds > 1 ? "s" : ""}`, `${n} move${n > 1 ? "s" : ""}`];
      if (block.restBetweenEx) bits.push(`≤${block.restBetweenEx}s between moves`);
      if (block.rounds > 1 && block.restBetweenRounds) bits.push(`${block.restBetweenRounds}s between rounds`);
      return bits.join(" · ");
    }
    case "straight": {
      if (block.bookend) return `one all-out set of ${block.exercises[0].reps} — heavy, steady, no tempo tricks`;
      if (block.closer) return `one light set of ${block.exercises[0].reps} at ${block.lightPctOfA?.[0]}–${block.lightPctOfA?.[1]}% of your bookend weight — the flush`;
      return `${block.rounds} sets · ${block.restBetweenRounds}s rest between`;
    }
    case "totalreps":
      return `${block.totalReps} total reps — as many sets as it takes, ${block.restBetweenRounds ?? 90}s rest between`;
    case "density":
      return `${block.minutes} minutes on the clock · alternate the moves, ${block.repsPerTurn} reps a turn · load at your ${block.repMax} · the block runs TWICE`;
    case "tempo":
      return `${block.rounds} rounds at a ${block.tempo?.join("-")} count — ${block.tempo?.[0]}s down, ${block.tempo?.[2]}s drive · ${block.restBetweenRounds}s between rounds`;
    default:
      return "";
  }
}

/* one-line "why" per block kind, for the intro card */
export const KIND_BLURBS = {
  circuit: "Keep moving. The short rests are the point — different muscles cover for each other.",
  straight: "One lift, full focus. Nothing fancy — load it honest and move it well.",
  totalreps: "The target is the total. Break it into as many sets as you need.",
  density: "Beat the clock, then beat your own ghost on run two with a heavier bar.",
  tempo: "Slow is the work. Follow the ticking cadence — the burn means it's working.",
};

/* rough session length from block structure, rounded to 5 min */
export function estimateMinutes(workout) {
  const REP_SEC = 45;
  let s = 0;
  for (const b of workout.blocks) {
    const n = b.exercises.length;
    if (b.kind === "density") s += b.minutes * 60 * 2 + (b.restAfter ?? 240);
    else if (b.kind === "totalreps") s += 4 * REP_SEC + 3 * (b.restBetweenRounds ?? 90);
    else {
      const rounds = b.rounds || 1;
      s += rounds * (n * REP_SEC + (b.restBetweenEx ?? 0) * Math.max(0, n - 1));
      s += (b.restBetweenRounds ?? 0) * Math.max(0, rounds - 1);
    }
    s += 120; // transition + setup slack per block
  }
  return Math.max(10, Math.round(s / 60 / 5) * 5);
}

export default function SessionBriefing({ workout, phase, lastWeights, onStart }) {
  const exKey = (n) => String(n || "").trim().toLowerCase();

  const equipment = useMemo(() => {
    const set = new Set();
    for (const b of workout.blocks) {
      for (const e of b.exercises) {
        const info = exerciseInfo(e.name);
        if (info?.equipment) set.add(info.equipment);
      }
    }
    return [...set];
  }, [workout]);

  const mins = estimateMinutes(workout);

  return (
    <div className="iw-al-briefing iw-drop-in">
      <div className="iw-eyebrow" style={{ color: phase.accent }}>
        the briefing · {workout.styleLabel || `${workout.style} day`} · ~{mins} min
      </div>
      <h2 className="iw-display iw-session-lift">{workout.name}</h2>
      <p className="iw-body iw-al-brief-why">{STYLE_EXPLAINERS[workout.style] || STYLE_EXPLAINERS.mrt}</p>

      {equipment.length > 0 && (
        <div className="iw-al-brief-gear">
          <span className="iw-eyebrow">stage this</span>
          <div className="iw-al-gearchips">
            {equipment.map((g) => (
              <span key={g} className="iw-chip">{g}</span>
            ))}
          </div>
        </div>
      )}

      <div className="iw-al-brief-blocks">
        {workout.blocks.map((b) => (
          <div key={`${b.key}-${b.exercises[0]?.name}`} className="iw-al-brief-block">
            <div className="iw-al-brief-blockhead">
              <span className="iw-al-brief-key">{b.key}</span>
              <span className="iw-al-brief-blocktitle">{blockTitle(b)}</span>
            </div>
            <div className="iw-al-brief-protocol">{protocolLine(b)}</div>
            <div className="iw-stack">
              {b.exercises.map((e, i) => (
                <ExerciseHowTo key={`${b.key}-${i}-${e.name}`} name={e.name}
                  title={e.name} meta={e.reps}
                  defaultOpen={false} />
              ))}
            </div>
            {b.note && <div className="iw-al-fastline">{b.note}</div>}
          </div>
        ))}
      </div>

      <div className="iw-al-fastline">
        First time on a lift? Tap it — the how-to is one touch away in the session too.
        {[...new Set(workout.blocks.flatMap((b) => b.exercises.map((e) => e.name)))]
          .some((n) => !lastWeights.has(exKey(n))) ? "" : " You've logged every lift in here before."}
      </div>

      <button className="iw-btn-ember iw-btn-wide" onClick={onStart}>
        ▶ step under the bar
      </button>
    </div>
  );
}
