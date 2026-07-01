import React, { useState } from "react";
import "../../../styles/swamp-valve.css";
import Boggo, { BoggoSays } from "./Boggo.jsx";
import { boggoLine } from "./swampData.js";
import PressureChamber from "./PressureChamber.jsx";
import BellyBoiler from "./BellyBoiler.jsx";
import RuminationBog from "./RuminationBog.jsx";

/* ════════════════════════════════════════════════════════════════════════
   SWAMP VALVE — the anger game inside Shadow Work.

   "Better out safely than trapped inside." Anger builds like swamp gas; the
   player learns to release it clean instead of bottling it or blowing up.
   A comedy skin over real regulation (breath, naming, clean truth, action).

   Mounts as a flat Shadow tool: receives { onClose, onFinish } from
   ShadowWorkPage. onClose exits to the Shadow hub; finishing any mode calls
   onFinish("Swamp Valve", takeaway) → auto XP + trail stamp.
   ════════════════════════════════════════════════════════════════════════ */

const MODES = [
  {
    id: "pressure", emoji: "🔧", tag: "Main game", accent: "#00FFBF",
    name: "Pressure Chamber",
    blurb: "Something set you off? Read the pressure, feel it in the body, and open the right valve — breath, truth, boundary, clean action.",
  },
  {
    id: "belly", emoji: "🫧", tag: "Fast & funny", accent: "#FACC15",
    name: "Belly Boiler",
    blurb: "Boggo ate his feelings. Vent the swamp gas the safe way before it blows — quick rounds, big fireflies, zero swamp damage.",
  },
  {
    id: "bog", emoji: "🌀", tag: "Break the loop", accent: "#7B2CFF",
    name: "Rumination Bog",
    blurb: "Same thought on repeat? Climb out of the bog one rung at a time: fact, story, feeling, a truer line, one action.",
  },
];

export default function SwampValve({ onClose, onFinish }) {
  const [mode, setMode] = useState(null);

  const toHub = () => setMode(null);
  const complete = (takeaway) => onFinish("Swamp Valve", takeaway);

  if (mode === "pressure") return <PressureChamber onBack={toHub} onComplete={complete} />;
  if (mode === "belly") return <BellyBoiler onBack={toHub} onComplete={complete} />;
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
            <button key={m.id} className="sv-modecard" style={{ "--mc": m.accent }} onClick={() => setMode(m.id)}>
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
      </div>
    </div>
  );
}
