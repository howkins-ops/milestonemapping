import React, { useState } from "react";
import ProjectCard from "./ProjectCard.jsx";
import ProjectWizard from "./ProjectWizard.jsx";
import MapQuestHero from "./MapQuestHero.jsx";
import Button from "../ui/Button.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { CATEGORIES } from "../../lib/constants.js";
import {
  getProjectProgress,
  getProjectMilestones
} from "../../lib/progress.js";

const FILTERS = ["All", ...CATEGORIES, "Mission Critical", "Completed"];

function prioBadgeClass(p) {
  if (p === "mission_critical") return "badge--red";
  if (p === "high") return "badge--pink";
  if (p === "medium") return "badge--green";
  return "";
}

export default function ProjectsPage({ onOpenProject, onNavigate, onOpenMapQuest }) {
  const { projects, milestones, createProject, updateProject, loadSampleData } = useAppData();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const filtered = projects.filter((p) => {
    if (filter === "All") return true;
    if (filter === "Completed") return p.status === "completed";
    if (filter === "Mission Critical") return p.priority === "mission_critical";
    return p.category === filter;
  });

  const active = projects.filter((p) => p.status !== "completed").length;
  const done = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="anim-fade-in">
      <div style={{ marginBottom: 4 }}>
        <p className="kicker" style={{ marginBottom: 6 }}>Milestone Mapping</p>
        <h1 className="page-header__title" style={{ marginBottom: 4 }}>The Map Room.</h1>
      </div>
      <p className="muted" style={{ fontSize: 14, marginBottom: 18, lineHeight: 1.5 }}>
        Every project is a map. Every milestone is a diamond on the trail.
      </p>

      <Button variant="primary" size="lg" onClick={() => setWizardOpen(true)} style={{ width: "100%", marginBottom: 18 }}>
        + Chart New Map
      </Button>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px 24px", border: "1px dashed rgba(0,240,255,.2)", borderRadius: 20 }}>
          <div className="empty-map-glyph" aria-hidden="true">
            <span />
          </div>
          <h3 style={{ marginBottom: 8 }}>
            {projects.length === 0 ? "No maps charted yet" : `No maps in "${filter}"`}
          </h3>
          <p className="muted" style={{ fontSize: 14, marginBottom: 18 }}>
            {projects.length === 0
              ? "Chart your first map and give your transformation coordinates."
              : "Try a different filter."}
          </p>
          {projects.length === 0 && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={loadSampleData}
            >
              Load Example Maps
            </button>
          )}
        </div>
      ) : (
        <div className="stack">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              milestones={milestones}
              onOpen={() => onOpenProject(p.id)}
            />
          ))}
        </div>
      )}

      {onOpenMapQuest && (
        <div style={{ marginTop: 18 }}>
          <MapQuestHero onLaunch={onOpenMapQuest} />
        </div>
      )}

      {wizardOpen && (
        <ProjectWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onCreate={createProject}
          onUpdate={updateProject}
        />
      )}
    </div>
  );
}
