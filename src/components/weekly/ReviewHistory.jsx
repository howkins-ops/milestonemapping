import React, { useState } from "react";
import { ScoreSeal, StepSigil } from "./strategyArt.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getScorecardLabel } from "../../lib/constants.js";
import { formatShortDate } from "../../lib/dates.js";

/* THE ARCHIVE — the weeks you already closed.

   Every filed week gets a seal: a notched disc with the score written
   into it and an arc that fills to what you actually scored out of fifty.
   The band colour is the same one the wizard's ring used while you were
   moving the sliders, so a week you remember as green looks green here a
   month later.

   The win is the headline. The lesson is the pull-quote. The receipts are
   pips — one per commitment, lit if you kept it. That's the whole record;
   there was never a reason to also print a 🏅 and a 📖 next to it. */

const BAND_COLOR = (t) =>
  t >= 46 ? "#00FFBF" : t >= 36 ? "#00F0FF" : t >= 26 ? "#FFD166" : t >= 16 ? "#FF8A3D" : "#FF3EDB";

const PAGE = 6;

function totalOf(r) {
  return (
    (Number(r.executionScore) || 0) +
    (Number(r.energyScore) || 0) +
    (Number(r.focusScore) || 0) +
    (Number(r.disciplineScore) || 0) +
    (Number(r.mindsetScore) || 0)
  );
}

export default function ReviewHistory() {
  const { weeklyReviews } = useAppData();
  const [showAll, setShowAll] = useState(false);
  if (weeklyReviews.length === 0) return null;

  const shown = showAll ? weeklyReviews : weeklyReviews.slice(0, PAGE);

  return (
    <section className="sr-sec">
      <header className="sr-sec__head">
        <span className="sr-sec__mark" aria-hidden="true">
          <StepSigil kind="orders" tone="#FFD166" />
        </span>
        <div className="sr-sec__titles">
          <h2 className="sr-sec__title">The Archive</h2>
          <p className="sr-sec__sub">Weeks you already closed, on the record.</p>
        </div>
        <span className="sr-sec__count">
          {weeklyReviews.length} filed
        </span>
      </header>

      <div className="sr-files">
        {shown.map((r) => {
          const total = totalOf(r);
          const color = BAND_COLOR(total);
          const checks = Array.isArray(r.lastWeekChecks) ? r.lastWeekChecks : [];
          return (
            <article key={r.id} className="sr-card sr-file">
              <span className="sr-file__seal" aria-hidden="true">
                <ScoreSeal total={total} max={50} color={color} />
              </span>
              <div className="sr-file__col">
                <div className="sr-file__top">
                  <span className="sr-file__week">
                    Week {r.weekNumber} · {formatShortDate(r.date)}
                  </span>
                  <span className="sr-file__band" style={{ color }}>
                    {getScorecardLabel(total)}
                  </span>
                </div>
                {r.biggestWin && <span className="sr-file__win">{r.biggestWin}</span>}
                {r.lesson && <span className="sr-file__lesson">{r.lesson}</span>}
                {checks.length > 0 && (
                  <div className="sr-file__kept" style={{ color }}>
                    <span className="sr-file__keptlabel">
                      Receipts {checks.filter((c) => c.done).length}/{checks.length}
                    </span>
                    <span className="sr-pips" aria-hidden="true">
                      {checks.map((c, i) => (
                        <span key={i} className={c.done ? "is-kept" : ""} />
                      ))}
                    </span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {weeklyReviews.length > PAGE && (
        <button type="button" className="sr-more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show recent only" : `Open all ${weeklyReviews.length}`}
        </button>
      )}
    </section>
  );
}
