import React from "react";
import MissionHero from "./MissionHero.jsx";
import TopFivePanel from "../daily/TopFivePanel.jsx";
import ActiveProjectsPreview from "./ActiveProjectsPreview.jsx";
import SundayReviewAlert from "./SundayReviewAlert.jsx";
import Button from "../ui/Button.jsx";

const QUICK_ACTIONS = [
  { label: "Daily Plan", route: "daily", icon: "⚡", color: "var(--brand-pink)" },
  { label: "My Maps", route: "milestones", icon: "🗺", color: "var(--brand-magenta)" },
  { label: "Weekly Review", route: "weekly", icon: "📋", color: "var(--brand-purple)" },
  { label: "Rewards", route: "rewards", icon: "🎁", color: "var(--brand-cyan)" },
];

export default function CommandCenter({ onNavigate, onOpenProject }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <MissionHero />

      <SundayReviewAlert onNavigate={onNavigate} />

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {QUICK_ACTIONS.map(({ label, route, icon, color }) => (
          <button
            key={route}
            onClick={() => onNavigate(route)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 14px",
              background: "linear-gradient(160deg, rgba(18,0,36,0.95), rgba(5,0,12,0.95))",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 14,
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = color;
              e.currentTarget.style.boxShadow = `0 0 16px ${color}22, inset 0 0 20px rgba(0,0,0,0.3)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0,0,0,0.3)";
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: "var(--text-primary)",
              flex: 1,
            }}>{label}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>→</span>
          </button>
        ))}
      </div>

      <TopFivePanel />

      <ActiveProjectsPreview onNavigate={onNavigate} onOpenProject={onOpenProject} />

      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="primary" onClick={() => onNavigate("milestones")} style={{ flex: 1 }}>
          + Chart New Map
        </Button>
        <Button variant="ghost" onClick={() => onNavigate("formula")}>
          ✦ The Formula
        </Button>
      </div>
    </div>
  );
}
