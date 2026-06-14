import React, { useMemo } from "react";
import Card from "../ui/Card.jsx";
import MissionHero from "./MissionHero.jsx";
import TopFivePanel from "../daily/TopFivePanel.jsx";
import ActiveProjectsPreview from "./ActiveProjectsPreview.jsx";
import SundayReviewAlert from "./SundayReviewAlert.jsx";
import MissionStatusGrid from "./MissionStatusGrid.jsx";
import Button from "../ui/Button.jsx";
import { getRandomCopy } from "../../lib/constants.js";

export default function CommandCenter({ onNavigate, onOpenProject }) {
  const quote = useMemo(() => getRandomCopy(), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Hero — progress ring, XP, streak, rank */}
      <MissionHero />

      {/* Sunday review alert — Sundays only, sits right under hero */}
      <SundayReviewAlert onNavigate={onNavigate} />

      {/* Today's Top 5 — right under hero for quick access */}
      <TopFivePanel />

      <MissionStatusGrid />

      {/* Active expedition cards */}
      <ActiveProjectsPreview onNavigate={onNavigate} onOpenProject={onOpenProject} />

      {/* New map CTA */}
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="primary" onClick={() => onNavigate("milestones")} style={{ flex: 1 }}>
          + Chart New Map
        </Button>
        <Button variant="ghost" onClick={() => onNavigate("formula")}>
          ✦ The Formula
        </Button>
      </div>

      {/* Motivational quote */}
      <Card variant="glass">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(15px, 2.2vw, 19px)",
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, var(--brand-green), var(--brand-cyan), var(--brand-pink))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          "{quote.text}"
        </p>
      </Card>
    </div>
  );
}
