import React, { useState } from "react";
import BottomNav from "./BottomNav.jsx";
import MoreSheet from "./MoreSheet.jsx";
import AnimatedBackground from "./AnimatedBackground.jsx";
import SyncStatus from "../ui/SyncStatus.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import "../../styles/wave.css";

const TOPBAR_ICONS = {
  rewards: "/assets/topbar/topbar-rewards.png",
  paths: "/assets/topbar/topbar-paths.png",
  profile: "/assets/topbar/topbar-profile.png",
};

export default function AppShell({ currentPage, onNavigate, onSignOut, onOpenJournal, onOpenWorkout, onOpenRoster, children }) {
  const { profile, syncStatus } = useAppData();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <AnimatedBackground />
      <div className="app-shell">
        <div className="app-main">
          <div className="app-header">
            <header className="app-topbar">
              <div className="app-topbar__brand">

                {/* Diamond — opens the More sheet (all paths + tools live there) */}
                <button
                  type="button"
                  className="app-topbar__diamond"
                  onClick={() => setMoreOpen(true)}
                  aria-label="Open menu — growth paths & tools"
                  aria-haspopup="dialog"
                >
                  <span className="app-topbar__icon-box" aria-hidden="true">
                    <img className="app-topbar__icon-art" src={TOPBAR_ICONS.paths} alt="" />
                  </span>
                  <span className="app-topbar__btn-label">Menu</span>
                </button>
              </div>

              <div className="app-topbar__right">
                <SyncStatus status={syncStatus} />
                {onOpenRoster && (
                  <button
                    type="button"
                    className="app-topbar__profile-btn app-topbar__roster"
                    onClick={onOpenRoster}
                    aria-label="Open the Arena roster — launch any game"
                    aria-haspopup="dialog"
                  >
                    <span className="app-topbar__icon-box" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
                        <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
                        <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
                        <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
                      </svg>
                    </span>
                    <span className="app-topbar__btn-label">Roster</span>
                  </button>
                )}
                {onOpenWorkout && (
                  <button
                    type="button"
                    className="app-topbar__profile-btn app-topbar__workout"
                    onClick={onOpenWorkout}
                    aria-label="Open The Iron — workout mode"
                  >
                    <span className="iw-mini" aria-hidden="true">
                      <span className="iw-mini-num">45</span>
                    </span>
                    <span className="app-topbar__btn-label">Iron</span>
                  </button>
                )}
                {onOpenJournal && (
                  <button
                    type="button"
                    className="app-topbar__profile-btn app-topbar__journal"
                    onClick={onOpenJournal}
                    aria-label="Open the Field Journal"
                  >
                    <span className="fj-mini" aria-hidden="true">
                      <span className="fj-mini-fj">FJ</span>
                    </span>
                    <span className="app-topbar__btn-label">Journal</span>
                  </button>
                )}
                <button
                  type="button"
                  className={`app-topbar__profile-btn app-topbar__rewards ${currentPage === "rewards" ? "is-active" : ""}`}
                  onClick={() => onNavigate("rewards")}
                  aria-label="Rewards vault"
                >
                  <span className="app-topbar__icon-box" aria-hidden="true">
                    <img className="app-topbar__icon-art app-topbar__icon-art--glyph" src={TOPBAR_ICONS.rewards} alt="" />
                  </span>
                  <span className="app-topbar__btn-label">Rewards</span>
                </button>
                <button
                  type="button"
                  className="app-topbar__profile-btn"
                  onClick={() => onNavigate("profile")}
                  aria-label="View profile"
                >
                  <span className="app-topbar__icon-box" aria-hidden="true">
                    <img className="app-topbar__icon-art app-topbar__icon-art--glyph" src={TOPBAR_ICONS.profile} alt="" />
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
          onSignOut={onSignOut}
          profile={profile}
        />
      )}
    </>
  );
}
