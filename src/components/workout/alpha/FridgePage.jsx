import React, { useState } from "react";
import MealTimeline from "./MealTimeline.jsx";
import StockpilePage from "./StockpilePage.jsx";
import AlphaDisclaimer from "./AlphaDisclaimer.jsx";

/* ═══════════════════════════════════════════════════════════════
   THE FRIDGE — top-level nav home for everything food.
   Tab 1 · today's plate: the hour-by-hour meal rail.
   Tab 2 · the stockpile: Sunday grocery raid, prep ritual, and the
   Fill-Your-Fridge game (opens first on Sundays — ritual day).
   ═══════════════════════════════════════════════════════════════ */

export default function FridgePage({ alpha, addXP, settings }) {
  const [tab, setTab] = useState(() => (new Date().getDay() === 0 ? "stockpile" : "plate"));

  return (
    <div className="iw-page iw-page-in iw-fr">
      <div className="iw-eyebrow">the coldbox · fuel is half the program</div>
      <h2 className="iw-display iw-page-title">The Fridge</h2>
      <div className="iw-rec-tabs">
        <button className={`iw-chip-btn ${tab === "plate" ? "iw-chip-on" : ""}`}
          onClick={() => setTab("plate")}>🍽 today&apos;s plate</button>
        <button className={`iw-chip-btn ${tab === "stockpile" ? "iw-chip-on" : ""}`}
          onClick={() => setTab("stockpile")}>🧊 the stockpile</button>
      </div>

      {tab === "plate"
        ? <MealTimeline alpha={alpha} />
        : <StockpilePage alpha={alpha} addXP={addXP} settings={settings} embedded />}

      <AlphaDisclaimer />
    </div>
  );
}
