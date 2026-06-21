import React from "react";
import MissionHero from "./MissionHero.jsx";
import SundayReviewAlert from "./SundayReviewAlert.jsx";
import MapQuestHero from "../projects/MapQuestHero.jsx";
import Button from "../ui/Button.jsx";

function IconLightning() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M11 2L3 12h7l-1 6 8-10h-7L11 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <polygon points="1,4 7,1 13,4 19,1 19,16 13,19 7,16 1,19" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <line x1="7" y1="1" x2="7" y2="16" stroke="currentColor" strokeWidth="1.4" />
      <line x1="13" y1="4" x2="13" y2="19" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7" y1="13.5" x2="11" y2="13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconGift() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="2" y="9" width="16" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="1" y="6" width="18" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <line x1="10" y1="6" x2="10" y2="18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 6c-2-2-2-5 0-5s3 3 3 5M13 6c2-2 2-5 0-5s-3 3-3 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const QUICK_ACTIONS = [
  {
    label: "Daily Plan",
    eyebrow: "Streak",
    description: "Lock the next five moves.",
    route: "daily",
    Icon: IconLightning,
    asset: "/assets/dashboard/action-streak-v2.png",
    tone: "pink",
  },
  {
    label: "My Maps",
    eyebrow: "Worlds",
    description: "Open active project trails.",
    route: "milestones",
    Icon: IconMap,
    asset: "/assets/dashboard/action-maps-v2.png",
    tone: "magenta",
  },
  {
    label: "Weekly Review",
    eyebrow: "Reflect",
    description: "Update the strategy layer.",
    route: "weekly",
    Icon: IconClipboard,
    asset: "/assets/dashboard/action-review-v2.png",
    tone: "purple",
  },
  {
    label: "Rewards",
    eyebrow: "Vault",
    description: "Claim what progress unlocked.",
    route: "rewards",
    Icon: IconGift,
    asset: "/assets/dashboard/action-rewards-v2.png",
    tone: "cyan",
  },
];

export default function CommandCenter({ onNavigate, onOpenProject, onOpenMapQuest }) {
  return (
    <div className="command-center-page">
      <MissionHero />

      <SundayReviewAlert onNavigate={onNavigate} />

      <div className="dashboard-action-grid">
        {QUICK_ACTIONS.map(({ label, eyebrow, description, route, Icon, asset, tone }) => (
          <button
            key={route}
            onClick={() => onNavigate(route)}
            className={`dashboard-action-card dashboard-action-card--${tone}`}
            aria-label={`Open ${label}`}
          >
            <img className="dashboard-action-card__image" src={asset} alt="" aria-hidden="true" />
            <span className="dashboard-action-card__shade" aria-hidden="true" />
            <span className="dashboard-action-card__body">
              <span className="dashboard-action-card__topline">
                <span className="dashboard-action-card__icon">
                  <Icon />
                </span>
                <span>{eyebrow}</span>
              </span>
              <span className="dashboard-action-card__label">{label}</span>
              <span className="dashboard-action-card__description">{description}</span>
            </span>
            <span className="dashboard-action-card__cta" aria-hidden="true">Open</span>
          </button>
        ))}
      </div>

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
