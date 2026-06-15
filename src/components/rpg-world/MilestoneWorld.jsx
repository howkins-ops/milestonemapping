import React, { useState } from "react";
import ProgressRing from "../ui/ProgressRing.jsx";
import BottomActionBar from "./BottomActionBar.jsx";
import RewardChest from "./RewardChest.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getMilestoneProgress } from "../../lib/progress.js";
import { getMilestoneBackground } from "../../lib/milestoneWorldAssets.js";

function priorityColor(priority) {
  if (priority === "mission_critical") return "#FF3B5C";
  if (priority === "high") return "#FF3EDB";
  if (priority === "medium") return "#7B2CFF";
  return "rgba(234,251,255,0.3)";
}

export default function MilestoneWorld({ milestoneId, milestoneIndex, project, onBackToMap, onMilestoneComplete }) {
  const { milestones, completeMilestone, toggleMilestoneAction, addMilestoneAction, updateMilestone } = useAppData();
  const milestone = milestones.find((m) => m.id === milestoneId);
  const [newActionText, setNewActionText] = useState("");
  const [collecting, setCollecting] = useState(false);

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

  const progress = getMilestoneProgress(milestone);
  const isComplete = milestone.status === "completed";
  const actions = milestone.actions || [];
  const bgUrl = getMilestoneBackground(milestoneIndex, isComplete);

  const handleComplete = () => {
    if (collecting) return;
    setCollecting(true);
    setTimeout(() => {
      completeMilestone(milestone.id);
      setCollecting(false);
      onMilestoneComplete();
    }, 820);
  };

  const handleAddAction = () => {
    const text = newActionText.trim();
    if (!text) return;
    addMilestoneAction(milestone.id, text);
    setNewActionText("");
  };

  const handleUpdateNotes = (notes) => {
    updateMilestone({ ...milestone, notes });
  };

  const handleToggleAction = (actionId) => {
    toggleMilestoneAction(milestone.id, actionId);
  };

  return (
    <div className="rpg-world">
      <div className="rpg-world__bg" style={{ backgroundImage: `url(${bgUrl})` }} />

      {/* Top bar */}
      <div className="rpg-world__topbar">
        <button className="rpg-back-btn" onClick={onBackToMap}>
          ← Map
        </button>
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <div className="rpg-world__topbar-sub">Milestone {milestoneIndex + 1}</div>
          <div className="rpg-world__topbar-title" style={{ fontSize: 14 }}>{milestone.title}</div>
        </div>
        <div className="rpg-world__topbar-progress">
          <div className="rpg-world__topbar-progress-bar">
            <i style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: 11, color: "rgba(0,240,255,0.85)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{progress}%</span>
        </div>
      </div>

      {/* Main content */}
      <div className="rpg-world__content">
        <div className="rpg-world__cols">

          {/* Left: Actions checklist */}
          <div className="rpg-card">
            <div className="rpg-actions__header">
              <span className="rpg-actions__title">Mission Steps</span>
              <span style={{ fontSize: 11, color: "rgba(234,251,255,0.4)", fontFamily: "var(--font-mono)" }}>
                {actions.filter((a) => a.done).length}/{actions.length} done
              </span>
            </div>

            {actions.length === 0 ? (
              <p style={{ fontSize: 13, color: "rgba(234,251,255,0.35)", fontStyle: "italic", marginBottom: 12 }}>
                No steps yet — add your first action below.
              </p>
            ) : (
              <div className="rpg-actions__list">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`rpg-action-item${action.done ? " is-done" : ""}`}
                    onClick={() => handleToggleAction(action.id)}
                    aria-pressed={action.done}
                  >
                    <span className="rpg-action-item__check">
                      <svg viewBox="0 0 14 14" fill="none">
                        <path d="M2 7.5 5.5 11 12 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="rpg-action-item__text">{action.text}</span>
                  </button>
                ))}
              </div>
            )}

            {!isComplete && (
              <div className="rpg-add-action">
                <input
                  type="text"
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAction()}
                  placeholder="Add a step…"
                  aria-label="New action"
                />
                <button className="rpg-add-action__btn" onClick={handleAddAction} disabled={!newActionText.trim()}>
                  + Add
                </button>
              </div>
            )}

            {!isComplete && (
              <button
                className="rpg-complete-btn"
                onClick={handleComplete}
                disabled={collecting}
                style={{ marginTop: 16 }}
              >
                {collecting ? "✨ Collecting Stone…" : progress === 100 ? "💎 Complete Milestone & Collect Stone" : "⚡ Complete Milestone"}
              </button>
            )}

            {isComplete && (
              <div style={{ marginTop: 12, textAlign: "center", padding: "14px", borderRadius: 12, background: "rgba(0,255,191,0.06)", border: "1px solid rgba(0,255,191,0.25)" }}>
                <span style={{ fontSize: 22 }}>💎</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#00FFBF", marginTop: 6 }}>Milestone Stone Collected</p>
              </div>
            )}
          </div>

          {/* Right: Status card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Progress ring */}
            <div className="rpg-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div className={collecting ? "stone-collect-anim" : ""}>
                <ProgressRing value={progress} size={100} label="Progress" />
              </div>
              {milestone.priority && (
                <span style={{
                  fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
                  textTransform: "uppercase", color: priorityColor(milestone.priority),
                  border: `1px solid ${priorityColor(milestone.priority)}44`,
                  padding: "3px 10px", borderRadius: 20
                }}>
                  {milestone.priority.replace("_", " ")}
                </span>
              )}
              {milestone.targetDate && (
                <p style={{ fontSize: 11, color: "rgba(234,251,255,0.4)", fontFamily: "var(--font-mono)", textAlign: "center" }}>
                  🎯 Target: {new Date(milestone.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              )}
            </div>

            {/* Milestone stone */}
            <div className="rpg-card" style={{ textAlign: "center" }}>
              <div className={`rpg-stone${isComplete ? "" : " rpg-stone--locked"}`} style={{ margin: "0 auto 10px" }}>
                {isComplete ? "💎" : "🔮"}
              </div>
              <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: isComplete ? "#00FFBF" : "rgba(234,251,255,0.35)" }}>
                {isComplete ? "Stone Claimed" : "Stone Unclaimed"}
              </p>
            </div>

            {/* Reward chest */}
            <div className="rpg-card">
              <RewardChest milestone={milestone} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <BottomActionBar
        milestone={milestone}
        project={project}
        onToggleAction={handleToggleAction}
        onUpdateNotes={handleUpdateNotes}
      />
    </div>
  );
}
