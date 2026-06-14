import React from "react";
import Button from "./Button.jsx";

export default function EmptyState({ title, description, actionLabel, onAction, icon = "🛰️" }) {
  return (
    <div className="empty-state anim-fade-in">
      <div className="empty-state__icon" aria-hidden="true">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="neon" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
