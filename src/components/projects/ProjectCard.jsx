import React, { useRef, useState } from "react";
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
import { milestoneWorldAssets as MWA } from "../../lib/milestoneWorldAssets.js";
import { useAppData } from "../../hooks/useAppData.js";
import { resolveImageSrc } from "../../lib/imageUploadService.js";

export default function ProjectCard({ project, milestones, onOpen }) {
  const { userId, updateProject } = useAppData();
  const hex = getProjectColorHex(project.color);
  const list = getProjectMilestones(milestones, project.id);
  const completedCount = list.filter((m) => m.status === "completed").length;
  const progress = getProjectProgress(project, milestones);
  const next = getNextMilestone(project, milestones);
  const days = daysUntil(project.targetDate);
  const completed = project.status === "completed";

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const defaultBg = completed
    ? "/assets/projects/project-card-complete-bg.png"
    : (days !== null && days < 0)
      ? "/assets/projects/project-card-overdue-bg.png"
      : "/assets/projects/project-card-active-bg.png";

  const handleBgFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await resolveImageSrc(file, userId);
      updateProject(project.id, { cardImageUrl: url });
    } catch (err) {
      console.error("Card background upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clearBg = (e) => {
    e.stopPropagation();
    updateProject(project.id, { cardImageUrl: "" });
  };

  const openPicker = (e) => {
    e.stopPropagation();
    fileRef.current?.click();
  };

  return (
    <Card
      hoverable
      variant={completed ? "completed" : "default"}
      className={`project-map-card ${completed ? "is-completed" : ""}`}
      onClick={onOpen}
      style={{ cursor: "pointer", borderColor: completed ? undefined : `${hex}33` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
    >
      <div className="project-map-card__art">
        <img
          className="project-map-card__bg"
          src={project.cardImageUrl || defaultBg}
          onError={(e) => {
            if (project.cardImageUrl) { e.currentTarget.src = defaultBg; return; }
            e.currentTarget.src = completed ? MWA.backgrounds.goalAchieved : MWA.backgrounds.treasureZone;
          }}
          alt=""
        />
        {!project.cardImageUrl && (
          <>
            <img
              className="project-map-card__portal"
              src={completed ? MWA.portals.completed : MWA.portals.active}
              alt=""
              aria-hidden="true"
            />
            <img
              className="project-map-card__avatar"
              src={completed ? MWA.avatars.victory : MWA.avatars.mapMarker}
              alt=""
              aria-hidden="true"
            />
          </>
        )}

        <input ref={fileRef} type="file" accept="image/*" onClick={(e) => e.stopPropagation()} onChange={handleBgFile} style={{ display: "none" }} />
        <div className={`project-map-card__bg-tools ${toolsOpen ? "is-open" : ""}`}>
          {toolsOpen && (
            <>
              <button
                type="button"
                className="project-map-card__bg-btn"
                onClick={openPicker}
                disabled={uploading}
                aria-label={project.cardImageUrl ? "Replace card background" : "Upload card background"}
              >
                {uploading ? "Uploading…" : project.cardImageUrl ? "↻ Replace" : "⤓ Background"}
              </button>
              {project.cardImageUrl && (
                <button
                  type="button"
                  className="project-map-card__bg-btn"
                  onClick={clearBg}
                  aria-label="Remove custom card background"
                >
                  ✕ Remove
                </button>
              )}
            </>
          )}
          <button
            type="button"
            className="project-map-card__bg-toggle"
            onClick={(e) => { e.stopPropagation(); setToolsOpen((o) => !o); }}
            aria-label={toolsOpen ? "Hide image tools" : "Edit card image"}
            aria-expanded={toolsOpen}
          >
            {toolsOpen ? "⌄" : "⚙"}
          </button>
        </div>
      </div>

      <div className="row row--between" style={{ marginBottom: 10 }}>
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
