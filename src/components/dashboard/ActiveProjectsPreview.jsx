import React from "react";
import Button from "../ui/Button.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import ProjectCard from "../projects/ProjectCard.jsx";
import { useAppData } from "../../hooks/useAppData.js";

export default function ActiveProjectsPreview({ onNavigate, onOpenProject }) {
  const { projects, milestones } = useAppData();
  const preview = projects.filter((p) => p.status === "active").slice(0, 3);

  return (
    <section>
      <SectionHeader
        title="Active Expeditions"
        icon={
          <svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="9" cy="7" r="4" />
            <path d="M5 11 Q9 16 13 11" />
          </svg>
        }
        sub="Your islands, your treasure trails, in motion."
        action={
          <Button variant="ghost" size="sm" onClick={() => onNavigate("milestones")}>
            Open World Map →
          </Button>
        }
      />
      {preview.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="10" r="5" />
              <path d="M7 15 Q12 22 17 15" />
              <line x1="4" y1="22" x2="20" y2="22" />
            </svg>
          }
          title="No active projects"
          description="The ocean is empty. Chart your first island and give your future coordinates."
          actionLabel="+ Map New Project"
          onAction={() => onNavigate("milestones")}
        />
      ) : (
        <div className="grid-3 stagger">
          {preview.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              milestones={milestones}
              onOpen={() => onOpenProject(p.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
