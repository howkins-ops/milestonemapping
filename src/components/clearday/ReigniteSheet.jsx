import React, { useEffect, useRef, useState } from "react";
import { reigniteDay, markAshDay, dateForDay, reigniteDaysLeft, loadClearDay } from "./clearDayStore.js";
import SignaturePad, { MIN_INK, readSignature } from "./SignaturePad.jsx";
import cdFx from "./cdFx.js";
import { tapMedium, slamHeavy } from "../../lib/haptics.js";
import { sfxQuillScratch, sfxMatchStrike, sfxPop } from "../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   RE-IGNITE — going back for a day you never closed out.
   The mercy is real but bounded: seven days, then a gap freezes.
   A streak that can never be repaired is a bomb set for a bad day;
   one that repairs forever stops being worth anything.

   Signing a past day costs the same ink the day itself cost — that
   is the only thing keeping the number honest. The other door is
   always open and always free: honesty never asks for a signature
   (the same law the slip path already runs on).
   ═══════════════════════════════════════════════════════════════ */

const BLUE = "#00F0FF";

function pretty(date) {
  try {
    return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  } catch {
    return "that day";
  }
}

export default function ReigniteSheet({ day, settings, onRelit, onAllClear, onClose }) {
  const [ink, setInk] = useState(0);
  const [clearSignal, setClearSignal] = useState(0);
  const [confirmAsh, setConfirmAsh] = useState(false);
  const [busy, setBusy] = useState(false);
  const padRef = useRef(null);

  const S = loadClearDay();
  const date = dateForDay(S, day);
  const left = reigniteDaysLeft(S, day);

  /* a fresh day means a fresh pad */
  useEffect(() => {
    setInk(0);
    setConfirmAsh(false);
    setBusy(false);
    setClearSignal((n) => n + 1);
  }, [day]);

  const sign = () => {
    if (ink < MIN_INK || busy) return;
    setBusy(true);
    const sig = readSignature(padRef.current);
    const res = reigniteDay(day, sig);
    if (!res.relit) { setBusy(false); return; }
    sfxMatchStrike(settings);
    slamHeavy();
    cdFx.flare(BLUE);
    const W = window.innerWidth || 390;
    const H = window.innerHeight || 844;
    cdFx.burst(W / 2, H * 0.55, "ember", 14, BLUE);
    // Last gap closed → hand off to the ceremony. Otherwise keep going.
    setTimeout(() => {
      if (res.remaining === 0) onAllClear(res);
      else onRelit(res);
    }, 380);
  };

  const ash = () => {
    if (busy) return;
    setBusy(true);
    tapMedium();
    markAshDay(day);
    sfxPop(settings);
    setTimeout(() => onRelit({ relit: false, ashed: true }), 220);
  };

  return (
    <div className="cd-reignite" role="dialog" aria-modal="true" aria-label="Reclaim a day">
      <div className="cd-reignite-card">
        <div className="cd-reignite-kicker">RE-IGNITE</div>
        <div className="cd-reignite-date">{date ? pretty(date) : `Day ${day}`}</div>
        <div className="cd-reignite-day">
          Day {day} · {left <= 1 ? "last day to reclaim it" : `${left} days left to reclaim it`}
        </div>

        {!confirmAsh ? (
          <>
            <p className="cd-reignite-ask">
              You never closed this one out. Only you know what actually happened —
              so only you can say. <strong>If you stayed clear, it still counts.</strong> Sign for it
              the same way you'd have signed that night.
            </p>

            <div className="cd-reignite-sigline">Signed by the man who was there:</div>
            <SignaturePad
              onInkChange={setInk}
              clearSignal={clearSignal}
              padRef={padRef}
              onFirstStroke={() => sfxQuillScratch(settings)}
              tint={BLUE}
            />
            <div className="cd-reignite-row">
              <button type="button" className="cd-ghost" onClick={() => setClearSignal((n) => n + 1)}>clear</button>
              <button type="button" className="cd-reignite-btn" disabled={ink < MIN_INK || busy} onClick={sign}>
                {ink < MIN_INK ? "SIGN IT — FINGER TO GLASS" : `✦ RECLAIM DAY ${day}`}
              </button>
            </div>

            <button type="button" className="cd-reignite-ash" onClick={() => setConfirmAsh(true)}>
              I didn't stay clear that day — mark it honestly. No signature needed for the truth.
            </button>
          </>
        ) : (
          <>
            <div className="cd-reignite-warn">
              Marking it honestly makes it <strong>ash</strong> — permanent. The chain restarts after it,
              and this day can't be reclaimed later. That's not a punishment. It's the only
              thing that makes every other day on this calendar mean something.
            </div>
            <div className="cd-reignite-row">
              <button type="button" className="cd-ghost" onClick={() => setConfirmAsh(false)}>back</button>
              <button type="button" className="cd-reignite-btn" onClick={ash} disabled={busy}>
                MARK IT ASH
              </button>
            </div>
          </>
        )}

        <div className="cd-reignite-row">
          <button type="button" className="cd-ghost" onClick={onClose} style={{ width: "100%" }}>not now</button>
        </div>
      </div>
    </div>
  );
}
