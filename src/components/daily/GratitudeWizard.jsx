import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { playSound } from "../../lib/sounds.js";
import { GRATITUDE_TYPES, getGratitudeType, GRATITUDE_ATTRIBUTION } from "../../data/gratitudeTypes.js";
import { useSpeechToText } from "../../hooks/useSpeechToText.js";

// ─── Cinematic branching Gratitude wizard ──────────────────────────────────────
// Step model:  -2 selector · -1 "go deeper" reminder · 0..n-1 layers · n reveal.
// The user picks one of four gratitude flavors (The Person, The Comeback, The
// Overlooked, The Future Self), gets a quick depth reminder, then drops into a
// uniquely-themed 3-layer flow. Each answer box supports voice dictation.
// Teaches DEPTH over breadth: one vivid, specific moment beats a list of three —
// that depth is where the drop in anxiety and depression actually comes from.

const IMPACT_STATS = [
  { label: "Anxiety Levels",  value: "↓ 23%",  color: "#00FFBF", delay: 0,   icon: "/assets/daily/stat-calm-icon.png" },
  { label: "Depression Risk", value: "↓ 25%",  color: "#00FFBF", delay: 120, icon: "/assets/daily/stat-heart-icon.png" },
  { label: "XP Earned",       value: "+50 XP", color: "#FACC15", delay: 240, icon: "/assets/daily/stat-xp-icon.png" },
];

// Shown on the "go deeper" reminder — what depth actually buys you.
const INTRO_STATS = [
  { label: "Less anxiety",    value: "↓ 23%", color: "#00FFBF" },
  { label: "Less depression", value: "↓ 25%", color: "#00FFBF" },
  { label: "Calmer body",     value: "✓",     color: "#FACC15" },
];

// Live "depth meter" — rewards specificity. Pure word-count heuristic, no blocking.
function depthScore(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  if (words === 0) return 0;
  if (words < 6) return 1;   // too vague
  if (words < 14) return 2;  // getting there
  return 3;                  // vivid
}
const DEPTH_LABEL = [
  "",
  "Add a detail — when? where? what exactly?",
  "Good. Can you make it even more specific?",
  "Vivid. That's the dose. ✦",
];

function DepthMeter({ score }) {
  return (
    <div className="gw-depth" data-score={score}>
      <div className="gw-depth-bars">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`gw-depth-bar ${score >= n ? "is-on" : ""}`} />
        ))}
      </div>
      {score > 0 && <span className="gw-depth-label">{DEPTH_LABEL[score]}</span>}
    </div>
  );
}

