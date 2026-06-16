import React from "react";

const PRIMARY_TABS = [
  { id: "dashboard", label: "Command", art: "/assets/nav/nav-command.png" },
  { id: "daily", label: "Daily", art: "/assets/nav/nav-daily.png" },
  { id: "milestones", label: "Map", art: "/assets/nav/nav-map.png" },
  { id: "essence", label: "Shadow", art: "/assets/nav/nav-shadow.png" },
  { id: "wellbeing", label: "Fill Cup", art: "/assets/nav/nav-cup.png" }
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
              <img className="bottom-nav__art" src={tab.art} alt="" loading="eager" />
            </span>
            <span className="bottom-nav__label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
