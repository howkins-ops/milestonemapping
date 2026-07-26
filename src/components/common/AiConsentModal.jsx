import React from "react";
import { grantAiConsent, AI_PROVIDERS } from "../../lib/aiConsent.js";

// Shown once per provider, before the first time any text leaves the device for
// a third-party AI service. Names the provider and states exactly what is sent,
// per App Store Guideline 5.1.2. Reuses the shared `rig-*` modal styles.
export default function AiConsentModal({ provider = "pollinations", onAccept, onCancel }) {
  const p = AI_PROVIDERS[provider] || AI_PROVIDERS.pollinations;

  const accept = () => {
    grantAiConsent(p.id);
    onAccept();
  };

  return (
    <div
      className="rig-backdrop"
      style={{ zIndex: 60 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="rig-panel cyber-panel" style={{ maxWidth: 440 }}>
        <div className="rig-header">
          <div>
            <div className="rig-kicker">{p.kicker}</div>
            <div className="rig-title">{p.title}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, lineHeight: 1.6, color: "rgba(234,251,255,0.78)" }}>
          {p.body.map((line, i) => (
            <p key={i} style={{ margin: 0 }}>{line}</p>
          ))}
          <p style={{ margin: 0 }}>
            See “AI features” in the Privacy Policy for details. You can withdraw
            this in Settings at any time.
          </p>
        </div>

        <div className="rig-actions" style={{ marginTop: 18 }}>
          <button className="rig-regen-btn" onClick={onCancel}>Not now</button>
          <button className="rig-save-btn" onClick={accept}>Agree &amp; continue</button>
        </div>
      </div>
    </div>
  );
}
