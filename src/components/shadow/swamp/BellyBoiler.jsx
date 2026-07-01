import React, { useState, useEffect } from "react";
import {
  SwampStage, Eyebrow, Heading, Lead, Science, Primary, Fireflies,
} from "./swampShell.jsx";
import Boggo, { BoggoSays } from "./Boggo.jsx";
import {
  MEALS, GAS_TYPES, RELEASE_METHODS, UNSAFE_METHODS, boggoLine,
} from "./swampData.js";

/* ════════════════════════════════════════════════════════════════════════
   BELLY BOILER — the fast, funny one.

   Boggo eats an emotional meal, colored gas builds, and you pick how to let
   it out. Any *safe* release vents it clean (fart-cloud → fireflies); the
   *unsafe* buttons (rage rant / mean text / door slam) make swamp damage and
   the gas stays — because blowing up never actually clears it.
   ════════════════════════════════════════════════════════════════════════ */

const clamp = (n) => Math.max(0, Math.min(100, n));
const TARGET = 5; // clean releases to finish

function pickMeal(seed) {
  return MEALS[Math.floor((seed * 9301 + 49297) % MEALS.length)];
}

export default function BellyBoiler({ onBack, onComplete }) {
  const [cleared, setCleared] = useState(0);
  const [score, setScore] = useState(0);
  const [heat, setHeat] = useState(20);
  const [leak, setLeak] = useState(10);
  const [meal, setMeal] = useState(() => MEALS[Math.floor(Math.random() * MEALS.length)]);
  const [flash, setFlash] = useState({ text: "Boggo just ate. Vent the gas — safely.", tone: "good" });
  const [popping, setPopping] = useState(false);
  const [boggoState, setBoggoState] = useState("bloated");
  const [done, setDone] = useState(false);
  const [tick, setTick] = useState(0);

  const gas = GAS_TYPES[meal.gas];

  const nextCloud = (n) => {
    setMeal(pickMeal(n + Date.now() % 97));
    setBoggoState("bloated");
  };

  const onSafe = (method) => {
    if (popping) return;
    const bonus = method.best?.includes(meal.gas);
    setPopping(true);
    setBoggoState("relieved");
    setScore((s) => s + (bonus ? 15 : 10));
    setFlash({ text: bonus ? "Perfect vent! Released safely — no swamp damage. ✨" : "Released safely. No swamp damage. ✨", tone: "good" });
    setTimeout(() => {
      const nc = cleared + 1;
      setCleared(nc);
      setPopping(false);
      if (nc >= TARGET) { setDone(true); return; }
      setTick((t) => t + 1);
      nextCloud(nc);
      setFlash({ text: "Fresh gas. Pick a clean valve.", tone: "good" });
    }, 620);
  };

  const onUnsafe = (method) => {
    if (popping) return;
    setHeat((h) => clamp(h + 18));
    setLeak((l) => clamp(l + 14));
    setBoggoState("steaming");
    setFlash({ text: `${method.label}: vented for one second… then made a mess. The gas is still here.`, tone: "bad" });
  };

  const meters = [
    { label: "Heat", value: heat, color: "var(--brand-red)" },
    { label: "Leak", value: leak, color: "var(--brand-gold)" },
  ];

  if (done) {
    const clean = leak <= 24 && heat <= 45;
    const takeaway = `Belly Boiler: vented ${TARGET} clouds safely · score ${score}${clean ? " · no swamp damage" : ""}`;
    return (
      <SwampStage title="Belly Boiler" onClose={onBack}>
        <div className="sv-center">
          <div style={{ position: "relative" }}><Boggo state="relieved" size={140} /><Fireflies /></div>
          <Eyebrow>Belly settled</Eyebrow>
          <Heading>Gas vented. No explosions.</Heading>
          <div className="sv-seal__stats">
            <div className="sv-seal__stat sv-seal__stat--after"><span>Score</span><b>{score}</b></div>
            <div className="sv-seal__stat"><span>Clouds</span><b>{TARGET}</b></div>
          </div>
          <BoggoSays state="relieved" line={boggoLine("win", score)} />
          <Science>Every "safe burp" here is a rep of the real skill: the urge to blow up passes in about 90 seconds if you don't feed it — so you route the energy somewhere clean instead.</Science>
          <Primary onClick={() => onComplete(takeaway)}>Save &amp; close ✦</Primary>
        </div>
      </SwampStage>
    );
  }

  return (
    <SwampStage title="Belly Boiler" onClose={onBack} meters={meters} wobble={heat > 60}>
      <div className="sv-center">
        <Eyebrow>Cleared {cleared}/{TARGET}</Eyebrow>
        <Heading>Boggo ate his feelings again</Heading>

        <div className="sv-bb-meals">
          <span className="sv-bb-meal"><b>{meal.emoji}</b> {meal.name}</span>
        </div>

        <div className="sv-bb-arena">
          <div className={`sv-bb-cloud ${popping ? "pop" : ""}`} key={tick} style={{ "--gas": gas.color }}>
            {popping ? "✨" : `${gas.label} gas`}
          </div>
          <Boggo state={boggoState} size={116} />
        </div>

        <p className={`sv-bb-flash ${flash.tone}`}>{flash.text}</p>

        <p className="sv-eyebrow">Safe valves — any of these vents it clean</p>
        <div className="sv-bb-methods">
          {RELEASE_METHODS.map((m) => (
            <button key={m.id} className="sv-bb-method sv-bb-method--safe" onClick={() => onSafe(m)} disabled={popping}>
              <span className="em">{m.emoji}</span>{m.label}
            </button>
          ))}
        </div>

        <p className="sv-eyebrow" style={{ color: "var(--brand-red)" }}>Unsafe — feels good, makes a mess</p>
        <div className="sv-bb-methods">
          {UNSAFE_METHODS.map((m) => (
            <button key={m.id} className="sv-bb-method sv-bb-method--unsafe" onClick={() => onUnsafe(m)} disabled={popping}>
              <span className="em">{m.emoji}</span>{m.label}
            </button>
          ))}
        </div>
      </div>
    </SwampStage>
  );
}
