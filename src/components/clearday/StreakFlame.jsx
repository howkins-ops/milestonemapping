import React from "react";

/* ═══════════════════════════════════════════════════════════════
   THE FLAME — the Accountability Zone's living fire, ported into
   CLEARDAY. Same layered teardrop (aura + body on pseudos, tongues
   / core / embers as static spans), same keyframes, re-namespaced
   to cd-flame so CLEARDAY never has to pull in zone.css.

   Three tones, and the difference is the whole language of the
   calendar:
     day   amber — a day sealed on the day it happened
     blue  #00F0FF — the Zone flame: a day reclaimed after the fact
     ash   grey coal — a slip, told honestly. Never re-ignitable.

   Zero JS: the flicker is CSS, so a whole month of these costs
   nothing per frame. Reduced motion kills the animation in CSS.
   ═══════════════════════════════════════════════════════════════ */

export default function StreakFlame({ tone = "day", size = "sm", className = "", style }) {
  return (
    <span
      className={`cd-flame cd-flame--${tone} cd-flame--${size} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {tone !== "ash" && (
        <>
          <span className="cd-flame__tongue cd-flame__tongue--l" />
          <span className="cd-flame__tongue cd-flame__tongue--r" />
          <span className="cd-flame__core" />
          <span className="cd-flame__ember cd-flame__ember--1" />
          <span className="cd-flame__ember cd-flame__ember--2" />
          <span className="cd-flame__ember cd-flame__ember--3" />
        </>
      )}
    </span>
  );
}
