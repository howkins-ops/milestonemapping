import React, { useMemo } from "react";
import Card from "../ui/Card.jsx";
import MissionHero from "./MissionHero.jsx";
import TopFivePanel from "../daily/TopFivePanel.jsx";
import ActiveProjectsPreview from "./ActiveProjectsPreview.jsx";
import SundayReviewAlert from "./SundayReviewAlert.jsx";
import MissionStatusGrid from "./MissionStatusGrid.jsx";
import Button from "../ui/Button.jsx";
import { getRandomCopy } from "../../lib/constants.js";

function splitQuote(text) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const lines = [];
  for (const s of sentences) {
    const words = s.split(" ");
    if (words.length <= 5) {
      lines.push(s);
    } else {
      const mid = Math.ceil(words.length / 2);
      lines.push(words.slice(0, mid).join(" "));
      lines.push(words.slice(mid).join(" "));
    }
  }
  return lines.filter(Boolean);
}

export default function CommandCenter({ onNavigate, onOpenProject }) {
  const quote = useMemo(() => getRandomCopy(), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
      <Card variant="glass" style={{ padding: "24px 22px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span style={{
            fontSize: 27,
            lineHeight: 0.8,
            color: "var(--brand-cyan)",
            opacity: 0.25,
            fontFamily: "Georgia, serif",
            marginBottom: 5,
            display: "block",
          }}>"</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {splitQuote(quote.text).map((line, i) => (
              <p key={i} style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(10px, 1.2vw, 12px)",
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                margin: 0,
                background: "linear-gradient(90deg, var(--brand-green), var(--brand-cyan), var(--brand-pink))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{line}</p>
            ))}
          </div>
          {quote.source && (
            <p style={{
              fontSize: 10,
              color: "var(--text-muted)",
              marginTop: 10,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              opacity: 0.6,
            }}>
              — {quote.source}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
