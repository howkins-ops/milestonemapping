import React, { useLayoutEffect, useRef } from "react";

const PRIMARY_TABS = [
  { id: "dashboard", label: "Command", art: "/assets/nav/nav-command.png" },
  { id: "daily", label: "Daily", art: "/assets/nav/nav-daily.png" },
  { id: "milestones", label: "Map", art: "/assets/nav/nav-map.png" },
  { id: "wellbeing", label: "Fill Cup", art: "/assets/nav/nav-cup.png" },
  { id: "essence", label: "Shadow", art: "/assets/nav/nav-shadow.png" },
  { id: "zone", label: "Zone", art: "/assets/nav/nav-zone.png" }
];

export default function BottomNav({ currentPage, onNavigate }) {
  const navRef = useRef(null);

  // Publish the nav's TRUE rendered height (incl. its own safe-area padding) so
  // every screen reserves exactly enough clearance — no matter how labels wrap
  // or how tall the bumped center tab renders. Beats the hardcoded token guess.
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const apply = () =>
      document.documentElement.style.setProperty(
        "--bottom-nav-h",
        `${Math.round(el.offsetHeight)}px`
      );
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("orientationchange", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  return (
    <nav ref={navRef} className="bottom-nav" aria-label="Main navigation">
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
