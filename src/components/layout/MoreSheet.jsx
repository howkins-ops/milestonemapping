import React from "react";
import NavIcon from "../ui/NavIcon.jsx";

const MORE_ITEMS = [
  { id: "weekly", label: "Weekly Review" },
  { id: "rewards", label: "Rewards Vault" },
  { id: "stats", label: "Stats" },
  { id: "formula", label: "Mastery Formula" },
  { id: "science", label: "The Science" },
  { id: "settings", label: "Settings" },
];

export default function MoreSheet({ currentPage, onNavigate, onClose }) {
  return (
    <div className="more-overlay" onClick={onClose}>
      <div className="more-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="More navigation">
        <div className="more-sheet__handle" />
        <p className="more-sheet__kicker">Tools &amp; Config</p>
        <div className="more-sheet__grid">
          {MORE_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`more-sheet__item ${currentPage === item.id ? "is-active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="more-sheet__icon" aria-hidden="true">
                <NavIcon name={item.id} />
              </span>
              <span className="more-sheet__label">{item.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="more-sheet__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
