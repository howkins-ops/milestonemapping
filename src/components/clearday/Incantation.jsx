import React, { useEffect, useMemo, useRef, useState } from "react";
import { createLineAudio, playLine, stopNarration } from "../../lib/voiceOver.js";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, slamHeavy, buzzSuccess } from "../../lib/haptics.js";
import { sfxHalo, sfxPhoenix, sfxWaxSeal } from "../../lib/sfx.js";
import "../../styles/incantation.css";

/* ═══════════════════════════════════════════════════════════════
   THE INCANTATION — say it until you believe it.
   Three rounds, escalating AROUSAL not rep count (illusory-truth
   gains are logarithmic; slow full-sentence reps only — see
   CLEARDAY-3-RESEARCH.md §1):
     ASK      "Will you live this today?" — the user answers first
              (interrogative self-talk, Senay 2010)
     WHISPER  the voice models it low; you say it back quietly
     SPEAK    full voice, steady
     ROAR     on your feet, fist to chest, like you mean it
   Voice: ElevenLabs via the tts proxy → Pollinations → device
   synth → silent rhythm mode. Never blocks on audio.
   Props-driven so the app-wide Identity Builder can mount it too:
   persistence belongs to the CALLER (onComplete).
   ═══════════════════════════════════════════════════════════════ */

const ROUNDS = [
  { key: "whisper", label: "ROUND 1 · WHISPER", prompt: "Say it back. Quiet is fine — out loud is the rule.", btn: "SAID IT" },
  { key: "speak", label: "ROUND 2 · FULL VOICE", prompt: "Again — steady, like a fact.", btn: "SAID IT — FOR REAL" },
  { key: "roar", label: "ROUND 3 · ROAR", prompt: "On your feet. Fist to chest on the last word. Like you mean it.", btn: "SAID IT — LIKE I MEAN IT" },
];

function splitLines(statement) {
  const clean = String(statement || "").trim();
  if (!clean) return [];
  // split on sentence ends and long comma clauses; keep lines speakable
  const rough = clean.split(/(?<=[.!?])\s+/).flatMap((s) => {
    if (s.split(/\s+/).length <= 10) return [s];
    return s.split(/,\s+/).map((part, i, arr) => (i < arr.length - 1 ? `${part},` : part));
  });
  return rough.map((s) => s.trim()).filter(Boolean).slice(0, 6);
}

export default function Incantation({
  statement,
  extraLine = "",     // optional stand-of-the-day, spoken after the claim
  devotionLine = "",  // optional outward closer — "my clear life is for ___" (Brand Step 11)
  voiceId = "ePEc9tlhrIO7VRkiOlQN",
  palette = { accent: "#7fb4ff", tintRgb: "127, 180, 255" },
  settings,
  onComplete,
  onClose,
}) {
  const lines = useMemo(() => {
    const base = splitLines(statement);
    const extra = String(extraLine || "").trim();
    const devotion = String(devotionLine || "").trim();
    // keep the 6-line speakable cap; devotion always closes, last in
    const tail = [extra, devotion].filter(Boolean);
    return tail.length ? [...base.slice(0, 6 - tail.length), ...tail] : base;
  }, [statement, extraLine, devotionLine]);
  const [phase, setPhase] = useState("ask"); // ask | round | done
  const [round, setRound] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const audiosRef = useRef({});

  /* one audio element per line, reused across rounds */
  useEffect(() => {
    const map = {};
    lines.forEach((ln, i) => {
      map[i] = createLineAudio(ln, "onyx", null, { elevenVoiceId: voiceId });
    });
    audiosRef.current = map;
    return () => stopNarration(Object.values(map));
  }, [lines, voiceId]);

  const speakCurrent = (idx) => {
    try {
      playLine(audiosRef.current[idx], lines[idx], settings);
    } catch { /* voice is garnish */ }
  };

  /* the voice models each line as it appears */
  useEffect(() => {
    if (phase !== "round") return;
    speakCurrent(lineIdx);
    if (round === 2) cdFx.flare(palette.accent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, lineIdx]);

  const begin = () => {
    tapMedium();
    sfxHalo(settings);
    setPhase("round");
    setRound(0);
    setLineIdx(0);
  };

  const saidIt = () => {
    if (round === 0) tapLight();
    else if (round === 1) tapMedium();
    else slamHeavy();
    if (lineIdx + 1 < lines.length) {
      setLineIdx((i) => i + 1);
      return;
    }
    if (round + 1 < ROUNDS.length) {
      setRound((r) => r + 1);
      setLineIdx(0);
      return;
    }
    // finale
    stopNarration(Object.values(audiosRef.current));
    setPhase("done");
    sfxPhoenix(settings);
    sfxWaxSeal(settings);
    buzzSuccess();
    cdFx.sunrise(palette.accent);
    const W = typeof window !== "undefined" ? window.innerWidth : 390;
    const H = typeof window !== "undefined" ? window.innerHeight : 844;
    cdFx.burst(W / 2, H / 2, "petal", 26);
    if (onComplete) onComplete({ rounds: ROUNDS.length });
  };

  const close = () => {
    stopNarration(Object.values(audiosRef.current));
    if (onClose) onClose();
  };

  if (!lines.length) return null;
  const r = ROUNDS[round];

  return (
    <div
      className={`cd-incant ${phase === "round" ? `cd-incant--${r.key}` : `cd-incant--${phase}`}`}
      style={{ "--in-acc": palette.accent, "--in-tint": palette.tintRgb }}
      role="dialog"
      aria-modal="true"
      aria-label="The Incantation"
    >
      <button type="button" className="cd-incant-close" onClick={close} aria-label="Leave the incantation">✕</button>

      {phase === "ask" && (
        <div className="cd-incant-stage">
          <div className="cd-incant-eyebrow">THE INCANTATION</div>
          <h2 className="cd-incant-ask">Will you live this today?</h2>
          <div className="cd-incant-statement">“{statement}”</div>
          <p className="cd-incant-note">
            Three rounds, out loud. A whisper, a voice, a roar.
            Spoken words go deeper than read ones — this is how you make it retrievable at 11pm.
          </p>
          <button type="button" className="cd-incant-btn" onClick={begin}>YES — BEGIN</button>
        </div>
      )}

      {phase === "round" && (
        <div className="cd-incant-stage" key={`${round}-${lineIdx}`}>
          <div className="cd-incant-eyebrow">{r.label} · {lineIdx + 1}/{lines.length}</div>
          <div className="cd-incant-ring" aria-hidden="true" />
          <div className={`cd-incant-line cd-incant-line--${r.key}`}>{lines[lineIdx]}</div>
          <p className="cd-incant-note">{r.prompt}</p>
          <button type="button" className="cd-incant-btn" onClick={saidIt}>{r.btn}</button>
          <button type="button" className="cd-incant-replay" onClick={() => speakCurrent(lineIdx)}>▷ hear it again</button>
        </div>
      )}

      {phase === "done" && (
        <div className="cd-incant-stage">
          <div className="cd-incant-stamp">SAID UNTIL BELIEVED</div>
          <p className="cd-incant-note cd-incant-note--done">
            That wasn't a chant — it was a rehearsal. The next time the Mask talks,
            these are the words your own voice already knows.
          </p>
          <button type="button" className="cd-incant-btn" onClick={close}>SEALED →</button>
        </div>
      )}
    </div>
  );
}
