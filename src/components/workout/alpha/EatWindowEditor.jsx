import React, { useState } from "react";
import { eatWindows, fmtClock, parseHM } from "./engine/mealTimeline.js";

/* ALPHA MODE — set your real eating window(s).
   Wake at 7, eat till 1, then a late meal at 9? Set both windows here.
   Saves to state.flags.eatWindows (no migration — freeform flag). The
   meal timeline and the fast clock both read from it. */

/* half-hour options from 4:00am to 11:30pm */
const OPTIONS = [];
for (let h = 4; h <= 23.5; h += 0.5) OPTIONS.push(h);

const toHM = (h) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

function TimeSelect({ value, onChange }) {
  return (
    <select className="iw-ew-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {OPTIONS.map((h) => {
        const v = toHM(h);
        return <option key={v} value={v}>{fmtClock(h)}</option>;
      })}
    </select>
  );
}

export default function EatWindowEditor({ alpha, defaultOpen = false }) {
  const { state } = alpha;
  const [open, setOpen] = useState(defaultOpen);

  const wins = eatWindows(state);
  const rows = wins.map((w) => ({ start: toHM(w.startH % 24), end: toHM(w.endH % 24), label: w.label }));
  const isCustom = Array.isArray(state.flags?.eatWindows) && state.flags.eatWindows.length > 0;

  const commit = (next) => {
    alpha.patchState({ flags: { ...state.flags, eatWindows: next.length ? next : null } });
  };
  const setField = (i, field, val) =>
    commit(rows.map((r, k) => (k === i ? { ...r, [field]: val } : r)));
  const addWindow = () => commit([...rows, { start: "21:00", end: "22:00", label: "Late" }]);
  const removeWindow = (i) => commit(rows.filter((_, k) => k !== i));
  const useDefault = () => alpha.patchState({ flags: { ...state.flags, eatWindows: null } });

  const summary = wins.map((w) => `${w.start}–${w.end}`).join("  ·  ");

  return (
    <div className="iw-al-card iw-ew">
      <button className="iw-ew-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="iw-ew-headtext">
          <span className="iw-eyebrow iw-al-card-title">your eating window{wins.length > 1 ? "s" : ""}</span>
          <span className="iw-ew-summary">{summary}</span>
        </span>
        <span className="iw-ew-edit">{open ? "done" : "edit"}</span>
      </button>

      {open && (
        <div className="iw-ew-body">
          <p className="iw-al-fastline">Set the hours you actually eat. Two windows? Add a second one — the plan splits your meals across both.</p>
          {rows.map((r, i) => (
            <div key={i} className="iw-ew-row">
              <span className="iw-ew-rowlabel">{rows.length > 1 ? (i === 0 ? "Morning" : i === rows.length - 1 ? "Late" : `Window ${i + 1}`) : "Window"}</span>
              <div className="iw-ew-times">
                <TimeSelect value={r.start} onChange={(v) => setField(i, "start", v)} />
                <span className="iw-ew-to">to</span>
                <TimeSelect value={r.end} onChange={(v) => setField(i, "end", v)} />
              </div>
              {rows.length > 1 && (
                <button className="iw-ew-remove" onClick={() => removeWindow(i)} aria-label="remove window">✕</button>
              )}
            </div>
          ))}
          <div className="iw-ew-actions">
            {rows.length < 3 && (
              <button className="iw-chip-btn" onClick={addWindow}>＋ add a window</button>
            )}
            {isCustom && (
              <button className="iw-chip-btn" onClick={useDefault}>reset to default</button>
            )}
          </div>
          {parseHM(rows[rows.length - 1]?.end) <= parseHM(rows[rows.length - 1]?.start) && (
            <p className="iw-al-fastline">Tip: the end time should be later than the start.</p>
          )}
        </div>
      )}
    </div>
  );
}
