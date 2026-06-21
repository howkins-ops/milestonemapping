import React, { useState, useRef, useEffect } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import TextInput from "../ui/TextInput.jsx";
import RewardImageGenerator from "../rewards/RewardImageGenerator.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getMilestoneProgress } from "../../lib/progress.js";
import { uploadImage } from "../../lib/imageUploadService.js";

const CHEST_BASE = "/assets/treasure-system";
function chestSrc(chest, state) {
  return `${CHEST_BASE}/${chest}-chest-${state}.png`;
}

const TIERS = [
  { tier: "small", field: "rewardSmall", imageField: "rewardSmallImage", label: "Small Reward", threshold: 33, chest: "small" },
  { tier: "medium", field: "rewardMedium", imageField: "rewardMediumImage", label: "Medium Reward", threshold: 66, chest: "medium" },
  { tier: "large", field: "rewardLarge", imageField: "rewardLargeImage", label: "Large Reward", threshold: 100, chest: "legendary" }
];

function RewardTierRow({ milestone, cfg, progress, userId, updateMilestone, saveRewardImage, onGenerate, onView }) {
  const { tier, field, imageField, label, threshold, chest } = cfg;
  const imageUrl = milestone[imageField] || "";
  const unlocked = progress >= threshold;
  const [text, setText] = useState(milestone[field] || "");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    setText(milestone[field] || "");
  }, [milestone, field]);

  const saveText = () => {
    const v = text.trim();
    if (v !== (milestone[field] || "")) updateMilestone(milestone.id, { [field]: v });
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setUploading(true);
    try {
      const url = await uploadImage(file, userId);
      saveRewardImage(milestone.id, tier, url);
    } catch (e2) {
      setErr(e2?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "14px 0",
        borderTop: "1px solid rgba(250,204,21,0.14)"
      }}
    >
      {/* Chest + status */}
      <div style={{ flexShrink: 0, width: 64, textAlign: "center" }}>
        <img
          src={chestSrc(chest, unlocked ? "open" : "closed")}
          alt=""
          style={{ width: 52, height: 52, objectFit: "contain", filter: unlocked ? "none" : "grayscale(0.4) opacity(0.85)" }}
        />
        <div
          className="mono"
          style={{ fontSize: 9, letterSpacing: "0.08em", marginTop: 2, color: unlocked ? "var(--brand-green)" : "rgba(234,251,255,0.4)" }}
        >
          {unlocked ? "UNLOCKED" : `${threshold}%`}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="kicker" style={{ color: "var(--brand-gold)", marginBottom: 6 }}>
          {label} · unlocks at {threshold}%
        </div>

        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={saveText}
          placeholder={`What's the ${label.toLowerCase()}? (e.g. new running shoes)`}
        />

        {/* Image preview */}
        {imageUrl && (
          <div style={{ marginTop: 10, position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(250,204,21,0.3)" }}>
            <img
              src={imageUrl}
              alt={text || label}
              onClick={() => onView(imageUrl)}
              style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block", cursor: "zoom-in" }}
            />
            <button
              onClick={() => saveRewardImage(milestone.id, tier, "")}
              style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 11, padding: "3px 8px"
              }}
            >
              Remove
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="row row--wrap" style={{ gap: 8, marginTop: 10 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : imageUrl ? "📷 Replace Photo" : "📷 Upload Photo"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onGenerate(cfg)}>
            ✨ Generate Art
          </Button>
        </div>
        {err && <p style={{ color: "var(--brand-red)", fontSize: 12, marginTop: 6 }}>{err}</p>}
      </div>
    </div>
  );
}

export default function MilestoneRewards({ milestone }) {
  const { userId, updateMilestone, saveRewardImage } = useAppData();
  const progress = getMilestoneProgress(milestone);
  const [genCfg, setGenCfg] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  return (
    <Card variant="gold" style={{ marginTop: 16 }}>
      <div className="kicker" style={{ color: "var(--brand-gold)", marginBottom: 4 }}>
        REWARD VAULT
      </div>
      <p className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
        Set your rewards and add a photo of each one. Seeing what you're chasing keeps the fire lit —
        no need to wait until it unlocks.
      </p>

      {TIERS.map((cfg) => (
        <RewardTierRow
          key={cfg.tier}
          milestone={milestone}
          cfg={cfg}
          progress={progress}
          userId={userId}
          updateMilestone={updateMilestone}
          saveRewardImage={saveRewardImage}
          onGenerate={setGenCfg}
          onView={setLightbox}
        />
      ))}

      {genCfg && (
        <RewardImageGenerator
          reward={{ tier: genCfg.tier, text: milestone[genCfg.field] || genCfg.label }}
          onSave={(url) => {
            saveRewardImage(milestone.id, genCfg.tier, url);
            setGenCfg(null);
          }}
          onClose={() => setGenCfg(null)}
        />
      )}

      {lightbox && (
        <Modal open onClose={() => setLightbox(null)} title="🏆 Your Reward" wide>
          <img src={lightbox} alt="Reward" style={{ width: "100%", borderRadius: 12, display: "block" }} />
        </Modal>
      )}
    </Card>
  );
}
