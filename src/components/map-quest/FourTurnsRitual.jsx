import React, { useEffect, useRef, useState } from "react";
import { FOUR_TURNS } from "./essencePairs.js";

// ════════════════════════════════════════════════════════════════════════
// THE FOUR TURNS — the shadow-flip ritual (four-turns doc, playable)
// One mechanism, everywhere a shadow speaks: Ch6 teaches it, the Citadel
// rehearses it, and every city on the Crossing runs it as the boss flip.
//
//   1. NAMING (nigredo)     — hold the pendant while the shadow speaks;
//                             its exact name burns in.
//   2. SEPARATING (albedo)  — catch the breath-flicker BEFORE the shadow's
//                             sentence finishes typing.
//   3. RETURNING (citrinitas)— hold to speak the Declaration out loud.
//   4. PROVING (rubedo)     — write one small real action only the essence
//                             would take. The gold isn't real until spent.
//
// Props:
//   pair        — an ESSENCE_PAIRS entry (essence/shadow/color/coreLie/voice)
//   voiceLabel  — who the shadow sounds like right now (escalates per city)
//   shadowLine  — the tempting line the shadow speaks (canon per scene)
//   declaration — override the spoken line (default built from the pair)
//   skipProving — the host scene provides its own Turn Four (e.g. a forge)
//   onComplete({ proof }) — fired when the last turn lands
// ════════════════════════════════════════════════════════════════════════

const HOLD_MS = 2200;
const SPEAK_MS = 2000;
const FLICKER_AT_MS = 1500; // when the flicker opens while the line types
const FLICKER_WINDOW_MS = 1700;
const TYPE_MS = 34;

function useHold(duration, onFull) {
  const [held, setHeld] = useState(0); // 0..1
  const timer = useRef(null);
  const doneRef = useRef(false);

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (!doneRef.current) setHeld(0);
  };

  const start = () => {
    if (timer.current || doneRef.current) return;
    const startedAt = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAt) / duration);
      setHeld(p);
      if (p >= 1 && !doneRef.current) {
        doneRef.current = true;
        stop();
        onFull();
      }
    }, 40);
  };

  useEffect(() => stop, []);
  return { held, start, stop };
}

