import React from "react";

// Standalone achievement toast body — used by the toast stack via type "achievement",
// and reusable anywhere an inline achievement banner is needed.
export default function AchievementToast({ icon = "🏅", title, description }) {
  return (
    <div className="toast toast--achievement" role="status">
      <span className="toast__icon" aria-hidden="true">{icon}</span>
      <div>
        <div className="toast__title">{title}</div>
        {description && <div className="toast__message">{description}</div>}
      </div>
    </div>
  );
}
