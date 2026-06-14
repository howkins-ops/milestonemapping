import React from "react";
import XPBar from "./XPBar.jsx";
import StatsGrid from "./StatsGrid.jsx";
import ProgressAnalytics from "./ProgressAnalytics.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import Card from "../ui/Card.jsx";
import { useAchievements } from "../../hooks/useAchievements.js";

export default function StatsPage() {
  const { list, unlockedCount } = useAchievements();

  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker">ANALYTICS</div>
        <h1 className="page-header__title">What gets measured gets mastered.</h1>
        <p className="page-header__sub">Receipts of the person you are becoming.</p>
      </header>

      <XPBar />

      <div style={{ marginTop: 20 }}>
        <StatsGrid />
      </div>

      <SectionHeader
        title="Achievements"
        icon="🏅"
        sub={`${unlockedCount}/${list.length} unlocked`}
      />
      <div className="grid-stats">
        {list.map((a) => (
          <Card
            key={a.id}
            variant={a.unlocked ? "gold" : "glass"}
            style={{ opacity: a.unlocked ? 1 : 0.55, textAlign: "center", padding: 16 }}
          >
            <div style={{ fontSize: 28 }} aria-hidden="true">
              {a.unlocked ? a.icon : "🔒"}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, marginTop: 8 }}>
              {a.title}
            </div>
            <p className="soft" style={{ fontSize: 11.5, marginTop: 4 }}>
              {a.description}
            </p>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <ProgressAnalytics />
      </div>
    </div>
  );
}
