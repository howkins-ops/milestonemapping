import React from "react";
import CommandCenter from "./CommandCenter.jsx";

export default function DashboardPage({ onNavigate, onOpenProject, onOpenWorkout, onRecommit }) {
  return (
    <CommandCenter
      onNavigate={onNavigate}
      onOpenProject={onOpenProject}
      onOpenWorkout={onOpenWorkout}
      onRecommit={onRecommit}
    />
  );
}
