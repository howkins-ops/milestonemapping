// CoachingBreak — the end-of-quarter experience carried over verbatim from Full
// Court (the thing Jon loves). Two phases:
//   1. buzzer takeover — the game's READ (won / rough / slump), locker-room
//      length (60/120), and RESET / HYPE ME UP; the ANNOUNCER (Andrew) calls the
//      quarter over the top.
//   2. locker room — a countdown ring with the baked COACH break track (RESET =
//      calm guided visualization, HYPE = the coach) + its music bed.
//
// Fully self-contained: it owns its own audio + timer and reuses the pure app
// modules (fullCourtBreakScript / fullCourtVoice / voiceOver / sfx). Host mounts
// it at each quarter end (quarters 1–3) and after Q4 with isFinal; onDone() hands
// control back to advance the quarter (or show the final screen).
import { useCallback, useEffect, useRef, useState } from "react";
import {
  pickBreakTrack,
  breakTrackAudio,
  breakTrackSpokenText,
  BREAK_BEDS,
} from "../../../../data/fullCourtBreakScript.js";
import { ANNOUNCER } from "../../../../data/fullCourtVoice.js";
import { createLineAudio, playLine, stopNarration } from "../../../../lib/voiceOver.js";
import {
  sfxBuzzer,
  sfxCalmPadLoop,
  sfxCrowdLoop,
  sfxCrowdRoar,
  playArenaStinger,
  playCrowdSample,
  stopCrowd,
} from "../../../../lib/sfx.js";
import { crowdAudioPath, pickCheer } from "../../../../data/fullCourtCrowd.js";
import "./CoachingBreak.css";

const QUARTER_ENDS = { 1: "END OF THE 1ST", 2: "HALFTIME", 3: "END OF THE 3RD", 4: "FINAL BUZZER" };
const READS = [
  { key: "won", glyph: "🔥", label: "Won it", sub: "sale landed — quarter's yours" },
  { key: "rough", glyph: "😤", label: "Fought hard", sub: "the doors fought back" },
  { key: "slump", glyph: "🛋️", label: "Court saw you hiding", sub: "the numbers don't lie" },
];
const BREAK_LENS = [60, 120];
const RESET_FALLBACK_VOICE = "shimmer";
const HYPE_FALLBACK_VOICE = "onyx";
const fmtClock = (s) => {
  const n = Math.max(0, s);
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
};

// The announcer's live line, built from this quarter's numbers (Andrew streams it).
function recapText(quarter, statLine) {
  const doors = statLine?.doors ?? 0;
  const sales = statLine?.sales ?? 0;
  const pts = statLine?.score ?? 0;
  const which =
    quarter === 1 ? "the first quarter" : quarter === 2 ? "the first half" : quarter === 3 ? "the third" : "regulation";
  return `That's the end of ${which}. ${doors} ${doors === 1 ? "door" : "doors"} worked, ${sales} ${
    sales === 1 ? "sale" : "sales"
  } on the board — ${pts} points this quarter. Now back to work.`;
}

