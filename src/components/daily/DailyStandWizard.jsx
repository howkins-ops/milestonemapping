import React, { useEffect, useMemo, useState } from "react";
import { STAND_THEMES, STAND_TEACHING, STANDS_ATTRIBUTION } from "../../data/powerfulStands.js";
import { playSound } from "../../lib/sounds.js";

// ─── Cinematic 5-stage Daily Stand wizard ──────────────────────────────────────
// category → stand → 3 ways to support it → intention → dopamine reveal.
// Shared by the Daily page (Morning Stand) and the Shadow Work page.

// Quick-pick supports, themed. Generic fallbacks keep momentum high.
const SUPPORT_SUGGESTIONS = {
  being: ["Speak to myself like I'm already worthy", "Pause before I judge myself", "Do one thing slowly and fully present"],
  purpose: ["Keep one promise I made to myself", "Do the hard task first", "Say no to one distraction"],
  gratitude: ["Tell one person why they matter", "Notice three good things out loud", "Do one small thing for someone else"],
  discipline: ["Show up before I feel ready", "Finish what I start today", "Choose the rep over the excuse"],
  money: ["Create value before I ask for any", "Have the conversation I've been avoiding", "Act like money already moves through me"],
  sales: ["Lead with energy before words", "Treat every no as one step closer", "Stay unattached and fully present"],
};
const GENERIC_SUPPORTS = [
  "Take one action that proves it's true",
  "Catch myself when I slip and reset",
  "Say it out loud before the hard moment",
];

const ORB = "✦";

