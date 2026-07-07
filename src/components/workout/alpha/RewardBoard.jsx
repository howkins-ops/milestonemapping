import React, { useState } from "react";
import { REWARD_BOARD } from "./data/journey.js";
import { HORMONES } from "./engine/hormones.js";
import { sfxCoin, sfxChalkPoof } from "../../../lib/sfx.js";

/* ALPHA MODE — the Reward Board (Crossing step: why answer the call).
   Six cards dealt one at a time; the user picks the TWO that matter
   most. The picks are remembered — the Mentor calls back to them at
   week milestones. */

export default function RewardBoard({ onDone, settings }) {
  const [picks, setPicks] = useState([]);

  const toggle = (id) => {
    setPicks((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      sfxCoin(settings);
      return [...prev, id];
    });
  };

  return (
    <div className="iw-al-rewards">
      <div className="iw-eyebrow">the reward board</div>
      <h2 className="iw-display iw-page-title">Why cross at all?</h2>
      <p className="iw-body iw-al-forge-sub">
        Six things waiting on the other side. Pick the <strong>two</strong> that
        matter most — the Mentor will hold you to them.
      </p>

      <div className="iw-al-reward-grid">
        {REWARD_BOARD.map((r, i) => {
          const on = picks.includes(r.id);
          const hormone = HORMONES.find((h) => h.id === r.stat);
          return (
            <button key={r.id}
              className={`iw-al-reward-card ${on ? "iw-al-reward-on" : ""}`}
              style={{ animationDelay: `${i * 150}ms` }}
              onClick={() => toggle(r.id)}>
              <span className="iw-al-reward-title">{r.title}</span>
              <span className="iw-al-reward-line">{r.line}</span>
              <span className="iw-al-reward-stat">◈ {hormone ? hormone.label : r.stat}</span>
              {on && <span className="iw-al-reward-check" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>

      <button className={`iw-btn-ember iw-btn-wide ${picks.length === 2 ? "" : "iw-btn-off"}`}
        disabled={picks.length !== 2}
        onClick={() => { sfxChalkPoof(settings); onDone(picks); }}>
        these two are mine
      </button>
    </div>
  );
}
