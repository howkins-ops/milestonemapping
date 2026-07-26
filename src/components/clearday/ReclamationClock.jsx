import React, { useEffect, useState } from "react";
import { milestonesFor, TRACK_META } from "./clearDayData.js";
import { Science } from "./IdentityTab.jsx";

/* ═══════════════════════════════════════════════════════════════
   THE RECLAMATION CLOCK — hours counting down to real, cited
   brain-recovery milestones. Why hours: the same future feels
   dramatically closer in smaller time units (Lewis & Oyserman
   2015), and motivation accelerates approaching a goal (goal-
   gradient, Kivetz 2006) — chained milestones keep you inside
   that acceleration zone for the whole program instead of only
   the last week. Honesty law: no milestone says "healed"; day 66
   is IDENTITY GRADUATION and the clock flips to a count-up —
   no finish line, no cliff, nothing to relapse "after."
   Pure derived display: reads the store, writes nothing.
   Both components run their own 1s tick so only they re-render.
   ═══════════════════════════════════════════════════════════════ */

function startMsOf(S) {
  if (!S?.startedAt || typeof S.startedAt !== "string") return null;
  const [y, m, d] = S.startedAt.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1).getTime();
}

const deadlineOf = (startMs, m) => startMs + (m.day - 1) * 86400000;

function useNowTick() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => {
      if (!document.hidden) setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const pad = (n) => String(n).padStart(2, "0");

function splitRemaining(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function clockState(S, now) {
  const startMs = startMsOf(S);
  if (startMs === null) return null;
  const list = milestonesFor(S.tracks);
  if (!list.length) return null;
  const next = list.find((m) => deadlineOf(startMs, m) > now) || null;
  return { startMs, list, next };
}

/* The Today chip is deliberately gone. A live countdown parked above the
   fold turned the hero into a stack of competing pills, and an hours-
   remaining number is not the question Today asks. The clock keeps its
   full form on Journey, where the milestone ladder gives it meaning. */

/* the full clock — Journey's hero */
export default function ReclamationClock({ S }) {
  const now = useNowTick();
  const st = clockState(S, now);
  if (!st) return null;
  const { startMs, list, next } = st;

  return (
    <div className="cd-card cd-clock">
      <div className="cd-label cd-label--dawn">THE RECLAMATION CLOCK</div>
      <p className="cd-p cd-p--soft cd-clock-lede">
        Your brain is rebuilding on a schedule. These are the real dates — every one of them cited, none of them a promise.
      </p>

      {next ? (
        (() => {
          const r = splitRemaining(deadlineOf(startMs, next) - now);
          return (
            <div className="cd-clock-next">
              <div className="cd-clock-hours">
                {r.h}<span className="cd-clock-hrs-label">HRS</span>
              </div>
              <div className="cd-clock-mmss">{pad(r.m)}:{pad(r.s)}</div>
              <div className="cd-clock-until">
                until · <strong>{next.title}</strong>
                {next.track !== "all" && TRACK_META[next.track] && (
                  <span className="cd-ballot-track" style={{ color: TRACK_META[next.track].color, borderColor: `${TRACK_META[next.track].color}55`, marginLeft: 8 }}>
                    {TRACK_META[next.track].label.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="cd-clock-sub">{next.sub}</div>
            </div>
          );
        })()
      ) : (
        (() => {
          const clear = splitRemaining(now - startMs);
          const days = Math.floor(clear.h / 24);
          return (
            <div className="cd-clock-next cd-clock-next--free">
              <div className="cd-clock-hours">{days}<span className="cd-clock-hrs-label">DAYS</span></div>
              <div className="cd-clock-mmss">{pad(clear.h % 24)}h {pad(clear.m)}m clear</div>
              <div className="cd-clock-until">Every milestone reclaimed. <strong>The clock is yours now</strong> — it only counts up.</div>
            </div>
          );
        })()
      )}

      <div className="cd-clock-ladder">
        {list.map((m) => {
          const dl = deadlineOf(startMs, m);
          const past = dl <= now;
          const isNext = next && m.id === next.id;
          return (
            <div key={m.id} className={`cd-clock-row ${past ? "cd-clock-row--past" : isNext ? "cd-clock-row--next" : "cd-clock-row--future"}`}>
              <div className="cd-clock-row-head">
                <span className="cd-clock-stamp">{past ? "◆ RECLAIMED" : `DAY ${m.day}`}</span>
                <span className="cd-clock-row-title">{m.title}</span>
                {m.track !== "all" && TRACK_META[m.track] && (
                  <span className="cd-ballot-track" style={{ color: TRACK_META[m.track].color, borderColor: `${TRACK_META[m.track].color}55` }}>
                    {TRACK_META[m.track].label.toUpperCase()}
                  </span>
                )}
              </div>
              {(past || isNext) && <div className="cd-clock-row-sub">{m.sub}</div>}
              <div className="cd-cite">◈ {m.cite}</div>
            </div>
          );
        })}
      </div>

      <Science>
        Motivation accelerates the closer you get to a goal (goal-gradient, Kivetz 2006) — chained milestones
        keep you close to one for all 66 days. And the same future feels dramatically nearer counted in hours
        than in days (Lewis &amp; Oyserman 2015) — people acted 4× sooner on a goal framed in the smaller unit.
      </Science>
    </div>
  );
}
