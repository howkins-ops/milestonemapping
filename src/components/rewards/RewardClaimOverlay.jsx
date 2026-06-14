import React from "react";

// The REWARD CLAIMED cinematic moment is rendered by the global
// CelebrationOverlay (variant: "reward"), queued from useAppData.claimReward().
// This component re-exports that path for anyone wiring rewards UI directly.
export { default } from "../ui/CelebrationOverlay.jsx";
