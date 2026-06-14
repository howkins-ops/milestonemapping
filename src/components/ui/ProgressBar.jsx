import React from "react";

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  variant = "default",
  showPercent = true
}) {
  const percent = max > 0 ? Math.round(Math.max(0, Math.min(1, value / max)) * 100) : 0;
  const variantClass = variant !== "default" ? `progress-bar--${variant}` : "";

  return (
    <div
      className={`progress-bar ${variantClass}`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || "Progress"}
    >
      {(label || showPercent) && (
        <div className="progress-bar__head">
          <span className="progress-bar__label">{label}</span>
          {showPercent && <span className="progress-bar__percent">{percent}%</span>}
        </div>
      )}
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
