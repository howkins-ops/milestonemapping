import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { playSound } from "../../lib/sounds.js";
import { useSpeechToText } from "../../hooks/useSpeechToText.js";
import {
  EVENING_STEPS,
  EVENING_IMPACT_STATS,
  EVENING_ATTRIBUTION,
} from "../../data/eveningRitual.js";

// ─── Cinematic evening close-the-day wizard ─────────────────────────────────────
// The night-time sibling of the morning GratitudeWizard. A linear flow:
//   win → lesson → upgrade → night-gratitude → reveal
// Reflection steps support voice dictation; the night-gratitude step is three
// quick light inputs (you only need one). Reveal carries the sleep science and
// hands the user off to the wind-down breathing below.

const TOTAL = EVENING_STEPS.length;

// Live "depth meter" — pure encouragement, never blocks. Mirrors the gratitude one.
function depthScore(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  if (words === 0) return 0;
  if (words < 6) return 1;
  if (words < 14) return 2;
  return 3;
}
const DEPTH_LABEL = [
  "",
  "Add a detail — what exactly?",
  "Good. A touch more if it's there.",
  "That's it. Real and specific. ✦",
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

const emptyForm = {
  biggestWin: "",
  lesson: "",
  tomorrowUpgrade: "",
  nightGratitude: ["", "", ""],
};

export default function EveningWizard({ onClose, onComplete, initial, soundEnabled = true }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({ ...emptyForm, ...(initial || {}) });

  const active = EVENING_STEPS[step];
  const accent = active?.accent || "#00F0FF";
  const revealStep = TOTAL;
  const onReveal = step === revealStep;

  const go = (next, d = 1) => {
    setDir(d);
    setStep(next);
    playSound(next === revealStep ? "levelup" : "click", { soundEnabled });
  };

  // ── Reflect-field helpers ──
  const setField = (field, v) => setForm((p) => ({ ...p, [field]: v }));
  const setGratitude = (i, v) =>
    setForm((p) => ({
      ...p,
      nightGratitude: p.nightGratitude.map((x, idx) => (idx === i ? v : x)),
    }));

  // ── Voice dictation → active reflect field (one textarea per reflect step) ──
  const dictation = useSpeechToText({
    onFinalText: (chunk) => {
      if (active?.kind !== "reflect") return;
      setForm((p) => {
        const cur = p[active.field] || "";
        return { ...p, [active.field]: cur.trim() ? `${cur.trim()} ${chunk}` : chunk };
      });
    },
  });

  // Stop dictation on every step change so it never bleeds across questions.
  useEffect(() => {
    dictation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Escape exits; lock body scroll while open.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Reveal sting.
  useEffect(() => {
    if (onReveal) {
      const t = setTimeout(() => playSound("reward", { soundEnabled }), 260);
      return () => clearTimeout(t);
    }
  }, [onReveal, soundEnabled]);

  const goBack = () => {
    if (step === 0) return onClose?.();
    go(step - 1, -1);
  };

  const complete = () => {
    playSound("chime", { soundEnabled });
    onComplete?.({
      biggestWin: form.biggestWin.trim(),
      lesson: form.lesson.trim(),
      tomorrowUpgrade: form.tomorrowUpgrade.trim(),
      nightGratitude: form.nightGratitude.map((g) => g.trim()).filter(Boolean),
    });
  };

  // Advance gating — never trap the user. Reflect needs text; gratitude needs ≥1.
  const reflectVal = active?.kind === "reflect" ? form[active.field] || "" : "";
  const gratitudeFilled =
    active?.kind === "gratitude3"
      ? form.nightGratitude.some((g) => g.trim())
      : false;
  const canAdvance =
    active?.kind === "reflect" ? !!reflectVal.trim() : active?.kind === "gratitude3" ? gratitudeFilled : true;

  const isLast = step === TOTAL - 1;
  const nextLabel = !canAdvance
    ? active?.kind === "gratitude3" ? "Add at least one…" : "Fill this in…"
    : isLast ? "Close the day 🌙" : "Next →";

  return createPortal(
    <div className="dsw-overlay dsw-overlay--night" role="dialog" aria-modal="true" aria-label="Evening reflection">
      {/* Cinematic backdrop */}
      <div className="dsw-aurora" aria-hidden="true">
        <span className="dsw-blob dsw-blob--1" />
        <span className="dsw-blob dsw-blob--2" />
        <span className="dsw-blob dsw-blob--3" />
      </div>
      <div className="dsw-stars" aria-hidden="true">
        {Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="dsw-star" style={{ "--i": i }} />
        ))}
      </div>

      <div className="dsw-stage" style={{ "--accent": accent }}>
        {/* Top bar */}
        <div className="dsw-topbar">
          <button type="button" className="dsw-back" onClick={goBack}>
            ← {step === 0 ? "Exit" : "Back"}
          </button>
          <span className="dsw-eyebrow" style={{ color: accent, textShadow: `0 0 16px ${accent}77` }}>
            {onReveal ? "Day Logged" : "Evening"}
          </span>
          <span className="dsw-count">
            {step < TOTAL ? `${step + 1} / ${TOTAL}` : active?.glyph || "🌙"}
          </span>
        </div>

        {/* Progress rail */}
        {step < TOTAL && (
          <div className="dsw-rail">
            {Array.from({ length: TOTAL }).map((_, k) => (
              <span
                key={k}
                className={`dsw-rail-seg ${k <= step ? "is-on" : ""}`}
                style={k <= step ? { background: `linear-gradient(90deg, ${accent}, #ffffff66)`, boxShadow: `0 0 14px ${accent}88` } : undefined}
              />
            ))}
          </div>
        )}

        <div className={`dsw-screen ${dir > 0 ? "from-right" : "from-left"}`} key={`ev-${step}`}>
          {/* ── Reflect step ── */}
          {active?.kind === "reflect" && (
            <div className="dsw-screen-inner">
              <span className="dsw-kicker">{active.kicker}</span>
              <h2 className="dsw-title">{active.title}</h2>
              {active.sub && <p className="dsw-sub">{active.sub}</p>}
              <div className="gw-field">
                <textarea
                  className="dsw-textarea dsw-textarea--big gw-field-input"
                  placeholder={active.placeholder}
                  rows={4}
                  autoFocus
                  value={reflectVal}
                  onChange={(e) => setField(active.field, e.target.value)}
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
                    <span className="gw-mic-label">{dictation.listening ? "Listening…" : "Speak"}</span>
                  </button>
                )}
              </div>
              {dictation.listening && dictation.interim && (
                <p className="gw-interim">{dictation.interim}…</p>
              )}
              {active.depth && <DepthMeter score={depthScore(reflectVal)} />}
              <div className="dsw-footer">
                <button
                  className="dsw-next gw-next"
                  style={{ "--accent": accent, background: `linear-gradient(90deg, ${accent}, #ffffffcc)` }}
                  disabled={!canAdvance}
                  onClick={() => go(step + 1)}
                >
                  {nextLabel}
                </button>
              </div>
            </div>
          )}

          {/* ── Night gratitude (3 quick, light) ── */}
          {active?.kind === "gratitude3" && (
            <div className="dsw-screen-inner">
              <span className="dsw-kicker">{active.kicker}</span>
              <h2 className="dsw-title">{active.title}</h2>
              {active.sub && <p className="dsw-sub">{active.sub}</p>}
              <div className="dsw-ways">
                {active.placeholders.map((ph, i) => (
                  <div className="dsw-way" key={i} style={{ "--d": `${i * 70}ms` }}>
                    <span className="dsw-way-num" style={{ color: accent, borderColor: `${accent}66`, background: `${accent}1f` }}>
                      {i + 1}
                    </span>
                    <input
                      className="dsw-way-input"
                      placeholder={ph}
                      autoFocus={i === 0}
                      value={form.nightGratitude[i] || ""}
                      onChange={(e) => setGratitude(i, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && canAdvance) go(step + 1); }}
                    />
                  </div>
                ))}
              </div>
              <p className="dsw-hint">One is plenty. Three is a luxury. No pressure — just notice the good.</p>
              <div className="dsw-footer">
                <button
                  className="dsw-next gw-next"
                  style={{ "--accent": accent, background: `linear-gradient(90deg, ${accent}, #ffffffcc)` }}
                  disabled={!canAdvance}
                  onClick={() => go(step + 1)}
                >
                  {nextLabel}
                </button>
              </div>
            </div>
          )}

          {/* ── Reveal ── */}
          {onReveal && (
            <div className="dsw-reveal dsw-reveal--night">
              <div className="dsw-burst" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span key={i} className="dsw-spark dsw-spark--night" style={{ "--s": i }} />
                ))}
              </div>

              <div className="dsw-reveal-orb dsw-reveal-orb--night">🌙</div>
              <p className="dsw-reveal-kicker dsw-reveal-kicker--night">TODAY · CLOSED OUT</p>

              <div className="gw-reveal-entries">
                {form.biggestWin.trim() && <Entry label="Biggest win" text={form.biggestWin} delay={400} />}
                {form.lesson.trim() && <Entry label="What it taught me" text={form.lesson} delay={540} />}
                {form.tomorrowUpgrade.trim() && <Entry label="Tomorrow's upgrade" text={form.tomorrowUpgrade} delay={680} />}
              </div>

              {form.nightGratitude.some((g) => g.trim()) && (
                <div className="ev-reveal-gratitude">
                  <span className="ev-reveal-gratitude-label">GRATEFUL FOR</span>
                  <ul className="ev-reveal-gratitude-list">
                    {form.nightGratitude.filter((g) => g.trim()).map((g, i) => (
                      <li key={i} className="anim-slide-up" style={{ animationDelay: `${820 + i * 120}ms` }}>
                        <span className="ev-reveal-gratitude-dot">✦</span> {g.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="gratitude-impact-stats gw-reveal-stats">
                {EVENING_IMPACT_STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className="gratitude-impact-stat anim-slide-up"
                    style={{ animationDelay: `${1100 + i * 120}ms`, "--stat-color": s.color }}
                  >
                    <span className="gratitude-impact-stat-value" style={{ color: s.color }}>{s.value}</span>
                    <span className="gratitude-impact-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <p className="dsw-reveal-body">
                The day is closed and tomorrow has a plan — so your mind has nothing left to chase.
                Ending on a few good things is what lets you fall asleep faster. Now wind down below ↓
              </p>
              <p className="dsw-reveal-source">{EVENING_ATTRIBUTION}</p>

              <button className="dsw-pop-btn dsw-pop-btn--night" onClick={complete}>
                Save &amp; rest 🌙
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
