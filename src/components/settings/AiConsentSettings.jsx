import React, { useState } from "react";
import { AI_PROVIDERS, hasAiConsent, revokeAiConsent } from "../../lib/aiConsent.js";

// Consent has to be withdrawable, not just grantable — the Privacy Policy and
// the consent modal both promise it can be taken back here, and Guideline 5.1.2
// plus GDPR Art. 7(3) both expect withdrawal to be as easy as giving it.
// Only providers the user has actually agreed to are listed; if they have
// agreed to none, the whole block stays out of the way.
export default function AiConsentSettings() {
  const [, force] = useState(0);
  const granted = Object.values(AI_PROVIDERS).filter((p) => hasAiConsent(p.id));

  if (!granted.length) return null;

  const withdraw = (id) => {
    revokeAiConsent(id);
    force((n) => n + 1);
  };

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--zn-border, rgba(255,255,255,0.1))" }}>
      <p style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>AI features you've agreed to</p>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 10, lineHeight: 1.55 }}>
        Withdrawing consent stops anything further being sent to that provider. The feature
        keeps working where it can run without them, and you'll simply be asked again if you
        change your mind.
      </p>
      {granted.map((p) => (
        <div key={p.id} className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 13.5 }}>{p.name}</span>
          <button
            type="button"
            onClick={() => withdraw(p.id)}
            style={{ background: "none", border: "1px solid var(--zn-border, rgba(255,255,255,0.2))", borderRadius: 8, padding: "5px 12px", color: "var(--accent)", fontSize: 12.5, cursor: "pointer" }}
          >
            Withdraw
          </button>
        </div>
      ))}
    </div>
  );
}
