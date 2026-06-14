import React, { useEffect } from "react";
import ResearchCard from "../ui/ResearchCard.jsx";
import { RESEARCH_BANK } from "../../data/researchData.js";
import { useAppData } from "../../hooks/useAppData.js";
import { playSound } from "../../lib/sounds.js";

const SECTIONS = [
  {
    label: "Daily Rituals",
    sub: "The morning and evening habits that actually change your brain.",
    color: "cyan",
    ids: ["gratitude", "planning", "daily_tracking"]
  },
  {
    label: "Goals & Accountability",
    sub: "Why writing it down — and telling someone — is the real strategy.",
    color: "gold",
    ids: ["written_goals", "accountability", "weekly_review"]
  },
  {
    label: "Momentum & Milestones",
    sub: "Small wins aren't small. Harvard has 12,000 diary entries that prove it.",
    color: "green",
    ids: ["milestones", "rewards"]
  },
  {
    label: "Identity & Habits",
    sub: "You don't just do the habit. You become the person who does it.",
    color: "purple",
    ids: ["habit_building", "identity", "affirmations", "visualization"]
  }
];

const SECTION_ACCENTS = {
  cyan:   "var(--brand-cyan)",
  gold:   "var(--brand-gold)",
  green:  "var(--brand-green)",
  purple: "var(--brand-purple)"
};

export default function SciencePage() {
  const { unlockAchievement, settings } = useAppData();

  useEffect(() => {
    unlockAchievement("science_believer");
    playSound("insight", settings);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="anim-fade-in">

      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontSize: 11,
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          color: "var(--brand-cyan)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 10
        }}>
          Peer-reviewed · Evidence-based
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 5vw, 40px)",
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: "var(--text-main)",
          marginBottom: 14
        }}>
          The Science of Becoming Undeniable.
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(14px, 2vw, 16px)",
          lineHeight: 1.7,
          color: "var(--text-soft)",
          maxWidth: 520
        }}>
          Every feature in this app is backed by peer-reviewed research.
          Not productivity hype. Not guru advice. Actual science — cited, flippable, and readable.
        </p>
      </div>

      {/* Stat strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
        gap: 10,
        marginBottom: 36,
        padding: "18px 16px",
        borderRadius: 16,
        background: "rgba(0,240,255,0.04)",
        border: "1px solid rgba(0,240,255,0.12)"
      }}>
        {[
          { n: "12", label: "Studies cited" },
          { n: "19,951", label: "Participants" },
          { n: "64", label: "Clinical trials" },
          { n: "d=0.65", label: "Top effect size" }
        ].map(({ n, label }) => (
          <div key={label} style={{ textAlign: "center", padding: "6px 4px" }}>
            <div style={{
              fontSize: "clamp(20px, 3.5vw, 28px)",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: "var(--brand-cyan)",
              lineHeight: 1
            }}>
              {n}
            </div>
            <div style={{
              fontSize: 11,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              color: "var(--text-soft)",
              marginTop: 5
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => {
        const cards = section.ids
          .map((id) => RESEARCH_BANK.find((r) => r.id === id))
          .filter(Boolean);

        return (
          <div key={section.label} style={{ marginBottom: 40 }}>
            {/* Section header */}
            <div style={{ marginBottom: 18 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6
              }}>
                <div style={{
                  width: 4,
                  height: 22,
                  borderRadius: 4,
                  background: SECTION_ACCENTS[section.color],
                  flexShrink: 0
                }} />
                <h2 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(17px, 2.5vw, 20px)",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  margin: 0
                }}>
                  {section.label}
                </h2>
              </div>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                color: "var(--text-soft)",
                lineHeight: 1.6,
                margin: 0,
                paddingLeft: 14
              }}>
                {section.sub}
              </p>
            </div>

            {/* Cards */}
            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cards.map((card) => (
                <ResearchCard
                  key={card.id}
                  card={card}
                  variant="inline"
                  showCount
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div style={{
        marginTop: 12,
        padding: "18px 20px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        textAlign: "center"
      }}>
        <p style={{
          fontSize: 13,
          fontFamily: "var(--font-body)",
          color: "var(--text-soft)",
          lineHeight: 1.7,
          margin: 0
        }}>
          Tap any card to flip it and read the full citation.
          This app supports your goals — it's not a substitute for professional mental health care.
          If you're struggling, please reach out to someone who can help.
        </p>
      </div>

    </div>
  );
}
