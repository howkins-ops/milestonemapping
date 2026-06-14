import React from "react";

export default function StatCard({ label, value, hint, tone = "", icon }) {
  return (
    <div className={`stat-card ${tone ? `stat-card--${tone}` : ""}`}>
      <div className="row row--between">
        <span className="stat-card__label">{label}</span>
        {icon && <span aria-hidden="true">{icon}</span>}
      </div>
      <div className="stat-card__value">{value}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
    </div>
  );
}
