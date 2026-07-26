import React, { useEffect, useRef, useState } from "react";
import { loadClearDay, streakChain, flameStreak, elapsedDay } from "./clearDayStore.js";
import StreakCalendar from "./StreakCalendar.jsx";
import StreakFlame from "./StreakFlame.jsx";
import cdFx from "./cdFx.js";
import { buzzSuccess, tapLight } from "../../lib/haptics.js";
import { sfxIgnite, sfxPhoenix, sfxRungUp } from "../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE IGNITION — what a signature is supposed to feel like.
   Four beats: the fire catches, it flies into the calendar, the
   calendar runs the flame down the whole chain, and then it rests
   on the number. The point is that the day you just signed is
   visibly attached to every day before it — the run is the reward,
   not the checkmark.

   kind "seal"     — amber. Tonight's contract.
   kind "reignite" — the Zone's blue. Days reclaimed; the fire
                     crosses the dark cells it just took back.
   ═══════════════════════════════════════════════════════════════ */

const AMBER = "#ffc46b";
const BLUE = "#00F0FF";

function motionOff() {
  try {
    if (document.documentElement.getAttribute("data-reduced-motion") === "true") return true;
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch {
    return false;
  }
}

export default function StreakIgnition({ kind = "seal", reclaimed = 0, settings, onClose, onSeeMonth }) {
  const still = useRef(motionOff());
  const [beat, setBeat] = useState(() => (still.current ? "rest" : "ignite"));
  const S = loadClearDay();
  const absDay = elapsedDay(S);
  const chain = streakChain(S);
  const streak = flameStreak(S);
  const blue = kind === "reignite";
  const tint = blue ? BLUE : AMBER;

  /* body scroll lock — same contract as the other CLEARDAY overlays */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* the beats */
  useEffect(() => {
    if (still.current) return undefined;
    buzzSuccess();
    sfxIgnite(settings);
    cdFx.flare(tint);
    const W = window.innerWidth || 390;
    const H = window.innerHeight || 844;
    cdFx.burst(W / 2, H * 0.62, "ember", 16, tint);

    const timers = [
      setTimeout(() => setBeat("flight"), 1100),
      setTimeout(() => {
        setBeat("chain");
        sfxPhoenix(settings);
        if (blue) sfxRungUp(settings);
      }, 2100),
      setTimeout(() => setBeat("rest"), 2100 + Math.max(700, chain.length * 45 + 600)),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const running = beat === "chain" ? chain : null;

  const headline = blue
    ? "THE CHAIN HOLDS."
    : `DAY ${absDay} · SEALED.`;

  const sub = blue
    ? `${reclaimed} ${reclaimed === 1 ? "day" : "days"} reclaimed. You didn't start over — you went back and said so.`
    : "One clear day, banked forever. Tomorrow signs its own contract.";

  return (
    <div
      className={`cd-ignite ${blue ? "cd-ignite--blue" : ""}`}
      data-beat={beat}
      role="dialog"
      aria-modal="true"
      aria-label={blue ? "Streak reclaimed" : "Day sealed"}
    >
      <div className="cd-ignite-flame">
        <StreakFlame tone={blue ? "blue" : "day"} size="xl" />
      </div>

      <div className="cd-ignite-kicker">{blue ? "RE-IGNITED" : "THE CONTRACT"}</div>

      {beat === "ignite" ? (
        <div className="cd-ignite-title">{headline}</div>
      ) : (
        <>
          <div className="cd-ignite-count">{streak}</div>
          <div className="cd-ignite-kicker">{streak === 1 ? "DAY LIT" : "DAYS IN A ROW"}</div>
          <p className="cd-ignite-sub">{sub}</p>
        </>
      )}

      <div className="cd-ignite-cal">
        <StreakCalendar S={S} absDay={absDay} runningDays={running} compact />
      </div>

      <div className="cd-ignite-actions">
        <button type="button" className="cd-ghost" onClick={() => { tapLight(); onSeeMonth(); }}>
          see the month
        </button>
        <button type="button" className="cd-btn" onClick={() => { tapLight(); onClose(); }}>
          {blue ? "KEEP IT LIT" : "KEEP THE FLAME LIT"}
        </button>
      </div>
    </div>
  );
}
