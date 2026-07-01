import React, { useState, useRef, useEffect, useCallback } from "react";
import { ShadowStage, Eyebrow, Heading, Lead, Science, Primary, Skip, Chips } from "./shell.jsx";
import { useBreathTimer } from "./useBreathTimer.js";
import { useWaveSessions } from "./useWaveSessions.js";
import { useAppData } from "../../hooks/useAppData.js";
import { XP_VALUES } from "../../lib/gamification.js";
import { playSound } from "../../lib/sounds.js";
import {
  BREATH_PATTERN, RIDE_CYCLES, NUDGES, SAFETY, GROUND, RIDE, SCAN, RELEASE, PROOF, COMPLETE, INTENSITY,
} from "./waveCopy.js";
import "../../styles/wave.css";

// ─────────────────────────────────────────────────────────────────────────
// Anxiety Wave Rider — "Ride the Wave" (SOS mode).
// A 90-second, five-phase nervous-system reset with the release-to-inhale /
// hold-to-exhale mechanic at its heart. No fail state, no medical claims.
// Rendered like every other Shadow tool: ({ onClose, onFinish }) inside
// <ShadowStage>. Works identically in the hub and in the global SOS overlay.
// ─────────────────────────────────────────────────────────────────────────
const SAFETY_KEY = "wave_safety_ack_v1";
const PHASES = ["intro", "ground", "ride", "scan", "release", "proof", "complete"];

const INTRO = {
  eyebrow: "Ride the wave",
  heading: "Let's ride this one out.",
  lead:
    "Ninety seconds. We'll anchor, breathe, find the room, soften, and choose one brave step. Nothing to fix — you're just going to ride it.",
  science:
    "Anxiety is a wave of arousal that rises and passes. You don't have to make it disappear to be present — you can feel it and still choose your next move.",
  begin: "Begin →",
};

function usePrefersReducedMotion() {
  const [rm, setRm] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setRm(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return rm;
}

function buzz(pattern, settings) {
  try {
    if (settings && settings.hapticsEnabled === false) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    // haptics are never worth a crash
  }
}

// ── The breath / anchor button (press & hold) ───────────────────────────────
function BreathButton({ label, sub, count, expected, held, setHeld, scale, ariaLabel, reducedMotion }) {
  const down = (e) => { e.preventDefault(); setHeld(true); };
  const up = () => setHeld(false);
  const key = (e) => {
    if (e.key === " " || e.key === "Enter" || e.code === "Space") {
      e.preventDefault();
      if (e.type === "keydown") { if (!e.repeat) setHeld(true); } else setHeld(false);
    }
  };
  // matched = is the current held/released state the one the phase is asking for?
  const matched = expected == null ? null : expected === "hold" ? held : !held;
  return (
    <button
      type="button"
      className="wave-btn"
      data-held={held ? "1" : "0"}
      data-match={matched == null ? "" : matched ? "yes" : "no"}
      aria-label={ariaLabel}
      style={reducedMotion ? undefined : { transform: `scale(${scale})` }}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onKeyDown={key}
      onKeyUp={key}
    >
      <span className="wave-btn__ring" aria-hidden />
      <span className="wave-btn__label">{label}</span>
      {count != null && <span className="wave-btn__count">{count}</span>}
      {sub && <span className="wave-btn__sub">{sub}</span>}
    </button>
  );
}

// ── 1–10 intensity picker (optional, skippable) ─────────────────────────────
function IntensityPicker({ value, onChange }) {
  return (
    <div className="wave-scale" role="group" aria-label="Rate the intensity from 1 to 10">
      {Array.from({ length: 10 }).map((_, i) => {
        const v = i + 1;
        const on = value === v;
        return (
          <button key={v} type="button" className={`wave-scale__dot ${on ? "on" : ""}`} aria-pressed={on} onClick={() => onChange(v)}>
            {v}
          </button>
        );
      })}
    </div>
  );
}

// ── Reality scan (shortened 5-4-3-2-1, tap-only) ────────────────────────────
function ScanStep({ onDone }) {
  const [tapped, setTapped] = useState(() => SCAN.cards.map(() => false));
  const count = tapped.filter(Boolean).length;
  const all = count >= SCAN.cards.length;
  return (
    <div className="sx-center">
      <Eyebrow>{SCAN.eyebrow}</Eyebrow>
      <Heading>{SCAN.heading}</Heading>
      <Lead>{SCAN.lead}</Lead>
      <div className="wave-cards">
        {SCAN.cards.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`wave-card ${tapped[i] ? "on" : ""}`}
            aria-pressed={tapped[i]}
            aria-label={c.label}
            onClick={() => setTapped((t) => t.map((v, j) => (j === i ? true : v)))}
          >
            <span className="wave-card__sense">{c.sense}</span>
            <span className="wave-card__label">{c.label}</span>
            <span className="wave-card__check" aria-hidden>{tapped[i] ? "✓" : ""}</span>
          </button>
        ))}
      </div>
      <Primary disabled={!all} onClick={() => onDone(count)}>
        {all ? SCAN.cta : `Tap each one — ${count}/${SCAN.cards.length}`}
      </Primary>
      <Skip onClick={() => onDone(count)}>Skip the scan</Skip>
    </div>
  );
}

