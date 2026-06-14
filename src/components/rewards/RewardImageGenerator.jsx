import React, { useState, useCallback } from "react";
import { generateRewardImage, STYLE_OPTIONS, buildPrompt, buildImageUrl } from "../../lib/imageGen.js";

export default function RewardImageGenerator({ reward, onSave, onClose }) {
  const [style, setStyle] = useState("cinematic");
  const [customPrompt, setCustomPrompt] = useState(reward.text);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seed, setSeed] = useState(null);

  const generate = useCallback(() => {
    setLoading(true);
    setError(null);
    const newSeed = Math.floor(Math.random() * 99999);
    setSeed(newSeed);
    const prompt = buildPrompt(customPrompt || reward.text, style);
    const url = buildImageUrl(prompt, newSeed);
    setImageUrl(url);
    // Image loads naturally via <img> tag — mark loading done after short delay
    setTimeout(() => setLoading(false), 800);
  }, [customPrompt, reward.text, style]);

  const regenerate = useCallback(() => {
    if (!imageUrl) return;
    const newSeed = Math.floor(Math.random() * 99999);
    setSeed(newSeed);
    const prompt = buildPrompt(customPrompt || reward.text, style);
    setImageUrl(buildImageUrl(prompt, newSeed));
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }, [imageUrl, customPrompt, reward.text, style]);

  const handleSave = () => {
    if (imageUrl) onSave(imageUrl);
  };

  return (
    <div className="rig-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rig-panel cyber-panel">
        {/* Header */}
        <div className="rig-header">
          <div>
            <div className="rig-kicker">AI IMAGE GENERATOR</div>
            <div className="rig-title">Generate Reward Art</div>
          </div>
          <button className="rig-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Reward label */}
        <div className="rig-reward-label">
          <span style={{ opacity: 0.5, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
            REWARD
          </span>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#eafbff" }}>
            {reward.text}
          </span>
        </div>

        {/* Prompt */}
        <div className="rig-field">
          <label className="rig-label">PROMPT</label>
          <textarea
            className="rig-textarea"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe the image..."
            rows={2}
          />
        </div>

        {/* Style presets */}
        <div className="rig-field">
          <label className="rig-label">STYLE</label>
          <div className="rig-styles">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.key}
                className={`rig-style-btn${style === s.key ? " rig-style-btn--active" : ""}`}
                onClick={() => setStyle(s.key)}
              >
                <span className="rig-style-label">{s.label}</span>
                <span className="rig-style-desc">{s.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        {!imageUrl ? (
          <button
            className="rig-generate-btn"
            onClick={generate}
            disabled={loading}
          >
            {loading ? "⏳ Generating..." : "✨ Generate AI Image"}
          </button>
        ) : null}

        {/* Image preview */}
        {imageUrl && (
          <div className="rig-preview">
            <div className="rig-preview-img-wrap">
              {loading && (
                <div className="rig-loading-overlay">
                  <div className="rig-spinner" />
                  <div className="rig-loading-text">Generating...</div>
                </div>
              )}
              <img
                src={imageUrl}
                alt="AI generated reward"
                className="rig-preview-img"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError("Generation failed. Try again.");
                }}
              />
            </div>
            {error && (
              <div className="rig-error">{error}</div>
            )}
            {/* Preview actions */}
            <div className="rig-actions">
              <button className="rig-regen-btn" onClick={regenerate} disabled={loading}>
                🔄 Regenerate
              </button>
              <button className="rig-save-btn" onClick={handleSave} disabled={loading}>
                ✓ Use This Image
              </button>
            </div>
          </div>
        )}

        <p className="rig-attribution">
          Powered by FLUX Pro · Images generate in ~10s
        </p>
      </div>
    </div>
  );
}
