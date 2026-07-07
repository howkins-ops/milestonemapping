import React from "react";
import CommandCenter from "./CommandCenter.jsx";

export default function DashboardPage({ onNavigate, onOpenProject, onOpenMapQuest, onOpenWorkout }) {
  return (
    <CommandCenter
      onNavigate={onNavigate}
      onOpenProject={onOpenProject}
      onOpenMapQuest={onOpenMapQuest}
      onOpenWorkout={onOpenWorkout}
    />
  );
}
