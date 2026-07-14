import React, { useState } from "react";
import IdentityForm from "./IdentityForm.jsx";
import IdentityRules from "./IdentityRules.jsx";
import Incantation from "../clearday/Incantation.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import "../../styles/identity.css";

export default function IdentityPage() {
  const { identity, settings } = useAppData();
  const [speaking, setSpeaking] = useState(false);
  const statement = (identity.powerStatement || "").trim();

  return (
    <div className="anim-fade-in">
      <header className="page-header idb-hero">
        <div className="page-header__kicker">IDENTITY BUILDER</div>
        <h1 className="page-header__title">
          Goals change what you chase. Identity changes what you keep.
        </h1>
        <p className="page-header__sub">
          Name the old version. Name the new one. Then write the rules the new one lives by.
        </p>
      </header>

      <IdentityForm />

      {statement.length >= 10 && (
        <button type="button" className="idb-speak" style={{ marginTop: 16 }} onClick={() => setSpeaking(true)}>
          <span className="idb-speak-icon" aria-hidden="true">🔊</span>
          <span className="idb-speak-copy">
            <span className="idb-speak-title">SPEAK IT — THE INCANTATION</span>
            <span className="idb-speak-sub">
              Your power statement, out loud, three rounds: whisper → voice → roar. Say it until you believe it.
            </span>
          </span>
        </button>
      )}

      <div style={{ marginTop: 16 }}>
        <IdentityRules />
      </div>

      {speaking && (
        <Incantation
          statement={statement}
          settings={settings}
          palette={{ accent: "#facc15", tintRgb: "250, 204, 21" }}
          onClose={() => setSpeaking(false)}
        />
      )}
    </div>
  );
}
