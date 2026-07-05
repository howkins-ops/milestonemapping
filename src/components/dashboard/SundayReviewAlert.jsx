import React from "react";
import { isSunday } from "../../lib/dates.js";

export default function SundayReviewAlert({ onNavigate }) {
  if (!isSunday()) return null;

  return (
    <button
      type="button"
      className="dashboard-image-card dashboard-image-card--sunday anim-glow-pulse"
      onClick={() => onNavigate("weekly")}
      aria-label="Sunday Review Live: Update Your Map. Begin the Sunday Review"
    >
      <img
        className="dashboard-image-card__bg"
        src="/assets/dashboard/front-cards/sunday-review.png"
        alt=""
        loading="lazy"
      />
    </button>
  );
}
