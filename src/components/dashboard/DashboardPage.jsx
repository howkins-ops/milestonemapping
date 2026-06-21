import React from "react";
import CommandCenter from "./CommandCenter.jsx";

export default function DashboardPage({ onNavigate, onOpenProject, onOpenMapQuest }) {
  return <CommandCenter onNavigate={onNavigate} onOpenProject={onOpenProject} onOpenMapQuest={onOpenMapQuest} />;
}
