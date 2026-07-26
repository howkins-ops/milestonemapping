import React, { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   THE SIGNATURE PAD — finger to glass.
   Lifted out of DailyContract so the re-ignition sheet signs with
   the exact same instrument: same ink gate, same quill scratch.
   Backfilling a day has to cost what the day itself cost, or the
   number stops meaning anything.
   Effortful-but-short signing, CLEARDAY-3-RESEARCH §2.
   ═══════════════════════════════════════════════════════════════ */

export const MIN_INK = 120; // px of cumulative stroke before SIGN unlocks

// Downsample the pad to a PNG dataURL. Returns null rather than throwing —
// the act matters more than the image.
export function readSignature(canvas) {
  try {
    if (!canvas) return null;
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.round(canvas.width / 2));
    off.height = Math.max(1, Math.round(canvas.height / 2));
    off.getContext("2d").drawImage(canvas, 0, 0, off.width, off.height);
    return off.toDataURL("image/png");
  } catch {
    return null;
  }
}

export default function SignaturePad({ onInkChange, clearSignal, padRef, onFirstStroke, tint = "#7fb4ff" }) {
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
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2.5 * dpr;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (padRef) padRef.current = canvas;
    return undefined;
  }, [padRef, tint]);

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
