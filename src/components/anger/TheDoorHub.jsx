import React, { useState } from "react";
import "../../styles/door-game.css";
import TheDoor from "./TheDoor.jsx";
import DoorLevel from "./DoorLevel.jsx";
import { DOOR_LEVELS, getDoorLevel } from "./doorLevels.js";

/* ════════════════════════════════════════════════════════════════════════
   THE DOOR — level ladder shell. Picks which level to play and gates them
   behind a linear unlock (clear N to open N+1), persisted in localStorage.

   Level 1 = the original three-round cinema (TheDoor.jsx, untouched).
   Levels 2-4 = the config-driven DoorLevel engine.

   Contract: { onClose, onComplete } — onComplete bubbles the payload up to
   the Anger Gym for XP + celebration; the hub itself returns to the select.
   ════════════════════════════════════════════════════════════════════════ */

const KEY = "door_levels_state";

const LEVEL1 = {
  id: 1,
  title: "The Door",
  relic: "The Threshold",
  tag: "Persistence arcade · Level 1 · 21+",
  when: "They keep telling you no",
  accent: "#FF3B5C",
  lesson: "They're going to say no. Knock anyway.",
  blurb: "3-round cinema. Knock through the screaming, close Harold at MIDNIGHT, then box him on the porch when he finally opens. Sound on.",
};

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { maxUnlocked: 1, cleared: {} };
}
function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

const ALL = [LEVEL1, ...DOOR_LEVELS.map((l) => ({ ...l, blurb: l.lesson }))];

export default function TheDoorHub({ onClose, onComplete }) {
  const [playing, setPlaying] = useState(null); // level id or null (select)
  const [state, setState] = useState(loadState);

  const markCleared = (id) => {
    setState((prev) => {
      const next = { maxUnlocked: Math.max(prev.maxUnlocked, id + 1), cleared: { ...prev.cleared, [id]: true } };
      saveState(next);
      return next;
    });
  };

  const finish = (id) => (payload) => {
    markCleared(id);
    onComplete({ ...payload, level: id });
    setPlaying(null);
  };

  if (playing === 1) {
    return <TheDoor onClose={() => setPlaying(null)} onComplete={finish(1)} />;
  }
  if (playing && playing > 1) {
    const cfg = getDoorLevel(playing);
    return <DoorLevel level={cfg} onClose={() => setPlaying(null)} onComplete={finish(playing)} />;
  }

  const isUnlocked = (id) => id <= state.maxUnlocked;
  const cleared = state.cleared || {};

  return (
    <div className="dl-hub">
      <div className="dl-hub__top">
        <button className="dg-back" onClick={onClose}>← Anger Gym</button>
        <span className="dl-hub__count">{Object.keys(cleared).length}/4 cleared</span>
      </div>

      <div className="dl-hub__head">
        <p className="dl-hub__kicker">Persistence Arcade · 21+</p>
        <h1 className="dl-hero">The Door</h1>
        <p className="dl-hub__sub">
          One rep. One customer who keeps running further away. Four levels of Bloody Knuckles, screamed
          banter, and finishers — knock through the no, chase him behind a steel door, and make him regret
          the words &ldquo;come back later.&rdquo; <b>Clear a level to unlock the next.</b>
        </p>
      </div>

      <div className="dl-ladder">
        {ALL.map((lv) => {
          const unlocked = isUnlocked(lv.id);
          const done = !!cleared[lv.id];
          return (
            <button
              key={lv.id}
              className={`dl-card ${unlocked ? "" : "is-locked"} ${done ? "is-done" : ""}`}
              style={{ "--acc": lv.accent }}
              onClick={() => unlocked && setPlaying(lv.id)}
              disabled={!unlocked}
              aria-label={unlocked ? `Play Level ${lv.id}: ${lv.title}` : `Level ${lv.id} locked`}
            >
              <div className="dl-card__aura" />
              <div className="dl-card__num">{unlocked ? lv.id : "🔒"}</div>
              <div className="dl-card__body">
                <div className="dl-card__topline">
                  <span className="dl-card__when">{lv.when}</span>
                  <span className="dl-card__relic">{lv.relic}</span>
                </div>
                <h2 className="dl-card__title">{lv.title}</h2>
                <p className="dl-card__blurb">{unlocked ? lv.blurb : `Clear Level ${lv.id - 1} to unlock.`}</p>
                <span className="dl-card__tag">{lv.tag}</span>
              </div>
              <span className="dl-card__cta">
                {done ? "Replay →" : unlocked ? "Enter →" : "Locked"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
