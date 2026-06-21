import React, { useEffect, useState } from "react";
import ProjectMap from "../milestone-map/ProjectMap.jsx";
import MilestoneWizard from "../milestones/MilestoneWizard.jsx";
import MilestoneWorld from "../milestone-world/MilestoneWorld.jsx";
import FinalGoalWorld from "./FinalGoalWorld.jsx";
import WorldComplete from "./WorldComplete.jsx";
import MapQuestMap from "../map-quest/MapQuestMap.jsx";
import ChapterAnchor from "../map-quest/chapters/ChapterAnchor.jsx";
import ChapterShadow from "../map-quest/chapters/ChapterShadow.jsx";
import { useMapQuestState } from "../map-quest/useMapQuestState.js";
import { useAppData } from "../../hooks/useAppData.js";
import { getProjectMilestones } from "../../lib/progress.js";

export default function RPGWorldPage({ projectId, initialMode = null, onExitWorld }) {
  const { projects, milestones, createMilestone, updateMilestone } = useAppData();
  const project = projects.find((p) => p.id === projectId);
  const { mode, setMode, completeChapter, isChapterComplete } = useMapQuestState();

  // When launched straight into a mode (e.g. the Map Quest button), honor it once.
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode, setMode]);

  const [screen, setScreen] = useState("map");
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);
  const [activeChapterKey, setActiveChapterKey] = useState(null);
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  if (!project) {
    return (
      <div className="rpg-world" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(234,251,255,0.4)" }}>Project not found.</p>
        <button className="rpg-back-btn" style={{ marginTop: 16 }} onClick={onExitWorld}>
          Back
        </button>
      </div>
    );
  }

  const list = getProjectMilestones(milestones, project.id);
  const allMilestonesDone = list.length > 0 && list.every((m) => m.status === "completed");

  const handleEnterMilestone = (id) => {
    const idx = list.findIndex((m) => m.id === id);
    setActiveMilestoneId(id);
    setActiveMilestoneIndex(idx >= 0 ? idx : 0);
    setScreen("milestone-world");
  };

  const handleEnterChapter = (chapterKey) => {
    setActiveChapterKey(chapterKey);
    setScreen(chapterKey);
  };

  const handleChapterComplete = (outputs) => {
    if (activeChapterKey) {
      completeChapter(activeChapterKey, outputs || {});
    }
    setScreen("map");
  };

  const handleMilestoneComplete = (completedId) => {
    const othersAllDone = list
      .filter((m) => m.id !== completedId)
      .every((m) => m.status === "completed");

    if (othersAllDone && list.length > 0) {
      setScreen("final-goal");
      return;
    }

    setJustUnlocked(true);
    setScreen("map");
    const timer = setTimeout(() => setJustUnlocked(false), 2500);
    return () => clearTimeout(timer);
  };

  if (screen === "chapter-anchor") {
    return <ChapterAnchor onComplete={handleChapterComplete} />;
  }

  if (screen === "chapter-shadow") {
    return <ChapterShadow onComplete={handleChapterComplete} />;
  }

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
        onFinalGoalClaimed={() => setScreen("world-complete")}
      />
    );
  }

  if (screen === "world-complete") {
    return <WorldComplete project={project} milestones={list} onContinue={onExitWorld} />;
  }

  return (
    <div className="anim-fade-in rpg-map-screen">
      <header className="rpg-map-screen__header">
        <div>
          <button className="rpg-back-btn" onClick={onExitWorld}>
            Back to Project
          </button>
          <div className="rpg-map-screen__eyebrow">
            {mode === "quest" ? "Map Quest" : "Treasure Map"}
          </div>
        </div>

        <div className="rpg-map-screen__actions">
          <div className="rpg-mode-toggle" role="tablist" aria-label="World mode">
            <button
              type="button"
              onClick={() => setMode("treasure")}
              className={mode === "treasure" ? "is-active" : ""}
              aria-selected={mode === "treasure"}
            >
              Treasure Map
            </button>
            <button
              type="button"
              onClick={() => setMode("quest")}
              className={mode === "quest" ? "is-active is-quest" : "is-quest"}
              aria-selected={mode === "quest"}
            >
              Map Quest
            </button>
          </div>

          {allMilestonesDone && project.status !== "completed" && (
            <button
              className="rpg-final__cta rpg-map-screen__compact-cta"
              onClick={() => setScreen("final-goal")}
            >
              Enter Final Goal
            </button>
          )}

          {project.status === "completed" && (
            <button
              className="rpg-world-complete__continue rpg-map-screen__compact-cta"
              onClick={() => setScreen("world-complete")}
            >
              View World Complete
            </button>
          )}
        </div>
      </header>

      {mode === "quest" ? (
        <MapQuestMap
          project={project}
          isChapterComplete={isChapterComplete}
          onEnterChapter={handleEnterChapter}
        />
      ) : list.length === 0 ? (
        <div className="rpg-empty-map">
          <p>No milestones charted yet. Map your first coordinate to begin the trail.</p>
          <button className="rpg-complete-btn" onClick={() => setAddMilestoneOpen(true)}>
            Add First Milestone
          </button>
        </div>
      ) : (
        <ProjectMap
          project={project}
          milestones={list}
          onOpenMilestone={handleEnterMilestone}
          onAddMilestone={() => setAddMilestoneOpen(true)}
          justUnlocked={justUnlocked}
        />
      )}

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
