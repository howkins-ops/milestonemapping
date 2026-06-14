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
        icon="🏝"
        sub="Your islands, your treasure trails, in motion."
        action={
          <Button variant="ghost" size="sm" onClick={() => onNavigate("milestones")}>
            Open World Map →
          </Button>
        }
      />
      {preview.length === 0 ? (
        <EmptyState
          icon="🏝️"
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
