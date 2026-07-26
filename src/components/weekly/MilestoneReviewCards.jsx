import React from "react";
import { StepSigil, FrontTerrain } from "./strategyArt.jsx";
import { useMilestones } from "../../hooks/useMilestones.js";
import { getMilestoneProgress, getNextIncompleteAction } from "../../lib/progress.js";

/* THE FRONTS — every active mission as a piece of ground.

   This used to be three glass boxes with a progress bar in each. A bar
   tells you a number you can already read; it doesn't tell you a mission
   at 8% and a mission at 91% are different *places*. So each card draws
   its own ridgeline, seeded off the milestone's id — same milestone, same
   terrain, forever — and the percentage is a front line sweeping across
   it. Ground behind the line is lit in the mission's colour. Ground ahead
   is dark. You read the whole board in one glance without reading a
   single number. */

export function frontTone(pct) {
  if (pct >= 80) return "#00FFBF";
  if (pct >= 45) return "#00F0FF";
  if (pct >= 15) return "#FFD166";
  return "#FF3EDB";
}

/* The board used to filter on status === "active" alone. But the app
   promotes a milestone to "in_progress" the moment you tick its first
   action — so the one mission you were actually moving was the one that
   disappeared from the review. A front is any milestone you can still
   advance: active or in progress. */
export function openFronts(milestones) {
  return (milestones || []).filter((m) => m.status === "active" || m.status === "in_progress");
}

export default function MilestoneReviewCards() {
  const { milestones } = useMilestones();
  const active = openFronts(milestones);
  if (active.length === 0) return null;

  return (
    <section className="sr-sec">
      <header className="sr-sec__head">
        <span className="sr-sec__mark" aria-hidden="true">
          <StepSigil kind="battle" tone="#00FFBF" />
        </span>
        <div className="sr-sec__titles">
          <h2 className="sr-sec__title">The Fronts</h2>
          <p className="sr-sec__sub">Ground held, ground still dark.</p>
        </div>
        <span className="sr-sec__count">{active.length} active</span>
      </header>

      <div className="sr-fronts">
        {active.map((m) => {
          const pct = getMilestoneProgress(m);
          const next = getNextIncompleteAction(m);
          const tone = frontTone(pct);
          return (
            <article key={m.id} className="sr-card sr-front">
              <span className="sr-card__art" aria-hidden="true">
                <FrontTerrain seed={m.id || m.title} pct={pct} tone={tone} />
              </span>
              <span className="sr-card__scrim" aria-hidden="true" />
              <div className="sr-card__body sr-front__body">
                <div className="sr-front__row">
                  <span className="sr-front__title">{m.title}</span>
                  <span className="sr-front__pct" style={{ color: tone }}>
                    {pct}
                    <small>%</small>
                  </span>
                </div>
                <p className="sr-front__next">
                  <b>{next ? "Next" : "Status"}</b>
                  {next ? next.text : "Ready to unlock"}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
