import React, { useMemo, useState } from "react";
import { monthCells, dateForDay, elapsedDay, REIGNITE_WINDOW } from "./clearDayStore.js";
import StreakFlame from "./StreakFlame.jsx";
import { tapLight } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   THE CALENDAR — every authored day, burning.
   Grid math is the Zone photo calendar's, and so is its design law:
   a day without a mark is dim, never scolded. What's added here is
   the chain — consecutive lit days connect, so a run reads as one
   unbroken run of fire instead of a scatter of dots. That's the
   whole point of a streak you can see.
   ═══════════════════════════════════════════════════════════════ */

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const TONE = { lit: "day", relit: "blue", ash: "ash" };

function monthLabel(y, m) {
  try {
    return new Date(y, m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" }).toUpperCase();
  } catch {
    return `${y}-${m + 1}`;
  }
}

export default function StreakCalendar({
  S,
  absDay = elapsedDay(S),
  onPickDay,
  runningDays = null, // day numbers the ceremony is walking, oldest first
  compact = false,
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));

  const startBound = useMemo(() => {
    const d = dateForDay(S, 1);
    return d ? { y: d.getFullYear(), m: d.getMonth() } : { y: today.getFullYear(), m: today.getMonth() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S.startedAt]);

  const cells = useMemo(
    () => monthCells(S, cursor.y, cursor.m),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [S, cursor.y, cursor.m, absDay]
  );

  const atStart = cursor.y === startBound.y && cursor.m === startBound.m;
  const atEnd = cursor.y === today.getFullYear() && cursor.m === today.getMonth();

  const step = (dir) => {
    tapLight();
    setCursor((c) => {
      const next = new Date(c.y, c.m + dir, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });
  };

  // A cell links back to the one before it only when both burned AND it
  // isn't the first column — a connector on column 0 would trail off the row.
  const litAt = (n) => n !== null && (S.closedDays[n] === "clear");
  const runIndex = (n) => (runningDays ? runningDays.indexOf(n) : -1);

  const renderCell = (cell, i) => {
    if (cell.blank) return <div key={cell.key} className="cd-cal-blank" aria-hidden="true" />;
    const { dayNum, status, dateNum } = cell;
    const isToday = dayNum === absDay;
    const tappable = status === "gap" || (status === "open" && Boolean(onPickDay));
    const link = litAt(dayNum) && litAt(dayNum - 1) && i % 7 !== 0;
    const rIdx = runIndex(dayNum);
    const cls = [
      "cd-cal-cell",
      `cd-cal-cell--${status}`,
      link ? "cd-cal-cell--link" : "",
      isToday ? "cd-cal-cell--today" : "",
      rIdx >= 0 ? "cd-cal-cell--running" : "",
    ].filter(Boolean).join(" ");

    const label = (() => {
      const d = cell.date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
      if (status === "lit") return `${d} — clear, signed`;
      if (status === "relit") return `${d} — clear, reclaimed`;
      if (status === "ash") return `${d} — logged as a slip`;
      if (status === "gap") return `${d} — never closed out, tap to reclaim`;
      if (status === "cold") return `${d} — never closed out, past reclaiming`;
      if (status === "open") return `${d} — today, not yet signed`;
      return d;
    })();

    const body = (
      <>
        {TONE[status] && <StreakFlame tone={TONE[status]} size="sm" />}
        <span className="cd-cal-cell__n">{dateNum}</span>
      </>
    );

    if (!tappable) {
      return (
        <div key={cell.key} className={cls} style={rIdx >= 0 ? { "--i": rIdx } : undefined} title={label} aria-label={label}>
          {body}
        </div>
      );
    }
    return (
      <button
        key={cell.key}
        type="button"
        className={cls}
        style={rIdx >= 0 ? { "--i": rIdx } : undefined}
        onClick={() => { tapLight(); onPickDay(dayNum, status); }}
        aria-label={label}
        title={label}
      >
        {body}
      </button>
    );
  };

  return (
    <div className="cd-cal">
      {!compact && (
        <div className="cd-cal-head">
          <button type="button" className="cd-cal-nav" onClick={() => step(-1)} disabled={atStart} aria-label="Previous month">‹</button>
          <span className="cd-cal-month">{monthLabel(cursor.y, cursor.m)}</span>
          <button type="button" className="cd-cal-nav" onClick={() => step(1)} disabled={atEnd} aria-label="Next month">›</button>
        </div>
      )}
      <div className="cd-cal-grid">
        {WEEKDAYS.map((wd, i) => (
          <div key={`wd-${i}`} className="cd-cal-wd">{wd}</div>
        ))}
        {cells.map(renderCell)}
      </div>
      {!compact && (
        <div className="cd-cal-legend">
          <span><i className="is-lit" /> signed that day</span>
          <span><i className="is-relit" /> reclaimed</span>
          <span><i className="is-gap" /> open to reclaim ({REIGNITE_WINDOW}d)</span>
          <span><i className="is-ash" /> told the truth</span>
        </div>
      )}
    </div>
  );
}

/* The Journey strip — the last 7 days, no paging, no tap targets of its
   own. The whole card is the button. */
export function StreakWeekStrip({ S, absDay = elapsedDay(S) }) {
  const days = [];
  for (let d = Math.max(1, absDay - 6); d <= absDay; d += 1) days.push(d);
  return (
    <div className="cd-streakcard-week" aria-hidden="true">
      {days.map((n) => {
        const mark = S.closedDays[n];
        const status = mark === "slip" ? "ash" : mark === "clear" ? (S.reignited[n] ? "relit" : "lit") : n === absDay ? "open" : absDay - n <= REIGNITE_WINDOW ? "gap" : "cold";
        const d = dateForDay(S, n);
        return (
          <div key={n} className={`cd-cal-cell cd-cal-cell--${status}`}>
            {TONE[status] && <StreakFlame tone={TONE[status]} size="sm" />}
            <span className="cd-cal-cell__n">{d ? d.getDate() : n}</span>
          </div>
        );
      })}
    </div>
  );
}
