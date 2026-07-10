import React, { useEffect, useState } from "react";
import { windowClock, refuelMeter, fastStreak } from "./engine/fastClock.js";
import { eatWindows } from "./engine/mealTimeline.js";
import { sfxCoin } from "../../../lib/sfx.js";

/* ALPHA MODE — the Fast/Eat clock.
   Reads your real eating window(s) (state.flags.eatWindows via
   eatWindows). The conic ring counts the current interval — eating
   until the window closes, or fasting until the next one opens.
   Sealing a completed fast is a once-a-day ritual. */

const fmtLeft = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

export default function FastClock({ alpha, phase, addXP, settings }) {
  const { state } = alpha;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const windows = eatWindows(state);
  const st = windowClock(windows, now);
  const windowLabel = windows.map((w) => `${w.start}–${w.end}`).join(" · ");
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
    <div className="iw-al-card iw-al-zone-card iw-al-fast-card">
      <div className="iw-al-card-head">
        <span className="iw-eyebrow iw-al-card-title">fast / eat clock · {windowLabel}</span>
        {streak > 0 && <span className="iw-chip iw-chip-ember">🔥 {streak}</span>}
      </div>
      <div className="iw-al-fastclock">
        <div className={`iw-al-fc-ring ${st.phase === "eating" ? "iw-al-fc-eating" : ""}`}
          style={{ "--iw-frac": 1 - st.progress }}>
          <span className="iw-al-fc-state">{st.phase === "eating" ? "EATING" : "FASTING"}</span>
          <span className="iw-al-fc-left">{fmtLeft(st.remainingS)}</span>
          <span className="iw-rest-unit">{st.phase === "eating" ? "until it closes" : "until it opens"}</span>
        </div>
        <div className="iw-al-fc-side">
          <div className="iw-eyebrow">your window{windows.length > 1 ? "s" : ""}</div>
          <div className="iw-al-fc-windows">
            {windows.map((w, i) => (
              <div key={i} className="iw-al-fc-win">
                <span className="iw-al-fc-winlabel">{w.label}</span>
                <span className="iw-al-fc-wintime">{w.start} – {w.end}</span>
              </div>
            ))}
          </div>
          <div className="iw-al-fastline iw-al-fc-hint">change your times in the Fridge → today&apos;s plate</div>
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
