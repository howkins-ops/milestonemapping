import React from "react";
import { NAV_ITEMS, APP_NAME, TAGLINE } from "../../lib/constants.js";
import { useGamification } from "../../hooks/useGamification.js";
import NavIcon from "../ui/NavIcon.jsx";

const GROUP_LABELS = {
  core: null,         // no label for primary nav — it speaks for itself
  belief: "BELIEF",
  tools: "TOOLS",
  extras: "EXTRAS",
  config: null,       // settings needs no label
};

export default function SidebarNav({ currentPage, onNavigate }) {
  const { rank, xp } = useGamification();

  // Group items while preserving order from NAV_ITEMS
  const groups = [];
  let lastGroup = null;
  for (const item of NAV_ITEMS) {
    if (item.group !== lastGroup) {
      groups.push({ group: item.group, items: [item] });
      lastGroup = item.group;
    } else {
      groups[groups.length - 1].items.push(item);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">{APP_NAME}</div>
      <div className="sidebar__tagline">{TAGLINE}</div>
      <nav className="sidebar__nav" aria-label="Main navigation">
        {groups.map(({ group, items }, gi) => (
          <React.Fragment key={group}>
            {gi > 0 && (
              <div className="sidebar__section-divider">
                {GROUP_LABELS[group] && (
                  <span className="sidebar__section-label">{GROUP_LABELS[group]}</span>
                )}
              </div>
            )}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${currentPage === item.id ? "is-active" : ""} ${
                  group === "extras" ? "nav-item--extra" : ""
                }`}
                onClick={() => onNavigate(item.id)}
                aria-current={currentPage === item.id ? "page" : undefined}
              >
                <span className="nav-item__icon" aria-hidden="true">
                  <NavIcon name={item.id} />
                </span>
                {item.label}
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>
      <div className="sidebar__footer">
        {rank.name.toUpperCase()} · {xp.toLocaleString()} XP
      </div>
    </aside>
  );
}
