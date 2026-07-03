import React, { useRef, useEffect, useCallback, useState } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useShadowWork } from "../shadow/useShadowWork.js";
import { XP_VALUES } from "../../lib/gamification.js";
import RideTheWave from "../shadow/RideTheWave.jsx";
import Grounding from "../shadow/Grounding.jsx";
import SelfCompassion from "../shadow/SelfCompassion.jsx";
import DrainTheSwamp from "../shadow/swamp/DrainTheSwamp.jsx";
import PressureChamber from "../shadow/swamp/PressureChamber.jsx";
import "../../styles/wave.css";
import "../../styles/swamp-valve.css"; // embedded swamp tools inherit .sv- styles

// ─────────────────────────────────────────────────────────────────────────
// EMOTIONAL RESET HUB — the SOS overlay, reachable mid-panic from anywhere.
//
// Used to be a single-mode anxiety tool; now it's six doors, each a
// research-backed regulation experience matched to what's loudest:
// anxiety, panic/grounding, anger, stress, breathing, overwhelm.
// Every door's finish() mirrors the Shadow hub's reward wiring (own hook
// instances — a shared hook would leave the hub's trail stale).
// ─────────────────────────────────────────────────────────────────────────

const DOORS = [
  {
    id: "wave", emoji: "🌊", accent: "#00F0FF", label: "Anxiety", time: "~90 sec",
    title: "Ride the Wave",
    sub: "Wave breathing for the spike — surf it instead of fighting it.",
  },
  {
    id: "ground", emoji: "⚡", accent: "#FACC15", label: "Panic · Grounding", time: "~60 sec",
    title: "Anchor Down",
    sub: "5-4-3-2-1 senses. Come back to the room, fast.",
  },
  {
    id: "anger", emoji: "🔥", accent: "#FF3B5C", label: "Anger", time: "~2 min",
    title: "Pressure Chamber",
    sub: "Read the pressure and open the right valve — zero damage.",
  },
  {
    id: "drain", emoji: "🌿", accent: "#00FFBF", label: "Stress", time: "~90 sec",
    title: "Drain the Swamp",
    sub: "Turn the great valve and watch stress leave the landscape.",
  },
  {
    id: "breath", emoji: "🫁", accent: "#7B2CFF", label: "Breathing", time: "~60 sec",
    title: "Box Breathing",
    sub: "Four sides, four counts — the tactical steady-down.",
  },
  {
    id: "soft", emoji: "🕊️", accent: "#FF3EDB", label: "Overwhelm", time: "~90 sec",
    title: "Self-Compassion Break",
    sub: "When it's all too much and you're being hard on you.",
  },
];

/* ── Box Breathing: 4-4-4-4, four cycles, one glowing square orb ─────────── */
const BOX_PHASES = [
  { key: "in", label: "Breathe in", secs: 4 },
  { key: "hold1", label: "Hold", secs: 4 },
  { key: "out", label: "Breathe out", secs: 4 },
  { key: "hold2", label: "Hold empty", secs: 4 },
];
const BOX_CYCLES = 4;

