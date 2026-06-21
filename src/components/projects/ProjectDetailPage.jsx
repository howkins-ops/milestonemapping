import React, { useState, useRef } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import ProgressRing from "../ui/ProgressRing.jsx";
import ConfirmModal from "../ui/ConfirmModal.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import TreasureMap from "./TreasureMap.jsx";
import ProjectWizard from "./ProjectWizard.jsx";
import MilestoneCard from "../milestones/MilestoneCard.jsx";
import MilestoneWizard from "../milestones/MilestoneWizard.jsx";
import VisionBoardCard from "../vision/VisionBoardCard.jsx";
import VisionBoardForm from "../vision/VisionBoardForm.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getProjectMilestones, getProjectProgress } from "../../lib/progress.js";
import { getProjectColorHex } from "../../lib/constants.js";
import { formatShortDate } from "../../lib/dates.js";
import { resolveImageSrc } from "../../lib/imageUploadService.js";

export default function ProjectDetailPage({ projectId, onBack, onOpenMilestone, onOpenRPGWorld }) {
  const { projects, milestones, visionBoard, userId, createMilestone, updateMilestone, updateProject, deleteProject, addVisionBoardItem, detachVisionFromProject } =
    useAppData();
  const project = projects.find((p) => p.id === projectId);
  const [editOpen, setEditOpen] = useState(false);
  const [addVisionOpen, setAddVisionOpen] = useState(false);
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [trailView, setTrailView] = useState(true);
  const [goalUrlMode, setGoalUrlMode] = useState(false);
  const [goalUrlInput, setGoalUrlInput] = useState("");
  const [goalUploading, setGoalUploading] = useState(false);
  const goalFileRef = useRef(null);

  const handleGoalFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGoalUploading(true);
    try {
      const url = await resolveImageSrc(file, userId);
      updateProject(project.id, { goalImageUrl: url });
    } catch (err) {
      console.error("Goal image upload failed:", err);
    } finally {
      setGoalUploading(false);
      if (goalFileRef.current) goalFileRef.current.value = "";
    }
  };

  const handleGoalUrl = () => {
    const url = goalUrlInput.trim();
    if (!url) return;
    updateProject(project.id, { goalImageUrl: url });
    setGoalUrlMode(false);
    setGoalUrlInput("");
  };

  const clearGoalImage = () => updateProject(project.id, { goalImageUrl: "" });

  if (!project) {
    return (
      <div className="anim-fade-in">
        <p className="muted">This project no longer exists.</p>
        <Button variant="secondary" onClick={onBack} style={{ marginTop: 14 }}>
          ← Back to Map Room
        </Button>
      </div>
    );
  }

  const list = getProjectMilestones(milestones, project.id);
  const progress = getProjectProgress(project, milestones);
  const completedCount = list.filter((m) => m.status === "completed").length;
  const completed = project.status === "completed";
  const hex = getProjectColorHex(project.color);
  const linkedVisions = visionBoard.filter((v) => (v.projectIds || []).includes(project.id));
  return (
    <div className="anim-fade-in">
      <Button variant="ghost" size="sm" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Back to Map Room
      </Button>

      {/* Project header */}
      <Card variant={completed ? "completed" : "neon"} style={{ borderColor: completed ? undefined : `${hex}44`, marginBottom: 16 }}>
        <div className="row row--between row--wrap" style={{ gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <h1 style={{ fontSize: "clamp(18px, 2.6vw, 24px)" }}>{project.title}</h1>
            {project.description && (
              <p className="muted" style={{ marginTop: 8 }}>{project.description}</p>
            )}
            {project.targetDate && (
              <p className="mono soft" style={{ fontSize: 12.5, marginTop: 10 }}>
                TREASURE DATE: {formatShortDate(project.targetDate)}
              </p>
            )}
            <p style={{ fontSize: 13, marginTop: 8, color: hex }}>
              ⛳ {completedCount}/{list.length} milestones conquered
            </p>

            <div className="row row--wrap" style={{ marginTop: 16 }}>
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                ✎ Edit Project
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </div>
          </div>
          <ProgressRing value={progress} size={136} label="Expedition" />
        </div>
      </Card>

      {/* Trail Map — view toggle header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <SectionHeader
          title="Treasure Trail"
          icon="🗺"
          sub="Your path from idea to achievement."
          style={{ margin: 0 }}
        />
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
          <button
            onClick={() => setTrailView(true)}
            style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 10,
              fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
              textTransform: "uppercase", cursor: "pointer", border: "1px solid",
              background: trailView ? "rgba(0,240,255,0.15)" : "transparent",
              borderColor: trailView ? "#00F0FF" : "rgba(255,255,255,0.15)",
              color: trailView ? "#00F0FF" : "rgba(234,251,255,0.4)",
            }}
          >
            🗺 Trail
          </button>
          <button
            onClick={() => setTrailView(false)}
            style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 10,
              fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
              textTransform: "uppercase", cursor: "pointer", border: "1px solid",
              background: !trailView ? "rgba(0,240,255,0.15)" : "transparent",
              borderColor: !trailView ? "#00F0FF" : "rgba(255,255,255,0.15)",
              color: !trailView ? "#00F0FF" : "rgba(234,251,255,0.4)",
            }}
          >
            📋 List
          </button>
          {onOpenRPGWorld && (
            <button
              className="rpg-enter-world-btn"
              onClick={() => onOpenRPGWorld(project.id)}
            >
              ⚔️ Enter World
            </button>
          )}
          <Button variant="primary" size="sm" onClick={() => setAddMilestoneOpen(true)}>
            + Add
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <Card variant="glass" className="text-center" style={{ padding: 40 }}>
          <p className="muted" style={{ marginBottom: 16 }}>
            No milestones on this trail yet. Map the first coordinate.
          </p>
          <Button variant="neon" onClick={() => setAddMilestoneOpen(true)}>
            + Add First Milestone
          </Button>
        </Card>
      ) : trailView ? (
        <TreasureMap
          project={project}
          milestones={list}
          onOpenMilestone={onOpenMilestone}
          onAddMilestone={() => setAddMilestoneOpen(true)}
        />
      ) : (
        <div className="grid-3 stagger">
          {list.map((m) => (
            <MilestoneCard key={m.id} milestone={m} onOpen={() => onOpenMilestone(m.id)} />
          ))}
        </div>
      )}

      {/* Goal Vision Upload */}
      <div style={{ marginTop: 20, marginBottom: 28 }}>
        <div className="row row--between" style={{ alignItems: "center", marginBottom: 10 }}>
          <div>
            <p className="kicker" style={{ color: "var(--brand-gold)", marginBottom: 2 }}>GOAL VISION</p>
            <p className="muted" style={{ fontSize: 13 }}>Upload an image that represents what achieving this goal looks like.</p>
          </div>
          {project.goalImageUrl && (
            <button
              onClick={clearGoalImage}
              style={{ background: "none", border: "none", color: "var(--text-muted, #888)", cursor: "pointer", fontSize: 12, flexShrink: 0 }}
            >
              Remove
            </button>
          )}
        </div>

        {project.goalImageUrl ? (
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(250,204,21,0.3)", boxShadow: "0 0 24px rgba(250,204,21,0.08)", background: "rgba(0,0,0,0.35)" }}>
            <img
              src={project.goalImageUrl}
              alt="Goal vision"
              style={{ width: "100%", height: 175, objectFit: "contain", display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)",
              pointerEvents: "none"
            }} />
            <span className="mono" style={{
              position: "absolute", bottom: 12, left: 16,
              fontSize: 11, letterSpacing: "0.1em", color: "#FACC15",
              textShadow: "0 0 8px rgba(250,204,21,0.6)"
            }}>
              ◆ YOUR FUTURE STATE
            </span>
            <button
              onClick={() => goalFileRef.current?.click()}
              style={{
                position: "absolute", top: 10, right: 10,
                background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8, color: "#fff", cursor: "pointer",
                fontSize: 11, padding: "4px 10px", letterSpacing: "0.05em"
              }}
            >
              Replace
            </button>
            <input ref={goalFileRef} type="file" accept="image/*" onChange={handleGoalFile} style={{ display: "none" }} />
          </div>
        ) : goalUrlMode ? (
          <div style={{ background: "rgba(250,204,21,0.04)", border: "1px solid rgba(250,204,21,0.2)", borderRadius: 14, padding: "16px 18px" }}>
            <input
              type="text"
              value={goalUrlInput}
              onChange={(e) => setGoalUrlInput(e.target.value)}
              placeholder="https://..."
              onKeyDown={(e) => e.key === "Enter" && handleGoalUrl()}
              style={{
                width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(250,204,21,0.3)",
                borderRadius: 8, color: "#fff", padding: "10px 12px", fontSize: 14, outline: "none",
                boxSizing: "border-box"
              }}
              autoFocus
            />
            <div className="row" style={{ gap: 8, marginTop: 10 }}>
              <Button variant="primary" size="sm" onClick={handleGoalUrl} disabled={!goalUrlInput.trim()}>
                Set Image
              </Button>
              <button
                onClick={() => { setGoalUrlMode(false); setGoalUrlInput(""); }}
                style={{ background: "none", border: "none", color: "var(--text-muted, #888)", cursor: "pointer", fontSize: 13 }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={goalFileRef} type="file" accept="image/*" onChange={handleGoalFile} style={{ display: "none" }} />
            <button
              onClick={() => goalFileRef.current?.click()}
              style={{
                width: "100%", padding: "28px 20px",
                borderRadius: 16,
                border: "2px dashed rgba(250,204,21,0.3)",
                background: "rgba(250,204,21,0.04)",
                cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8,
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(250,204,21,0.7)"; e.currentTarget.style.background = "rgba(250,204,21,0.09)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(250,204,21,0.3)"; e.currentTarget.style.background = "rgba(250,204,21,0.04)"; }}
            >
              <span style={{ fontSize: 32 }}>🌅</span>
              <span style={{ fontWeight: 700, color: "#FACC15", fontSize: 15, letterSpacing: "0.03em" }}>Upload Your Goal Vision</span>
              <span className="muted" style={{ fontSize: 12 }}>A photo, screenshot, or inspiration image of your achieved goal</span>
            </button>
            <button
              onClick={() => setGoalUrlMode(true)}
              style={{ background: "none", border: "none", color: "rgba(250,204,21,0.6)", cursor: "pointer", fontSize: 12, marginTop: 8, padding: 0 }}
            >
              Or paste an image URL →
            </button>
          </div>
        )}
      </div>

      {/* Why / Vision */}
      {(project.whyItMatters || project.futureVision) && (
        <div className="grid-2" style={{ marginTop: 16 }}>
          {project.whyItMatters && (
            <Card variant="gold">
              <div className="kicker" style={{ color: "var(--brand-gold)", marginBottom: 8 }}>
                WHY IT MATTERS
              </div>
              <p className="muted" style={{ lineHeight: 1.7 }}>{project.whyItMatters}</p>
            </Card>
          )}
          {project.futureVision && (
            <Card variant="pink">
              <div className="kicker" style={{ color: "var(--brand-pink)", marginBottom: 8 }}>
                FUTURE VISION
              </div>
              <p className="muted" style={{ lineHeight: 1.7 }}>{project.futureVision}</p>
            </Card>
          )}
        </div>
      )}

      {/* Vision Wall */}
      {linkedVisions.length === 0 ? (
        <Card variant="glass" style={{ padding: "28px 24px", margin: "30px 0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 32, opacity: 0.5 }}>🔭</span>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>No vision pinned yet</p>
              <p className="muted" style={{ fontSize: 13 }}>
                Add images that represent the future this project is building toward.
              </p>
            </div>
            <Button variant="neon" size="sm" onClick={() => setAddVisionOpen(true)} style={{ marginLeft: "auto", flexShrink: 0 }}>
              + Add Vision
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <SectionHeader
            title="Vision Wall"
            icon="🔭"
            action={
              <Button variant="secondary" size="sm" onClick={() => setAddVisionOpen(true)}>
                + Add Vision
              </Button>
            }
          />
          <div style={{ columns: "3 200px", columnGap: 14, marginBottom: 16 }}>
            {linkedVisions.map((v, i) => (
              <VisionBoardCard
                key={v.id}
                item={v}
                index={i}
                compact
                onDelete={() => detachVisionFromProject(v.id, project.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Milestone dossiers */}
      {list.length > 0 && (
        <>
          <SectionHeader title="Milestone Dossiers" icon="🗂" sub="Full detail on every node." />
          <div className="grid-3 stagger">
            {list.map((m) => (
              <MilestoneCard key={m.id} milestone={m} onOpen={() => onOpenMilestone(m.id)} />
            ))}
          </div>
        </>
      )}

      {editOpen && (
        <ProjectWizard
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initial={project}
          onCreate={() => {}}
          onUpdate={updateProject}
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

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteProject(project.id);
          onBack();
        }}
        title="Delete this project?"
        message={`"${project.title}" and all ${list.length} of its milestones will be removed from the map. This cannot be undone.`}
        confirmLabel="Delete Project"
        danger
      />

      {addVisionOpen && (
        <VisionBoardForm
          open={addVisionOpen}
          onClose={() => setAddVisionOpen(false)}
          onAdd={addVisionBoardItem}
          defaultProjectId={project.id}
        />
      )}
    </div>
  );
}
