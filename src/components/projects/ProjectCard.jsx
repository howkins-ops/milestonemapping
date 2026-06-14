import React from "react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import { getProjectColorHex } from "../../lib/constants.js";
import {
  getProjectProgress,
  getProjectMilestones,
  getNextMilestone
} from "../../lib/progress.js";
import { formatShortDate, daysUntil } from "../../lib/dates.js";

export default function ProjectCard({ project, milestones, onOpen }) {
  const hex = getProjectColorHex(project.color);
  const list = getProjectMilestones(milestones, project.id);
  const completedCount = list.filter((m) => m.status === "completed").length;
  const progress = getProjectProgress(project, milestones);
  const next = getNextMilestone(project, milestones);
  const days = daysUntil(project.targetDate);
  const completed = project.status === "completed";

  return (
    <Card
      hoverable
      variant={completed ? "completed" : "default"}
      onClick={onOpen}
      style={{ cursor: "pointer", borderColor: completed ? undefined : `${hex}33` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
    >
      <div className="row row--between" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 28 }} aria-hidden="true">{completed ? "🏆" : project.icon}</span>
        <div className="row" style={{ gap: 6 }}>
          <Badge tone="cyan">{project.category}</Badge>
          {completed && <Badge tone="gold">Conquered</Badge>}
        </div>
      </div>

      <h3 style={{ fontSize: 17.5, marginBottom: 4 }}>{project.title}</h3>
      <p className="soft" style={{ fontSize: 12.5, marginBottom: 12 }}>
        {completedCount}/{list.length} milestones
        {project.targetDate && ` · Target ${formatShortDate(project.targetDate)}`}
        {days !== null && !completed && (
          <span style={{ color: days < 0 ? "var(--brand-red)" : "var(--text-soft)" }}>
            {" "}· {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
          </span>
        )}
      </p>

      <ProgressBar value={progress} max={100} />

      <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
        {completed
          ? "Treasure claimed. Project conquered."
          : next
            ? `Next milestone: ${next.title}`
            : "Map the first milestone."}
      </p>
    </Card>
  );
}
