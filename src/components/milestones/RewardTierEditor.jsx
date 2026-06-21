import React, { useState, useRef } from "react";
import TextInput from "../ui/TextInput.jsx";
import { chestAssets } from "../../data/assetRegistry.js";
import { resolveRewardImage } from "../../lib/rewardImage.js";

/**
 * One row of the reward ladder editor: a chest preview, the reward text,
 * and an optional photo of the actual reward (camera roll or URL).
 */
export default function RewardTierEditor({ tier, text, image, userId, onChangeText, onChangeImage }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const src = await resolveRewardImage(file, userId);
      onChangeImage(src);
    } catch (err) {
      console.error("Reward image failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="reward-editor">
      <div className="reward-editor__head">
        <img
          className="reward-editor__chest"
          src={chestAssets.src(tier.chestTier, "closed")}
          alt=""
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
        />
        <div className="reward-editor__title">
          <span className="reward-editor__label">{tier.label}</span>
          <span className="reward-editor__threshold">Unlocks at {tier.threshold}%</span>
        </div>
      </div>

      <TextInput
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={
          tier.key === "small" ? "A small win for early momentum..."
          : tier.key === "medium" ? "Something worth pushing through the middle for..."
          : "The trophy at the summit..."
        }
      />

      {image ? (
        <div className="reward-editor__preview">
          <img src={image} alt="Reward" />
          <button type="button" className="reward-editor__remove" onClick={() => onChangeImage("")}>
            ✕ Remove photo
          </button>
        </div>
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="reward-editor__upload"
            onClick={() => !uploading && fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "⏳ Uploading…" : "📷 Add a photo of this reward"}
          </button>
        </>
      )}
    </div>
  );
}
