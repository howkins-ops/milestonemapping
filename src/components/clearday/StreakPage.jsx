import React, { useRef, useState } from "react";
import {
  streakStats, dateForDay, reigniteDaysLeft, elapsedDay, REIGNITE_WINDOW,
} from "./clearDayStore.js";
import StreakCalendar from "./StreakCalendar.jsx";
import StreakFlame from "./StreakFlame.jsx";
import ReigniteSheet from "./ReigniteSheet.jsx";
import { tapLight } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   THE STREAK — the whole record, in one place.
   Deliberately not a scoreboard: the ash log sits on the same page
   as the flame, framed as evidence rather than failure, because a
   reset that keeps its history is the one people come back from.
   Nothing here ever reads zero — the run can restart, the record
   can't be taken away.
   ═══════════════════════════════════════════════════════════════ */

function shortDate(d) {
  try {
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function StreakPage({ S, settings, onBack, onReclaimed }) {
  const [picked, setPicked] = useState(null);
  const reclaimedRef = useRef(0); // how many this sitting — the ceremony's copy

  const absDay = elapsedDay(S);
  const st = streakStats(S);
  const blue = (st.current > 0 && st.relit > 0) || (st.current === 0 && st.reignitable.length > 0);

  /* CLEARDAY's language law: nothing ever resets to zero. A run of 0 is real
     and never hidden — but it's a chain waiting to be closed, not a scoreboard
     reading nil, so the hero leads with the days that are still claimable
     instead of putting a 0 on the wall. */
  const waiting = st.current === 0 && st.reignitable.length > 0;

  const openDay = (n, status) => {
    if (status !== "gap") return;
    tapLight();
    setPicked(n);
  };

  return (
    <div className="cd-page">
      <button type="button" className="cd-streak-back" onClick={onBack}>‹ Journey</button>

      <div className="cd-section-head cd-streak-hero">
        <div className="cd-hero-kicker">THE STREAK</div>
        <StreakFlame tone={waiting ? "ash" : blue ? "blue" : "day"} size="lg" />
        <div className={`cd-streak-count ${blue ? "cd-streak-count--blue" : ""}`}>
          {waiting ? st.reignitable.length : st.current}
        </div>
        <div className="cd-streak-word">
          {waiting
            ? (st.reignitable.length === 1 ? "day waiting to be claimed" : "days waiting to be claimed")
            : st.current === 1 ? "day lit" : "days in a row"}
        </div>
        <p className="cd-p cd-p--soft" style={{ marginTop: 10 }}>
          {waiting
            ? <>The chain isn't broken — <strong>it's just unsigned.</strong> Claim the days you were clear and it closes back up.</>
            : <>Not how long it's been. <strong>How many days you actually authored.</strong></>}
        </p>
        <div className="cd-streak-stats">
          <div className="cd-streak-stat"><b>{st.best}</b><span>best run</span></div>
          <div className="cd-streak-stat"><b>{st.lit}</b><span>days lit</span></div>
          <div className="cd-streak-stat"><b>{st.relit}</b><span>reclaimed</span></div>
        </div>
      </div>

      {st.reignitable.length > 0 && (
        <div className="cd-card cd-reclaim">
          <div className="cd-label" style={{ color: "#00F0FF" }}>RE-IGNITE</div>
          <div className="cd-card-title">
            {st.reignitable.length} {st.reignitable.length === 1 ? "day is" : "days are"} still open to reclaim.
          </div>
          <p className="cd-p cd-p--soft" style={{ margin: "6px 0 12px" }}>
            A day you never closed out isn't a day you lost — it's a day you never said anything about.
            Sign for it and the chain closes back up. After {REIGNITE_WINDOW} days it freezes, so this
            window is the mercy, not a loophole.
          </p>
          {st.reignitable.map((n) => {
            const d = dateForDay(S, n);
            const left = reigniteDaysLeft(S, n);
            return (
              <div key={n} className="cd-reclaim-row">
                <div>
                  <div className="cd-reclaim-date">{d ? shortDate(d) : `Day ${n}`}</div>
                  <div className="cd-reclaim-left">
                    Day {n} · <b>{left <= 1 ? "last day" : `${left} days left`}</b> to reclaim
                  </div>
                </div>
                <button type="button" className="cd-reclaim-btn" onClick={() => { tapLight(); setPicked(n); }}>
                  reclaim
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="cd-card">
        <StreakCalendar S={S} absDay={absDay} onPickDay={openDay} />
        {S.streakBackfilledAt && (
          <p className="cd-cal-foot">
            Days from before THE STREAK shipped were counted as lit — you were living them,
            there just wasn't anywhere to sign. Anything inside the last {REIGNITE_WINDOW} days
            was left for you to sign yourself.
          </p>
        )}
        {st.cold > 0 && (
          <p className="cd-cal-foot">
            {st.cold} {st.cold === 1 ? "day has" : "days have"} gone past reclaiming. They stay on the
            record. The record is the point.
          </p>
        )}
      </div>

      {st.ash > 0 && (
        <div className="cd-card">
          <div className="cd-label">THE DAYS YOU TOLD THE TRUTH ABOUT</div>
          <p className="cd-p cd-p--soft" style={{ margin: "6px 0 12px" }}>
            {st.ash} of them. Every one is a day you could have quietly left blank and didn't.
            That's evidence too — of the exact thing this whole program is about.
          </p>
          {Object.keys(S.closedDays)
            .map(Number)
            .filter((n) => S.closedDays[n] === "slip")
            .sort((a, b) => b - a)
            .slice(0, 12)
            .map((n) => {
              const d = dateForDay(S, n);
              return (
                <div key={n} className="cd-ashrow">
                  <StreakFlame tone="ash" size="sm" />
                  <span>{d ? shortDate(d) : ""} · day {n} — logged honestly</span>
                </div>
              );
            })}
        </div>
      )}

      {picked !== null && (
        <ReigniteSheet
          day={picked}
          settings={settings}
          onRelit={(res) => { if (res && res.relit) reclaimedRef.current += 1; setPicked(null); }}
          onAllClear={(res) => {
            reclaimedRef.current += 1;
            setPicked(null);
            if (onReclaimed) onReclaimed({ ...res, reclaimed: reclaimedRef.current });
            reclaimedRef.current = 0;
          }}
          onClose={() => setPicked(null)}
        />
      )}
    </div>
  );
}
