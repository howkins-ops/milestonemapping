// Phase 5: Replace src/components/rpg-world/MilestoneWorld.jsx by updating
// RPGWorldPage.jsx to import from this path instead:
//   import MilestoneWorld from "../milestone-world/MilestoneWorld.jsx";
// Then make rpg-world/MilestoneWorld.jsx a thin re-export of this file.

import React, { useState, useEffect, useRef } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useMilestoneCompletion } from "../../hooks/useMilestoneCompletion.js";
import { getMilestoneProgress } from "../../lib/progress.js";
import { getMilestoneBackground } from "../../data/assetRegistry.js";
import WorldBackground from "./WorldBackground.jsx";
import StepChecklist from "./StepChecklist.jsx";
import MilestoneProgressPanel from "./MilestoneProgressPanel.jsx";
import RewardChestPanel from "./RewardChestPanel.jsx";
import WorldActionBar from "./WorldActionBar.jsx";

export default function MilestoneWorld({ milestoneId, milestoneIndex, project, onBackToMap, onMilestoneComplete }) {
  const { milestones, toggleMilestoneAction, addMilestoneAction, updateMilestone } = useAppData();
  const milestone = milestones.find((m) => m.id === milestoneId);
  const [newActionText, setNewActionText] = useState("");
  const didSetInProgressRef = useRef(false);

  // Transition active → in_progress when entering a milestone
  useEffect(() => {
    if (!didSetInProgressRef.current && milestone && milestone.status === "active") {
      didSetInProgressRef.current = true;
      updateMilestone(milestone.id, { status: "in_progress" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone?.id]);

  const { collecting, handleComplete } = useMilestoneCompletion(milestoneId, onMilestoneComplete);

  if (!milestone) {
    return (
      <div className="rpg-world">
        <div className="rpg-world__topbar">
          <button className="rpg-back-btn" onClick={onBackToMap}>← Back to Map</button>
        </div>
        <div className="rpg-world__content" style={{ alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "rgba(234,251,255,0.4)" }}>Milestone not found.</p>
        </div>
      </div>
    );
  }

  const progress  = getMilestoneProgress(milestone);
  const isComplete = milestone.status === "completed";
  const bgUrl     = getMilestoneBackground(milestoneIndex, isComplete);
  const actions   = milestone.actions || [];

  const handleAddAction = () => {
    const text = newActionText.trim();
    if (!text) return;
    addMilestoneAction(milestone.id, text);
    setNewActionText("");
  };

  const handleToggleAction  = (actionId) => toggleMilestoneAction(milestone.id, actionId);
  const handleUpdateNotes   = (notes)     => updateMilestone(milestone.id, { notes });

  return (
    <div className="rpg-world">
      <WorldBackground bgUrl={bgUrl} />

      {/* Top bar */}
      <div className="rpg-world__topbar">
        <button className="rpg-back-btn" onClick={onBackToMap}>← Map</button>
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <div className="rpg-world__topbar-sub">Milestone {milestoneIndex + 1}</div>
          <div className="rpg-world__topbar-title" style={{ fontSize: 14 }}>{milestone.title}</div>
        </div>
        <div className="rpg-world__topbar-progress">
          <div className="rpg-world__topbar-progress-bar">
            <i style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: 11, color: "rgba(0,240,255,0.85)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="rpg-world__content">
        <div className="rpg-world__cols">
          <StepChecklist
            actions={actions}
            isComplete={isComplete}
            collecting={collecting}
            progress={progress}
            newActionText={newActionText}
            onChangeText={setNewActionText}
            onAddAction={handleAddAction}
            onToggleAction={handleToggleAction}
            onComplete={handleComplete}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <MilestoneProgressPanel
              progress={progress}
              priority={milestone.priority}
              targetDate={milestone.targetDate}
              collecting={collecting}
              isComplete={isComplete}
            />
            <RewardChestPanel milestone={milestone} />
          </div>
        </div>
      </div>

      <WorldActionBar
        milestone={milestone}
        project={project}
        onToggleAction={handleToggleAction}
        onUpdateNotes={handleUpdateNotes}
      />
    </div>
  );
}
