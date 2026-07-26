import React, { useEffect, useRef, useState } from "react";
import { GateWall, Callbox, GuardBooth, Flashlight } from "./GateArt.jsx";
import { GameIcon } from "./GameIcons.jsx";
import {
  sfxBuzzer, sfxBlock, sfxWhoosh, sfxLandThud, sfxZap, sfxHorn,
  sfxGateBuzzer, sfxFenceRattle, sfxFlashlightClick, sfxKnuckleSplit,
  playVoiceLine,
} from "../../../lib/sfx.js";
import { tapLight, slamHeavy } from "../../../lib/haptics.js";

/* ════════════════════════════════════════════════════════════════════════
   THE BREACH — Level 3, round 1.

   Used to be a cine card ("There's a wall. A gate. You climbed all three")
   over the same wooden door. Now it's three real beats:

     1 · BUZZ   — work the callbox. Residents hang up on you.
     2 · SHAKE  — grab the mesh and rattle it. The chain jumps.
     3 · CLIMB  — alternate hands up the diamonds. Barbed wire at the top
                  opens your knuckles, so you arrive at Harold's door
                  ALREADY bleeding.

   And the whole time a security flashlight sweeps the street. Caught on the
   fence and you come off it. Three catches and the guard gets out of the
   cart. So you climb in the dark between passes — that timing is the beat.

   The sweep is driven in JS (not CSS) so "am I in the beam" is exact rather
   than guessed from an animation clock.
   ════════════════════════════════════════════════════════════════════════ */

const SWEEP_MS = 5200;          // one full there-and-back pass
const BEAM_HALF = 13;           // degrees either side of centre that count as caught
const BUZZES = 7;
const SHAKES = 10;
const CLIMB_RUNGS = 12;
const CATCHES_TO_GUARD = 3;

