import React, { useState } from "react";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import RewardImageGenerator from "./RewardImageGenerator.jsx";
import { REWARD_STATUS_LABELS } from "../../lib/rewards.js";

const CHEST_TIER = { small: "small", medium: "medium", large: "legendary" };
const CHEST_BASE = "/assets/treasure-system";
function chestSrc(tier, state) {
  return `${CHEST_BASE}/${CHEST_TIER[tier] || "epic"}-chest-${state}.png`;
}

const TIER_COLORS = {
  small:  { glow: "rgba(251,146,60,0.35)",  border: "rgba(251,146,60,0.4)",  text: "#FB923C" },
  medium: { glow: "rgba(203,213,225,0.3)",  border: "rgba(203,213,225,0.35)", text: "#CBD5E1" },
  large:  { glow: "rgba(250,204,21,0.4)",   border: "rgba(250,204,21,0.5)",  text: "#FACC15" },
};

export default function RewardCard({ reward, onClaim, onSaveImage }) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [opening, setOpening] = useState(false);

  const handleClaim = () => {
    setOpening(true);
    setTimeout(() => setOpening(false), 700);
    onClaim();
  };

  const claimable = reward.status === "preview_unlocked" || reward.status === "fully_unlocked";
  const locked    = reward.status === "locked";
  const claimed   = reward.status === "claimed";

  const tierStyle = TIER_COLORS[reward.tier] || TIER_COLORS.large;
  const hasImage  = Boolean(reward.imageUrl);
  const canGenerate = !locked;

  const handleSaveImage = (url) => {
    if (onSaveImage) onSaveImage(url);
    setShowGenerator(false);
  };

  return (
    <>
      <div
        className={`reward-card${claimed ? " reward-card--claimed" : ""}${claimable ? " reward-card--claimable" : ""}${locked ? " reward-card--locked" : ""}`}
        style={{
          "--tier-glow": tierStyle.glow,
          "--tier-border": tierStyle.border,
          "--tier-text": tierStyle.text,
          opacity: locked ? 0.6 : 1,
        }}
      >
        {/* AI-generated cover image */}
        {hasImage && !locked && (
          <div className="reward-card__cover">
            <img
              src={reward.imageUrl}
              alt={reward.text}
              className="reward-card__cover-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="reward-card__cover-overlay" />
            {/* Re-generate button on hover */}
            <button
              className="reward-card__regen-btn"
              onClick={() => setShowGenerator(true)}
              aria-label="Regenerate image"
            >
              🎨
            </button>
          </div>
        )}

        {/* Card body */}
        <div className="reward-card__body">
          <div className="reward-card__top-row">
            <span className="reward-card__tier-icon" aria-hidden="true">
              {locked ? (
                <span>🔒</span>
              ) : (
                <img
                  src={chestSrc(reward.tier, claimed ? "open" : opening ? "opening" : "closed")}
                  alt=""
                  style={{ width: 44, height: 44, objectFit: "contain", display: "block" }}
                />
              )}
            </span>
            <Badge tone={claimed ? "green" : claimable ? "gold" : ""}>
              {REWARD_STATUS_LABELS[reward.status]}
            </Badge>
          </div>

          <h3 className="reward-card__title" style={{ color: locked ? "rgba(234,251,255,0.3)" : undefined }}>
            {locked ? "????????" : reward.text}
          </h3>

          <p className="reward-card__meta">
            {reward.label} · {reward.milestoneTitle}
          </p>

          <ProgressBar
            value={Math.min(reward.progress, reward.threshold)}
            max={reward.threshold}
            label={`${reward.progress}% of ${reward.threshold}% required`}
            variant="gold"
            showPercent={false}
          />

          {/* Actions */}
          <div className="reward-card__actions">
            {claimable && (
              <Button variant="gold" style={{ flex: 1 }} onClick={handleClaim}>
                🎁 Claim (+50 XP)
              </Button>
            )}
            {claimed && (
              <p className="reward-card__claimed-msg">
                ✓ CLAIMED — discipline paid you back.
              </p>
            )}

            {/* Generate / Regenerate AI image button */}
            {canGenerate && (
              <button
                className={`reward-card__gen-btn${hasImage ? " reward-card__gen-btn--small" : ""}`}
                onClick={() => setShowGenerator(true)}
                title={hasImage ? "Regenerate AI image" : "Generate AI image for this reward"}
              >
                {hasImage ? "🎨" : "✨ Generate Art"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showGenerator && (
        <RewardImageGenerator
          reward={reward}
          onSave={handleSaveImage}
          onClose={() => setShowGenerator(false)}
        />
      )}
    </>
  );
}
