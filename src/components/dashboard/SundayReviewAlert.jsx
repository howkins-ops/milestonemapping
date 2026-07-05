import React from "react";
import { isSunday } from "../../lib/dates.js";

export default function SundayReviewAlert({ onNavigate }) {
  if (!isSunday()) return null;

  return (
    <button
      type="button"
      className="dashboard-image-card dashboard-image-card--sunday anim-glow-pulse"
      onClick={() => onNavigate("weekly")}
      aria-label="Begin the Sunday Review"
    >
      <img
        className="dashboard-image-card__bg"
        src="/assets/dashboard/front-cards/sunday-review.png"
        alt=""
        loading="lazy"
      />
      <span className="dashboard-image-card__shade" aria-hidden="true" />
      <span className="dashboard-image-card__content">
        <span className="dashboard-image-card__kicker">Sunday Review is live</span>
        <span className="dashboard-image-card__title">UPDATE THE MAP</span>
        <span className="dashboard-image-card__copy">
          Lock in the wins, reroute the misses, and launch the next mission.
        </span>
        <span className="dashboard-image-card__cta dashboard-image-card__cta--gold">
          Begin Review <span aria-hidden="true">-&gt;</span>
        </span>
      </span>
    </button>
  );
}
