import React, { useState, useRef, useEffect } from "react";
import BottomNav from "./BottomNav.jsx";
import MoreSheet from "./MoreSheet.jsx";
import AnimatedBackground from "./AnimatedBackground.jsx";
import SyncStatus from "../ui/SyncStatus.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import NavIcon from "../ui/NavIcon.jsx";

const GROWTH_MENU = [
  { id: "identity", label: "Identity", sub: "Name the new version" },
  { id: "vision", label: "Vision Board", sub: "See where you're going" },
  { id: "essence", label: "Shadow Work", sub: "Face what's holding you back" },
  { id: "training", label: "5 Shifts", sub: "Cinematic transformation" },
  { id: "wellbeing", label: "Fill Your Cup", sub: "Energy & recovery" },
  { id: "blaze", label: "B.L.A.Z.E.", sub: "Advanced training lab" },
];

const TOPBAR_ICONS = {
  paths: "/assets/topbar/topbar-paths.png",
  more: "/assets/topbar/topbar-more.png",
  profile: "/assets/topbar/topbar-profile.png",
};

export default function AppShell({ currentPage, onNavigate, onSignOut, children }) {
  const { profile, syncStatus } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleMenuNav = (id) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <>
      <AnimatedBackground />
      <div className="app-shell">
        <div className="app-main">
          <div className="app-header">
            <header className="app-topbar">
              <div className="app-topbar__brand">

                {/* Diamond — dropdown trigger */}
                <div className="app-topbar__diamond-wrap" ref={menuRef}>
                  <button
                    type="button"
                    className={`app-topbar__diamond ${menuOpen ? "is-open" : ""}`}
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Growth paths menu"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="app-topbar__icon-box" aria-hidden="true">
                      <img className="app-topbar__icon-art" src={TOPBAR_ICONS.paths} alt="" />
                    </span>
                    <span className="app-topbar__btn-label">
                      Paths
                      <span className={`app-topbar__chevron ${menuOpen ? "is-open" : ""}`} aria-hidden="true" />
                    </span>
                  </button>

                  {menuOpen && (
                    <div className="topbar-dropdown" role="menu" aria-label="Growth paths">
                      <div className="topbar-dropdown__header">GROWTH PATHS</div>
                      {GROWTH_MENU.map((item) => {
                        const isActive = currentPage === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="menuitem"
                            className={`topbar-dropdown__item ${isActive ? "is-active" : ""}`}
                            onClick={() => handleMenuNav(item.id)}
                          >
                            <span className="topbar-dropdown__icon" aria-hidden="true">
                              <NavIcon name={item.id} />
                            </span>
                            <span className="topbar-dropdown__text">
                              <span className="topbar-dropdown__label">{item.label}</span>
                              <span className="topbar-dropdown__sub">{item.sub}</span>
                            </span>
                            {isActive && <span className="topbar-dropdown__dot" aria-hidden="true" />}
                          </button>
                        );
                      })}
                      {onSignOut && (
                        <>
                          <div className="topbar-dropdown__divider" />
                          <button
                            type="button"
                            role="menuitem"
                            className="topbar-dropdown__item topbar-dropdown__item--signout"
                            onClick={() => { setMenuOpen(false); onSignOut(); }}
                          >
                            <span className="topbar-dropdown__text">
                              <span className="topbar-dropdown__label">Sign Out</span>
                              <span className="topbar-dropdown__sub">
                                {profile?.display_name || profile?.full_name || "Your account"}
                              </span>
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="app-topbar__right">
                <SyncStatus status={syncStatus} />
                <button
                  type="button"
                  className="app-topbar__profile-btn"
                  onClick={() => setMoreOpen(true)}
                  aria-label="More options"
                  aria-haspopup="dialog"
                >
                  <span className="app-topbar__icon-box" aria-hidden="true">
                    <img className="app-topbar__icon-art" src={TOPBAR_ICONS.more} alt="" />
                  </span>
                  <span className="app-topbar__btn-label">More</span>
                </button>
                <button
                  type="button"
                  className="app-topbar__profile-btn"
                  onClick={() => onNavigate("profile")}
                  aria-label="View profile"
                >
                  <span className="app-topbar__icon-box" aria-hidden="true">
                    <img className="app-topbar__icon-art" src={TOPBAR_ICONS.profile} alt="" />
                  </span>
                  <span className="app-topbar__btn-label">Profile</span>
                </button>
              </div>
            </header>
          </div>
          <main className="page" id="main-content">
            {children}
          </main>
        </div>
      </div>
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
      {moreOpen && (
        <MoreSheet
          currentPage={currentPage}
          onNavigate={(id) => { onNavigate(id); setMoreOpen(false); }}
          onClose={() => setMoreOpen(false)}
        />
      )}
    </>
  );
}
