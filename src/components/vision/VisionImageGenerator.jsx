import React, { useState, useCallback } from "react";
import { STYLE_OPTIONS, buildPrompt, buildImageUrl } from "../../lib/imageGen.js";

// "Imagine your goal" — describe a goal in words and let FLUX Pro paint it.
// Reuses the keyless Pollinations image gen + the shared `rig-*` modal styles.
// onUse({ imageUrl, title, prompt }) is called when the user keeps an image.
export default function VisionImageGenerator({ onUse, onClose, defaultPrompt = "", title = "Imagine Your Goal" }) {
  const [style, setStyle] = useState("cinematic");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const text = (prompt || "").trim();

  const generate = useCallback(() => {
    if (!text) return;
    setLoading(true);
    setError(null);
    const seed = Math.floor(Math.random() * 99999);
    setImageUrl(buildImageUrl(buildPrompt(text, style), seed));
    setTimeout(() => setLoading(false), 800);
  }, [text, style]);

  const regenerate = useCallback(() => {
    if (!imageUrl) return;
    const seed = Math.floor(Math.random() * 99999);
    setImageUrl(buildImageUrl(buildPrompt(text, style), seed));
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 800);
  }, [imageUrl, text, style]);

  const handleUse = () => {
    if (imageUrl) onUse({ imageUrl, title: text.slice(0, 60), prompt: text });
  };

  return (
    <div className="rig-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rig-panel cyber-panel">
        <div className="rig-header">
          <div>
            <div className="rig-kicker">AI VISION GENERATOR</div>
            <div className="rig-title">{title}</div>
          </div>
          <button className="rig-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Goal prompt */}
        <div className="rig-field">
          <label className="rig-label">DESCRIBE YOUR GOAL</label>
          <textarea
            className="rig-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="The mountain house with floor-to-ceiling windows. Crossing the marathon finish line, arms raised…"
            rows={3}
            autoFocus
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

        {!imageUrl ? (
          <button className="rig-generate-btn" onClick={generate} disabled={loading || !text}>
            {loading ? "⏳ Generating…" : "✨ Generate Vision"}
          </button>
        ) : null}

        {imageUrl && (
          <div className="rig-preview">
            <div className="rig-preview-img-wrap">
              {loading && (
                <div className="rig-loading-overlay">
                  <div className="rig-spinner" />
                  <div className="rig-loading-text">Painting your vision…</div>
                </div>
              )}
              <img
                src={imageUrl}
                alt="AI generated vision"
                className="rig-preview-img"
                onLoad={() => setLoading(false)}
                onError={() => { setLoading(false); setError("Generation failed. Try again."); }}
              />
            </div>
            {error && <div className="rig-error">{error}</div>}
            <div className="rig-actions">
              <button className="rig-regen-btn" onClick={regenerate} disabled={loading}>
                🔄 Regenerate
              </button>
              <button className="rig-save-btn" onClick={handleUse} disabled={loading}>
                ✓ Pin to Vision
              </button>
            </div>
          </div>
        )}

        <p className="rig-attribution">Powered by FLUX Pro · Images generate in ~10s</p>
      </div>
    </div>
  );
}
