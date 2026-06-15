import React, { useState } from "react";
import TreasureMap from "../projects/TreasureMap.jsx";
import MilestoneWizard from "../milestones/MilestoneWizard.jsx";
import MilestoneWorld from "./MilestoneWorld.jsx";
import FinalGoalWorld from "./FinalGoalWorld.jsx";
import WorldComplete from "./WorldComplete.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getProjectMilestones } from "../../lib/progress.js";

export default function RPGWorldPage({ projectId, onExitWorld }) {
  const { projects, milestones, createMilestone, updateMilestone } = useAppData();
  const project = projects.find((p) => p.id === projectId);

  // State machine
  const [screen, setScreen] = useState("map");
  // "map" | "milestone-world" | "final-goal" | "world-complete"

  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);

  if (!project) {
    return (
      <div className="rpg-world" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(234,251,255,0.4)" }}>Project not found.</p>
        <button className="rpg-back-btn" style={{ marginTop: 16 }} onClick={onExitWorld}>← Back</button>
      </div>
    );
  }

  const list = getProjectMilestones(milestones, project.id);
  const allMilestonesDone = list.length > 0 && list.every((m) => m.status === "completed");

  // When a milestone node is clicked on the map
  const handleEnterMilestone = (id) => {
    const idx = list.findIndex((m) => m.id === id);
    setActiveMilestoneId(id);
    setActiveMilestoneIndex(idx >= 0 ? idx : 0);
    setScreen("milestone-world");
  };

  // When a milestone is completed inside MilestoneWorld
  const handleMilestoneComplete = (completedId) => {
    const othersAllDone = list
      .filter((m) => m.id !== completedId)
      .every((m) => m.status === "completed");
    if (othersAllDone && list.length > 0) {
      setScreen("final-goal");
    } else {
      setScreen("map");
    }
  };

  // When final goal stone is claimed
  const handleFinalGoalClaimed = () => {
    setScreen("world-complete");
  };

  // When WorldComplete "Continue" is pressed
  const handleContinue = () => {
    onExitWorld();
  };

  if (screen === "milestone-world" && activeMilestoneId) {
    return (
      <MilestoneWorld
        milestoneId={activeMilestoneId}
        milestoneIndex={activeMilestoneIndex}
        project={project}
        onBackToMap={() => setScreen("map")}
        onMilestoneComplete={() => handleMilestoneComplete(activeMilestoneId)}
      />
    );
  }

  if (screen === "final-goal") {
    return (
      <FinalGoalWorld
        project={project}
        milestones={list}
        onBackToMap={() => setScreen("map")}
        onFinalGoalClaimed={handleFinalGoalClaimed}
      />
    );
  }

  if (screen === "world-complete") {
    return (
      <WorldComplete
        project={project}
        milestones={list}
        onContinue={handleContinue}
      />
    );
  }

  // "map" screen — show TreasureMap + optional final goal enter button
  return (
    <div className="anim-fade-in" style={{ position: "relative" }}>
      {/* RPG World header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12, flexWrap: "wrap", gap: 10
      }}>
        <div>
          <button
            className="rpg-back-btn"
            onClick={onExitWorld}
            style={{ marginBottom: 6 }}
          >
            ← Back to Project
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,240,255,0.55)" }}>
              RPG WORLD
            </span>
            <span style={{ fontSize: 11, color: "rgba(234,251,255,0.6)", fontWeight: 600 }}>
              {project.icon} {project.title}
            </span>
          </div>
        </div>

        {/* Final goal unlock button — only when all milestones done */}
        {allMilestonesDone && project.status !== "completed" && (
          <button
            className="rpg-final__cta"
            style={{ maxWidth: 280, fontSize: 13, padding: "10px 20px" }}
            onClick={() => setScreen("final-goal")}
          >
            👑 Enter Final Goal
          </button>
        )}

        {project.status === "completed" && (
          <button
            className="rpg-world-complete__continue"
            style={{ maxWidth: 240, fontSize: 12, padding: "10px 18px" }}
            onClick={() => setScreen("world-complete")}
          >
            🏆 View World Complete
          </button>
        )}
      </div>

      {/* World map */}
      {list.length === 0 ? (
        <div style={{
          padding: "48px 24px", textAlign: "center",
          background: "rgba(8,5,20,0.82)", border: "1px solid rgba(0,240,255,0.12)",
          borderRadius: 16
        }}>
          <p style={{ color: "rgba(234,251,255,0.4)", marginBottom: 16, fontSize: 14 }}>
            No milestones charted yet. Map your first coordinate to begin the journey.
          </p>
          <button
            className="rpg-complete-btn"
            style={{ maxWidth: 260, margin: "0 auto" }}
            onClick={() => setAddMilestoneOpen(true)}
          >
            + Add First Milestone
          </button>
        </div>
      ) : (
        <TreasureMap
          project={project}
          milestones={list}
          onOpenMilestone={handleEnterMilestone}
          onAddMilestone={() => setAddMilestoneOpen(true)}
        />
      )}

      {/* Add milestone modal */}
      {addMilestoneOpen && (
        <MilestoneWizard
          open={addMilestoneOpen}
          onClose={() => setAddMilestoneOpen(false)}
          onCreate={(data) => createMilestone({ ...data, projectId: project.id })}
          onUpdate={updateMilestone}
        />
      )}
    </div>
  );
}
