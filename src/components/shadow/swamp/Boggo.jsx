import React from "react";

/* ════════════════════════════════════════════════════════════════════════
   BOGGO — the swamp coach. A big-hearted CSS blob (no image pipeline).

   `state` drives his body + face:
     calm      — settled green glow, easy smile
     bloated   — puffed up, straining (high pressure / bottling)
     steaming  — red-tinted, steam from the ears (high heat / blowing up)
     relieved  — soft, fireflies around him (clean release / seal)

   `size` scales the whole thing. Pair with <BoggoSays> for a coach line.
   ════════════════════════════════════════════════════════════════════════ */

export default function Boggo({ state = "calm", size = 120, style }) {
  const eyes = state === "steaming" ? "◣ ◢" : state === "bloated" ? "> <" : "◕ ◕";
  const mouth =
    state === "steaming" ? "sv-boggo__mouth--grr"
      : state === "bloated" ? "sv-boggo__mouth--strain"
      : state === "relieved" ? "sv-boggo__mouth--soft"
      : "sv-boggo__mouth--smile";

  return (
    <div className={`sv-boggo sv-boggo--${state}`} style={{ "--boggo-size": `${size}px`, ...style }} aria-hidden>
      {state === "steaming" && (
        <>
          <span className="sv-boggo__steam sv-boggo__steam--l" />
          <span className="sv-boggo__steam sv-boggo__steam--r" />
        </>
      )}
      {state === "relieved" && (
        <span className="sv-boggo__fireflies">
          {["✨", "🦋", "🫧", "⭐"].map((f, i) => (
            <i key={i} style={{ "--i": i }}>{f}</i>
          ))}
        </span>
      )}
      <div className="sv-boggo__body">
        <span className="sv-boggo__ear sv-boggo__ear--l" />
        <span className="sv-boggo__ear sv-boggo__ear--r" />
        <span className="sv-boggo__eyes">{eyes}</span>
        <span className={`sv-boggo__mouth ${mouth}`} />
        <span className="sv-boggo__belly" />
      </div>
    </div>
  );
}

export function BoggoSays({ line, state = "calm", size = 88, compact = false }) {
  if (!line) return null;
  return (
    <div className={`sv-boggosays ${compact ? "sv-boggosays--compact" : ""}`}>
      <Boggo state={state} size={size} />
      <div className="sv-boggosays__bubble">
        <span className="sv-boggosays__name">Boggo</span>
        <p>{line}</p>
      </div>
    </div>
  );
}
