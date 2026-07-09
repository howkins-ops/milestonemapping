import React, { useState } from "react";
import BottomNav from "./BottomNav.jsx";
import MoreSheet from "./MoreSheet.jsx";
import HoopsBallIcon from "./HoopsBallIcon.jsx";
import AnimatedBackground from "./AnimatedBackground.jsx";
import SyncStatus from "../ui/SyncStatus.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import "../../styles/wave.css";

const TOPBAR_ICONS = {
  rewards: "/assets/topbar/topbar-rewards.png",
  paths: "/assets/topbar/topbar-paths.png",
  profile: "/assets/topbar/topbar-profile.png",
};

export default function AppShell({ currentPage, onNavigate, onSignOut, onOpenJournal, onOpenWorkout, onOpenGame, onOpenZone, children }) {
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
                {onOpenZone && (
                  <button
                    type="button"
                    className={`app-topbar__profile-btn app-topbar__zone ${currentPage === "zone" ? "is-active" : ""}`}
                    onClick={onOpenZone}
                    aria-label="Open The Zone — your accountability world"
                  >
                    <span className="app-topbar__icon-box" aria-hidden="true">
                      <img className="app-topbar__icon-art app-topbar__icon-art--glyph" src="/assets/nav/nav-zone.png" alt="" />
                    </span>
                    <span className="app-topbar__btn-label">Zone</span>
                  </button>
                )}
                {onOpenGame && (
                  <button
                    type="button"
                    className="app-topbar__profile-btn app-topbar__game"
                    onClick={onOpenGame}
                    aria-label="Play Hoops — start your game day"
                  >
                    <span className="app-topbar__icon-box app-topbar__icon-box--ball" aria-hidden="true">
                      <HoopsBallIcon />
                    </span>
                    <span className="app-topbar__btn-label">Hoops</span>
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
                {/* Rewards (trophy) lives in the Menu sheet — removed from the top
                    bar to de-clutter the right cluster. Re-add via app-topbar__rewards. */}
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
