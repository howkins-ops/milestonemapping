import React from "react";
import Card from "../ui/Card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getScorecardLabel } from "../../lib/constants.js";
import { formatShortDate } from "../../lib/dates.js";

export default function ReviewHistory() {
  const { weeklyReviews } = useAppData();
  if (weeklyReviews.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Mission Log" icon="📜" sub="Every reviewed week is captured intel." />
      <div className="stack" style={{ gap: 12 }}>
        {weeklyReviews.map((r) => {
          const total =
            (Number(r.executionScore) || 0) +
            (Number(r.energyScore) || 0) +
            (Number(r.focusScore) || 0) +
            (Number(r.disciplineScore) || 0) +
            (Number(r.mindsetScore) || 0);
          return (
            <Card key={r.id} variant="glass">
              <div className="row row--between row--wrap">
                <div>
                  <span className="mono" style={{ fontSize: 12.5, color: "var(--brand-cyan)" }}>
                    WEEK {r.weekNumber} · {formatShortDate(r.date)}
                  </span>
                  {r.biggestWin && (
                    <p style={{ marginTop: 6, fontSize: 14 }}>🏅 {r.biggestWin}</p>
                  )}
                  {r.lesson && (
                    <p className="muted" style={{ marginTop: 3, fontSize: 13 }}>
                      📖 {r.lesson}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <div className="mono" style={{ fontSize: 21, fontWeight: 700, color: "var(--brand-green)" }}>
                    {total}/50
                  </div>
                  <span className="badge badge--gold" style={{ marginTop: 4 }}>
                    {getScorecardLabel(total)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