export default function DailyStandWizard({ onClose, onComplete, soundEnabled = true }) {
  const [step, setStep] = useState(0); // 0 cat · 1 stand · 2 ways · 3 intention · 4 reveal
  const [dir, setDir] = useState(1);
  const [themeId, setThemeId] = useState(null);
  const [stand, setStand] = useState("");
  const [ways, setWays] = useState(["", "", ""]);
  const [intention, setIntention] = useState("");

  const theme = STAND_THEMES.find((t) => t.id === themeId) || null;
  const accent = theme?.accent || "var(--brand-gold)";
  const TOTAL = 4; // input stages (reveal is the payoff)

  const suggestions = useMemo(() => {
    if (theme && SUPPORT_SUGGESTIONS[theme.id]) return SUPPORT_SUGGESTIONS[theme.id];
    return GENERIC_SUPPORTS;
  }, [theme]);

  const filledWays = ways.map((w) => w.trim()).filter(Boolean);

  const go = (next, d = 1) => {
    setDir(d);
    setStep(next);
    if (next === 4) {
      playSound("levelup", { soundEnabled });
    } else {
      playSound("click", { soundEnabled });
    }
  };

  // Escape exits the wizard.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Reveal sting once we land on the payoff.
  useEffect(() => {
    if (step === 4) {
      const t = setTimeout(() => playSound("reward", { soundEnabled }), 260);
      return () => clearTimeout(t);
    }
  }, [step, soundEnabled]);

  const setWay = (i, v) => setWays((p) => p.map((w, k) => (k === i ? v : w)));
  const addSuggestion = (s) => {
    const idx = ways.findIndex((w) => !w.trim());
    if (idx === -1 || ways.includes(s)) return;
    setWay(idx, s);
    playSound("pop", { soundEnabled });
  };

  const complete = () => {
    playSound("chime", { soundEnabled });
    onComplete?.({
      theme: theme?.label || null,
      themeId,
      stand: stand.trim(),
      ways: filledWays,
      intention: intention.trim(),
    });
  };

  const canStand = stand.trim().length > 0;
  const canWays = filledWays.length >= 1;

  return (
    <div className="dsw-overlay" role="dialog" aria-modal="true" aria-label="Daily Stand">
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
          <button
            type="button"
            className="dsw-back"
            onClick={() => (step === 0 ? onClose?.() : go(step - 1, -1))}
          >
            ← {step === 0 ? "Exit" : "Back"}
          </button>
          <span className="dsw-eyebrow">Daily Stand</span>
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
              kicker="STEP ONE"
              title="Where do you stand today?"
              sub="Pick the arena you're choosing to be powerful in."
            >
              <div className="dsw-theme-grid">
                {STAND_THEMES.map((t, i) => (
                  <button
                    key={t.id}
                    className={`dsw-theme ${themeId === t.id ? "is-active" : ""}`}
                    style={{ "--theme-accent": t.accent, "--d": `${i * 50}ms` }}
                    onClick={() => { setThemeId(t.id); go(1); }}
                  >
                    <span className="dsw-theme-label">{t.label}</span>
                    <span className="dsw-theme-go">→</span>
                  </button>
                ))}
              </div>
            </Screen>
          )}

          {step === 1 && (
            <Screen
              kicker={theme ? theme.label.toUpperCase() : "STEP TWO"}
              title="Claim your stand."
              sub="Say it in the present tense, like it's already true. Pick one or write your own."
            >
              <div className="dsw-chips">
                {(theme?.stands || []).map((s, i) => (
                  <button
                    key={s}
                    className={`dsw-chip ${stand === s ? "is-active" : ""}`}
                    style={{ "--d": `${i * 55}ms` }}
                    onClick={() => { setStand(s); playSound("pop", { soundEnabled }); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <textarea
                className="dsw-textarea"
                placeholder="…or write your own.  I am…"
                rows={2}
                value={stand}
                onChange={(e) => setStand(e.target.value)}
              />
              <p className="dsw-hint">{STAND_TEACHING.how[1]}</p>
              <Footer accent={accent} disabled={!canStand} label="Lock it in →" onNext={() => go(2)} />
            </Screen>
          )}

          {step === 2 && (
            <Screen
              kicker="STEP THREE"
              title="3 ways to back it today."
              sub="A stand needs proof. Name the moves that make it real before the day tests you."
            >
              <div className="dsw-ways">
                {ways.map((w, i) => (
                  <div className="dsw-way" key={i} style={{ "--d": `${i * 70}ms` }}>
                    <span className="dsw-way-num">{i + 1}</span>
                    <input
                      className="dsw-way-input"
                      value={w}
                      onChange={(e) => setWay(i, e.target.value)}
                      placeholder={`Way ${i + 1} I'll support this stand`}
                    />
                  </div>
                ))}
              </div>
              <div className="dsw-suggest">
                <span className="dsw-suggest-label">QUICK ADD</span>
                <div className="dsw-suggest-row">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      className="dsw-suggest-chip"
                      disabled={ways.includes(s) || filledWays.length >= 3}
                      onClick={() => addSuggestion(s)}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
              <Footer accent={accent} disabled={!canWays} label="These are my moves →" onNext={() => go(3)} />
            </Screen>
          )}

          {step === 3 && (
            <Screen
              kicker="STEP FOUR"
              title="Set your intention."
              sub="One line for the day — said as if it's already happening."
            >
              <textarea
                className="dsw-textarea dsw-textarea--big"
                placeholder="Today I lead with calm and close with confidence."
                rows={3}
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
              />
              <Footer
                accent={accent}
                disabled={!intention.trim()}
                label="Take my stand ✦"
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
              <p className="dsw-reveal-kicker">THIS IS YOUR STAND</p>

              <div className="dsw-stamp">
                <span className="dsw-stamp-mark">YOUR STAND</span>
                <p className="dsw-stamp-text">{stand.trim() || "I lead today."}</p>
              </div>

              {filledWays.length > 0 && (
                <ul className="dsw-reveal-ways">
                  {filledWays.map((w, i) => (
                    <li key={i} style={{ "--d": `${500 + i * 120}ms` }}>
                      <span className="dsw-reveal-tick">✓</span> {w}
                    </li>
                  ))}
                </ul>
              )}

              {intention.trim() && (
                <p className="dsw-reveal-intention">"{intention.trim()}"</p>
              )}

              <p className="dsw-reveal-body">
                Identity creates the outcome — not the other way around. You spoke into who you
                are. Now the day follows the story you set.
              </p>

              <button className="dsw-pop-btn" onClick={complete}>
                Save &amp; close ✦
              </button>
            </div>
          )}
        </div>

        {step <= 1 && (
          <p className="dsw-attribution">
            Powerful stands from {STANDS_ATTRIBUTION.authors}, used with permission.
          </p>
        )}
      </div>
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
