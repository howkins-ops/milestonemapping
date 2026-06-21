import React, { useEffect, useState } from "react";
import { playSound } from "../../lib/sounds.js";

// ─── Cinematic Gratitude wizard ────────────────────────────────────────────────
// Teaches DEPTH over breadth: one vivid, specific moment beats a list of three.
// Steps: teach → the moment → mental subtraction → alchemize the hard thing → reveal.
// Research: elaborating on ONE specific thing (esp. a person) carries far more
// benefit than a shallow list; mental subtraction amplifies the effect.

const ACCENT = "#00FFBF";
const ORB = "✦";

const IMPACT_STATS = [
  { label: "Anxiety Levels",  value: "↓ 23%",  color: "#00FFBF", delay: 0,   icon: "/assets/daily/stat-calm-icon.png" },
  { label: "Depression Risk", value: "↓ 25%",  color: "#00FFBF", delay: 120, icon: "/assets/daily/stat-heart-icon.png" },
  { label: "XP Earned",       value: "+50 XP", color: "#FACC15", delay: 240, icon: "/assets/daily/stat-xp-icon.png" },
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
  "Add a detail — when? where? what exactly did they do?",
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
  const [step, setStep] = useState(0); // 0 teach · 1 moment · 2 subtraction · 3 hardship · 4 reveal
  const [dir, setDir] = useState(1);
  const [moment, setMoment] = useState(initial?.moment || "");
  const [subtraction, setSubtraction] = useState(initial?.subtraction || "");
  const [hardship, setHardship] = useState(initial?.hardship || "");

  const TOTAL = 4; // input stages (reveal is the payoff)

  const go = (next, d = 1) => {
    setDir(d);
    setStep(next);
    playSound(next === 4 ? "levelup" : "click", { soundEnabled });
  };

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
    if (step === 4) {
      const t = setTimeout(() => playSound("reward", { soundEnabled }), 260);
      return () => clearTimeout(t);
    }
  }, [step, soundEnabled]);

  const complete = () => {
    playSound("chime", { soundEnabled });
    onComplete?.({
      moment: moment.trim(),
      subtraction: subtraction.trim(),
      hardship: hardship.trim(),
    });
  };

  const momentScore = depthScore(moment);

  return (
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

      <div className="dsw-stage" style={{ "--accent": ACCENT }}>
        {/* Top bar */}
        <div className="dsw-topbar">
          <button
            type="button"
            className="dsw-back"
            onClick={() => (step === 0 ? onClose?.() : go(step - 1, -1))}
          >
            ← {step === 0 ? "Exit" : "Back"}
          </button>
          <span className="dsw-eyebrow">Gratitude</span>
          <span className="dsw-count">{step < 4 ? `${step + 1} / ${TOTAL}` : "✦"}</span>
        </div>

        {/* Progress rail */}
        {step < 4 && (
          <div className="dsw-rail">
            {Array.from({ length: TOTAL }).map((_, k) => (
              <span key={k} className={`dsw-rail-seg ${k <= step ? "is-on" : ""}`} />
            ))}
          </div>
        )}

        {/* Screens */}
        <div className={`dsw-screen ${dir > 0 ? "from-right" : "from-left"}`} key={step}>
          {step === 0 && (
            <Screen
              kicker="HOW TO MAKE THIS HIT"
              title="Gratitude is a skill. Here's the dose."
              sub="The benefit doesn't come from listing things — it comes from going deep on one. Detail is what your brain actually responds to."
            >
              <div className="gw-examples">
                <div className="gw-example gw-example--bad">
                  <span className="gw-example-tag">❌ SHALLOW</span>
                  <p className="gw-example-text">"Grateful for my brother."</p>
                </div>
                <div className="gw-example gw-example--good">
                  <span className="gw-example-tag">✓ VIVID</span>
                  <p className="gw-example-text">
                    "Grateful my brother texted me at 11pm Tuesday just to check in — I didn't even
                    know he'd noticed I'd been off."
                  </p>
                </div>
              </div>
              <p className="gw-teach-line">
                One specific moment beats a list of ten. We'll do three quick layers — start to finish in about two minutes.
              </p>
              <Footer accent={ACCENT} disabled={false} label="Begin →" onNext={() => go(1)} />
            </Screen>
          )}

          {step === 1 && (
            <Screen
              kicker="LAYER ONE · THE MOMENT"
              title="One person. One real moment."
              sub="Not 'my friends.' A specific thing someone did — and when it happened. Write it like you're back in it."
            >
              <textarea
                className="dsw-textarea dsw-textarea--big"
                placeholder="Who, what they did, and when…"
                rows={4}
                autoFocus
                value={moment}
                onChange={(e) => setMoment(e.target.value)}
              />
              <DepthMeter score={momentScore} />
              <Footer
                accent={ACCENT}
                disabled={momentScore < 2}
                label={momentScore < 2 ? "Go a little deeper…" : "That's the one →"}
                onNext={() => go(2)}
              />
            </Screen>
          )}

          {step === 2 && (
            <Screen
              kicker="LAYER TWO · THE SUBTRACTION"
              title="Now picture it gone."
              sub="Imagine this morning if that person or moment had never been in your life. What would be missing? This is where gratitude actually lands."
            >
              <textarea
                className="dsw-textarea dsw-textarea--big"
                placeholder="Without them, my life would be…"
                rows={4}
                autoFocus
                value={subtraction}
                onChange={(e) => setSubtraction(e.target.value)}
              />
              <p className="dsw-hint">
                Subtraction beats addition — feeling the absence makes the presence real.
              </p>
              <Footer
                accent={ACCENT}
                disabled={!subtraction.trim()}
                label="Felt it →"
                onNext={() => go(3)}
              />
            </Screen>
          )}

          {step === 3 && (
            <Screen
              kicker="LAYER THREE · THE ALCHEMY"
              title="Find the gift in the hard thing."
              sub="One struggle — recent or old — that shaped you. What did it give you that you'd actually keep?"
            >
              <textarea
                className="dsw-textarea dsw-textarea--big"
                placeholder="The hard thing was… and what it gave me was…"
                rows={4}
                autoFocus
                value={hardship}
                onChange={(e) => setHardship(e.target.value)}
              />
              <Footer
                accent={ACCENT}
                disabled={!hardship.trim()}
                label="Lock in gratitude ✦"
                onNext={() => go(4)}
              />
            </Screen>
          )}

          {step === 4 && (
            <div className="dsw-reveal">
              <div className="dsw-reveal-rays" aria-hidden="true" />
              <div className="dsw-burst" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span key={i} className="dsw-spark" style={{ "--s": i }} />
                ))}
              </div>

              <div className="dsw-reveal-orb">{ORB}</div>
              <p className="dsw-reveal-kicker">GRATITUDE LOCKED IN</p>

              <div className="gw-reveal-entries">
                <Entry label="THE MOMENT" text={moment} delay={400} />
                <Entry label="WITHOUT IT" text={subtraction} delay={560} />
                <Entry label="THE GIFT" text={hardship} delay={720} />
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
              <p className="dsw-reveal-source">Gratitude Intervention Meta-Analysis, 2023 (64 RCTs)</p>

              <button className="dsw-pop-btn" onClick={complete}>
                Save &amp; close ✦
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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

function Screen({ kicker, title, sub, children }) {
  return (
    <div className="dsw-screen-inner">
      <span className="dsw-kicker">{kicker}</span>
      <h2 className="dsw-title">{title}</h2>
      {sub && <p className="dsw-sub">{sub}</p>}
      {children}
    </div>
  );
}

function Footer({ accent, disabled, label, onNext }) {
  return (
    <div className="dsw-footer">
      <button
        className="dsw-next"
        style={{ "--accent": accent }}
        disabled={disabled}
        onClick={onNext}
      >
        {label}
      </button>
    </div>
  );
}
