import React, { useState } from "react";
import { getMilestoneProgress } from "../../lib/progress.js";
import { useAppData } from "../../hooks/useAppData.js";
import { REWARD_TIERS as TIERS, chestAssets } from "../../data/assetRegistry.js";
import RewardRevealModal from "./RewardRevealModal.jsx";

function chestSrc(tier, state) {
  return chestAssets.src(tier, state);
}

export default function RewardChest({ milestone }) {
  const { updateMilestone, addXP } = useAppData();
  const [justClaimed, setJustClaimed] = useState(null);
  const [openTier, setOpenTier] = useState(null);
  const progress = getMilestoneProgress(milestone);
  const claimed = milestone.rewardsClaimed || {};

  const handleClaim = (tier) => {
    if (claimed[tier.claimKey]) return;
    setJustClaimed(tier.claimKey);
    updateMilestone(milestone.id, {
      rewardsClaimed: { ...claimed, [tier.claimKey]: true },
    });
    addXP(50, `${tier.label} claimed`);
    setTimeout(() => setJustClaimed(null), 1200);
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
          const isFlashing = justClaimed === tier.claimKey;
          const state = isClaimed ? "open" : unlocked ? "opening" : "closed";

          return (
            <div
              key={tier.key}
              className={`reward-chest__tier${unlocked && !isClaimed ? " is-unlocked" : ""}${isClaimed ? " is-claimed" : ""}`}
            >
              {/* Chest image — tap to reveal the reward */}
              <button
                type="button"
                className="reward-chest__chest-btn"
                onClick={() => setOpenTier(tier)}
                aria-label={`View ${tier.label}`}
                style={{ position: "relative", width: 48, height: 48, flexShrink: 0, padding: 0, border: 0, background: "none", cursor: "pointer" }}
              >
                <img
                  src={chestSrc(tier.chestTier, state)}
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  style={{
                    width: 48, height: 48, objectFit: "contain",
                    opacity: unlocked ? 1 : 0.3,
                    filter: isClaimed
                      ? "drop-shadow(0 0 10px rgba(0,255,191,0.65))"
                      : unlocked
                      ? "drop-shadow(0 0 8px rgba(250,204,21,0.55))"
                      : "saturate(0)",
                    transition: "filter 0.35s ease, opacity 0.35s ease",
                  }}
                />
                {isFlashing && (
                  <img
                    src={chestAssets.xpBurst}
                    alt=""
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    style={{
                      position: "absolute", top: -10, left: -10,
                      width: 68, height: 68, objectFit: "contain",
                      animation: "xpBurst 1.2s ease-out forwards",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </button>

              {/* Tier info */}
              <div className="reward-chest__tier-body">
                <div className="reward-chest__tier-label">
                  {tier.label} · {tier.threshold}%
                </div>
                <div className={`reward-chest__tier-text${!unlocked ? " is-locked" : ""}`}>
                  {isEmpty ? (
                    <span style={{ fontStyle: "italic", opacity: 0.4 }}>No reward set</span>
                  ) : unlocked ? rewardText : `Unlock at ${tier.threshold}% progress`}
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

      {openTier && (
        <RewardRevealModal
          tier={openTier}
          milestone={milestone}
          unlocked={progress >= openTier.threshold}
          isClaimed={!!claimed[openTier.claimKey]}
          onClaim={() => { handleClaim(openTier); setOpenTier(null); }}
          onClose={() => setOpenTier(null)}
        />
      )}
    </div>
  );
}