export default function FourTurnsRitual({
  pair,
  voiceLabel,
  shadowLine,
  declaration,
  skipProving = false,
  onComplete,
}) {
  const [turn, setTurn] = useState(0); // index into FOUR_TURNS
  const [named, setNamed] = useState(false);
  const [caught, setCaught] = useState(false);
  const [missed, setMissed] = useState(false);
  const [typed, setTyped] = useState(0);
  const [spoke, setSpoke] = useState(false);
  const [proof, setProof] = useState("");

  const color = pair.color;
  const decl =
    declaration ||
    `I am ${pair.essence}. I choose ${pair.essence} instead of the ${pair.shadow}.`;

  const finish = (extra = {}) => onComplete && onComplete({ proof: proof.trim(), ...extra });

  /* Turn 1 — NAMING: hold the pendant through the shadow's line */
  const nameHold = useHold(HOLD_MS, () => {
    setNamed(true);
    setTimeout(() => setTurn(1), 1300);
  });

  /* Turn 2 — SEPARATING: the line types; catch the flicker mid-sentence */
  const sepLine = shadowLine || pair.coreLie;
  const sepTotal = sepLine.length;
  useEffect(() => {
    if (turn !== 1 || caught) return undefined;
    setTyped(0);
    setMissed(false);
    const startedAt = Date.now();
    const t = setInterval(() => {
      const chars = Math.floor((Date.now() - startedAt) / TYPE_MS);
      setTyped(Math.min(chars, sepTotal));
      if (chars >= sepTotal) {
        clearInterval(t);
        setMissed(true); // the sentence finished — the shadow got the whole word in
      }
    }, TYPE_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, missed, caught]);

  const elapsedMs = typed * TYPE_MS;
  const flickerLive =
    turn === 1 && !caught && !missed &&
    elapsedMs >= FLICKER_AT_MS && elapsedMs <= FLICKER_AT_MS + FLICKER_WINDOW_MS;

  const catchFlicker = () => {
    if (!flickerLive) return;
    setCaught(true);
    setTimeout(() => setTurn(2), 1400);
  };

  /* Turn 3 — RETURNING: hold to speak the declaration */
  const speakHold = useHold(SPEAK_MS, () => {
    setSpoke(true);
    setTimeout(() => {
      if (skipProving) finish({ declaration: decl });
      else setTurn(3);
    }, 1300);
  });

  const t = FOUR_TURNS[turn];

  return (
    <div className="ftr-overlay" role="dialog" aria-modal="true" aria-label="The Four Turns">
      <div className="ftr-panel" style={{ "--ftr": color, "--ftr-turn": t.accent }}>
        <div className="ftr-turnsbar" aria-hidden="true">
          {FOUR_TURNS.map((x, i) => (
            <span
              key={x.id}
              className={`ftr-turnchip${i === turn ? " is-now" : i < turn ? " is-done" : ""}`}
              style={{ "--chip": x.accent }}
            >
              {x.title}
            </span>
          ))}
        </div>

        <p className="ftr-latin">{t.latin}</p>
        <h3 className="ftr-title">
          Turn {turn + 1} · {t.title}
        </h3>
        <p className="ftr-hint">{t.hint}</p>

        {turn === 0 ? (
          <div className="ftr-stage">
            <p className="ftr-voice">{voiceLabel || pair.voice}</p>
            <p className="ftr-shadowline">“{shadowLine || pair.coreLie}”</p>
            {named ? (
              <p className="ftr-named">
                THIS IS THE <b>{pair.shadow.toUpperCase()}</b>. Not a fact about the world.
              </p>
            ) : (
              <button
                type="button"
                className="ftr-hold"
                onPointerDown={nameHold.start}
                onPointerUp={nameHold.stop}
                onPointerLeave={nameHold.stop}
              >
                <span className="ftr-hold__fill" style={{ width: `${nameHold.held * 100}%` }} />
                <span className="ftr-hold__label">◈ HOLD THE PENDANT — NAME IT</span>
              </button>
            )}
          </div>
        ) : null}

        {turn === 1 ? (
          <div className="ftr-stage">
            <p className="ftr-voice">it keeps talking…</p>
            <p className="ftr-shadowline">
              “{sepLine.slice(0, typed)}
              <span className="ftr-caret" aria-hidden="true" />”
            </p>
            {caught ? (
              <p className="ftr-named">
                The words were never yours. <b>The flicker before them was.</b>
              </p>
            ) : missed ? (
              <div>
                <p className="ftr-missed">
                  The sentence landed whole. Too convincing to argue with — that's its
                  trick. Watch the <b>breath</b>, not the words.
                </p>
                <button
                  type="button"
                  className="ftr-retry"
                  onClick={() => {
                    setMissed(false);
                    setTyped(0);
                  }}
                >
                  Listen again →
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`ftr-flicker${flickerLive ? " is-live" : ""}`}
                onClick={catchFlicker}
              >
                {flickerLive ? "⟡ CATCH THE FLICKER" : "…wait for the stir in your chest…"}
              </button>
            )}
          </div>
        ) : null}

        {turn === 2 ? (
          <div className="ftr-stage">
            <p className="ftr-decl">“{decl}”</p>
            {spoke ? (
              <p className="ftr-named">
                Spoken. Unretractable. <b>{pair.essence}</b> was true before the mask existed.
              </p>
            ) : (
              <button
                type="button"
                className="ftr-hold ftr-hold--gold"
                onPointerDown={speakHold.start}
                onPointerUp={speakHold.stop}
                onPointerLeave={speakHold.stop}
              >
                <span className="ftr-hold__fill" style={{ width: `${speakHold.held * 100}%` }} />
                <span className="ftr-hold__label">HOLD — SAY IT WHERE IT CAN BE HEARD</span>
              </button>
            )}
          </div>
        ) : null}

        {turn === 3 ? (
          <div className="ftr-stage">
            <p className="ftr-provelead">
              Naming, separating, returning — the shadow will wait out a person who only
              <i> thinks</i> the truth. Spend it.
            </p>
            <textarea
              className="ftr-proof"
              rows={3}
              value={proof}
              placeholder={`One small, real action only ${pair.essence} would take — today.`}
              onChange={(e) => setProof(e.target.value)}
            />
            <button
              type="button"
              className="ftr-commit"
              disabled={proof.trim().length < 5}
              onClick={() => finish({ declaration: decl })}
            >
              SPEND THE GOLD →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
