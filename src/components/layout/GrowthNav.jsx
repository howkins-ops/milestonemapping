import React from "react";
import NavIcon from "../ui/NavIcon.jsx";

const GROWTH_ITEMS = [
  { id: "identity", label: "Identity" },
  { id: "vision", label: "Vision" },
  { id: "essence", label: "Shadow" },
  { id: "training", label: "5 Shifts" },
  { id: "wellbeing", label: "Fill Your Cup" },
  { id: "blaze", label: "B.L.A.Z.E." },
];

export default function GrowthNav({ currentPage, onNavigate }) {
  return (
    <div className="growth-nav" role="navigation" aria-label="Personal development">
      <div className="growth-nav__track">
        {GROWTH_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`growth-nav__pill ${currentPage === item.id ? "is-active" : ""}`}
            onClick={() => onNavigate(item.id)}
            aria-current={currentPage === item.id ? "page" : undefined}
          >
            <span className="growth-nav__icon" aria-hidden="true">
              <NavIcon name={item.id} />
            </span>
            <span className="growth-nav__label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