export default function CoachingBreak({ quarter = 1, read: initialRead = "rough", statLine, isFinal = false, settings, onDone }) {
  const isHalf = quarter === 2;
  const [phase, setPhase] = useState("buzzer"); // buzzer | break
  const [read, setRead] = useState(initialRead === "won" || initialRead === "slump" ? initialRead : "rough");
  const [breakLen, setBreakLen] = useState(isHalf ? 120 : 60);
  const [brk, setBrk] = useState(null); // { flavor, secs, endsAt, track }
  const [brkClock, setBrkClock] = useState(0);
  const aliveRef = useRef(true);
  const doneRef = useRef(false);
  const voiceRef = useRef(null); // announcer line
  const bedRef = useRef(null); // break music bed <audio>
  const loopRef = useRef(null); // WebAudio fallback loop handle
  const brkVoiceRef = useRef(null); // baked coach break track

  const stopAllAudio = useCallback(() => {
    try { stopNarration([voiceRef.current, brkVoiceRef.current]); } catch (e) { /* silent */ }
    voiceRef.current = null;
    brkVoiceRef.current = null;
    try { bedRef.current?.pause(); } catch (e) { /* silent */ }
    bedRef.current = null;
    try { loopRef.current?.stop(); } catch (e) { /* silent */ }
    loopRef.current = null;
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopAllAudio();
    onDone?.();
  }, [stopAllAudio, onDone]);

  // Buzzer entrance: horn + whistle + a ducked crowd cheer, then Andrew's recap.
  useEffect(() => {
    aliveRef.current = true;
    try {
      sfxBuzzer(settings);
      playArenaStinger(crowdAudioPath("stinger-whistle"), { settings, fallback: sfxCrowdRoar });
      const c = pickCheer();
      if (c) playCrowdSample(crowdAudioPath(c.id), { settings, volume: 0.7, fallback: sfxCrowdRoar });
    } catch (e) { /* audio never blocks */ }
    const text = recapText(quarter, statLine);
    const audio = createLineAudio(text, ANNOUNCER.voice, null, { elevenVoiceId: ANNOUNCER.elevenId });
    voiceRef.current = audio;
    const t = setTimeout(() => {
      if (aliveRef.current && voiceRef.current === audio) playLine(audio, text, settings);
    }, 850);
    return () => {
      aliveRef.current = false;
      clearTimeout(t);
      stopAllAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startBreak = useCallback(
    (flavor) => {
      try { stopNarration([voiceRef.current]); } catch (e) { /* silent */ }
      voiceRef.current = null;
      try { stopCrowd(); } catch (e) { /* silent */ }
      const secs = breakLen;
      const track = pickBreakTrack(flavor, read, secs);
      setBrk({ flavor, secs, endsAt: Date.now() + secs * 1000, track });
      setBrkClock(secs);
      setPhase("break");
      // music bed: baked Eleven Music mp3 first, WebAudio loop as the fallback.
      if (settings?.soundEnabled !== false) {
        const startLoop = () => {
          try { loopRef.current = flavor === "hype" ? sfxCrowdLoop(settings) : sfxCalmPadLoop(settings); } catch (e) { /* silent */ }
        };
        try {
          const bed = new Audio(BREAK_BEDS[flavor]);
          bed.loop = true;
          bed.volume = flavor === "hype" ? 0.26 : 0.2;
          bed.onerror = startLoop;
          bedRef.current = bed;
          bed.play().catch(startLoop);
        } catch (e) {
          startLoop();
        }
      }
      // coach voice: baked break track → streamed → device synth.
      if (track) {
        const text = breakTrackSpokenText(track);
        const fallbackVoice = flavor === "hype" ? HYPE_FALLBACK_VOICE : RESET_FALLBACK_VOICE;
        const audio = createLineAudio(text, fallbackVoice, breakTrackAudio(track.id));
        brkVoiceRef.current = audio;
        setTimeout(() => {
          if (aliveRef.current && brkVoiceRef.current === audio) playLine(audio, text, settings);
        }, 700);
      }
    },
    [breakLen, read, settings]
  );

  // Locker-room countdown → auto tip-off (onDone).
  useEffect(() => {
    if (phase !== "break" || !brk) return undefined;
    const tick = () => setBrkClock(Math.max(0, Math.ceil((brk.endsAt - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [phase, brk]);
  useEffect(() => {
    if (phase === "break" && brk && brkClock === 0) finish();
  }, [phase, brk, brkClock, finish]);

  // Locker-room caption: the last cue whose timestamp has passed.
  let caption = null;
  if (phase === "break" && brk?.track) {
    const elapsed = brk.secs - brkClock;
    for (const c of brk.track.captions || []) {
      if (c.at <= elapsed) caption = c.text;
      else break;
    }
  }
  const brkFrac = phase === "break" && brk?.secs ? brkClock / brk.secs : 0;

  /* ---------------- buzzer takeover ---------------- */
  if (phase === "buzzer") {
    return (
      <div className="fc-cine" role="dialog" aria-modal="true" aria-label="End of quarter">
        <div className="fc-cine__glow" aria-hidden="true" />
        <div className="fc-cine__inner">
          <div className="fc-cine__siren" aria-hidden="true">🚨</div>
          <div className="fc-cine__label">{QUARTER_ENDS[quarter] || "END OF THE QUARTER"}</div>
          <div className="fc-cine__score">{statLine?.score ?? 0}</div>
          <div className="fc-cine__stat">
            {statLine?.doors ?? 0} doors · {statLine?.sales ?? 0}{" "}
            {(statLine?.sales ?? 0) === 1 ? "sale" : "sales"} this quarter
            {(statLine?.sales ?? 0) > 0 && <span className="fc-cine__won"> · ✓ QUARTER WON</span>}
          </div>

          {isFinal ? (
            <button
              type="button"
              className="fc-flavor fc-flavor--hype"
              style={{ marginTop: 20, width: "100%" }}
              onClick={finish}
            >
              <span className="fc-flavor__glyph">🏆</span>
              SEE FINAL
              <small>your box score + records</small>
            </button>
          ) : (
            <>
              <div className="fc-cine__readlbl">The game's read — tap to correct it:</div>
              <div className="fc-cine__reads">
                {READS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className={`fc-read ${read === r.key ? "fc-read--on" : ""}`}
                    onClick={() => setRead(r.key)}
                  >
                    <span className="fc-read__glyph">{r.glyph}</span>
                    {r.label}
                    <small>{r.sub}</small>
                  </button>
                ))}
              </div>
              <div className="fc-cine__lenrow">
                <span className="fc-cine__lenlbl">Locker room:</span>
                {BREAK_LENS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    className={`fc-len ${breakLen === len ? "fc-len--on" : ""}`}
                    onClick={() => setBreakLen(len)}
                  >
                    {fmtClock(len)}
                  </button>
                ))}
              </div>
              <div className="fc-cine__flavors">
                <button type="button" className="fc-flavor fc-flavor--reset" onClick={() => startBreak("reset")}>
                  <span className="fc-flavor__glyph">🧘</span>
                  RESET
                  <small>guided visualization · calm voice</small>
                </button>
                <button type="button" className="fc-flavor fc-flavor--hype" onClick={() => startBreak("hype")}>
                  <span className="fc-flavor__glyph">📣</span>
                  HYPE ME UP
                  <small>the coach has words for you</small>
                </button>
              </div>
              <button type="button" className="fc-cine__skip" onClick={finish}>
                Skip the break — straight back on the court →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- locker room ---------------- */
  return (
    <div
      className={`fc-locker fc-locker--${brk?.flavor || "reset"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Locker room break"
    >
      <div className="fc-locker__inner">
        <p className="fc-locker__eyebrow">
          {isHalf ? "HALFTIME" : "TIMEOUT"} · {brk?.flavor === "hype" ? "the coach is talking" : "locker room reset"}
        </p>
        <div className="fc-locker__ringwrap" aria-hidden="true">
          <svg className="fc-locker__ring" viewBox="0 0 120 120">
            <circle className="fc-locker__ringbg" cx="60" cy="60" r="54" />
            <circle
              className="fc-locker__ringfg"
              cx="60"
              cy="60"
              r="54"
              strokeDasharray={`${Math.max(0, brkFrac) * 339.3} 339.3`}
            />
          </svg>
          {brk?.flavor === "reset" ? (
            <div className="fc-locker__orb" aria-hidden="true" />
          ) : (
            <div className="fc-locker__pulse" aria-hidden="true">📣</div>
          )}
          <div className="fc-locker__count">{fmtClock(brkClock)}</div>
        </div>
        <p key={caption || "•"} className="fc-locker__caption">
          {caption || (brk?.flavor === "hype" ? "Coach is coming in…" : "Settle in…")}
        </p>
        <button type="button" className="fc-locker__skip" onClick={finish}>
          Back on the court →
        </button>
      </div>
    </div>
  );
}
