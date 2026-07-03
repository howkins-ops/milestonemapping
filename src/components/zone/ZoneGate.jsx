import React from "react";

// Shown when Supabase isn't configured or the user isn't signed in.
export default function ZoneGate() {
  return (
    <div className="zone-root" data-fire="cold">
      <div className="zn-card zn-card--glow" style={{ textAlign: "center", padding: "42px 24px", marginTop: 40 }}>
        <div style={{ fontSize: 44, marginBottom: 14 }} aria-hidden="true">🔥</div>
        <h2 className="zn-head__title" style={{ fontSize: 20, marginBottom: 10 }}>The Accountability Zone</h2>
        <p style={{ color: "var(--text-soft)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
          The Zone is where your people witness your work — missions, proof, squads, and fire.
          Sign in with a cloud account to enter.
        </p>
      </div>
    </div>
  );
}
