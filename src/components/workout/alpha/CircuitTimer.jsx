import React, { useEffect, useRef, useState } from "react";
import { sfxRoundBell } from "../../../lib/sfx.js";

/* ALPHA MODE — session clocks.
   RestRing: a conic countdown between sets/rounds (auto-runs, bell at 0).
   BlockClock: a fixed working clock for density/AMRAP blocks. */

export function RestRing({ seconds, label = "rest", onDone, onSkip, settings, accent }) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(Date.now() + seconds * 1000);
  useEffect(() => {
    endRef.current = Date.now() + seconds * 1000;
    setLeft(seconds);
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setLeft(rem);
      if (rem <= 0) {
        clearInterval(iv);
        sfxRoundBell(settings);
        try { if (navigator.vibrate) navigator.vibrate([60, 80, 60]); } catch { /* silent */ }
        onDone();
      }
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);
  const frac = seconds > 0 ? left / seconds : 0;
  return (
    <div className="iw-rest">
      <div className="iw-rest-ring" style={{ "--iw-frac": frac, ...(accent ? { "--iw-al-accent": accent } : {}) }}>
        <span className="iw-rest-num">{left}</span>
        <span className="iw-rest-unit">{label}</span>
      </div>
      <button className="iw-btn-ghost" onClick={onSkip}>skip — back under the bar</button>
    </div>
  );
}

export function BlockClock({ seconds, running, onExpire, label = "block clock" }) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(null);
  useEffect(() => {
    if (!running) return undefined;
    endRef.current = Date.now() + left * 1000;
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setLeft(rem);
      if (rem <= 0) {
        clearInterval(iv);
        onExpire();
      }
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  useEffect(() => { if (!running) setLeft(seconds); /* eslint-disable-next-line */ }, [seconds]);
  const m = Math.floor(left / 60), s = String(left % 60).padStart(2, "0");
  const frac = seconds > 0 ? left / seconds : 0;
  return (
    <div className={`iw-al-blockclock ${left <= 10 && running ? "iw-al-bc-hot" : ""}`}>
      <span className="iw-eyebrow">{label}</span>
      <span className="iw-al-bc-time">{m}:{s}</span>
      <div className="iw-al-bc-bar"><div className="iw-al-bc-fill" style={{ width: `${frac * 100}%` }} /></div>
    </div>
  );
}
