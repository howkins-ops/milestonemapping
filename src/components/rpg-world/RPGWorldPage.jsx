import React, { useEffect, useState, Suspense } from "react";
import ProjectMap from "../milestone-map/ProjectMap.jsx";
import MilestoneWizard from "../milestones/MilestoneWizard.jsx";
import MilestoneWorld from "../milestone-world/MilestoneWorld.jsx";
import FinalGoalWorld from "./FinalGoalWorld.jsx";
import WorldComplete from "./WorldComplete.jsx";
import MapQuestMap from "../map-quest/MapQuestMap.jsx";
import PendantHUD from "../map-quest/PendantHUD.jsx";
import WorldAtlas from "../map-quest/WorldAtlas.jsx";
import SpireJourney from "../map-quest/spire/SpireJourney.jsx";
import CrossingJourney from "../map-quest/crossing/CrossingJourney.jsx";
import { useMapQuestState } from "../map-quest/useMapQuestState.js";
import { getChapterByKey } from "../map-quest/questChapters.js";
import { CHAPTER_COMPONENTS } from "../map-quest/chapterRegistry.js";
import { useAppData } from "../../hooks/useAppData.js";
import { getProjectMilestones } from "../../lib/progress.js";
import {
  isSpireOpen,
  spireLitCount,
  TUTORIAL_DISTRICT_IDS,
} from "../city/journeyStore.js";

export default function RPGWorldPage({ projectId, initialMode = null, onExitWorld, onGoToCity }) {
  const { projects, milestones, createMilestone, updateMilestone } = useAppData();
  const project = projects.find((p) => p.id === projectId);
  const quest = useMapQuestState();
  const { mode, setMode, completeChapter, isChapterComplete } = quest;

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

  // WORLD ⇄ BOOK — the quest is walkable by default (the full video game),
  // with the node-map book one toggle away. Persisted across sessions.
  const [questView, setQuestViewState] = useState(() => {
    try {
      return localStorage.getItem("mq_quest_view_v1") === "book" ? "book" : "world";
    } catch {
      return "world";
    }
  });
  const setQuestView = (v) => {
    setQuestViewState(v);
    try { localStorage.setItem("mq_quest_view_v1", v); } catch { /* no-op */ }
  };
  const [spireJumpTick, setSpireJumpTick] = useState(0); // remounts SpireJourney on Atlas jumps

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

  // GATE 2 — the quest book is sealed for new citizens until the whole city
  // tutorial is lit (legacy users bypass inside isSpireOpen).
  const spireOpen = isSpireOpen();

  const handleEnterChapter = (chapterKey) => {
    if (!spireOpen) return;
    // "Replay" on a finished chapter: clear its save so it starts fresh instead
    // of reloading the terminal "handoff" state (which would instantly re-complete).
    if (isChapterComplete(chapterKey)) {
      const ch = getChapterByKey(chapterKey);
      if (ch?.saveKey) {
        try { localStorage.removeItem(ch.saveKey); } catch {}
      }
    }
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

  const activeChapter = getChapterByKey(screen);
  if (activeChapter && CHAPTER_COMPONENTS[activeChapter.component]) {
    const ChapterComponent = CHAPTER_COMPONENTS[activeChapter.component];
    return (
      <Suspense
        fallback={
          <div className="rpg-world" style={{ alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <p style={{ color: "rgba(234,251,255,0.4)" }}>Loading chapter…</p>
          </div>
        }
      >
        <ChapterComponent onComplete={handleChapterComplete} quest={quest} />
      </Suspense>
    );
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
        spireOpen ? (
          <>
            <div className="rpg-mode-toggle rpg-mode-toggle--view" role="tablist" aria-label="Quest view">
              <button
                type="button"
                onClick={() => setQuestView("world")}
                className={questView === "world" ? "is-active is-quest" : "is-quest"}
                aria-selected={questView === "world"}
              >
                ◈ World
              </button>
              <button
                type="button"
                onClick={() => setQuestView("book")}
                className={questView === "book" ? "is-active is-quest" : "is-quest"}
                aria-selected={questView === "book"}
              >
                ⬒ Book
              </button>
            </div>
            {screen === "crossing" ? (
              <CrossingJourney
                onExitToSpire={() => setScreen("map")}
                onEnterChapter={handleEnterChapter}
              />
            ) : questView === "world" ? (
              <SpireJourney
                key={spireJumpTick}
                isChapterComplete={isChapterComplete}
                onEnterChapter={handleEnterChapter}
                onExitToStreets={onGoToCity}
                onEnterCrossing={() => setScreen("crossing")}
              />
            ) : (
              <MapQuestMap
                project={project}
                isChapterComplete={isChapterComplete}
                onEnterChapter={handleEnterChapter}
              />
            )}
          </>
        ) : (
          <div className="mq-sealed" role="status">
            <span className="mq-sealed__glyph" aria-hidden="true">◈</span>
            <h3 className="mq-sealed__title">THE SPIRE IS SEALED</h3>
            <p className="mq-sealed__count">
              {spireLitCount()}/{TUTORIAL_DISTRICT_IDS.length} districts lit
            </p>
            <p className="mq-sealed__copy">
              The tower answers only to a trained citizen. Walk the city, hear each
              door's lesson, and do one real thing inside it — every district you
              light is a discipline the Spire will test.
            </p>
            {onGoToCity ? (
              <button type="button" className="rpg-complete-btn" onClick={onGoToCity}>
                Walk the city →
              </button>
            ) : null}
          </div>
        )
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

      {mode === "quest" ? <PendantHUD /> : null}
      {mode === "quest" && spireOpen ? (
        <WorldAtlas
          current={screen === "crossing" ? "oasis" : "floor-1"}
          onJump={(j) => {
            if (j.type === "hometown" || j.type === "city") {
              if (onGoToCity) onGoToCity();
              return;
            }
            if (j.type === "spire") {
              try { sessionStorage.setItem("mq_spire_floor_v1", String(j.idx || 0)); } catch { /* no-op */ }
              setScreen("map");
              setQuestView("world");
              setSpireJumpTick((t) => t + 1);
              return;
            }
            if (j.type === "crossing") setScreen("crossing");
          }}
        />
      ) : null}
    </div>
  );
}
