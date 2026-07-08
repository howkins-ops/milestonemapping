import React from "react";
import { grantAiConsent } from "../../lib/aiConsent.js";

// Shown once, before the first time any prompt text leaves the device for the
// AI image generator. Names the provider and states exactly what is sent, per
// App Store Guideline 5.1.2(i). Reuses the shared `rig-*` modal styles.
export default function AiConsentModal({ onAccept, onCancel }) {
  const accept = () => {
    grantAiConsent();
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
            <div className="rig-kicker">BEFORE YOU GENERATE</div>
            <div className="rig-title">This uses an AI image service</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, lineHeight: 1.6, color: "rgba(234,251,255,0.78)" }}>
          <p style={{ margin: 0 }}>
            To paint your image, the words you type are sent to{" "}
            <strong style={{ color: "#eafbff" }}>Pollinations.ai</strong>, a third-party AI
            image generator, which sends the picture back.
          </p>
          <p style={{ margin: 0 }}>
            Only your prompt text is shared — never your name, email, journal, or
            any other personal data. See “Optional AI features” in the Privacy
            Policy for details.
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
