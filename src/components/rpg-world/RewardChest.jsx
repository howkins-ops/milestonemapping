import React from "react";
import { getMilestoneProgress } from "../../lib/progress.js";
import { useAppData } from "../../hooks/useAppData.js";

const TIERS = [
  { key: "small",  threshold: 33,  icon: "🪙", label: "Small Reward",  field: "rewardSmall",  claimKey: "small"  },
  { key: "medium", threshold: 66,  icon: "💜", label: "Medium Reward", field: "rewardMedium", claimKey: "medium" },
  { key: "large",  threshold: 100, icon: "💎", label: "Final Reward",  field: "rewardLarge",  claimKey: "large"  },
];

export default function RewardChest({ milestone }) {
  const { updateMilestone, addXP } = useAppData();
  const progress = getMilestoneProgress(milestone);
  const claimed = milestone.rewardsClaimed || {};

  const handleClaim = (tier) => {
    if (claimed[tier.claimKey]) return;
    updateMilestone({
      ...milestone,
      rewardsClaimed: { ...claimed, [tier.claimKey]: true },
    });
    addXP(50, `${tier.label} claimed`);
  };

  return (
    <div>
      <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(234,251,255,0.45)", marginBottom: 12 }}>
        REWARD CHEST
      </p>
      <div className="reward-chest__list">
        {TIERS.map((tier) => {
          const rewardText = milestone[tier.field];
          const unlocked = progress >= tier.threshold;
          const isClaimed = !!claimed[tier.claimKey];
          const isEmpty = !rewardText;

          return (
            <div
              key={tier.key}
              className={`reward-chest__tier${unlocked && !isClaimed ? " is-unlocked" : ""}${isClaimed ? " is-claimed" : ""}`}
            >
              <span className="reward-chest__tier-icon" style={{ opacity: unlocked ? 1 : 0.35 }}>
                {isClaimed ? "✅" : unlocked ? tier.icon : "🔒"}
              </span>
              <div className="reward-chest__tier-body">
                <div className="reward-chest__tier-label">
                  {tier.label} · {tier.threshold}%
                </div>
                <div className={`reward-chest__tier-text${!unlocked ? " is-locked" : ""}`}>
                  {isEmpty ? (
                    <span style={{ fontStyle: "italic", opacity: 0.4 }}>No reward set</span>
                  ) : unlocked ? rewardText : "Unlock at " + tier.threshold + "% progress"}
                </div>
              </div>

              {unlocked && !isClaimed && !isEmpty && (
                <button className="reward-chest__claim-btn" onClick={() => handleClaim(tier)}>
                  Claim
                </button>
              )}
              {isClaimed && (
                <span className="reward-chest__claimed-badge">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7.5 5.5 11 12 4" stroke="#00FFBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Claimed
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
