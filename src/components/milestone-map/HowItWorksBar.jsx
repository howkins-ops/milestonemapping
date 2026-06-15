import React from "react";

// TODO Phase 2: Mount this below the map in ProjectMap / RPGWorldPage.

const STEPS = [
  { icon: "✦", label: "Create Milestone", desc: "Chart your next checkpoint" },
  { icon: "🗺️", label: "Explore the Map", desc: "See your path ahead" },
  { icon: "⚡", label: "Take Action", desc: "Complete each step" },
  { icon: "💎", label: "Earn Reward", desc: "Claim your stone" },
  { icon: "👑", label: "Final Goal", desc: "Reach the summit" },
];

export default function HowItWorksBar() {
  return (
    <div
      style={{
        display: "flex", alignItems: "stretch", gap: 0,
        background: "rgba(8,5,20,0.72)", border: "1px solid rgba(0,240,255,0.1)",
        borderRadius: 14, overflow: "hidden", marginTop: 12,
      }}
    >
      {STEPS.map((step, i) => (
        <div
          key={step.label}
          style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 4, padding: "12px 8px", textAlign: "center",
            borderRight: i < STEPS.length - 1 ? "1px solid rgba(0,240,255,0.08)" : "none",
          }}
        >
          <span style={{ fontSize: 18 }}>{step.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
            color: "#00F0FF", fontFamily: "var(--font-mono)",
          }}>
            {step.label}
          </span>
          <span style={{ fontSize: 11, color: "rgba(234,251,255,0.45)", lineHeight: 1.4 }}>
            {step.desc}
          </span>
        </div>
      ))}
    </div>
  );
}
