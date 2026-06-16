import React, { useState } from "react";
import ProjectCard from "./ProjectCard.jsx";
import ProjectWizard from "./ProjectWizard.jsx";
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

export default function ProjectsPage({ onOpenProject, onNavigate }) {
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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <p className="kicker" style={{ marginBottom: 6 }}>Milestone Mapping</p>
          <h1 className="page-header__title" style={{ marginBottom: 4 }}>The Map Room.</h1>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate("openworld")}
            style={{
              marginTop: 4,
              flexShrink: 0,
              background: "linear-gradient(135deg, rgba(255,62,219,0.18), rgba(0,240,255,0.08))",
              border: "1px solid rgba(255,62,219,0.5)",
              borderRadius: 10,
              padding: "7px 14px",
              color: "#FF3EDB",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 0 12px rgba(255,62,219,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            Your Empire
          </button>
        )}
      </div>
      <p className="muted" style={{ fontSize: 14, marginBottom: 18, lineHeight: 1.5 }}>
        Every project is a map. Every milestone is a diamond on the trail.
      </p>

      {/* filter chips */}
      <div className="map-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`map-chip ${filter === f ? "is-on" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

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