export default function GateRound({ fx, lines, onProgress, onBleed, onDone, onGuard }) {
  const [beat, setBeat] = useState(0);            // 0 buzz · 1 shake · 2 climb
  const [buzzes, setBuzzes] = useState(0);
  const [shakes, setShakes] = useState(0);
  const [rung, setRung] = useState(0);
  const [side, setSide] = useState("l");
  const [pressed, setPressed] = useState(-1);
  const [talking, setTalking] = useState(false);
  const [caught, setCaught] = useState(false);
  const [catches, setCatches] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [note, setNote] = useState(null);

  const torchRef = useRef(null);
  const wallRef = useRef(null);
  const angRef = useRef(0);
  const beatRef = useRef(0);
  const rungRef = useRef(0);
  const catchesRef = useRef(0);
  const lockRef = useRef(false);                  // brief immunity after a catch
  const shakeTimer = useRef(0);

  beatRef.current = beat;
  rungRef.current = rung;

  /* ── the sweep ───────────────────────────────────────────────────────── */
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const speed = 1 + catches * 0.35;             // he gets more thorough
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const phase = (((t - t0) * speed) % SWEEP_MS) / SWEEP_MS;
      // triangle wave: -34° → 38° → -34°
      const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      const a = -34 + tri * 72;
      angRef.current = a;
      if (torchRef.current) torchRef.current.style.setProperty("--torch-a", `${a.toFixed(2)}deg`);

      // caught? only matters while you're on the fence
      if (beatRef.current === 2 && !lockRef.current && Math.abs(a) < BEAM_HALF) getCaught();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catches]);

  const getCaught = () => {
    lockRef.current = true;
    const n = catchesRef.current + 1;
    catchesRef.current = n;
    setCatches(n);
    setCaught(true);
    sfxFlashlightClick(); sfxBuzzer(); sfxZap();
    slamHeavy();
    try { if (navigator.vibrate) navigator.vibrate([30, 60, 30]); } catch { /* no haptics */ }
    if (fx) { fx.shake(0.7); fx.flash("#fff2c0", 220, { alpha: 0.55 }); fx.hitStop(90); }

    // you come off the fence
    const lost = Math.max(0, rungRef.current - 4);
    setRung(lost);
    rungRef.current = lost;

    if (n >= CATCHES_TO_GUARD) {
      setNote("HE'S OUT OF THE CART.");
      sfxHorn(1);
      window.setTimeout(() => onGuard && onGuard(), 1100);
      return;
    }
    setNote(`SPOTTED — ${CATCHES_TO_GUARD - n} more and he comes over`);
    window.setTimeout(() => { setCaught(false); setNote(null); lockRef.current = false; }, 1400);
  };

  /* ── beat 1 · buzz the callbox ───────────────────────────────────────── */
  const buzz = () => {
    if (beat !== 0) return;
    const key = (Math.random() * 12) | 0;
    setPressed(key);
    window.setTimeout(() => setPressed(-1), 110);
    sfxGateBuzzer();
    tapLight();
    const n = buzzes + 1;
    setBuzzes(n);
    onProgress(1);
    if (fx) fx.shake(0.08);

    // somebody picks up, realises who it is, and hangs up
    if (n % 2 === 0) {
      setTalking(true);
      sfxBlock();
      window.setTimeout(() => setTalking(false), 700);
      if (lines && lines.length) {
        const l = lines[(n / 2 - 1) % lines.length];
        playVoiceLine(l.id, { volume: 0.9 });
      }
    }
    if (n >= BUZZES) {
      setNote("Nobody's buzzing you in. Grab the fence.");
      window.setTimeout(() => { setBeat(1); setNote(null); }, 1100);
    }
  };

  /* ── beat 2 · shake the gate ─────────────────────────────────────────── */
  const shakeOn = () => {
    if (beat !== 1) return;
    setShaking(true);
    sfxWhoosh();
    shakeTimer.current = window.setInterval(() => {
      setShakes((s) => {
        const n = s + 1;
        onProgress(1);
        sfxFenceRattle();
        tapLight();
        if (fx) fx.shake(0.16);
        if (n >= SHAKES) {
          window.clearInterval(shakeTimer.current);
          setShaking(false);
          setNote("It's not opening. Go over it.");
          window.setTimeout(() => { setBeat(2); setNote(null); }, 1100);
        }
        return n;
      });
    }, 190);
  };
  const shakeOff = () => {
    setShaking(false);
    window.clearInterval(shakeTimer.current);
  };
  useEffect(() => () => window.clearInterval(shakeTimer.current), []);

  /* ── beat 3 · climb ──────────────────────────────────────────────────── */
  const grab = (hand) => {
    if (beat !== 2 || caught) return;
    if (hand !== side) { sfxBlock(); setNote("Other hand."); window.setTimeout(() => setNote(null), 500); return; }
    const n = rung + 1;
    setRung(n);
    rungRef.current = n;
    setSide(hand === "l" ? "r" : "l");
    onProgress(1.2);
    sfxFenceRattle();
    tapLight();
    if (fx) fx.shake(0.1);

    // the barbed wire at the top opens your knuckles
    if (n >= CLIMB_RUNGS - 3) {
      onBleed(1);
      sfxKnuckleSplit();
      if (fx) {
        const s = fx.size;
        const x = s.w * (hand === "l" ? 0.34 : 0.66);
        const y = s.h * 0.3;
        fx.emit("blood", x, y, { normal: -Math.PI / 2, power: 1.2 });
        fx.decal("blood", x, y, { normal: -Math.PI / 2, power: 1 });
      }
    }

    if (n >= CLIMB_RUNGS) {
      // over the top, drop, land
      setNote("OVER.");
      sfxWhoosh();
      window.setTimeout(() => {
        sfxLandThud(0.8);
        slamHeavy();
        if (fx) {
          const s = fx.size;
          fx.shake(0.55);
          fx.emit("dust", s.w * 0.5, s.h * 0.86, { count: 16, power: 1.4, spread: 2.7 });
        }
        onDone();
      }, 620);
    }
  };

  const climbPct = Math.min(1, rung / CLIMB_RUNGS);

  return (
    <>
      <GuardBooth alert={catches > 0} />
      <div className="dgg-torchwrap" ref={torchRef}>
        <Flashlight sweeping={false} caught={caught} />
      </div>

      <GateWall ref={wallRef} climbed={climbPct} shake={shaking ? 1 : 0} />
      <Callbox pressed={pressed} talking={talking} />

      <div className="dgg-beat">
        {beat === 0 && <><GameIcon name="gate" size={13} /> BUZZ EVERY UNIT · {buzzes}/{BUZZES}</>}
        {beat === 1 && <><GameIcon name="gate" size={13} /> SHAKE IT · {shakes}/{SHAKES}</>}
        {beat === 2 && <><GameIcon name="blood" size={13} /> CLIMB · {rung}/{CLIMB_RUNGS} · MIND THE LIGHT</>}
      </div>

      {note && <div className="dgg-caught" key={note}>{note}</div>}

      {beat === 0 && (
        <button className="dgg-callbtn" onPointerDown={buzz}>
          <GameIcon name="bell" size={16} /> BUZZ
        </button>
      )}
      {beat === 1 && (
        <button
          className="dgg-callbtn"
          onPointerDown={shakeOn}
          onPointerUp={shakeOff}
          onPointerLeave={shakeOff}
          onPointerCancel={shakeOff}
        >
          <GameIcon name="gate" size={16} /> HOLD TO SHAKE
        </button>
      )}

      {/* the climb ladder — alternating hands, inside the scene so the
          flashlight pressure and the buttons read as one thing */}
      {beat === 2 && (
        <div className="dgg-climbctl">
          <button
            className={`dgg-climbbtn ${side === "l" ? "is-next" : ""}`}
            onPointerDown={() => grab("l")}
            disabled={caught}
          >
            LEFT HAND<small>GRAB</small>
          </button>
          <button
            className={`dgg-climbbtn ${side === "r" ? "is-next" : ""}`}
            onPointerDown={() => grab("r")}
            disabled={caught}
          >
            RIGHT HAND<small>GRAB</small>
          </button>
        </div>
      )}
    </>
  );
}