function BoxBreathing({ onClose, onFinish }) {
  const [tick, setTick] = useState(0); // elapsed whole seconds — everything derives from this

  useEffect(() => {
    const t = window.setInterval(() => setTick((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const secsPerCycle = 16;
  const total = BOX_CYCLES * secsPerCycle;
  const clamped = Math.min(tick, total);
  const done = clamped >= total;
  const cycle = Math.min(Math.floor(clamped / secsPerCycle), BOX_CYCLES - 1);
  const within = clamped % secsPerCycle;
  const phase = BOX_PHASES[Math.floor(within / 4)];
  const count = 4 - (within % 4);

  const finish = () => {
    const cycles = Math.max(1, Math.floor(clamped / secsPerCycle) + (done ? 0 : 1));
    onFinish("Box Breathing", `Box breathing — ${cycles} slow cycle${cycles === 1 ? "" : "s"}, nervous system steadied`, { xp: 10 });
  };

  return (
    <div className="sos-breath">
      <button className="sv-back sos-breath__back" onClick={onClose}>← Back</button>
      <p className="sos-breath__kicker">BOX BREATHING · {done ? BOX_CYCLES : cycle + 1}/{BOX_CYCLES}</p>
      <div className={`sos-breath__orb is-${phase.key} ${done ? "is-done" : ""}`} aria-hidden>
        <span className="sos-breath__ring" />
        <span className="sos-breath__count">{done ? "✓" : count}</span>
      </div>
      <p className="sos-breath__phase">{done ? "Steady. Well ridden." : phase.label}</p>
      <p className="sos-breath__hint">
        {done
          ? "Four full squares. Your baseline is back within reach."
          : "Trace the square: in, hold, out, hold. Slow beats deep."}
      </p>
      {done ? (
        <button className="sv-primary" onClick={finish}>Seal it →</button>
      ) : (
        <button className="sv-skip" onClick={finish}>I'm steadier — finish early</button>
      )}
    </div>
  );
}

export default function AnxietySOS({ open, onClose }) {
  const { addXP, unlockAchievement, celebrate } = useAppData();
  const { recordCompletion } = useShadowWork();
  const overlayRef = useRef(null);
  const [mode, setMode] = useState(null); // null = hub

  const finish = useCallback((tool, takeaway, opts = {}) => {
    const res = recordCompletion({ tool, takeaway, essence: opts.essence });
    const xp = opts.xp ?? (opts.transmuted ? XP_VALUES.shadowTransmutation : XP_VALUES.shadowToolCompleted);
    addXP(xp, `${tool} complete`);
    if (opts.transmuted) unlockAchievement("shadow_alchemist");
    (opts.achievements || []).forEach((id) => unlockAchievement(id));
    if (res.newEssence) {
      celebrate({
        variant: "reward",
        title: "ESSENCE RECLAIMED",
        subtitle: opts.essence ? `${opts.essence.name} → ${opts.essence.essence}` : "A shadow turned to gold.",
        detail: "Added to your Essence Gallery.",
      });
    }
    setMode(null);
    onClose?.();
  }, [recordCompletion, addXP, unlockAchievement, celebrate, onClose]);

  // Focus the overlay + lock body scroll while open; always reopen on the hub.
  useEffect(() => {
    if (!open) {
      setMode(null);
      return undefined;
    }
    overlayRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const toHub = () => setMode(null);

  const renderMode = () => {
    switch (mode) {
      case "wave":
        return <RideTheWave onClose={toHub} onFinish={finish} />;
      case "ground":
        return <Grounding onClose={toHub} onFinish={finish} />;
      case "soft":
        return <SelfCompassion onClose={toHub} onFinish={finish} />;
      case "anger":
        return <PressureChamber onBack={toHub} onComplete={(t) => finish("Swamp Valve", t)} />;
      case "drain":
        return <DrainTheSwamp onBack={toHub} onComplete={(t) => finish("Swamp Valve", t)} />;
      case "breath":
        return <BoxBreathing onClose={toHub} onFinish={finish} />;
      default:
        return (
          <div className="sos-hub">
            <header className="sos-hub__head">
              <p className="sos-hub__kicker">EMERGENCY RESET</p>
              <h2 className="sos-hub__title">You're safe. Breathe.</h2>
              <p className="sos-hub__sub">Pick what's loudest right now — every door leads back to calm.</p>
              <button className="sos-hub__close" onClick={onClose} aria-label="Close emergency reset">✕</button>
            </header>
            <div className="sos-hub__grid">
              {DOORS.map((d, i) => (
                <button
                  key={d.id}
                  className="sos-door"
                  style={{ "--sd": d.accent, "--i": i }}
                  onClick={() => setMode(d.id)}
                >
                  <span className="sos-door__emoji" aria-hidden>{d.emoji}</span>
                  <span className="sos-door__label">{d.label}</span>
                  <span className="sos-door__title">{d.title}</span>
                  <span className="sos-door__sub">{d.sub}</span>
                  <span className="sos-door__time">{d.time}</span>
                </button>
              ))}
            </div>
            <p className="sos-hub__foot">
              In immediate danger or thinking about harming yourself? Call or text <b>988</b> (Suicide &amp; Crisis
              Lifeline) or <b>911</b>. This screen is a tool, not a substitute for help.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className="wave-overlay"
      ref={overlayRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Emotional reset hub"
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        if (mode) setMode(null);
        else onClose?.();
      }}
    >
      <div className="wave-overlay__inner">
        {renderMode()}
      </div>
    </div>
  );
}
