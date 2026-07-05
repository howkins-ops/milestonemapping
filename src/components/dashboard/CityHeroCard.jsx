import React from "react";

export default function CityHeroCard({ onEnter }) {
  return (
    <button
      type="button"
      onClick={onEnter}
      aria-label="Enter MapQuest City"
      className="dashboard-image-card dashboard-image-card--city"
    >
      <img
        className="dashboard-image-card__bg"
        src="/assets/dashboard/front-cards/mapquest-city.png"
        alt=""
        loading="lazy"
      />
      <span className="dashboard-image-card__shade" aria-hidden="true" />
      <span className="dashboard-image-card__content">
        <span className="dashboard-image-card__kicker">Open World</span>
        <span className="dashboard-image-card__title">MAPQUEST CITY</span>
        <span className="dashboard-image-card__copy">
          Every feature is a district. The city grows as you do.
        </span>
        <span className="dashboard-image-card__cta">
          Enter the City <span aria-hidden="true">-&gt;</span>
        </span>
      </span>
    </button>
  );
}
