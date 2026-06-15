import React from "react";
import { crystalFrontierAssets, milestoneWorldAssets as MWA } from "../../lib/milestoneWorldAssets.js";
import { getMilestoneProgress } from "../../lib/progress.js";

export default function WorldComplete({ project, milestones, onContinue }) {
  const completedMilestones = milestones.filter((m) => m.status === "completed");
  const totalXP = completedMilestones.length * 1000 + 1000;

  const totalClaimed = milestones.reduce((sum, m) => {
    const c = m.rewardsClaimed || {};
    return sum + (c.small ? 1 : 0) + (c.medium ? 1 : 0) + (c.large ? 1 : 0);
  }, 0);

  return (
    <div className="rpg-world" style={{ overflowY: "auto" }}>
      <div
        className="rpg-world__bg"
        style={{ backgroundImage: `url(${crystalFrontierAssets.final.congratulations})` }}
      />

      <div
        className="rpg-world__content rpg-world-complete__hero"
        style={{ alignItems: "center", gap: 20, paddingBottom: 60, paddingTop: 32 }}
      >

        {/* Victory avatar */}
        <img
          src={MWA.avatars.victory}
          alt="Victory hero"
          className="rpg-world-complete__avatar"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />

        {/* Titles */}
        <div className="rpg-world-complete__title">CONGRATULATIONS</div>
        <div className="rpg-world-complete__sub">⚔ World Complete ⚔</div>

        <p style={{ fontSize: 14, color: "rgba(234,251,255,0.55)", textAlign: "center", maxWidth: 440, lineHeight: 1.6 }}>
          You mapped the path, conquered every milestone, and claimed the final stone.
          <br />The legend of <strong style={{ color: "#fff" }}>{project.title}</strong> is complete.
        </p>

        {/* Stones collected */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,240,255,0.6)", marginBottom: 12 }}>
            ALL STONES COLLECTED
          </p>
          <div className="rpg-world-complete__stones">
            {milestones.map((m) => (
              <div key={m.id} title={m.title} style={{
                width: 40, height: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
                background: "rgba(0,255,191,0.12)",
                border: "1.5px solid #00FFBF",
                boxShadow: "0 0 14px rgba(0,255,191,0.3)",
              }}>
                💎
              </div>
            ))}
            {/* Final stone */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              background: "rgba(250,204,21,0.14)",
              border: "2px solid #FACC15",
              boxShadow: "0 0 20px rgba(250,204,21,0.4)",
            }}>
              👑
            </div>
          </div>
        </div>

        {/* Journey summary */}
        <div className="rpg-card" style={{ width: "100%", maxWidth: 500 }}>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,240,255,0.6)", marginBottom: 14 }}>
            JOURNEY SUMMARY
          </p>
          <div className="rpg-world-complete__summary-grid">
            <div className="rpg-world-complete__stat">
              <div className="rpg-world-complete__stat-val">{completedMilestones.length}</div>
              <div className="rpg-world-complete__stat-label">Milestones Conquered</div>
            </div>
            <div className="rpg-world-complete__stat">
              <div className="rpg-world-complete__stat-val" style={{ color: "#FACC15" }}>{totalXP.toLocaleString()}</div>
              <div className="rpg-world-complete__stat-label">Total XP Earned</div>
            </div>
            <div className="rpg-world-complete__stat">
              <div className="rpg-world-complete__stat-val" style={{ color: "#FF3EDB" }}>{totalClaimed}</div>
              <div className="rpg-world-complete__stat-label">Rewards Claimed</div>
            </div>
            <div className="rpg-world-complete__stat">
              <div className="rpg-world-complete__stat-val" style={{ fontSize: 14, color: "#7B2CFF" }}>Crystal Frontier</div>
              <div className="rpg-world-complete__stat-label">World Theme</div>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <button className="rpg-world-complete__continue" onClick={onContinue}>
          Continue Your Legend →
        </button>
      </div>
    </div>
  );
}
