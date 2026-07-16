import React, { useState } from "react";
import { setDevotion } from "./clearDayStore.js";
import { tapLight, tapMedium } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   THE DEVOTION LINE — one outward closer added to the Incantation.
   Brand's Step 11, verbatim: "create your own incantation, your own
   tune-in code, use it daily." His example ends outward — this is
   the one line his program would add to what CLEARDAY already
   built. One-time setup (editable), not a nightly rep.
   ═══════════════════════════════════════════════════════════════ */

const PRESETS = [
  "The ones still stuck",
  "The man I'm becoming",
  "My future family",
  "The people who count on me",
];

export default function DevotionSetup({ current, onClose }) {
  const [pick, setPick] = useState(null);
  const [custom, setCustom] = useState(current || "");
  const [saved, setSaved] = useState(false);

  const value = custom.trim() || pick || "";

  const save = () => {
    if (!value) return;
    tapMedium();
    // a preset chip becomes "My clear life is for X." — custom text is spoken verbatim
    const line = pick && !custom.trim() ? `My clear life is for ${pick}.` : custom.trim();
    setDevotion(line);
    setSaved(true);
  };

  return (
    <div className="cd-devotion" role="dialog" aria-label="The Devotion Line">
      <div className="cd-devotion-card">
        <button type="button" className="cd-reachout-x" onClick={onClose} aria-label="Close">×</button>
        <img className="cd-reachout-art" src="/assets/clearday/devotion-line-v3.webp" alt="" />
        <div className="cd-eyebrow" style={{ color: "var(--cd-green)" }}>THE DEVOTION LINE</div>
        <h2 className="cd-reachout-h">Your claim says who you are.<br />Add who it's for.</h2>

        {!saved ? (
          <>
            <p className="cd-p cd-p--soft" style={{ margin: "0 0 12px" }}>
              Every line of the Incantation points inward — I am, I don't, I choose. One outward
              line changes the engine: a clear life aimed at someone is harder to abandon than
              one aimed at a mirror.
            </p>
            <div className="cd-devotion-chips">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`cd-ledger-chip ${pick === p ? "on" : ""}`}
                  onClick={() => { setPick(p); setCustom(""); tapLight(); }}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              className="cd-service-input"
              maxLength={80}
              value={custom}
              placeholder="…or say it your way"
              onChange={(e) => { setCustom(e.target.value); setPick(null); }}
            />
            <button type="button" className="cd-btn cd-btn--rep" disabled={!value} onClick={save}>
              ADD THE LINE
            </button>
          </>
        ) : (
          <div className="cd-reachout-done">
            <div className="cd-cite" style={{ marginBottom: 14 }}>
              Spoken every night from now on — the closing line of the Incantation.
            </div>
            <button type="button" className="cd-btn cd-btn--rep" onClick={onClose}>DONE →</button>
          </div>
        )}
      </div>
    </div>
  );
}
