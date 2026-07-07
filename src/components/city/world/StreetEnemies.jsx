import React, { useEffect, useRef, useState } from "react";
import ClownSprite from "./ClownSprite.jsx";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — street enemies (the comedy layer)
// HATERS and NAYSAYERS waddle-patrol the street as loud SVG clowns. They
// can't hurt you (no-fail law) — but jump and land on one and it squashes
// flat with a WebAudio honk, a floating trash-talk-reversal quip, and a
// Mario bounce so you can chain onto the next clown. They respawn after a
// while because haters always come back.
//
// Perf: patrol is pure CSS animation (zero JS while walking). The ONLY
// JS work is a rect check per enemy per frame WHILE THE PLAYER IS
// AIRBORNE (~0.7s per jump), wired in via airFrameRef from the engine.
// On stomp the walker's animated transform is frozen inline so the
// squash plays exactly where the clown stood.
// ════════════════════════════════════════════════════════════════════════

const QUIPS = {
  hater: [
    "HATER: HANDLED",
    "OPINION DELETED",
    "BLOCKED. IN REAL LIFE.",
    "WHO ASKED?",
    "HATE FLATTENED",
  ],
  naysayer: [
    "“IT'LL NEVER WORK” — IT WORKED",
    "DOUBT: SQUASHED",
    "NAY. SAY. LESS.",
    "FORECAST: WRONG",
    "NO? ...NO.",
  ],
};

const RESPAWN_MS = 26000; // haters always come back
const QUIP_MS = 1000;

export default function StreetEnemies({
  enemies,
  charRef,
  airFrameRef,
  onBounce,
  onStomp,
}) {
  const [dead, setDead] = useState({});
  const [quips, setQuips] = useState({});
  const nodes = useRef(new Map());
  const deadRef = useRef(dead);
  deadRef.current = dead;
  const timers = useRef([]);
  const audioRef = useRef(null);

  // Latest callbacks without re-binding the collision hook.
  const cbRef = useRef({});
  cbRef.current = { onBounce, onStomp };

  // Clown horn — tiny WebAudio honk-honk, no assets (FullCourt pattern).
  const honk = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const beep = (t0, f0, f1, dur) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "square";
        o.frequency.setValueAtTime(f0, t0);
        o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t0);
        o.stop(t0 + dur + 0.02);
      };
      const t = ctx.currentTime;
      beep(t, 340, 190, 0.16);
      beep(t + 0.14, 300, 155, 0.22);
    } catch {
      /* sound is garnish */
    }
  };

  const stompRef = useRef(null);
  stompRef.current = (e, walker) => {
    // Freeze the patrol mid-stride so the squash plays in place.
    try {
      const t = getComputedStyle(walker).transform;
      walker.style.transform = t && t !== "none" ? t : "";
    } catch {
      /* squash plays at the anchor instead — still funny */
    }
    // Quip floats above wherever the clown actually stood — and the juice
    // layer wants the same spot in world coords (px from world left, px
    // above the street line).
    let quipLeft = 28;
    let stompPos = null;
    const anchor = walker.parentElement;
    if (anchor) {
      const ar = anchor.getBoundingClientRect();
      const wr = walker.getBoundingClientRect();
      quipLeft = Math.round(wr.left - ar.left + wr.width / 2);
      const main = walker.closest(".mqw-main");
      if (main) {
        const mr = main.getBoundingClientRect();
        stompPos = {
          x: Math.round(wr.left - mr.left + wr.width / 2),
          y: Math.round(mr.bottom - (wr.top + wr.height / 2) - mr.height * 0.12),
        };
      }
    }
    const pool = QUIPS[e.kind] || QUIPS.hater;
    const text = pool[Math.floor(Math.random() * pool.length)];

    setDead((d) => ({ ...d, [e.id]: true }));
    setQuips((q) => ({ ...q, [e.id]: { text, left: quipLeft } }));
    honk();
    if (cbRef.current.onBounce) cbRef.current.onBounce();
    if (cbRef.current.onStomp) cbRef.current.onStomp(e.kind, stompPos);

    timers.current.push(
      setTimeout(() => {
        setQuips((q) => {
          const next = { ...q };
          delete next[e.id];
          return next;
        });
      }, QUIP_MS)
    );
    timers.current.push(
      setTimeout(() => {
        walker.style.transform = "";
        setDead((d) => {
          const next = { ...d };
          delete next[e.id];
          return next;
        });
      }, RESPAWN_MS)
    );
  };

  // Collision hook — the engine calls this each airborne frame.
  useEffect(() => {
    if (!airFrameRef) return undefined;
    airFrameRef.current = (y, vy) => {
      if (vy > 120) return; // still rising — stomps only count on the way down
      const charEl = charRef.current;
      if (!charEl) return;
      const pr = charEl.getBoundingClientRect();
      const px = pr.left + pr.width / 2;
      for (const e of enemies) {
        if (deadRef.current[e.id]) continue;
        const walker = nodes.current.get(e.id);
        if (!walker) continue;
        const er = walker.getBoundingClientRect();
        if (px < er.left - 6 || px > er.right + 6) continue;
        if (pr.bottom < er.top - 8 || pr.bottom > er.top + er.height * 0.62)
          continue;
        stompRef.current(e, walker);
      }
    };
    return () => {
      airFrameRef.current = null;
    };
  }, [enemies, airFrameRef, charRef]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const setNode = (id) => (el) => {
    if (el) nodes.current.set(id, el);
    else nodes.current.delete(id);
  };

  return (
    <>
      {enemies.map((e) => {
        const isDead = Boolean(dead[e.id]);
        const quip = quips[e.id];
        return (
          <div
            key={e.id}
            className={`mqw-enemy mqw-enemy--${e.kind}${isDead ? " is-dead" : ""}`}
            style={{
              left: e.x - 28,
              "--patrol": `${e.patrol || 80}px`,
              "--pdur": `${e.dur || 4.6}s`,
            }}
            aria-hidden="true"
          >
            <div className="mqw-enemy__walker" ref={setNode(e.id)}>
              <div className="mqw-enemy__face">
                <div className="mqw-enemy__body">
                  <ClownSprite kind={e.kind} />
                </div>
                {isDead ? (
                  <span className="mqw-enemy__burst">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <i
                        key={i}
                        className="mqw-enemy__bit"
                        style={{ "--a": `${i * 72}deg` }}
                      />
                    ))}
                  </span>
                ) : null}
              </div>
              <span className="mqw-enemy__tag">
                {e.kind === "naysayer" ? "NAYSAYER" : "HATER"}
              </span>
            </div>
            {quip ? (
              <span className="mqw-enemy__quip" style={{ left: quip.left }}>
                {quip.text}
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
