import React from "react";
import MissionHero from "./MissionHero.jsx";
import SundayReviewAlert from "./SundayReviewAlert.jsx";
import CityHeroCard from "./CityHeroCard.jsx";
import VisionFeatureCard from "../vision/VisionFeatureCard.jsx";
import FirstHoursCard from "../onboarding/FirstHoursCard.jsx";
import RecommitLauncher from "../zone/recommit/RecommitLauncher.jsx";
import ClearDayStatusCard from "./ClearDayStatusCard.jsx";

export default function CommandCenter({ onNavigate, onOpenProject, onOpenWorkout, onRecommit }) {
  return (
    <div className="command-center-page">
      <MissionHero />

      {/* THE FIRST 24 HOURS — the Crossing's torch checklist. Self-gates:
          renders null for legacy users, skippers, done lists, or after 7 days. */}
      <FirstHoursCard onNavigate={onNavigate} onOpenWorkout={onOpenWorkout} />

      {/* On Sundays this jumps to the very top of the cards (self-gates via
          isSunday — renders null every other day, so order is unchanged then). */}
      <SundayReviewAlert onNavigate={onNavigate} />

      {/* The City is the one hero card left on Command. The Zone has its own
          bottom-nav tab and The Inner Alchemist lives on the Map page + in the
          City, so neither needed a duplicate door here. Daily, Map, Fill Cup
          are bottom-nav tabs; Shadow is a top-bar icon; Weekly Review surfaces
          via the Sunday alert. No redundant quick-action grid. */}
      <CityHeroCard onEnter={() => onNavigate("city")} />

      <VisionFeatureCard onNavigate={onNavigate} />

      {/* Command deck — quiet utility row anchoring the bottom of the page */}
      <div className="cmdeck">
        <button type="button" className="cmdeck-btn cmdeck-btn--map" onClick={() => onNavigate("milestones")}>
          <span className="cmdeck-btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="12" r="9" />
              <path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span>Chart New Map</span>
        </button>
        <button type="button" className="cmdeck-btn cmdeck-btn--formula" onClick={() => onNavigate("formula")}>
          <span className="cmdeck-btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3h4M10.5 3v5.2L5.8 17a2.4 2.4 0 0 0 2.2 3.4h8a2.4 2.4 0 0 0 2.2-3.4L13.5 8.2V3" />
              <path d="M8 14.5h8" />
            </svg>
          </span>
          <span>The Formula</span>
        </button>
      </div>

      {/* CLEARDAY standing — self-gates: renders null until the Claim is made. */}
      <ClearDayStatusCard />

      {/* The integrity door, one tap from the dashboard — deep-links into the
          Zone and opens the Recommit ritual. */}
      {onRecommit && <RecommitLauncher onClick={onRecommit} />}
    </div>
  );
}
