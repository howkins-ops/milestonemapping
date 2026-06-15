import React from "react";

export default function StepItem({ action, onToggle }) {
  return (
    <button
      type="button"
      className={`rpg-action-item${action.done ? " is-done" : ""}`}
      onClick={() => onToggle(action.id)}
      aria-pressed={action.done}
    >
      <span className="rpg-action-item__check">
        <svg viewBox="0 0 14 14" fill="none">
          <path d="M2 7.5 5.5 11 12 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="rpg-action-item__text">{action.text}</span>
    </button>
  );
}
