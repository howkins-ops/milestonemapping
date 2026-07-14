import React, { useEffect, useRef, useState } from "react";
import { signDailyContract, localDateString } from "./clearDayStore.js";
import { TRACK_META } from "./clearDayData.js";
import cdFx from "./cdFx.js";
import { slamHeavy } from "../../lib/haptics.js";
import { sfxWaxSeal, sfxQuillScratch } from "../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE DAILY CONTRACT — the ritual's finale.
   One day. Named behaviors. One if-then. A real signature.
   Design rules from CLEARDAY-3-RESEARCH.md §2:
   today-only scope (Bandura proximal goals · Marlatt AVE), the
   specific Laws on the page (Zickfeld oath megastudy), one
   implementation intention (Gollwitzer d≈0.65), identity-framed
   signature line (Kettle & Häubl), effortful-but-short signing,
   and the slip path never requires a signature — honesty is free.
   ═══════════════════════════════════════════════════════════════ */

const MIN_INK = 120; // px of cumulative stroke before SIGN unlocks

function SignaturePad({ onInkChange, clearSignal, padRef, onFirstStroke }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const inkRef = useRef(0);
  const scratched = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#7fb4ff";
    ctx.lineWidth = 2.5 * dpr;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (padRef) padRef.current = canvas;
    return undefined;
  }, [padRef]);

  /* parent asks for a wipe */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !clearSignal) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    inkRef.current = 0;
    scratched.current = false;
    onInkChange(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSignal]);

  const pos = (e) => {
    const canvas = canvasRef.current;
    const r = canvas.getBoundingClientRect();
    const dpr = canvas.width / r.width;
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
  };

  const down = (e) => {
    drawing.current = true;
    last.current = pos(e);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* fine */ }
    if (!scratched.current) { scratched.current = true; if (onFirstStroke) onFirstStroke(); }
  };
  const move = (e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const p = pos(e);
    const l = last.current;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    const dpr = canvas.width / canvas.getBoundingClientRect().width;
    inkRef.current += Math.hypot(p.x - l.x, p.y - l.y) / dpr;
    last.current = p;
    onInkChange(inkRef.current);
  };
  const up = () => { drawing.current = false; last.current = null; };

  return (
    <canvas
      ref={canvasRef}
      className="cd-sigpad"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      aria-label="Sign here with your finger"
    />
  );
}

export default function DailyContract({ S, day, settings, addXPSafe, xpAmount, onSigned, onSlipPath }) {
  const [ink, setInk] = useState(0);
  const [clearSignal, setClearSignal] = useState(0);
  const [sealing, setSealing] = useState(false);
  const padRef = useRef(null);
  const closed = Boolean(S.closedDays[day]);
  const contract = S.contracts && S.contracts[day];

  const prettyDate = (() => {
    try {
      return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    } catch {
      return localDateString();
    }
  })();

  if (closed || contract) {
    return (
      <div className="cd-contract cd-contract--sealed">
        <div className="cd-contract-seal-mini" aria-hidden="true">✦</div>
        <div className="cd-contract-ledgerline">
          {S.closedDays[day] === "slip"
            ? `Day ${day} logged honestly — no signature needed for the truth. Today's contract closed; tomorrow's is blank.`
            : `Day ${day} — signed & sealed. One clear day, banked forever.`}
        </div>
      </div>
    );
  }

  const sign = () => {
    if (ink < MIN_INK || sealing) return;
    setSealing(true);
    let sig = null;
    try {
      const canvas = padRef.current;
      if (canvas) {
        const off = document.createElement("canvas");
        off.width = Math.max(1, Math.round(canvas.width / 2));
        off.height = Math.max(1, Math.round(canvas.height / 2));
        off.getContext("2d").drawImage(canvas, 0, 0, off.width, off.height);
        sig = off.toDataURL("image/png");
      }
    } catch { /* the act matters more than the image */ }
    const { firstTime } = signDailyContract(sig);
    if (firstTime && addXPSafe) addXPSafe(xpAmount, "CLEARDAY contract");
    sfxWaxSeal(settings);
    slamHeavy();
    cdFx.flare("#ffc46b");
    const W = window.innerWidth || 390;
    const H = window.innerHeight || 844;
    cdFx.burst(W / 2, H * 0.6, "ember", 16, "#ffc46b");
    if (onSigned) setTimeout(onSigned, 350);
  };

  return (
    <div className={`cd-contract ${sealing ? "cd-contract--sealing" : ""}`}>
      <div className="cd-contract-head">
        <span className="cd-contract-title">THE DAY CONTRACT</span>
        <span className="cd-contract-date">DAY {day} · {prettyDate}</span>
      </div>

      <p className="cd-contract-line">
        Today — sunrise to sleep — I stay clear. <strong>Just today.</strong> Tomorrow signs its own contract.
      </p>

      {S.tracks.map((t) => (
        <div key={t} className="cd-contract-law" style={{ color: TRACK_META[t].color, borderColor: `${TRACK_META[t].color}44` }}>
          {S.laws[t] || TRACK_META[t].lawHint}
        </div>
      ))}

      <p className="cd-contract-ifthen">
        <strong>If an urge hits,</strong> then I open the Urge Battle before I do anything else.
      </p>

      <div className="cd-contract-sigline">Signed by the man I'm becoming:</div>
      <SignaturePad onInkChange={setInk} clearSignal={clearSignal} padRef={padRef} onFirstStroke={() => sfxQuillScratch(settings)} />
      <div className="cd-contract-sigrow">
        <button type="button" className="cd-ghost" onClick={() => setClearSignal((n) => n + 1)}>clear</button>
        <button type="button" className="cd-btn cd-contract-signbtn" disabled={ink < MIN_INK} onClick={sign}>
          {ink < MIN_INK ? "SIGN IT — FINGER TO GLASS" : "✦ SEAL DAY " + day}
        </button>
      </div>

      {sealing && (
        <div className="cd-seal-wax" aria-hidden="true">
          <span className="cd-seal-wax-sun">☀</span>
        </div>
      )}

      <button type="button" className="cd-slip-link" onClick={onSlipPath}>
        It slipped — no signature needed. The comeback is on Today.
      </button>
    </div>
  );
}
