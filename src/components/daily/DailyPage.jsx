import React, { useState, useCallback } from "react";
import MorningPlanRecap from "./MorningPlanRecap.jsx";
import GratitudePanel from "./GratitudePanel.jsx";
import BattlePlanPanel from "./BattlePlanPanel.jsx";
import TopFivePanel from "./TopFivePanel.jsx";
import EndOfDayReflection from "./EndOfDayReflection.jsx";
import NightWizard from "./NightWizard.jsx";
import BedtimeChecklist from "./BedtimeChecklist.jsx";
import ModeTransitionOverlay from "./ModeTransitionOverlay.jsx";

// SVG icons — no emojis
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export default function DailyPage() {
  // Morning is the default — new day, fresh start
  const [ritual, setRitual] = useState("am");
  const [transitioning, setTransitioning] = useState(null); // "pm" | "am" | null

  const switchMode = (newMode) => {
    if (newMode === ritual || transitioning) return;
    setTransitioning(newMode);
  };

  const handleTransitionDone = useCallback(() => {
    setRitual((prev) => transitioning ?? prev);
    setTransitioning(null);
  }, [transitioning]);

  return (
    <>
      {transitioning && (
        <ModeTransitionOverlay mode={transitioning} onDone={handleTransitionDone} />
      )}

      <div className={`daily-page-root anim-fade-in ${ritual === "pm" ? "daily-night-mode" : ""}`}>

        {/* Hero header */}
        <div className="daily-hero">
          <h1 className="daily-hero-title">
            {ritual === "am" ? (
              <>New Day,<br /><span className="daily-hero-accent daily-hero-accent--am">New Mindset.</span></>
            ) : (
              <>Plan Tonight,<br /><span className="daily-hero-accent">Execute Tomorrow.</span></>
            )}
          </h1>
          <p className="daily-hero-sub">
            {ritual === "am"
              ? "Everyone starts at zero. What you do today is the only thing that matters."
              : "Close today. Load tomorrow. Rest with intention."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="daily-ritual-toggle">
          <button
            type="button"
            className={`daily-ritual-tab ${ritual === "am" ? "is-active" : ""}`}
            onClick={() => switchMode("am")}
          >
            <SunIcon />
            <span>Morning</span>
          </button>
          <button
            type="button"
            className={`daily-ritual-tab daily-ritual-tab--night ${ritual === "pm" ? "is-active" : ""}`}
            onClick={() => switchMode("pm")}
          >
            <MoonIcon />
            <span>Night</span>
          </button>
        </div>

        {ritual === "am" ? (
          /* ── MORNING: Execute the plan you loaded last night ── */
          <div className="daily-am-flow">
            <MorningPlanRecap />
            <TopFivePanel />
            <GratitudePanel />
            <BattlePlanPanel />
          </div>
        ) : (
          /* ── NIGHT: Close today, load tomorrow ── */
          <div className="daily-pm-flow">

            <div className="night-section-group">
              <div className="night-section-label">
                <span className="night-section-label-line" />
                <span>CLOSE TODAY</span>
                <span className="night-section-label-line" />
              </div>
              <EndOfDayReflection />
            </div>

            <div className="night-section-group">
              <div className="night-section-label">
                <span className="night-section-label-line" />
                <span>LOAD TOMORROW</span>
                <span className="night-section-label-line" />
              </div>
              <NightWizard />
            </div>

            <div className="night-section-group">
              <div className="night-section-label">
                <span className="night-section-label-line" />
                <span>WIND DOWN</span>
                <span className="night-section-label-line" />
              </div>
              <BedtimeChecklist />
            </div>

          </div>
        )}
      </div>
    </>
  );
}
