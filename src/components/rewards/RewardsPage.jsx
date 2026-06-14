import React from "react";
import RewardVault from "./RewardVault.jsx";
export default function RewardsPage({ onNavigate }) {
  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker" style={{ color: "#FACC15" }}>REWARDS VAULT</div>
        <h1 className="page-header__title">Discipline Pays You Back</h1>
        <p className="page-header__sub">
          Execute your milestones. 33% unlocks the preview. 100% opens the vault.
        </p>
      </header>
      <RewardVault onNavigate={onNavigate} />
    </div>
  );
}
