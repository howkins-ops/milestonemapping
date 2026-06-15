import React from "react";
import ProgressRing from "../ui/ProgressRing.jsx";
import { shrineAssets, chestAssets } from "../../data/assetRegistry.js";

function priorityColor(priority) {
  if (priority === "mission_critical") return "#FF3B5C";
  if (priority === "high")             return "#FF3EDB";
  if (priority === "medium")           return "#7B2CFF";
  return "rgba(234,251,255,0.3)";
}

export default function MilestoneProgressPanel({ progress, priority, targetDate, collecting, isComplete }) {
  return (
    <div className="rpg-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative" }}>
      {collecting && (
        <img
          src={shrineAssets.rebirthSwirl}
          alt=""
          aria-hidden="true"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          style={{
            position: "absolute", width: 140, height: 140, objectFit: "contain",
            opacity: 0.6, animation: "xpBurst 0.9s ease-out forwards",
            pointerEvents: "none", zIndex: 10,
          }}
        />
      )}

      <div className={collecting ? "stone-collect-anim" : ""}>
        <ProgressRing value={progress} size={100} label="Progress" />
      </div>

      {priority && (
        <span style={{
          fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
          textTransform: "uppercase", color: priorityColor(priority),
          border: `1px solid ${priorityColor(priority)}44`,
          padding: "3px 10px", borderRadius: 20,
        }}>
          {priority.replace("_", " ")}
        </span>
      )}

      {targetDate && (
        <p style={{ fontSize: 11, color: "rgba(234,251,255,0.4)", fontFamily: "var(--font-mono)", textAlign: "center" }}>
          🎯 Target: {new Date(targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}

      {/* Milestone stone status */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <div className={`rpg-stone${isComplete ? "" : " rpg-stone--locked"}`} style={{ margin: "0 auto 10px" }}>
          <img
            src={isComplete ? chestAssets.diamondReward : chestAssets.epicClosed}
            alt={isComplete ? "Stone collected" : "Stone locked"}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{
              width: 60, height: 60, objectFit: "contain",
              filter: isComplete
                ? "drop-shadow(0 0 14px rgba(0,255,191,0.55))"
                : "saturate(0) opacity(0.35)",
              transition: "filter 0.4s ease",
            }}
          />
        </div>
        <p style={{
          fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: isComplete ? "#00FFBF" : "rgba(234,251,255,0.35)",
        }}>
          {isComplete ? "Stone Claimed" : "Stone Unclaimed"}
        </p>
      </div>
    </div>
  );
}
