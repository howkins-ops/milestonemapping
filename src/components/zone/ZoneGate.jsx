import React from "react";
import { supabase } from "../../lib/supabase.js";

// Shown when Supabase isn't configured or the user isn't signed in.
export default function ZoneGate() {
  const canSignIn = Boolean(supabase);

  function goSignIn() {
    try { localStorage.removeItem("mm_guest_mode"); } catch { /* ignore */ }
    window.location.reload();
  }

  return (
    <div className="zone-root" data-fire="cold">
      <div className="zn-card zn-card--glow" style={{ textAlign: "center", padding: "42px 24px", marginTop: 40 }}>
        <div style={{ fontSize: 44, marginBottom: 14 }} aria-hidden="true">🔥</div>
        <h2 className="zn-head__title" style={{ fontSize: 20, marginBottom: 10 }}>The Accountability Zone</h2>
        <p style={{ color: "var(--text-soft)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
          The Zone is where your people witness your work — missions, proof, squads, and fire.
          Sign in with a free account to enter. Everything else in the app keeps working without one.
        </p>
        {canSignIn && (
          <button
            type="button"
            onClick={goSignIn}
            style={{
              marginTop: 22,
              padding: "10px 26px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #1de8ff, #8b5cff)",
              color: "#000",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            SIGN IN / CREATE ACCOUNT
          </button>
        )}
      </div>
    </div>
  );
}
