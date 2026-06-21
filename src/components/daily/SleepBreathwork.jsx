import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ScienceInfo from "../ui/ScienceInfo.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { playSound } from "../../lib/sounds.js";
import { SLEEP_TECHNIQUES, BREATHWORK_ATTRIBUTION } from "../../data/sleepTechniques.js";

// ─── Wind-down breathwork & meditation ──────────────────────────────────────────
// Inline picker on the Night page → tap a technique → immersive full-screen player.
// The player drives one shared cursor (`segIdx`) over a flat list of timed
// segments, so breathing, body-scan, and cognitive-shuffle all run on the same
// engine. Breathing segments scale the orb; guided/shuffle pulse it gently.

// Flatten a technique into the timed segments the player steps through.
function buildSegments(tech) {
  if (!tech) return [];
  if (tech.type === "breath") {
    const segs = [];
    for (let c = 0; c < tech.cycles; c++) {
      tech.phases.forEach((p) => segs.push({ ...p, cycle: c + 1 }));
    }
    return segs;
  }
  if (tech.type === "guided") {
    return tech.steps.map((s, i) => ({ key: "guided", label: s.text, secs: s.secs, idx: i }));
  }
  if (tech.type === "shuffle") {
    const shuffled = [...tech.words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.map((w) => ({ key: "shuffle", label: w, secs: tech.wordSecs }));
  }
  return [];
}

export default function SleepBreathwork() {
  const { settings } = useAppData();
  const soundOn = settings?.soundEnabled !== false;

  const [active, setActive] = useState(null);     // technique object | null
  const [segments, setSegments] = useState([]);
  const [segIdx, setSegIdx] = useState(0);
  const [running, setRunning] = useState(false);  // playing vs paused
  const [secLeft, setSecLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(false);

  const cueOn = soundOn && !muted;

  const launch = (tech) => {
    setActive(tech);
    setSegments(buildSegments(tech));
    setSegIdx(0);
    setFinished(false);
    setRunning(true);
    playSound("chime", { soundEnabled: soundOn });
  };

  const exit = () => {
    setActive(null);
    setRunning(false);
    setFinished(false);
    setSegments([]);
  };

  const restart = () => {
    setSegments(buildSegments(active));
    setSegIdx(0);
    setFinished(false);
    setRunning(true);
  };

  const seg = segments[segIdx];

  // ── The clock: cue the segment, count it down, advance / finish ──
  useEffect(() => {
    if (!active || !running || finished || !seg) return undefined;

    if (active.type === "breath") {
      if (seg.key === "inhale") playSound("breatheIn", { soundEnabled: cueOn });
      else if (seg.key.startsWith("exhale")) playSound("breatheOut", { soundEnabled: cueOn });
      else playSound("breatheHold", { soundEnabled: cueOn });
    }

    setSecLeft(seg.secs);
    const tick = setInterval(() => setSecLeft((s) => (s > 1 ? s - 1 : s)), 1000);
    const advance = setTimeout(() => {
      if (segIdx + 1 >= segments.length) setFinished(true);
      else setSegIdx((i) => i + 1);
    }, seg.secs * 1000);

    return () => { clearInterval(tick); clearTimeout(advance); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, running, finished, segIdx, segments]);

  // Body-scroll lock + Escape while the immersive player is open.
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => { if (e.key === "Escape") exit(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  // ── Inline picker ──
  return (
    <section className="sbw-section anim-fade-in">
      <ScienceInfo ids={["breathwork"]} />
      <div className="sbw-head">
        <span className="sbw-badge">SLEEP LAB</span>
        <h3 className="sbw-title">Breathe yourself to sleep.</h3>
        <p className="sbw-sub">
          Pick a technique and follow the orb. Each one downshifts your nervous system so you
          fall asleep faster — no app, no screen needed once you've got the rhythm.
        </p>
      </div>

      <div className="sbw-grid">
        {SLEEP_TECHNIQUES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className="sbw-card"
            style={{ "--accent": t.accent, "--d": `${i * 60}ms` }}
            onClick={() => launch(t)}
          >
            <span className="sbw-card-glyph" aria-hidden="true">{t.glyph}</span>
            <span className="sbw-card-body">
              <span className="sbw-card-name">{t.name}</span>
              <span className="sbw-card-tag">{t.tagline}</span>
              <span className="sbw-card-blurb">{t.blurb}</span>
            </span>
            <span className="sbw-card-go" aria-hidden="true">▶</span>
          </button>
        ))}
      </div>
      <p className="sbw-foot-source">{BREATHWORK_ATTRIBUTION}</p>

      {active && createPortal(
        <SessionPlayer
          active={active}
          seg={seg}
          segIdx={segIdx}
          segments={segments}
          secLeft={secLeft}
          running={running}
          finished={finished}
          muted={muted}
          onToggleRun={() => setRunning((r) => !r)}
          onToggleMute={() => setMuted((m) => !m)}
          onRestart={restart}
          onExit={exit}
        />,
        document.body
      )}
    </section>
  );
}

// ─── Immersive full-screen session ──────────────────────────────────────────────
function SessionPlayer({
  active, seg, segIdx, segments, secLeft, running, finished, muted,
  onToggleRun, onToggleMute, onRestart, onExit,
}) {
  const accent = active.accent;
  const isBreath = active.type === "breath";
  const isGuided = active.type === "guided";
  const isShuffle = active.type === "shuffle";

  // Orb scale: breathing drives it; guided/shuffle pulse gently in the background.
  const orbScale = isBreath ? (seg?.scale ?? 0.7) : 0.85;
  const orbTransition = isBreath && seg ? `transform ${seg.secs}s linear` : "transform 0.4s ease";
  const ambientDur = active.breathSecs || 6;

  // Progress label
  let progressLabel = "";
  if (isBreath && seg) progressLabel = `Cycle ${seg.cycle} / ${active.cycles}`;
  else if (isGuided && seg) progressLabel = `Step ${(seg.idx ?? segIdx) + 1} / ${segments.length}`;
  else if (isShuffle) progressLabel = "Let each one drift by…";

  return (
    <div className="sbw-overlay" style={{ "--accent": accent }} role="dialog" aria-modal="true" aria-label={active.name}>
      <div className="sbw-overlay-glow" aria-hidden="true" />
      <div className="sbw-stars" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="dsw-star" style={{ "--i": i }} />
        ))}
      </div>

      {/* Top bar */}
      <div className="sbw-player-top">
        <button type="button" className="sbw-exit" onClick={onExit} aria-label="Exit">✕</button>
        <span className="sbw-player-name">{active.glyph} {active.name}</span>
        <button
          type="button"
          className="sbw-mute"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute cues" : "Mute cues"}
          title={muted ? "Unmute cues" : "Mute cues"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      {/* Stage */}
      <div className="sbw-stage">
        {!finished ? (
          <>
            <div className="sbw-orb-wrap">
              {/* Pulse rings */}
              <span className="sbw-orb-ring sbw-orb-ring--1" style={{ borderColor: `${accent}44` }} />
              <span className="sbw-orb-ring sbw-orb-ring--2" style={{ borderColor: `${accent}22` }} />
              <div
                className={`sbw-orb ${!isBreath ? "sbw-orb--ambient" : ""} ${!running ? "is-paused" : ""}`}
                style={{
                  transform: `scale(${orbScale})`,
                  transition: orbTransition,
                  background: `radial-gradient(circle at 38% 32%, ${accent}, ${accent}22 70%, transparent)`,
                  boxShadow: `0 0 80px -8px ${accent}, inset 0 0 50px -10px #fff8`,
                  animationDuration: !isBreath ? `${ambientDur}s` : undefined,
                }}
              >
                {isBreath && (
                  <span className="sbw-orb-count">{secLeft}</span>
                )}
              </div>
            </div>

            {/* Cue text */}
            <div className="sbw-cue">
              {isBreath && seg && (
                <>
                  <span className="sbw-cue-phase" style={{ color: accent }}>{seg.label}</span>
                  {seg.hint && <span className="sbw-cue-hint">{seg.hint}</span>}
                </>
              )}
              {isGuided && seg && (
                <p className="sbw-cue-script">{seg.label}</p>
              )}
              {isShuffle && seg && (
                <>
                  <span className="sbw-cue-hint">Picture…</span>
                  <span className="sbw-cue-word" style={{ color: accent }}>{seg.label}</span>
                </>
              )}
            </div>

            <p className="sbw-progress">{progressLabel}</p>

            {/* Controls */}
            <div className="sbw-controls">
              <button type="button" className="sbw-ctrl" onClick={onRestart} title="Restart">↺</button>
              <button
                type="button"
                className="sbw-ctrl sbw-ctrl--main"
                onClick={onToggleRun}
                style={{ borderColor: accent, color: accent }}
              >
                {running ? "❚❚ Pause" : "▶ Resume"}
              </button>
              <button type="button" className="sbw-ctrl" onClick={onExit} title="End">✕</button>
            </div>
            {isShuffle && segIdx === 0 && active.intro && (
              <p className="sbw-intro">{active.intro}</p>
            )}
          </>
        ) : (
          <div className="sbw-done">
            <div className="sbw-done-moon">🌙</div>
            <h3 className="sbw-done-title">Well done.</h3>
            <p className="sbw-done-sub">
              Your body is settled and your mind is quiet. Stay in the dark, keep breathing slow,
              and let yourself drift off.
            </p>
            <div className="sbw-done-actions">
              <button type="button" className="sbw-ctrl" onClick={onRestart}>↺ Again</button>
              <button
                type="button"
                className="sbw-ctrl sbw-ctrl--main"
                onClick={onExit}
                style={{ borderColor: accent, color: accent }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
