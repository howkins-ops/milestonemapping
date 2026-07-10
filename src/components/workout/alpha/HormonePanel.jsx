import React from "react";
import { HORMONES, condition } from "./engine/hormones.js";
import { sfxCoin } from "../../../lib/sfx.js";

/* ALPHA MODE — the Hormone Codex panel.
   Six dials + the once-a-day sleep log (sleep is the mana system:
   it touches four dials at once). */

const SLEEP_CHIPS = [
  { label: "under 6h", hours: 5 },
  { label: "6–7h", hours: 6.5 },
  { label: "7–8h", hours: 7.5 },
  { label: "8h+", hours: 8.5 },
];

export default function HormonePanel({ alpha, addXP, settings, compact = false }) {
  const { state } = alpha;
  const today = new Date().toDateString();
  const sleepLogged = state.flags.lastSleepLogDate === today;
  const cond = condition(state.hormones);

  const logSleep = (hours) => {
    sfxCoin(settings);
    alpha.moveHormones({ kind: "sleep", hours });
    alpha.logEvent("sleep_log", { hours });
    alpha.patchState({ flags: { ...state.flags, lastSleepLogDate: today } });
    addXP(5, "Night logged — sleep is the regen system");
  };

  return (
    <div className="iw-al-card iw-al-zone-card iw-al-hormone-card">
      <div className="iw-al-card-head">
        <span className="iw-eyebrow iw-al-card-title">the hormone codex</span>
        <span className="iw-chip">{cond} condition</span>
      </div>
      <div className="iw-al-dials">
        {HORMONES.map((h) => {
          const v = state.hormones[h.id] ?? 50;
          return (
            <div key={h.id} className="iw-al-dial">
              <div className="iw-al-dial-top">
                <span className="iw-al-dial-name">{h.label}</span>
                <span className="iw-al-dial-val">{v}</span>
              </div>
              <div className="iw-al-dial-track">
                <div className="iw-al-dial-fill" style={{ width: `${v}%` }} />
              </div>
              {!compact && <div className="iw-al-dial-villain">{h.villain}</div>}
            </div>
          );
        })}
      </div>
      <div className="iw-al-sleeplog">
        <span className="iw-eyebrow">{sleepLogged ? "night logged ✓" : "last night's sleep"}</span>
        {!sleepLogged && (
          <div className="iw-al-fc-hours">
            {SLEEP_CHIPS.map((c) => (
              <button key={c.label} className="iw-chip-btn" onClick={() => logSleep(c.hours)}>{c.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
