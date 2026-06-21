import React from "react";
import Card from "../ui/Card.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import { getMilestoneProgress, getRewardStatus } from "../../lib/progress.js";
import { formatShortDate, daysUntil } from "../../lib/dates.js";

export default function MilestoneCard({ milestone, onOpen }) {
  const progress = getMilestoneProgress(milestone);
  const reward = getRewardStatus(milestone);
  const days = daysUntil(milestone.targetDate);
  const completed = milestone.status === "completed";

  return (
    <Card
      hoverable
      variant={
        completed ? "completed" : milestone.priority === "mission_critical" ? "pink" : "default"
      }
      onClick={onOpen}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
    >
      <h3 style={{ fontSize: 17.5, marginBottom: 6 }}>{milestone.title}</h3>
      {milestone.targetDate && (
        <p className="soft" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Target {formatShortDate(milestone.targetDate)}
          {days !== null && !completed && (
            <span style={{ color: days < 0 ? "var(--brand-red)" : "var(--text-soft)" }}>
              {" "}· {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
            </span>
          )}
        </p>
      )}

      <ProgressBar value={progress} max={100} variant={completed ? "default" : progress >= 66 ? "gold" : "default"} />

      <p style={{ fontSize: 12.5, marginTop: 12, color: "var(--brand-gold)" }}>
        🎁 {reward.label}
      </p>
    </Card>
  );
}