export default function GratitudeWizard({ onClose, onComplete, initial, soundEnabled = true }) {
  // Resolve any in-progress / editing state passed in.
  const initialType = initial?.typeId ? getGratitudeType(initial.typeId) : null;

  // step: -2 selector · -1 reminder · 0..n-1 layers · n reveal
  const [type, setType] = useState(initialType);
  const [step, setStep] = useState(initialType ? 0 : -2);
  const [dir, setDir] = useState(1);
  const [values, setValues] = useState(initial?.values || ["", "", ""]);

  const layers = type?.layers || [];
  const TOTAL = layers.length;
  const accent = type?.accent || "#00FFBF";
  const revealStep = TOTAL;
  const onReveal = step === revealStep;

  const go = (next, d = 1) => {
    setDir(d);
    setStep(next);
    playSound(next === revealStep ? "levelup" : "click", { soundEnabled });
  };

  const pickType = (t) => {
    setType(t);
    setValues(initial?.typeId === t.id ? (initial.values || ["", "", ""]) : ["", "", ""]);
    go(-1); // land on the "go deeper" reminder before the questions
  };

  const setValue = (i, v) =>
    setValues((prev) => prev.map((x, idx) => (idx === i ? v : x)));

  // ── Voice dictation ── speech→text into the active field; never stored as audio.
  const dictation = useSpeechToText({
    onFinalText: (chunk) =>
      setValues((prev) =>
        prev.map((x, idx) =>
          idx === step ? (x.trim() ? `${x.trim()} ${chunk}` : chunk) : x
        )
      ),
  });

  // Stop dictation whenever the step changes so it never bleeds across questions.
  useEffect(() => {
    dictation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Escape exits the wizard; lock body scroll while open.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Reveal sting on the payoff.
  useEffect(() => {
    if (onReveal) {
      const t = setTimeout(() => playSound("reward", { soundEnabled }), 260);
      return () => clearTimeout(t);
    }
  }, [onReveal, soundEnabled]);

  const complete = () => {
    playSound("chime", { soundEnabled });
    onComplete?.({
      typeId: type.id,
      typeLabel: type.label,
      labels: type.labels,
      values: values.map((v) => v.trim()),
    });
  };

  // Selector exits · reminder returns to selector · first layer returns to reminder.
  const goBack = () => {
    if (step === -2) return onClose?.();
    if (step === -1) { setDir(-1); setStep(-2); setType(null); playSound("click", { soundEnabled }); return; }
    go(step - 1, -1);
  };

  const layer = step >= 0 && step < TOTAL ? layers[step] : null;
  const current = layer ? values[step] || "" : "";
  const score = layer?.depth ? depthScore(current) : 0;
  // Never trap the user: any non-empty answer advances. The depth meter is pure
  // encouragement, not a wall.
  const canAdvance = layer ? !!current.trim() : false;

  // Portal to <body> so the fixed overlay escapes any transformed/filtered
  // ancestor and covers the full viewport — otherwise the top/bottom nav paint
  // over it and the content can't be scrolled clear of them.
  return createPortal(
    <div className="dsw-overlay" role="dialog" aria-modal="true" aria-label="Gratitude">
      {/* Cinematic backdrop */}
      <div className="dsw-aurora" aria-hidden="true">
        <span className="dsw-blob dsw-blob--1" />
        <span className="dsw-blob dsw-blob--2" />
        <span className="dsw-blob dsw-blob--3" />
      </div>
      <div className="dsw-embers" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="dsw-ember" style={{ "--i": i }} />
        ))}
      </div>

      <div className="dsw-stage" style={{ "--accent": accent }}>
        {/* Top bar */}
        <div className="dsw-topbar">
          <button type="button" className="dsw-back" onClick={goBack}>
            ← {step === -2 ? "Exit" : step === -1 ? "Pick another" : step === 0 ? "Back" : "Back"}
          </button>
          <span className="dsw-eyebrow">{type ? type.label : "Gratitude"}</span>
          <span className="dsw-count">
            {step >= 0 && step < TOTAL ? `${step + 1} / ${TOTAL}` : type?.glyph || "✦"}
          </span>
        </div>

        {/* Progress rail (only inside a chosen flow) */}
        {step >= 0 && step < TOTAL && (
          <div className="dsw-rail">
            {Array.from({ length: TOTAL }).map((_, k) => (
              <span key={k} className={`dsw-rail-seg ${k <= step ? "is-on" : ""}`} />
            ))}
          </div>
        )}

        {/* Screens */}
        <div className={`dsw-screen ${dir > 0 ? "from-right" : "from-left"}`} key={`${type?.id || "sel"}-${step}`}>
          {/* ── Selector ── */}
          {step === -2 && (
            <div className="dsw-screen-inner">
              <span className="dsw-kicker" style={{ color: "var(--brand-gold)" }}>CHOOSE YOUR GRATITUDE</span>
              <h2 className="dsw-title">What do you want to feel today?</h2>
              <p className="dsw-sub">
                Four different doors. Pick one — each one takes you somewhere the others don't.
                Depth is the medicine: we'll go deep on one real thing, not wide on a list.
              </p>
              <div className="gw-type-grid">
                {GRATITUDE_TYPES.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    className="gw-type"
                    style={{ "--theme-accent": t.accent, "--d": `${i * 70}ms` }}
                    onClick={() => pickType(t)}
                  >
                    <span className="gw-type-glyph" aria-hidden="true">{t.glyph}</span>
                    <span className="gw-type-body">
                      <span className="gw-type-label">{t.label}</span>
                      <span className="gw-type-tagline">{t.tagline}</span>
                      <span className="gw-type-blurb">{t.blurb}</span>
                    </span>
                    <span className="gw-type-go" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── "Go deeper" reminder ── */}
          {step === -1 && type && (
            <div className="dsw-screen-inner gw-intro">
              <span className="dsw-kicker">{type.label.toUpperCase()}</span>
              <h2 className="dsw-title">One thing before you start.</h2>
              <p className="dsw-sub">
                This works best when you slow down and really dig in. People who go deep —
                not fast — feel a lot less stressed, anxious, and down. One real answer beats
                ten quick ones.
              </p>

              <div className="gratitude-impact-stats gw-intro-stats">
                {INTRO_STATS.map((s) => (
                  <div key={s.label} className="gratitude-impact-stat" style={{ "--stat-color": s.color }}>
                    <span className="gratitude-impact-stat-value" style={{ color: s.color }}>{s.value}</span>
                    <span className="gratitude-impact-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {dictation.supported && (
                <p className="gw-intro-tip">
                  <span className="gw-intro-tip-mic" aria-hidden="true">🎤</span>
                  Tip: tap the mic and just talk it out loud — saying it beats typing it.
                </p>
              )}

              <div className="dsw-footer">
                <button className="dsw-next gw-next" style={{ "--accent": accent }} onClick={() => go(0)}>
                  I'm ready →
                </button>
              </div>
            </div>
          )}

          {/* ── A layer ── */}
          {layer && (
            <div className="dsw-screen-inner">
              <span className="dsw-kicker">{layer.kicker}</span>
              <h2 className="dsw-title">{layer.title}</h2>
              {layer.sub && <p className="dsw-sub">{layer.sub}</p>}
              <div className="gw-field">
                <textarea
                  className="dsw-textarea dsw-textarea--big gw-field-input"
                  placeholder={layer.placeholder}
                  rows={4}
                  autoFocus
                  value={current}
                  onChange={(e) => setValue(step, e.target.value)}
                />
                {dictation.supported && (
                  <button
                    type="button"
                    className={`gw-mic ${dictation.listening ? "is-live" : ""}`}
                    onClick={dictation.toggle}
                    aria-label={dictation.listening ? "Stop dictation" : "Speak your answer"}
                    title={dictation.listening ? "Listening… tap to stop" : "Tap to speak"}
                  >
                    <span className="gw-mic-icon" aria-hidden="true">🎤</span>
                    <span className="gw-mic-label">
                      {dictation.listening ? "Listening…" : "Speak"}
                    </span>
                  </button>
                )}
              </div>
              {dictation.listening && dictation.interim && (
                <p className="gw-interim">{dictation.interim}…</p>
              )}
              {layer.depth && <DepthMeter score={score} />}
              {layer.hint && <p className="dsw-hint">{layer.hint}</p>}
              <div className="dsw-footer">
                <button
                  className="dsw-next gw-next"
                  style={{ "--accent": accent }}
                  disabled={!canAdvance}
                  onClick={() => go(step + 1)}
                >
                  {!canAdvance
                    ? "Fill this in…"
                    : step === TOTAL - 1
                      ? `Lock in gratitude ${type.glyph}`
                      : "Next →"}
                </button>
              </div>
            </div>
          )}

          {/* ── Reveal ── */}
          {onReveal && (
            <div className="dsw-reveal">
              <div className="dsw-reveal-rays" aria-hidden="true" />
              <div className="dsw-burst" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span key={i} className="dsw-spark" style={{ "--s": i }} />
                ))}
              </div>

              <div className="dsw-reveal-orb">{type.glyph}</div>
              <p className="dsw-reveal-kicker">{type.label.toUpperCase()} · LOCKED IN</p>

              <div className="gw-reveal-entries">
                {layers.map((l, i) =>
                  values[i]?.trim() ? (
                    <Entry key={i} label={type.labels[i]} text={values[i]} delay={400 + i * 160} />
                  ) : null
                )}
              </div>

              <div className="gratitude-impact-stats gw-reveal-stats">
                {IMPACT_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="gratitude-impact-stat anim-slide-up"
                    style={{ animationDelay: `${900 + s.delay}ms`, "--stat-color": s.color }}
                  >
                    <img
                      src={s.icon}
                      alt=""
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      style={{ width: 28, height: 28, objectFit: "contain" }}
                    />
                    <span className="gratitude-impact-stat-value" style={{ color: s.color }}>
                      {s.value}
                    </span>
                    <span className="gratitude-impact-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <p className="dsw-reveal-body">
                You didn't list — you felt it. That depth is the whole point: morning gratitude
                done this way drops anxiety 23% and depression risk 25%. You're already ahead of the day.
              </p>
              <p className="dsw-reveal-source">{GRATITUDE_ATTRIBUTION}</p>

              <button className="dsw-pop-btn" onClick={complete}>
                Save &amp; close {type.glyph}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Entry({ label, text, delay }) {
  if (!text.trim()) return null;
  return (
    <div className="gw-reveal-entry anim-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <span className="gw-reveal-entry-label">{label}</span>
      <p className="gw-reveal-entry-text">"{text.trim()}"</p>
    </div>
  );
}
