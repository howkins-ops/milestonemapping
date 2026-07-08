// FULL COURT — HOOPS boot splash. A ~15-second, full-screen basketball
// cinematic that plays when you enter via the top-bar HOOPS button, teaches the
// game in five hype beats, then hands off to the idle title screen. Always
// skippable; reduced-motion jumps straight to the title.
//
// Self-contained (own sfx + local confetti, no shared FX hooks) so it can mount
// over the already-fullscreen FullCourt without threading state. Styles live in
// FullCourt.css (fc-splash-*). Transform/opacity animation only (perf law).

import { useEffect, useRef, useState } from "react";
import {
  sfxBuzzer,
  sfxHorn,
  sfxCrowdRoar,
  sfxCrowdLoop,
  sfxBallThrow,
  sfxSwish,
  sfxDunk,
} from "../../../../lib/sfx.js";

// Five beats. `at` = when the beat starts (ms). The splash ends ~3s after the
// last beat begins (~15s total).
const BEATS = [
  { key: "tip", at: 0 },
  { key: "frame", at: 3000 },
  { key: "shot", at: 6000 },
  { key: "dunk", at: 9000 },
  { key: "law", at: 12000 },
];
const TOTAL_MS = 15000;

function prefersReduced() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export default function FullCourtSplash({ onDone, settings }) {
  const [step, setStep] = useState(0);
  const timers = useRef([]);
  const bedRef = useRef(null);
  const doneRef = useRef(false);

  // Fire once — clears timers, kills the crowd bed, hands off to the title.
  const finish = useRef(() => {});
  finish.current = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try {
      bedRef.current?.stop?.();
    } catch {
      /* audio optional */
    }
    onDone?.();
  };

  useEffect(() => {
    // Reduced motion: no cinematic — show the logo frame briefly, then hand off.
    if (prefersReduced()) {
      const t = setTimeout(() => finish.current(), 900);
      timers.current.push(t);
      return () => {
        clearTimeout(t);
      };
    }

    // Crowd bed for the whole splash.
    try {
      bedRef.current = sfxCrowdLoop?.(settings) || null;
    } catch {
      bedRef.current = null;
    }

    // Beat 0 audio — tip-off.
    safe(() => sfxBuzzer(settings));
    safe(() => sfxCrowdRoar(settings));

    // Schedule every beat + the audio cue that lands with it.
    BEATS.forEach((b, i) => {
      if (i === 0) return; // beat 0 fires synchronously above
      const t = setTimeout(() => {
        setStep(i);
        if (b.key === "shot") {
          safe(() => sfxBallThrow(settings));
          const s = setTimeout(() => safe(() => sfxSwish(settings)), 520);
          timers.current.push(s);
        } else if (b.key === "dunk") {
          safe(() => sfxDunk(settings));
          safe(() => sfxHorn(1, settings));
        } else if (b.key === "law") {
          safe(() => sfxCrowdRoar(settings));
        }
      }, b.at);
      timers.current.push(t);
    });

    const end = setTimeout(() => finish.current(), TOTAL_MS);
    timers.current.push(end);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      try {
        bedRef.current?.stop?.();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beat = BEATS[step]?.key || "tip";

  return (
    <div
      className="fc-splash"
      role="dialog"
      aria-modal="true"
      aria-label="Hoops — game intro"
    >
      <div className="fc-splash__court" aria-hidden="true" />
      <div className="fc-splash__glow" aria-hidden="true" />

      {/* the whole thing keys on `beat` so each scene re-animates on entry */}
      <div className="fc-splash__stage" key={beat}>
        {beat === "tip" && (
          <div className="fc-splash__scene fc-splash__scene--tip">
            <div className="fc-splash__balldrop" aria-hidden="true">🏀</div>
            <h1 className="fc-splash__logo">HOOPS</h1>
            <p className="fc-splash__kicker">FULL&nbsp;COURT</p>
          </div>
        )}

        {beat === "frame" && (
          <div className="fc-splash__scene">
            <p className="fc-splash__lead">Your sales day is</p>
            <h2 className="fc-splash__big">4 QUARTERS</h2>
            <div className="fc-splash__qs" aria-hidden="true">
              {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
                <span
                  key={q}
                  className="fc-splash__q"
                  style={{ animationDelay: `${0.15 + i * 0.28}s` }}
                >
                  {q}
                </span>
              ))}
            </div>
            <p className="fc-splash__sub">Buzzer to buzzer. Play it like a game.</p>
          </div>
        )}

        {beat === "shot" && (
          <div className="fc-splash__scene">
            <div className="fc-splash__arc" aria-hidden="true">
              <span className="fc-splash__hoop">🏀</span>
              <span className="fc-splash__ball">🏀</span>
            </div>
            <h2 className="fc-splash__big">EVERY NO IS A SHOT</h2>
            <p className="fc-splash__sub">Every door you knock puts points on the board.</p>
          </div>
        )}

        {beat === "dunk" && (
          <div className="fc-splash__scene">
            <div className="fc-splash__dunk" aria-hidden="true">
              <span className="fc-splash__dunkball">🏀</span>
              <span className="fc-splash__confetti">
                {Array.from({ length: 14 }).map((_, i) => (
                  <i key={i} style={{ "--i": i }} />
                ))}
              </span>
            </div>
            <h2 className="fc-splash__big fc-splash__big--gold">EVERY SALE IS A DUNK</h2>
            <p className="fc-splash__sub">
              <b>+10</b> · THE DUNK. Slam it home.
            </p>
          </div>
        )}

        {beat === "law" && (
          <div className="fc-splash__scene">
            <p className="fc-splash__kicker">THE LAW OF PROBABILITY</p>
            <h2 className="fc-splash__big">THE MATH OWES YOU</h2>
            <p className="fc-splash__sub">Keep knocking. The next yes is already on the way.</p>
            <div className="fc-splash__go">GAME&nbsp;ON</div>
          </div>
        )}
      </div>

      {/* progress dots + skip */}
      <div className="fc-splash__dots" aria-hidden="true">
        {BEATS.map((b, i) => (
          <span key={b.key} className={`fc-splash__dot ${i <= step ? "is-on" : ""}`} />
        ))}
      </div>
      <button type="button" className="fc-splash__skip" onClick={() => finish.current()}>
        Skip ⏭
      </button>
    </div>
  );
}

// sfx helpers never throw up into the render path.
function safe(fn) {
  try {
    fn();
  } catch {
    /* audio is best-effort */
  }
}