// ── Release the armor (choose one, soften for a few seconds) ─────────────────
function ReleaseStep({ chosen, setChosen, onDone }) {
  const [holdN, setHoldN] = useState(null);
  useEffect(() => {
    if (holdN == null || holdN <= 0) return undefined;
    const id = setTimeout(() => setHoldN((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [holdN]);
  const start = (opt) => { setChosen(opt); setHoldN(RELEASE.holdSeconds); };
  const done = holdN === 0;
  return (
    <div className="sx-center">
      <Eyebrow>{RELEASE.eyebrow}</Eyebrow>
      <Heading>{RELEASE.heading}</Heading>
      <Lead>{RELEASE.lead}</Lead>
      <Chips options={RELEASE.options} value={chosen} onChange={start} />
      {holdN != null && holdN > 0 && (
        <p className="wave-soften" aria-live="polite">{`${RELEASE.holding} ${holdN}`}</p>
      )}
      <Primary disabled={!done} onClick={onDone}>
        {done ? RELEASE.cta : chosen ? RELEASE.holding : "Pick one to soften"}
      </Primary>
    </div>
  );
}

export default function RideTheWave({ onClose, onFinish }) {
  const { settings } = useAppData();
  const { recordSession } = useWaveSessions();
  const reducedMotion = usePrefersReducedMotion() || !!settings?.reducedMotion;

  const alreadyAcked = () => {
    try { return localStorage.getItem(SAFETY_KEY) === "1"; } catch { return false; }
  };
  const [phase, setPhase] = useState(() => (alreadyAcked() ? "intro" : "safety"));
  const [safetyOpen, setSafetyOpen] = useState(false);

  // Session accumulators (refs where a value shouldn't trigger re-render).
  const startedAt = useRef(new Date().toISOString());
  const [intensityBefore, setIntensityBefore] = useState(null);
  const [intensityAfter, setIntensityAfter] = useState(null);
  const [proof, setProof] = useState(null);
  const [release, setRelease] = useState(null);
  const groundingTappedRef = useRef(0);
  const cyclesAttemptedRef = useRef(0);
  const cyclesCompletedRef = useRef(0);
  const committedRef = useRef(false);

  // Ride mechanic state.
  const [held, setHeld] = useState(false);
  const [rideDone, setRideDone] = useState(false);
  const [nudge, setNudge] = useState("");
  const heldDuringExhaleRef = useRef(false);

  const idx = Math.max(0, PHASES.indexOf(phase));
  const meter = phase === "safety" ? 0 : Math.round(((idx + 1) / PHASES.length) * 100);
  const go = (p) => setPhase(p);

  const ackSafety = () => {
    try { localStorage.setItem(SAFETY_KEY, "1"); } catch { /* ignore */ }
    setSafetyOpen(false);
    setPhase("intro");
  };

  const onPhaseChange = useCallback((next) => {
    if (next === "inhale") { playSound("breatheIn", settings); buzz(16, settings); }
    else { playSound("breatheOut", settings); buzz([10, 40, 10], settings); heldDuringExhaleRef.current = false; }
    setNudge("");
  }, [settings]);

  const onCycleComplete = useCallback((n) => {
    cyclesAttemptedRef.current = n;
    if (heldDuringExhaleRef.current) { cyclesCompletedRef.current += 1; setNudge(""); }
    else setNudge(NUDGES[n % NUDGES.length]);
  }, []);

  const onComplete = useCallback(() => setRideDone(true), []);

  const timer = useBreathTimer({
    inhaleSeconds: BREATH_PATTERN.inhaleSeconds,
    exhaleSeconds: BREATH_PATTERN.exhaleSeconds,
    cycles: RIDE_CYCLES,
    running: phase === "ride" && !rideDone,
    onPhaseChange,
    onCycleComplete,
    onComplete,
  });

  // Register a matched exhale (user holding while the cue says hold).
  useEffect(() => {
    if (phase === "ride" && held && timer.phase === "exhale") heldDuringExhaleRef.current = true;
  }, [held, timer.phase, phase]);

  const rideScale = reducedMotion
    ? 1
    : timer.phase === "inhale"
      ? 0.9 + 0.28 * timer.progress
      : 1.18 - 0.28 * timer.progress;

  const commit = useCallback(() => {
    if (committedRef.current) return;
    committedRef.current = true;
    const { completedCount } = recordSession({
      startedAt: startedAt.current,
      completed: true,
      breathPattern: BREATH_PATTERN,
      breathCyclesAttempted: cyclesAttemptedRef.current,
      breathCyclesCompleted: cyclesCompletedRef.current,
      groundingCardsTapped: groundingTappedRef.current,
      bodyReleaseChosen: release,
      proofActionChosen: proof,
      courageXpEarned: XP_VALUES.waveRidden,
      intensityBefore,
      intensityAfter,
    });
    const achievements = [];
    if (completedCount === 1) achievements.push("wave_first");
    if (completedCount >= 3) achievements.push("wave_returned");
    const delta = intensityBefore != null && intensityAfter != null ? ` · wave ${intensityBefore}→${intensityAfter}` : "";
    const takeaway = `${proof ? `Proof: ${proof}` : "Stayed with the wave"}${delta}`;
    onFinish("Ride the Wave", takeaway, { accent: "cyan", xp: XP_VALUES.waveRidden, achievements });
  }, [recordSession, release, proof, intensityBefore, intensityAfter, onFinish]);

  // Plain render helper (not a nested component) so the reopened safety modal
  // doesn't remount on every 100ms ride tick.
  const renderSafety = (onAccept, acceptLabel) => (
    <div className="sx-center wave-safety">
      <Eyebrow>{SAFETY.title}</Eyebrow>
      <p className="wave-safety__body">{SAFETY.body}</p>
      <p className="wave-safety__crisis">{SAFETY.crisis}</p>
      <Primary onClick={onAccept}>{acceptLabel}</Primary>
    </div>
  );

  // First-run safety gate — its own bare stage, no dots/meter distraction.
  if (phase === "safety") {
    return (
      <ShadowStage accent="cyan" title="Ride the Wave" onClose={onClose} meter={0}>
        {renderSafety(ackSafety, SAFETY.accept)}
      </ShadowStage>
    );
  }

  return (
    <ShadowStage accent="cyan" title="Ride the Wave" onClose={onClose} meter={meter} total={PHASES.length} active={idx}>
      <button className="wave-info" onClick={() => setSafetyOpen(true)} aria-label="Safety information">ⓘ safety</button>

      {safetyOpen && (
        <div className="wave-safety-modal" role="dialog" aria-modal="true" aria-label="Safety information">
          <div className="wave-safety-modal__card">
            {renderSafety(() => setSafetyOpen(false), "Close")}
          </div>
        </div>
      )}

      {phase === "intro" && (
        <div className="sx-center">
          <Eyebrow>{INTRO.eyebrow}</Eyebrow>
          <Heading>{INTRO.heading}</Heading>
          <Lead>{INTRO.lead}</Lead>
          <Science>{INTRO.science}</Science>
          <div className="wave-checkin">
            <p className="wave-checkin__q">{INTENSITY.before}</p>
            <IntensityPicker value={intensityBefore} onChange={setIntensityBefore} />
            <div className="wave-scale__ends"><span>{INTENSITY.low}</span><span>{INTENSITY.high}</span></div>
          </div>
          <Primary onClick={() => go("ground")}>{INTRO.begin}</Primary>
        </div>
      )}

      {phase === "ground" && (
        <div className="sx-center">
          <Eyebrow>{GROUND.eyebrow}</Eyebrow>
          <Heading>{GROUND.heading}</Heading>
          <Lead>{GROUND.lead}</Lead>
          <div className="wave-stage" data-rm={reducedMotion ? "1" : "0"}>
            <div className="wave-stage__sea" aria-hidden />
            <BreathButton
              label="You are here"
              sub="thumb on the circle"
              count={null}
              expected={null}
              held={held}
              setHeld={setHeld}
              scale={held ? 1.06 : 1}
              ariaLabel="Rest your thumb on the circle. You are here."
              reducedMotion={reducedMotion}
            />
          </div>
          <Science>{GROUND.science}</Science>
          <Primary onClick={() => go("ride")}>{GROUND.cta}</Primary>
        </div>
      )}

      {phase === "ride" && (
        <div className="sx-center">
          <Eyebrow>{RIDE.eyebrow}</Eyebrow>
          <Heading>{RIDE.heading}</Heading>
          <div className="wave-stage" data-phase={timer.phase} data-rm={reducedMotion ? "1" : "0"}>
            <div className="wave-stage__sea" aria-hidden />
            <BreathButton
              label={timer.phase === "inhale" ? RIDE.inhaleLabel : RIDE.exhaleLabel}
              sub={timer.phase === "inhale" ? RIDE.inhaleSub : RIDE.exhaleSub}
              count={timer.remaining}
              expected={timer.phase === "inhale" ? "release" : "hold"}
              held={held}
              setHeld={setHeld}
              scale={rideScale}
              ariaLabel={timer.phase === "inhale" ? RIDE.aria.inhale : RIDE.aria.exhale}
              reducedMotion={reducedMotion}
            />
          </div>
          <p className="wave-nudge" aria-live="polite">
            {nudge || `Wave ${Math.min(RIDE_CYCLES, timer.cycle + 1)} of ${RIDE_CYCLES}`}
          </p>
          {rideDone ? (
            <Primary onClick={() => go("scan")}>{RIDE.cta}</Primary>
          ) : (
            <Skip onClick={() => setRideDone(true)}>I've got the rhythm — continue</Skip>
          )}
        </div>
      )}

      {phase === "scan" && (
        <ScanStep onDone={(tapped) => { groundingTappedRef.current = tapped; go("release"); }} />
      )}

      {phase === "release" && (
        <ReleaseStep chosen={release} setChosen={setRelease} onDone={() => go("proof")} />
      )}

      {phase === "proof" && (
        <div className="sx-center">
          <Eyebrow>{PROOF.eyebrow}</Eyebrow>
          <Heading>{PROOF.heading}</Heading>
          <Lead>{PROOF.lead}</Lead>
          <Chips options={PROOF.options} value={proof} onChange={setProof} />
          <Primary disabled={!proof} onClick={() => go("complete")}>{PROOF.cta}</Primary>
        </div>
      )}

      {phase === "complete" && (
        <div className="sx-center wave-complete">
          <div className="wave-complete__badge" aria-hidden>🌊</div>
          <Eyebrow>{COMPLETE.eyebrow}</Eyebrow>
          <Heading>{COMPLETE.title}</Heading>
          <Lead>{COMPLETE.lead}</Lead>
          <div className="wave-proofcard">
            <span>Your Courage Proof</span>
            <p>{proof || "You stayed with the wave."}</p>
          </div>
          <div className="wave-xp">+{XP_VALUES.waveRidden} Courage XP</div>
          <div className="wave-checkin">
            <p className="wave-checkin__q">{INTENSITY.after}</p>
            <IntensityPicker value={intensityAfter} onChange={setIntensityAfter} />
            <div className="wave-scale__ends"><span>{INTENSITY.low}</span><span>{INTENSITY.high}</span></div>
          </div>
          <Primary onClick={commit}>{COMPLETE.done}</Primary>
        </div>
      )}
    </ShadowStage>
  );
}
