import React, { useEffect, useState } from "react";
import { clockStatus, refuelMeter, fastStreak, DEFAULT_WINDOW_OPEN_HOUR } from "./engine/fastClock.js";
import { sfxCoin } from "../../../lib/sfx.js";

/* ALPHA MODE — the Fast/Eat clock.
   One dial rules them all: the eating window. Conic ring counts the
   current interval; sealing a completed fast is a once-a-day ritual
   that moves the hormone dials and feeds the streak. */

const OPEN_HOURS = [10, 11, 12, 13];
const fmtClock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

export default function FastClock({ alpha, phase, addXP, settings }) {
  const { state } = alpha;
  const openHour = state.flags.windowOpenHour ?? DEFAULT_WINDOW_OPEN_HOUR;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const st = clockStatus({
    openHour, fastHours: phase.fasting.fastHours, eatHours: phase.fasting.eatHours, now,
  });
  const refuel = refuelMeter(state.flags.lastRefuelISO, now);
  const streak = fastStreak(
    alpha.events.filter((e) => e.kind === "fast_complete").map((e) => e.created_at), now);

  const today = now.toDateString();
  const canSeal = st.phase === "eating" && state.flags.lastFastSealDate !== today;

  const sealFast = () => {
    sfxCoin(settings);
    alpha.logEvent("fast_complete", { hours: phase.fasting.fastHours });
    alpha.moveHormones({ kind: "fast_complete" });
    alpha.patchState({ flags: { ...state.flags, lastFastSealDate: today } });
    addXP(5, "Fast sealed — hunger is a message");
  };

  return (
    <div className="iw-al-card">
      <div className="iw-al-card-head">
        <span className="iw-eyebrow iw-al-card-title">the fast/eat clock · {st.windowLabel}</span>
        {streak > 0 && <span className="iw-chip iw-chip-ember">🔥 {streak}</span>}
      </div>
      <div className="iw-al-fastclock">
        <div className={`iw-al-fc-ring ${st.phase === "eating" ? "iw-al-fc-eating" : ""}`}
          style={{ "--iw-frac": 1 - st.progress }}>
          <span className="iw-al-fc-state">{st.phase === "eating" ? "EATING" : "FASTING"}</span>
          <span className="iw-al-fc-left">{fmtClock(st.remainingS)}</span>
          <span className="iw-rest-unit">{st.phase === "eating" ? "until it closes" : "until it opens"}</span>
        </div>
        <div className="iw-al-fc-side">
          <div className="iw-eyebrow">window opens</div>
          <div className="iw-al-fc-hours">
            {OPEN_HOURS.map((h) => (
              <button key={h} className={`iw-chip-btn ${openHour === h ? "iw-chip-on" : ""}`}
                onClick={() => alpha.patchState({ flags: { ...state.flags, windowOpenHour: h } })}>
                {h <= 12 ? `${h}am`.replace("12am", "12pm") : `${h - 12}pm`}
              </button>
            ))}
          </div>
          <div className="iw-eyebrow" style={{ marginTop: 10 }}>refuel meter</div>
          <div className="iw-al-dial-track"><div className="iw-al-dial-fill" style={{ width: `${refuel}%` }} /></div>
          <div className="iw-al-fastline">leptin case for the next feast</div>
        </div>
      </div>
      {canSeal && (
        <button className="iw-btn-ghost iw-btn-wide iw-al-seal-fast" onClick={sealFast}>
          ✦ seal the fast — {phase.fasting.fastHours} hours held
        </button>
      )}
    </div>
  );
}
