// FULL COURT · HYDRATION — press-and-hold the cup to fill it (handoff #9).
// Target: one cup per quarter (≈ one per hour on the standard schedule). Holds
// fill the cup percentage-wise; a full cup banks and the next one starts empty.
// Self-contained localStorage (fullcourt_hydration_v1), rolls over daily.
//
// The hold gesture mirrors MythBossFight's timer fill; the cup art is a light
// SVG that fills by a clipped <rect>, same idea as wellbeing/FillYourCup.
//
// Ownership: part of the FullCourt game. Styles live in FullCourt.css (fc-hydro-*).

import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "fullcourt_hydration_v1";
const FILL_MS = 1400; // hold this long (from empty) to finish a cup
const today = () => new Date().toLocaleDateString("en-CA");

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && raw.date === today()) return { cups: raw.cups | 0, pct: Math.max(0, Math.min(100, raw.pct || 0)) };
  } catch {
    /* fresh */
  }
  return { cups: 0, pct: 0 };
}
function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ date: today(), cups: state.cups, pct: state.pct }));
  } catch {
    /* storage optional */
  }
}

export default function HydrationCup({ target = 4, onCupDone }) {
  const [cups, setCups] = useState(0);
  const [pct, setPct] = useState(0);
  const holdRef = useRef({ timer: null, from: 0, start: 0 });
  const aliveRef = useRef(true);

  useEffect(() => {
    const s = load();
    setCups(s.cups);
    setPct(s.pct);
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      clearInterval(holdRef.current.timer);
    };
  }, []);

  // Persist whenever the banked values change.
  useEffect(() => {
    save({ cups, pct });
  }, [cups, pct]);

  const stopHold = useCallback(() => {
    clearInterval(holdRef.current.timer);
    holdRef.current.timer = null;
  }, []);

  const startHold = useCallback(() => {
    clearInterval(holdRef.current.timer);
    holdRef.current.from = pct;
    holdRef.current.start = Date.now();
    holdRef.current.timer = setInterval(() => {
      const gained = ((Date.now() - holdRef.current.start) / FILL_MS) * 100;
      const now = Math.min(100, holdRef.current.from + gained);
      if (now >= 100) {
        clearInterval(holdRef.current.timer);
        holdRef.current.timer = null;
        if (!aliveRef.current) return;
        setPct(0);
        setCups((c) => {
          const next = c + 1;
          try {
            if (navigator.vibrate) navigator.vibrate([25, 30, 25]);
          } catch {
            /* haptics optional */
          }
          onCupDone?.(next);
          return next;
        });
      } else {
        setPct(now);
      }
    }, 40);
  }, [pct, onCupDone]);

  const fillY = 34 - (26 * Math.min(pct, 100)) / 100; // cup interior 8..34
  const metTarget = cups >= target;

  return (
    <div className="fc-hydro" title="Hold to drink — one cup a quarter keeps the legs fresh">
      <button
        type="button"
        className={`fc-hydro__btn ${pct > 0 ? "fc-hydro__btn--filling" : ""}`}
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        aria-label={`Hydration: ${cups} of ${target} cups today. Press and hold to drink.`}
      >
        <svg viewBox="0 0 40 44" className="fc-hydro__cup" aria-hidden="true">
          <defs>
            <clipPath id="fc-hydro-clip">
              <path d="M9 8 H31 L28.5 38 A2 2 0 0 1 26.5 40 H13.5 A2 2 0 0 1 11.5 38 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#fc-hydro-clip)">
            <rect x="6" y={fillY} width="28" height={40 - fillY} className="fc-hydro__water" />
          </g>
          <path
            d="M9 8 H31 L28.5 38 A2 2 0 0 1 26.5 40 H13.5 A2 2 0 0 1 11.5 38 Z"
            className="fc-hydro__glass"
          />
          <line x1="8" y1="8" x2="32" y2="8" className="fc-hydro__rim" />
        </svg>
      </button>
      <div className="fc-hydro__meta">
        <span className={`fc-hydro__count ${metTarget ? "fc-hydro__count--met" : ""}`}>
          💧 {cups}/{target}
        </span>
        <span className="fc-hydro__lbl">{metTarget ? "hydrated" : "hold to drink"}</span>
      </div>
    </div>
  );
}
