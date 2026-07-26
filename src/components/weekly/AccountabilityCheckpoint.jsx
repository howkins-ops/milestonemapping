import React from "react";
import { CheckMark } from "./strategyArt.jsx";
import { formatShortDate } from "../../lib/dates.js";

/* THE RECEIPTS — last week's promises, one per line, checked or owned.

   The old card carried a ⚡ in its title, a native checkbox per row, and
   two emoji streak badges at the bottom that repeated numbers the
   ignition screen had already shown one tap earlier. The badges are gone
   — a screen shouldn't tell you the same thing twice — and the checkbox
   is now a drawn box with a check that strokes itself on when you keep
   your word. The real input is still there, visually hidden, so screen
   readers and the keyboard get an honest checkbox. */

function verdict(kept, total) {
  if (total === 0) return null;
  const pct = kept / total;
  if (pct === 0)
    return `Zero out of ${total}. Every promise broken. The first step is honesty — you just took it. Now stop making promises you won't keep, or start keeping them.`;
  if (pct < 0.5)
    return `${kept} of ${total}. You started and didn't finish. The ${total - kept} you missed aren't random — what's the pattern?`;
  if (pct < 0.75)
    return `${kept} of ${total}. You showed up for the majority. The ones you skipped are the work.`;
  if (pct < 1)
    return `${kept} of ${total}. Almost locked in. That last ${total - kept} wasn't a scheduling problem — it was a priority call. Own it.`;
  return `All ${total} kept. That's the identity forming. Don't you dare break it.`;
}

export default function AccountabilityCheckpoint({ lastReview, checks, onChange }) {
  const total = checks.length;
  const kept = checks.filter((c) => c.done).length;
  const pct = total > 0 ? kept / total : null;

  const tone =
    pct === null ? "#00F0FF" : pct === 1 ? "#00FFBF" : pct >= 0.75 ? "#00F0FF" : pct >= 0.5 ? "#FFD166" : "#FF3EDB";

  const toggle = (idx) => onChange(checks.map((c, i) => (i === idx ? { ...c, done: !c.done } : c)));

  return (
    <div className="swiz-rc" style={{ "--rc": tone }}>
      <div className="swiz-rc__head">
        <span className="swiz-rc__kicker">Signed last Sunday</span>
        {lastReview && (
          <span className="swiz-rc__stamp">
            Week {lastReview.weekNumber} · {formatShortDate(lastReview.date)}
          </span>
        )}
      </div>

      {total === 0 ? (
        <p className="swiz-rc__blank">
          {lastReview
            ? "You didn't write down what you'd do last week. That changes at the Orders screen."
            : "No receipts yet — this is your first review. Today you start leaving them."}
        </p>
      ) : (
        <>
          <div className="swiz-rc__list">
            {checks.map((c, i) => (
              <label key={i} className={`swiz-rc__row${c.done ? " is-kept" : ""}`}>
                <input
                  type="checkbox"
                  className="swiz-rc__input"
                  checked={c.done}
                  onChange={() => toggle(i)}
                />
                <span className="swiz-rc__box" aria-hidden="true">
                  {c.done && <CheckMark draw />}
                </span>
                <span className="swiz-rc__text">{c.text}</span>
              </label>
            ))}
          </div>

          <div className="swiz-rc__meter">
            <span className="swiz-rc__pips" aria-hidden="true">
              {checks.map((c, i) => (
                <span key={i} className={c.done ? "is-kept" : ""} />
              ))}
            </span>
            <span className="swiz-rc__score">
              {kept}
              <small>/{total}</small>
            </span>
          </div>

          <p className="swiz-rc__verdict">{verdict(kept, total)}</p>
        </>
      )}
    </div>
  );
}
