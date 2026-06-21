import React, { useState } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { crystalFrontierAssets } from "../../lib/milestoneWorldAssets.js";
import { milestoneWorldAssets as MWA } from "../../lib/milestoneWorldAssets.js";

export default function FinalGoalWorld({ project, milestones, onBackToMap, onFinalGoalClaimed }) {
  const { updateProject, addXP, celebrate } = useAppData();
  const [claiming, setClaiming] = useState(false);
  const [achieved, setAchieved] = useState(false);

  const completedMilestones = milestones.filter((m) => m.status === "completed");
  const totalXP = completedMilestones.length * 1000 + 1000;

  const handleClaim = () => {
    if (claiming) return;
    setClaiming(true);
    celebrate({
      variant: "milestone",
      title: "FINAL STONE CLAIMED",
      subtitle: `${project.title} — World Complete`,
      detail: `${completedMilestones.length} milestones conquered`,
    });
    setTimeout(() => {
      updateProject(project.id, { status: "completed", completedAt: new Date().toISOString() });
      addXP(1000, "World completed — final stone claimed");
      setClaiming(false);
      setAchieved(true);
      setTimeout(onFinalGoalClaimed, 2000);
    }, 900);
  };

  if (achieved) {
    return (
      <div className="rpg-goal-achieved-overlay">
        <img
          src={crystalFrontierAssets.final.finalAchieved}
          alt="Final goal achieved"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>
    );
  }

  return (
    <div className="rpg-world">
      <div className="rpg-world__bg" style={{ backgroundImage: `url(${crystalFrontierAssets.final.finalGoal})` }} />

      {/* Top bar */}
      <div className="rpg-world__topbar">
        <button className="rpg-back-btn" onClick={onBackToMap}>← Map</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div className="rpg-world__topbar-sub">Final Destination</div>
          <div className="rpg-world__topbar-title" style={{ fontSize: 14 }}>
            {project.futureVision || project.title}
          </div>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Main content */}
      <div className="rpg-world__content" style={{ alignItems: "center", justifyContent: "center", paddingBottom: 40 }}>

        {/* Collected stones row */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,240,255,0.6)", marginBottom: 12 }}>
            MILESTONE STONES COLLECTED
          </p>
          <div className="rpg-final__stones">
            {milestones.map((m) => (
              <div key={m.id} title={m.title} style={{
                width: 44, height: 44, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: m.status === "completed" ? "rgba(0,255,191,0.12)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${m.status === "completed" ? "#00FFBF" : "rgba(255,255,255,0.1)"}`,
                boxShadow: m.status === "completed" ? "0 0 12px rgba(0,255,191,0.25)" : "none",
              }}>
                <img
                  src={m.status === "completed" ? "/assets/treasure-system/diamond-reward.png" : "/assets/treasure-system/small-chest-closed.png"}
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  style={{
                    width: 28, height: 28, objectFit: "contain",
                    filter: m.status === "completed"
                      ? "drop-shadow(0 0 6px rgba(0,255,191,0.5))"
                      : "saturate(0) opacity(0.4)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <img
          src={MWA.avatars.hoodedFront}
          alt="Hero approaching final goal"
          style={{ width: 100, height: 100, objectFit: "contain", filter: "drop-shadow(0 0 24px rgba(250,204,21,0.4))", marginBottom: 4 }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />

        {/* Title */}
        <div className="rpg-final__title">
          <span>YOUR DESTINY</span>
          <span style={{ fontSize: "0.55em", color: "rgba(234,251,255,0.7)", fontWeight: 700, backgroundImage: "none", WebkitTextFillColor: "initial" }}>
            {project.title}
          </span>
        </div>
        {project.futureVision && (
          <p className="rpg-final__subtitle">{project.futureVision}</p>
        )}

        {/* Stats card */}
        <div className="rpg-card" style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#00FFBF", fontFamily: "var(--font-display)" }}>{completedMilestones.length}</div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(234,251,255,0.4)", marginTop: 3 }}>STONES COLLECTED</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#FACC15", fontFamily: "var(--font-display)" }}>{totalXP.toLocaleString()}</div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(234,251,255,0.4)", marginTop: 3 }}>TOTAL XP</div>
            </div>
          </div>

          <img
            src="/assets/phoenix-shrine/phoenix-appears.png"
            alt=""
            aria-hidden="true"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{ width: 90, height: 90, objectFit: "contain", filter: "drop-shadow(0 0 18px rgba(250,204,21,0.4))", marginBottom: 8 }}
          />

          <button
            className="rpg-final__cta"
            onClick={handleClaim}
            disabled={claiming}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            <img
              src={claiming ? "/assets/treasure-system/xp-burst.png" : "/assets/treasure-system/phoenix-reward.png"}
              alt=""
              onError={(e) => { e.currentTarget.style.display = "none"; }}
              style={{ width: 28, height: 28, objectFit: "contain" }}
            />
            {claiming ? "Claiming Final Stone…" : "Claim Final Stone"}
          </button>
        </div>
      </div>
    </div>
  );
}
