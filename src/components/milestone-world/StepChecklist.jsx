import React from "react";
import StepItem from "./StepItem.jsx";
import { chestAssets } from "../../data/assetRegistry.js";

export default function StepChecklist({
  actions,
  isComplete,
  collecting,
  progress,
  newActionText,
  onChangeText,
  onAddAction,
  onToggleAction,
  onComplete,
}) {
  const doneCount = actions.filter((a) => a.done).length;

  return (
    <div className="rpg-card">
      <div className="rpg-actions__header">
        <span className="rpg-actions__title">Mission Steps</span>
        <span style={{ fontSize: 11, color: "rgba(234,251,255,0.4)", fontFamily: "var(--font-mono)" }}>
          {doneCount}/{actions.length} done
        </span>
      </div>

      {actions.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(234,251,255,0.35)", fontStyle: "italic", marginBottom: 12 }}>
          No steps yet — add your first action below.
        </p>
      ) : (
        <div className="rpg-actions__list">
          {actions.map((action) => (
            <StepItem key={action.id} action={action} onToggle={onToggleAction} />
          ))}
        </div>
      )}

      {!isComplete && (
        <div className="rpg-add-action">
          <input
            type="text"
            value={newActionText}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddAction()}
            placeholder="Add a step…"
            aria-label="New action"
          />
          <button
            className="rpg-add-action__btn"
            onClick={onAddAction}
            disabled={!newActionText.trim()}
          >
            + Add
          </button>
        </div>
      )}

      {!isComplete && (
        <button
          className="rpg-complete-btn"
          onClick={onComplete}
          disabled={collecting}
          style={{ marginTop: 16 }}
        >
          {collecting
            ? "✨ Collecting Stone…"
            : progress === 100
            ? "💎 Complete Milestone & Collect Stone"
            : "⚡ Complete Milestone"}
        </button>
      )}

      {isComplete && (
        <div style={{
          marginTop: 12, textAlign: "center", padding: "14px", borderRadius: 12,
          background: "rgba(0,255,191,0.06)", border: "1px solid rgba(0,255,191,0.25)",
        }}>
          <img
            src={chestAssets.diamondReward}
            alt=""
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{ width: 52, height: 52, objectFit: "contain", filter: "drop-shadow(0 0 12px rgba(0,255,191,0.5))" }}
          />
          <p style={{ fontSize: 13, fontWeight: 700, color: "#00FFBF", marginTop: 6 }}>
            Milestone Stone Collected
          </p>
        </div>
      )}
    </div>
  );
}
