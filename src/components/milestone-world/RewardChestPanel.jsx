import React from "react";
import RewardChest from "../rpg-world/RewardChest.jsx";

export default function RewardChestPanel({ milestone }) {
  return (
    <div className="rpg-card">
      <RewardChest milestone={milestone} />
    </div>
  );
}
