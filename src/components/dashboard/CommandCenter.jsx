import React from "react";
import MissionHero from "./MissionHero.jsx";
import SundayReviewAlert from "./SundayReviewAlert.jsx";
import MapQuestHero from "../projects/MapQuestHero.jsx";
import CityHeroCard from "./CityHeroCard.jsx";
import ZoneHeroCard from "./ZoneHeroCard.jsx";
import VisionFeatureCard from "../vision/VisionFeatureCard.jsx";
import Button from "../ui/Button.jsx";

export default function CommandCenter({ onNavigate, onOpenProject, onOpenMapQuest }) {
  return (
    <div className="command-center-page">
      <MissionHero />

      {/* Two main features get matched heroes — the daily anchors of the app.
          Everything else (Daily, Map, Fill Cup, Shadow) lives on the bottom
          nav; Weekly Review surfaces via the Sunday alert; Rewards is a
          top-bar icon. No more redundant quick-action grid. */}
      <CityHeroCard onEnter={() => onNavigate("city")} />

      <ZoneHeroCard onEnter={() => onNavigate("zone")} />

      <SundayReviewAlert onNavigate={onNavigate} />

      <VisionFeatureCard onNavigate={onNavigate} />

      <div className="dashboard-command-row">
        <Button variant="primary" onClick={() => onNavigate("milestones")} className="dashboard-command-row__primary">
          + Chart New Map
        </Button>
        <Button variant="ghost" onClick={() => onNavigate("formula")}>
          The Formula
        </Button>
      </div>

      {onOpenMapQuest && <MapQuestHero onLaunch={onOpenMapQuest} />}
    </div>
  );
}
