import React from "react";
import BottomActionBar from "../rpg-world/BottomActionBar.jsx";

// Thin wrapper over BottomActionBar.
// Phase 3: Inline the tabs here and replace BottomActionBar.jsx with this component
// so each tab panel can import from milestone-world/ sub-components.
export default function WorldActionBar({ milestone, project, onToggleAction, onUpdateNotes }) {
  return (
    <BottomActionBar
      milestone={milestone}
      project={project}
      onToggleAction={onToggleAction}
      onUpdateNotes={onUpdateNotes}
    />
  );
}
