import React from "react";

export default function ZoneHeroCard({ onEnter }) {
  return (
    <button
      type="button"
      onClick={onEnter}
      aria-label="Enter The Zone"
      className="dashboard-image-card dashboard-image-card--zone"
    >
      <img
        className="dashboard-image-card__bg"
        src="/assets/dashboard/front-cards/accountability-zone-card-sales-cyberpunk.png"
        alt=""
        loading="lazy"
      />
      <span className="dashboard-image-card__shade" aria-hidden="true" />
      <span className="dashboard-image-card__content">
        <span className="dashboard-image-card__kicker">Accountability / Daily</span>
        <span className="dashboard-image-card__title">THE ZONE</span>
        <span className="dashboard-image-card__copy">
          Declare it. Prove it. Rise with your people every single day.
        </span>
        <span className="dashboard-image-card__cta">
          Enter the Zone <span aria-hidden="true">-&gt;</span>
        </span>
      </span>
    </button>
  );
}
