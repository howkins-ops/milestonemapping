import React from "react";
import RewardCard from "./RewardCard.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getRewardsFromMilestones } from "../../lib/progress.js";

const ORDER = { fully_unlocked: 0, preview_unlocked: 1, locked: 2, claimed: 3 };

const PREVIEW_REWARDS = [
  { tier: "small",  icon: "🥉", label: "Small",  pct: "33%", example: "Cheat meal, earned not stolen" },
  { tier: "medium", icon: "🥈", label: "Medium", pct: "66%", example: "New training shoes" },
  { tier: "large",  icon: "🏆", label: "Large",  pct: "100%", example: "Weekend trip, fully unplugged" },
];

function VaultEmptyState({ onNavigate }) {
  return (
    <div style={{ padding: "4px 0 40px" }}>
      {/* Hero message */}
      <div style={{
        textAlign: "center",
        padding: "32px 20px 28px",
        borderRadius: 20,
        background: "rgba(250,204,21,0.04)",
        border: "1px solid rgba(250,204,21,0.12)",
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 20,
          color: "#eafbff",
          marginBottom: 8,
        }}>
          The Vault Is Empty
        </div>
        <p style={{ fontSize: 13.5, color: "rgba(234,251,255,0.5)", margin: "0 0 20px", lineHeight: 1.6 }}>
          Rewards live inside your milestones. Go to any milestone,
          edit it, and fill in the three reward tiers — they'll appear here automatically as you progress.
        </p>
        <button
          onClick={() => onNavigate("milestones")}
          style={{
            padding: "12px 28px",
            borderRadius: 100,
            background: "linear-gradient(135deg, rgba(250,204,21,0.2), rgba(250,204,21,0.08))",
            border: "1px solid rgba(250,204,21,0.4)",
            color: "#FACC15",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.12em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          OPEN PROJECT MAP →
        </button>
      </div>

      {/* How it works */}
      <div style={{ marginBottom: 8 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.2em",
          color: "rgba(234,251,255,0.3)",
          textTransform: "uppercase",
          marginBottom: 12,
        }}>
          HOW REWARDS UNLOCK
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PREVIEW_REWARDS.map((r) => (
            <div key={r.tier} style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#eafbff", marginBottom: 2 }}>
                  {r.label} Reward — unlocks at {r.pct}
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(234,251,255,0.4)", fontStyle: "italic" }}>
                  "{r.example}"
                </div>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#FACC15",
                flexShrink: 0,
                fontWeight: 700,
              }}>
                {r.pct}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI image teaser */}
      <div style={{
        marginTop: 24,
        padding: "14px 16px",
        borderRadius: 14,
        background: "rgba(209,30,255,0.06)",
        border: "1px solid rgba(209,30,255,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>✨</span>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#D11EFF", marginBottom: 2 }}>
            AI Image Generation
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(234,251,255,0.45)", lineHeight: 1.5 }}>
            Once rewards appear, tap Generate Art on any card to create a cinematic AI image powered by FLUX Pro.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RewardVault({ onNavigate }) {
  const { milestones, claimReward, saveRewardImage } = useAppData();
  const rewards = getRewardsFromMilestones(milestones).sort(
    (a, b) => ORDER[a.status] - ORDER[b.status]
  );

  if (rewards.length === 0) {
    return <VaultEmptyState onNavigate={onNavigate} />;
  }

  const unlockedCount = rewards.filter(
    (r) => r.status === "preview_unlocked" || r.status === "fully_unlocked"
  ).length;

  return (
    <section>
      <SectionHeader
        title="Vault Contents"
        icon="🏦"
        sub={
          unlockedCount > 0
            ? `${unlockedCount} reward${unlockedCount > 1 ? "s" : ""} ready to claim. Tap ✨ to generate AI art.`
            : "Progress is the only key that opens this vault."
        }
      />
      <div className="grid-3 stagger">
        {rewards.map((r) => (
          <RewardCard
            key={r.id}
            reward={r}
            onClaim={() => claimReward(r.milestoneId, r.tier)}
            onSaveImage={(url) => saveRewardImage(r.milestoneId, r.tier, url)}
          />
        ))}
      </div>
    </section>
  );
}
