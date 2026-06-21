import React from "react";
import Modal from "../ui/Modal.jsx";
import { chestAssets } from "../../data/assetRegistry.js";

/**
 * Shown when a reward chest is tapped — reveals the photo + description of the
 * reward, its unlock threshold, and a claim action when it's available.
 */
export default function RewardRevealModal({ tier, milestone, unlocked, isClaimed, onClaim, onClose }) {
  if (!tier) return null;

  const text = milestone[tier.field];
  const image = milestone[tier.imageField];
  const isEmpty = !text && !image;
  const state = isClaimed ? "open" : unlocked ? "opening" : "closed";

  return (
    <Modal open onClose={onClose} title={tier.label}>
      <div className="reward-reveal">
        <div className="reward-reveal__chest">
          <img
            src={chestAssets.src(tier.chestTier, state)}
            alt=""
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{ opacity: unlocked ? 1 : 0.45, filter: unlocked ? "none" : "saturate(0.2)" }}
          />
          <span className="reward-reveal__threshold">
            {isClaimed ? "Claimed" : unlocked ? "Unlocked" : `Unlocks at ${tier.threshold}%`}
          </span>
        </div>

        {image && (
          <div className="reward-reveal__photo">
            <img src={image} alt="Your reward" style={{ filter: unlocked ? "none" : "blur(8px) brightness(0.6)" }} />
            {!unlocked && <span className="reward-reveal__lock">🔒 Keep going to reveal</span>}
          </div>
        )}

        {isEmpty ? (
          <p className="muted" style={{ textAlign: "center" }}>No reward set for this chest yet.</p>
        ) : (
          <p className="reward-reveal__text">
            {unlocked ? (text || "Your reward awaits.") : "Reach the threshold to reveal this reward."}
          </p>
        )}

        {unlocked && !isClaimed && !isEmpty && (
          <button className="reward-reveal__claim" onClick={onClaim}>
            🎉 Claim this reward
          </button>
        )}
        {isClaimed && (
          <p className="reward-reveal__claimed">✓ You've claimed this reward</p>
        )}
      </div>
    </Modal>
  );
}
