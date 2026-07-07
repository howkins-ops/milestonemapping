import React, { useState } from "react";
import { DIET_DEBUFFS } from "./data/phases.js";
import { refuelMeter } from "./engine/fastClock.js";
import { SCROLLS } from "./data/scrolls.js";
import { ScrollCard } from "./WisdomScroll.jsx";
import { sfxPhoenix, sfxScrollUnfurl } from "../../../lib/sfx.js";

/* ALPHA MODE — the Cheat Day boss event (weekly, scheduled).
   Not a broken streak — a scheduled power-up. The four diet-debuff
   meters sit drained; the FEAST ritual refills them all at once.
   Pairs with the feast/fast: tomorrow's full fast locks the bump in. */

const RULES = [
  "Don't eat yourself sick — feast, don't punish.",
  "Same-day food only. Nothing stockpiled in advance.",
  "Zero guilt. This is the mechanism working, not failing.",
];

export default function CheatDayEvent({ alpha, addXP, settings, onClose, pairedFastTomorrow }) {
  const { state } = alpha;
  const today = new Date().toDateString();
  const alreadyFeasted = state.flags.lastRefuelISO &&
    new Date(state.flags.lastRefuelISO).toDateString() === today;
  const [feasted, setFeasted] = useState(alreadyFeasted);
  const firstEver = !state.flags.lastRefuelISO;
  const refuel = refuelMeter(state.flags.lastRefuelISO);
  const scroll = SCROLLS.find((s) => s.id === "first-cheat");

  const feast = () => {
    sfxPhoenix(settings);
    try { if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 30]); } catch { /* silent */ }
    const iso = new Date().toISOString();
    const scrolls = state.flags.scrolls || [];
    const giveScroll = firstEver && !scrolls.includes("first-cheat");
    alpha.patchState({
      flags: {
        ...state.flags,
        lastRefuelISO: iso,
        ...(giveScroll ? { scrolls: [...scrolls, "first-cheat"] } : {}),
      },
    });
    alpha.logEvent("cheat_day", {});
    if (giveScroll) { alpha.logEvent("scroll", { scrollId: "first-cheat" }); sfxScrollUnfurl(settings); }
    alpha.moveHormones({ kind: "cheat_day" });
    addXP(15, "The Refuel — furnace fed on purpose");
    setFeasted(true);
  };

  return (
    <div className="iw-al-cheat">
      <button className="iw-back" onClick={onClose}>❮ the zone</button>
      <div className="iw-eyebrow" style={{ color: "#ff8a4d" }}>scheduled boss event</div>
      <h2 className="iw-display iw-page-title">The Refuel</h2>
      <p className="iw-body iw-al-forge-sub">
        A week in deficit drains four meters. One deliberate feast
        resets all four at once — that's not cheating the plan,
        that IS the plan.
      </p>

      <div className="iw-al-debuffs">
        {DIET_DEBUFFS.map((d, i) => (
          <div key={d.id} className="iw-al-debuff">
            <div className="iw-al-dial-top">
              <span className="iw-al-dial-name">{d.label}</span>
              <span className="iw-al-dial-val">{feasted ? 100 : Math.min(refuel, 35)}</span>
            </div>
            <div className="iw-al-dial-track">
              <div className={`iw-al-dial-fill ${feasted ? "iw-al-debuff-refilled" : "iw-al-debuff-low"}`}
                style={{ width: `${feasted ? 100 : Math.min(refuel, 35)}%`, transitionDelay: `${i * 180}ms` }} />
            </div>
            <div className="iw-al-dial-villain">{d.line}</div>
          </div>
        ))}
      </div>

      <div className="iw-al-rules">
        <div className="iw-eyebrow iw-al-card-title">three rules, nothing else</div>
        {RULES.map((r, i) => <div key={i} className="iw-al-rule">◆ {r}</div>)}
      </div>

      {!feasted ? (
        <button className="iw-btn-ember iw-btn-wide" onClick={feast}>🔥 FEAST — reset all four</button>
      ) : (
        <div className="iw-al-feasted iw-drop-in">
          <div className="iw-al-offledger">METERS RESET</div>
          {firstEver && scroll && <ScrollCard scroll={scroll} unfurl />}
          {pairedFastTomorrow && (
            <div className="iw-al-gate">
              <span className="iw-al-gate-glyph" aria-hidden="true">⏳</span>
              Tomorrow pairs the feast with a full fast (~32–40h total) to lock
              the leptin bump in. The fallback ALWAYS stands: a small 400-calorie
              dinner still counts. Busy hands win fast days — stack tomorrow full.
            </div>
          )}
          <button className="iw-btn-ghost iw-btn-wide" onClick={onClose}>back to the zone</button>
        </div>
      )}
    </div>
  );
}
