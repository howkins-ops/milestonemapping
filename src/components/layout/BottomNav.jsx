import React from "react";
import NavIcon from "../ui/NavIcon.jsx";

const PRIMARY_TABS = [
  { id: "dashboard", label: "Command" },
  { id: "daily", label: "Daily" },
  { id: "milestones", label: "Map" },
  { id: "essence", label: "Shadow" },
  { id: "wellbeing", label: "Fill Cup" }
];

export default function BottomNav({ currentPage, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="bottom-nav__inner">
        {PRIMARY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`bottom-nav__item ${currentPage === tab.id ? "is-active" : ""}`}
            onClick={() => onNavigate(tab.id)}
            aria-current={currentPage === tab.id ? "page" : undefined}
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              <NavIcon name={tab.id} />
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
