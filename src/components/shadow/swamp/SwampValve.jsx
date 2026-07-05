import React, { useState } from "react";
import "../../../styles/swamp-valve.css";
import Boggo, { BoggoSays } from "./Boggo.jsx";
import { boggoLine } from "./swampData.js";
import PressureChamber from "./PressureChamber.jsx";
import RuminationBog from "./RuminationBog.jsx";
import DrainTheSwamp from "./DrainTheSwamp.jsx";

/* ════════════════════════════════════════════════════════════════════════
   SWAMP VALVE — the anger game inside Shadow Work.

   "Better out safely than trapped inside." Anger builds like swamp gas; the
   player learns to release it clean instead of bottling it or blowing up.
   A comedy skin over real regulation (breath, naming, clean truth, action).

   Mounts as a flat Shadow tool: receives { onClose, onFinish } from
   ShadowWorkPage. onClose exits to the Shadow hub; finishing any mode calls
   onFinish("Swamp Valve", takeaway) → auto XP + trail stamp.
   ════════════════════════════════════════════════════════════════════════ */

// Two ways in — the cinematic drain (fast, wordless) and the full pressure
// curriculum (deep). Rumination Bog is a quiet secondary for one specific
// case (a looping thought), offered below rather than as a headline card.
const MODES = [
  {
    id: "drain", emoji: "🌊", tag: "Signature · Cinematic", accent: "#00F0FF", featured: true,
    name: "Drain the Swamp",
    blurb: "Grip the great valve and slowly open the floodgate. Watch the black water leave, the fog lift, the sun break through — stress drains out of the landscape while you breathe it out of your body.",
  },
  {
    id: "pressure", emoji: "🔧", tag: "Main game", accent: "#00FFBF",
    name: "Pressure Chamber",
    blurb: "Something set you off? Read the pressure, feel it in the body, and open the right valve — breath, truth, boundary, clean action.",
  },
];

export default function SwampValve({ onClose, onFinish }) {
  const [mode, setMode] = useState(null);

  const toHub = () => setMode(null);
  const complete = (takeaway) => onFinish("Swamp Valve", takeaway, { xp: 25 });

  if (mode === "drain") return <DrainTheSwamp onBack={toHub} onComplete={complete} />;
  if (mode === "pressure") return <PressureChamber onBack={toHub} onComplete={complete} />;
  if (mode === "bog") return <RuminationBog onBack={toHub} onComplete={complete} />;

  return (
    <div className="sv-stage">
      <div className="sv-swampbg" aria-hidden>
        <span className="sv-swampbg__glow" />
        <span className="sv-swampbg__gas" />
      </div>

      <div className="sv-top">
        <button className="sv-back" onClick={onClose}>← Back</button>
        <span className="sv-title">Swamp Valve</span>
        <span className="sv-top__spacer" />
      </div>

      <div className="sv-body sv-hub">
        <div className="sv-hub__head">
          <Boggo state="calm" size={128} />
          <p className="sv-hub__kicker">Anger · The Pressure Valve</p>
          <h1 className="sv-hub__title">Swamp Valve</h1>
          <p className="sv-hub__sub">
            Anger is pressure, and pressure is information. Bottle it up and it leaks sideways;
            blow up and it makes a mess. Open the right valve and you keep your power. Pick a way in.
          </p>
        </div>

        <BoggoSays state="calm" line={boggoLine("greet", 1)} />

        <div className="sv-modes" style={{ marginTop: 16 }}>
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`sv-modecard ${m.featured ? "sv-modecard--featured" : ""}`}
              style={{ "--mc": m.accent }}
              onClick={() => setMode(m.id)}
            >
              <div className="sv-modecard__top">
                <span className="sv-modecard__emoji">{m.emoji}</span>
                <span className="sv-modecard__tag">{m.tag}</span>
              </div>
              <h3>{m.name}</h3>
              <p>{m.blurb}</p>
              <span className="sv-modecard__go">Enter →</span>
            </button>
          ))}
        </div>

        <button className="sv-secondary" style={{ "--mc": "#7B2CFF" }} onClick={() => setMode("bog")}>
          <span className="sv-secondary__emoji" aria-hidden>🌀</span>
          <span className="sv-secondary__txt">
            <b>Stuck on a loop?</b> Rumination Bog — climb out one rung at a time: fact, story, feeling, a truer line, one action.
          </span>
          <span className="sv-secondary__go">Enter →</span>
        </button>
      </div>
    </div>
  );
}
