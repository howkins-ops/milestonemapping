// Eat the Frog — the original accountability ritual, standing on its own two
// webbed feet. Name the ONE task you're dreading most today (the frog), let it
// sit there staring at you from its lily pad, then HOLD to swallow it — hardest
// thing first, the rest of the day is dessert. Solo + local-first: the ritual
// persists in localStorage (arena_frog_v1, ~90 days kept); squad glory still
// flows through real proofs — eat before 9AM and the Dawn Raid sunrise board is
// one tap away.
//
// GLOW-UP (2026-07-10): the flat card became a living swamp-at-night diorama —
// a bespoke SVG frog character on a bobbing lily pad, drifting fireflies (one
// capped rAF canvas, §3-lawful), a "gets heavier the longer you dodge it"
// tension layer, a 3-act HOLD-to-swallow set-piece (tension → tongue-snatch →
// calm + sunrise), and a trophy-pond week strip. All motion is transform/opacity
// only; every loop dies on hide / off-screen / unmount; reduced-motion collapses
// to static.
//
// Ownership: this file + EatTheFrog.css only. All witness/notification copy
// through witnessLines.js.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import {
  sfxPop,
  sfxSplat,
  sfxBubble,
  sfxCoin,
  sfxPhoenix,
  sfxSwish,
  sfxRainbow,
  sfxCalmPadLoop,
} from "../../../../lib/sfx.js";
import { slamHeavy, tapLight, tapMedium } from "../../../../lib/haptics.js";
import "./EatTheFrog.css";

const STORE_KEY = "arena_frog_v1";
const HOLD_MS = 1400; // the swallow — long enough to mean it, short enough to crave
const KEEP_DAYS = 90;
const MINT = "#00FFBF";
const WEIGHT_HOURS = 8; // an uneaten frog is "fully heavy" after ~8 hours of dodging

// Local YYYY-MM-DD (matches how the Zone stamps local_date on proofs).
const dayKey = (d = new Date()) => d.toLocaleDateString("en-CA");

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

function prefersReducedMotion() {
  try {
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

// "7:42a" from an ISO timestamp, in LOCAL time.
function eatenLabel(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h < 12 ? "a" : "p";
  h = h % 12 || 12;
  return `${h}:${m}${ap}`;
}

// 0..1 dread weight — how long the named-but-uneaten frog has been dodged.
function computeWeight(declaredAt) {
  if (!declaredAt) return 0;
  const t = new Date(declaredAt).getTime();
  if (Number.isNaN(t)) return 0;
  const hrs = (Date.now() - t) / 3_600_000;
  return Math.max(0, Math.min(1, hrs / WEIGHT_HOURS));
}

function loadDays() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data && typeof data === "object" && data.days && typeof data.days === "object") {
      return data.days;
    }
  } catch {
    /* corrupted store → fresh swamp */
  }
  return {};
}

function saveDays(days) {
  try {
    const keep = Object.keys(days).sort().slice(-KEEP_DAYS);
    const trimmed = {};
    for (const k of keep) trimmed[k] = days[k];
    localStorage.setItem(STORE_KEY, JSON.stringify({ days: trimmed }));
  } catch {
    /* storage full/blocked — the ritual still plays */
  }
}

// Streaks + totals from the day map. All day arithmetic pins to LOCAL NOON so
// a YYYY-MM-DD string never shifts a day across the UTC boundary.
function frogStats(days) {
  const eatenDays = Object.keys(days)
    .filter((k) => days[k]?.eatenAt)
    .sort();
  const eaten = new Set(eatenDays);

  let before9 = 0;
  for (const k of eatenDays) {
    const d = new Date(days[k].eatenAt);
    if (!Number.isNaN(d.getTime()) && d.getHours() < 9) before9++;
  }

  // Current streak: today counts if eaten; otherwise anchor on yesterday so an
  // un-eaten morning never reads as a broken streak.
  let streak = 0;
  const cur = new Date();
  if (!eaten.has(dayKey(cur))) cur.setDate(cur.getDate() - 1);
  while (eaten.has(dayKey(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of eatenDays) {
    if (prev) {
      const d = new Date(`${prev}T12:00:00`);
      d.setDate(d.getDate() + 1);
      run = dayKey(d) === k ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = k;
  }

  return { total: eatenDays.length, before9, streak, best };
}

// Last 7 days as lily pads for the trophy pond — eaten / named-not-eaten / empty.
function weekPonds(days) {
  const out = [];
  const base = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const rec = days[k];
    out.push({
      key: k,
      wd: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      eaten: Boolean(rec?.eatenAt),
      named: Boolean(rec?.text),
      isToday: i === 0,
    });
  }
  return out;
}

// One-shot count-up for a stat number. Animates 0→target once on first mount;
// later target changes snap (no recount). Static under reduced motion.
function useCountUp(target, enabled) {
  const [n, setN] = useState(enabled ? 0 : target);
  const started = useRef(false);
  useEffect(() => {
    if (!enabled || started.current) {
      setN(target);
      return undefined;
    }
    started.current = true;
    let raf = 0;
    const t0 = performance.now();
    const dur = 680;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  return n;
}

/* ============================================================
   <FrogChar/> — the bespoke SVG frog. mood drives every expression
   through a single class; CSS owns all the motion.
   ============================================================ */
function FrogChar({ mood = "staring", holdFrac = 0 }) {
  return (
    <svg
      className={`fchar fchar--${mood}`}
      viewBox="0 0 120 120"
      aria-hidden="true"
      style={{ "--hf": holdFrac }}
    >
      {/* pond shadow */}
      <ellipse className="fchar__shadow" cx="60" cy="110" rx="33" ry="6.5" />

      {/* back haunches */}
      <g className="fchar__haunches">
        <ellipse cx="30" cy="90" rx="17" ry="13" />
        <ellipse cx="90" cy="90" rx="17" ry="13" />
      </g>

      {/* front feet */}
      <g className="fchar__feet">
        <path d="M34 104q-8 2-12 8 M34 104q-9-1-14 2 M34 104q-6 5-6 11" />
        <path d="M86 104q8 2 12 8 M86 104q9-1 14 2 M86 104q6 5 6 11" />
        <ellipse cx="34" cy="104" rx="9" ry="6" />
        <ellipse cx="86" cy="104" rx="9" ry="6" />
      </g>

      {/* body */}
      <ellipse className="fchar__body" cx="60" cy="72" rx="37" ry="35" />
      {/* belly (breathes) */}
      <ellipse className="fchar__belly" cx="60" cy="84" rx="24" ry="21" />
      {/* throat sac (puffs / gulps) */}
      <ellipse className="fchar__throat" cx="60" cy="94" rx="15" ry="10" />

      {/* mouth */}
      <path className="fchar__mouth" d="M40 66q20 12 40 0" />
      {/* nostrils */}
      <circle className="fchar__nostril" cx="54" cy="56" r="1.5" />
      <circle className="fchar__nostril" cx="66" cy="56" r="1.5" />

      {/* tongue (snatch) */}
      <path className="fchar__tongue" d="M52 68h16v10a8 8 0 0 1-16 0z" />

      {/* eyes — dome + iris + pupil + eyelid */}
      <g className="fchar__eye fchar__eye--l">
        <circle className="fchar__eyedome" cx="38" cy="36" r="15" />
        <circle className="fchar__iris" cx="38" cy="37" r="9" />
        <circle className="fchar__pupil" cx="38" cy="37" r="4.6" />
        <circle className="fchar__glint" cx="34.5" cy="33.5" r="2.2" />
        <ellipse className="fchar__lid" cx="38" cy="36" rx="15.5" ry="15.5" />
      </g>
      <g className="fchar__eye fchar__eye--r">
        <circle className="fchar__eyedome" cx="82" cy="36" r="15" />
        <circle className="fchar__iris" cx="82" cy="37" r="9" />
        <circle className="fchar__pupil" cx="82" cy="37" r="4.6" />
        <circle className="fchar__glint" cx="78.5" cy="33.5" r="2.2" />
        <ellipse className="fchar__lid" cx="82" cy="36" rx="15.5" ry="15.5" />
      </g>

      {/* cheek freckles */}
      <g className="fchar__freckles">
        <circle cx="30" cy="72" r="1.3" />
        <circle cx="26" cy="78" r="1.3" />
        <circle cx="90" cy="72" r="1.3" />
        <circle cx="94" cy="78" r="1.3" />
      </g>
    </svg>
  );
}

export default function EatTheFrog({ go }) {
  const { member } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();
  const reduce = prefersReducedMotion();

  const myName = member?.username ? `@${member.username}` : "You";

  const [days, setDays] = useState(loadDays);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdFrac, setHoldFrac] = useState(0);
  const [weight, setWeight] = useState(0);
  const [ripples, setRipples] = useState([]);
  const [justAte, setJustAte] = useState(false);
  const holdRaf = useRef(null);
  const holdPt = useRef({ x: 0, y: 0 });
  const holdStep = useRef(0); // haptic/audio ramp index during a hold
  const aliveRef = useRef(true);
  const rippleId = useRef(0);
  const fliesRef = useRef(null);
  const heroRef = useRef(null);
  const ambientRef = useRef(null);
  const ateAtMount = useRef(false);

  const todayK = dayKey();
  const entry = days[todayK] || null;
  const eaten = Boolean(entry?.eatenAt);
  const eatenAtLabel = eaten ? eatenLabel(entry.eatenAt) : null;
  const ateBefore9 = eaten && new Date(entry.eatenAt).getHours() < 9;
  const stats = useMemo(() => frogStats(days), [days]);
  const week = useMemo(() => weekPonds(days), [days]);

  // Yesterday's frog left uneaten → it hopped into today. No shame, one tap.
  const yEntry = !entry ? days[yesterdayKey()] : null;
  const hoppedText = yEntry && !yEntry.eatenAt && yEntry.text ? yEntry.text : null;

  const showDeclare = !eaten && (!entry || editing);
  const staringOn = Boolean(entry) && !eaten && !editing;

  // frog expression
  const frogMood = eaten
    ? "gulped"
    : holding
    ? "squirming"
    : weight > 0.55
    ? "heavy"
    : "staring";

  // Count-ups (static under reduced motion)
  const streakN = useCountUp(stats.streak, !reduce);
  const totalN = useCountUp(stats.total, !reduce);
  const before9N = useCountUp(stats.before9, !reduce);

  useEffect(() => {
    aliveRef.current = true;
    // If the day was already eaten when we opened the game, skip the dawn
    // cinematic and render calm-dawn directly.
    ateAtMount.current = eaten;
    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(holdRaf.current);
      try {
        ambientRef.current?.stop?.();
      } catch {
        /* silent */
      }
      ambientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  /* -------- dread weight: recompute on entry + every 60s (no rAF) -------- */
  useEffect(() => {
    if (!staringOn) {
      setWeight(0);
      return undefined;
    }
    const tick = () => setWeight(computeWeight(entry?.declaredAt));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [staringOn, entry?.declaredAt]);

  /* -------- ambient swamp bed (lazy, gesture-gated, scene-scoped) -------- */
  const startAmbient = useCallback(() => {
    if (ambientRef.current || !staringOn) return;
    try {
      const h = sfxCalmPadLoop();
      if (h) {
        h.setLevel?.(0.05);
        ambientRef.current = h;
      }
    } catch {
      /* audio never blocks */
    }
  }, [staringOn]);
  const stopAmbient = useCallback(() => {
    try {
      ambientRef.current?.stop?.();
    } catch {
      /* silent */
    }
    ambientRef.current = null;
  }, []);
  // kill the bed the moment we leave the staring scene (eaten / editing)
  useEffect(() => {
    if (!staringOn) stopAmbient();
  }, [staringOn, stopAmbient]);

  /* -------- fireflies: one capped rAF canvas, §3-lawful -------- */
  useEffect(() => {
    if (!staringOn) return undefined;
    const canvas = fliesRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const rm = prefersReducedMotion();
    const mobile = window.innerWidth < 700;
    const CAP = rm ? 5 : mobile ? 8 : 14;
    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, Math.floor(W * DPR));
      canvas.height = Math.max(1, Math.floor(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const rnd = (a, b) => a + Math.random() * (b - a);
    const flies = [];
    const make = (seed) => ({
      x: rnd(0, W || 1),
      y: seed ? rnd(0, H || 1) : (H || 1) + rnd(0, 20),
      r: rnd(0.8, 2),
      vy: -rnd(0.05, 0.22),
      vx: rnd(-0.05, 0.05),
      life: 0,
      max: rnd(300, 760),
      blink: rnd(0, 6.28),
      blinkSpd: rnd(0.02, 0.05),
      amp: rnd(6, 18),
    });
    for (let i = 0; i < CAP; i++) flies.push(make(true));
    const C1 = [0, 255, 191];
    const C2 = [150, 255, 190];

    let raf = 0;
    let running = true;
    let onScreen = true;
    let last = performance.now();

    const frame = (dt) => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < flies.length; i++) {
        const p = flies[i];
        p.life += dt;
        p.blink += p.blinkSpd * dt;
        p.x += (p.vx + Math.sin(p.blink) * 0.01 * p.amp) * dt;
        p.y += p.vy * dt;
        const lt = p.life / p.max;
        if (lt >= 1 || p.y < -6) {
          flies[i] = make(false);
          continue;
        }
        const tw = 0.3 + 0.7 * Math.max(0, Math.sin(p.blink * 1.3));
        const fade = Math.sin(Math.min(1, lt) * Math.PI);
        const a = fade * tw * 0.9;
        const rr = p.r * 4;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
        g.addColorStop(0, `rgba(${C2[0]},${C2[1]},${C2[2]},${a})`);
        g.addColorStop(0.4, `rgba(${C1[0]},${C1[1]},${C1[2]},${a * 0.5})`);
        g.addColorStop(1, `rgba(${C1[0]},${C1[1]},${C1[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rr, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = `rgba(224,255,236,${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.7, 0, 6.283);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    const step = (now) => {
      if (!running || !onScreen) return;
      const dt = Math.min(2.5, (now - last) / 16.6667);
      last = now;
      frame(dt);
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    if (rm) frame(1);
    else start();

    const onVis = () => {
      running = document.visibilityState !== "hidden";
      if (running && onScreen && !rm) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVis);

    let io = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          onScreen = entries[0]?.isIntersecting ?? true;
          if (running && onScreen && !rm) start();
          else stop();
        },
        { threshold: 0 }
      );
      io.observe(canvas);
    }
    const onResize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      resize();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      if (io) io.disconnect();
    };
  }, [staringOn]);

  const commit = useCallback((mutate) => {
    setDays((prev) => {
      const next = { ...prev };
      mutate(next);
      saveDays(next);
      return next;
    });
  }, []);

  /* -------- ripples (declare / poke / gulp / water tap) -------- */
  const spawnRipple = useCallback((x, y, big = false) => {
    const id = ++rippleId.current;
    setRipples((r) => [...r, { id, x, y, big }].slice(-4));
    setTimeout(() => {
      if (!aliveRef.current) return;
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 900);
  }, []);

  // ripple at a local point in the hero, from a pointer event (falls back to
  // the frog's base at scene center-bottom).
  const rippleFromEvent = useCallback(
    (e, big = false) => {
      const host = heroRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const x = e?.clientX != null ? e.clientX - rect.left : rect.width / 2;
      const y = e?.clientY != null ? e.clientY - rect.top : rect.height * 0.72;
      spawnRipple(x, y, big);
    },
    [spawnRipple]
  );

  /* ---------------- declare / swap ---------------- */

  const declare = useCallback(
    (text) => {
      const clean = String(text || "").trim().slice(0, 140);
      if (!clean) return;
      const k = dayKey();
      commit((d) => {
        if (d[k]?.eatenAt) return; // eaten frogs stay eaten
        d[k] = { text: clean, declaredAt: new Date().toISOString(), eatenAt: null };
      });
      setDraft("");
      setEditing(false);
      setWeight(0);
      try {
        sfxBubble();
        sfxPop();
      } catch {
        /* audio never blocks */
      }
      tapLight();
      // frog splashes up onto the pad
      const host = heroRef.current;
      if (host) {
        const rect = host.getBoundingClientRect();
        spawnRipple(rect.width / 2, rect.height * 0.7, true);
      }
      startAmbient();
      pushToast?.({
        type: "info",
        title: "Frog named 🐸",
        message: witnessSay("frog_declared", { name: myName, frog: clean, today: k }).line,
      });
    },
    [commit, pushToast, myName, spawnRipple, startAmbient]
  );

  const startSwap = useCallback(() => {
    setDraft(entry?.text || "");
    setEditing(true);
    try {
      sfxPop();
    } catch {
      /* silent */
    }
  }, [entry]);

  /* ---------------- poke the frog (pure delight) ---------------- */
  const pokeFrog = useCallback(
    (e) => {
      if (!staringOn || holding) return;
      try {
        sfxBubble();
      } catch {
        /* silent */
      }
      tapLight();
      startAmbient();
      rippleFromEvent(e);
      const el = e.currentTarget;
      if (el && !reduce) {
        el.classList.remove("is-poked");
        // reflow so the animation can retrigger
        void el.offsetWidth;
        el.classList.add("is-poked");
        // drop the class after the pop so the idle bob resumes
        setTimeout(() => el.classList.remove("is-poked"), 430);
      }
    },
    [staringOn, holding, rippleFromEvent, startAmbient, reduce]
  );

  /* ---------------- the swallow (hold-to-eat) ---------------- */

  const finishEat = useCallback(() => {
    const at = new Date();
    const k = dayKey(at);
    let swallowed = false;
    commit((d) => {
      const cur = d[k];
      if (!cur || cur.eatenAt) return;
      cur.eatenAt = at.toISOString();
      swallowed = true;
    });
    if (!swallowed) return;

    const newStreak = stats.streak + 1;
    setJustAte(true);
    setTimeout(() => aliveRef.current && setJustAte(false), 2600);
    stopAmbient();

    try {
      sfxSwish(); // tongue snatch
      sfxSplat();
      sfxCoin();
      if (newStreak === 7 || newStreak === 30 || newStreak > Math.max(1, stats.best)) {
        sfxPhoenix();
      }
      if (!reduce) setTimeout(() => aliveRef.current && sfxRainbow(), 420); // sunrise swell
    } catch {
      /* silent */
    }
    slamHeavy();
    try {
      burst(holdPt.current.x, holdPt.current.y, MINT);
      if (!reduce) {
        burst(holdPt.current.x - 46, holdPt.current.y + 8, MINT);
        burst(holdPt.current.x + 46, holdPt.current.y + 8, MINT);
      }
    } catch {
      /* confetti optional */
    }
    // splash ripples at the frog's base
    const host = heroRef.current;
    if (host) {
      const rect = host.getBoundingClientRect();
      spawnRipple(rect.width / 2, rect.height * 0.72, true);
      if (!reduce) spawnRipple(rect.width / 2 - 40, rect.height * 0.72, false);
    }
    celebrate?.({
      variant: "reward",
      title: "FROG EATEN 🐸",
      subtitle: `Hardest thing first — day ${newStreak} of the streak.`,
      detail: witnessSay("frog_eaten", { name: myName, streak: newStreak, today: k }).line,
    });
    if (at.getHours() < 9) {
      pushToast?.({
        type: "success",
        title: "🌅 Before 9AM",
        message: "That frog counts double — post a real proof and raid the Dawn board.",
      });
    }
  }, [commit, stats.streak, stats.best, burst, celebrate, pushToast, myName, spawnRipple, stopAmbient, reduce]);

  const cancelHold = useCallback(() => {
    cancelAnimationFrame(holdRaf.current);
    setHolding(false);
    setHoldFrac(0);
    holdStep.current = 0;
  }, []);

  const beginHold = useCallback(
    (e) => {
      if (!entry || eaten || holding) return;
      e.preventDefault?.();
      holdPt.current = {
        x: e.clientX ?? window.innerWidth / 2,
        y: e.clientY ?? window.innerHeight / 2,
      };
      holdStep.current = 0;
      try {
        sfxBubble();
      } catch {
        /* silent */
      }
      tapLight();
      startAmbient();
      setHolding(true);
      const start = performance.now();
      const step = (now) => {
        if (!aliveRef.current) return;
        const frac = Math.min(1, (now - start) / HOLD_MS);
        setHoldFrac(frac);
        // rising tension: a bubble + escalating haptic every 20%
        const s = Math.floor(frac * 5);
        if (s > holdStep.current) {
          holdStep.current = s;
          try {
            sfxBubble();
          } catch {
            /* silent */
          }
          if (s >= 4) tapMedium();
          else tapLight();
        }
        if (frac >= 1) {
          setHolding(false);
          setHoldFrac(0);
          holdStep.current = 0;
          finishEat();
          return;
        }
        holdRaf.current = requestAnimationFrame(step);
      };
      holdRaf.current = requestAnimationFrame(step);
    },
    [entry, eaten, holding, finishEat, startAmbient]
  );

  const holdKeyDown = useCallback(
    (e) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) beginHold(e);
    },
    [beginHold]
  );

  /* ---------------- proof bridge ---------------- */

  const goProve = useCallback(
    (e) => {
      try {
        sfxPop();
      } catch {
        /* silent */
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, MINT);
      pushToast?.({
        type: "info",
        title: "Make it real 🐸",
        message: "Post the frog as a proof — that's what lands on the boards your squad can see.",
      });
      go?.("home");
    },
    [burst, pushToast, go]
  );

  // shared scene layers behind the frog (night → dawn)
  const scene = (dawn) => (
    <>
      <span className="frog-sky frog-sky--night" aria-hidden="true" />
      <span className={`frog-sky frog-sky--dawn ${dawn ? "is-lit" : ""}`} aria-hidden="true" />
      <span className="frog-moon" aria-hidden="true" />
      <span className="frog-sun" aria-hidden="true" />
      <span className="frog-fog" aria-hidden="true" />
      <span className="frog-reeds" aria-hidden="true">
        <svg viewBox="0 0 320 90" preserveAspectRatio="none" aria-hidden="true">
          <g className="frog-reed">
            <path d="M18 90c-2-30 4-52 2-78" />
            <path d="M18 44c-10-4-16-14-16-14 8-2 14 4 16 14z" />
          </g>
          <g className="frog-reed">
            <path d="M40 90c3-28-3-46-1-66" />
            <path d="M39 40c9-3 15-12 15-12-7-2-13 3-15 12z" />
          </g>
          <g className="frog-reed">
            <path d="M292 90c2-32-5-52-2-80" />
            <path d="M290 42c10-4 16-14 16-14-8-2-14 4-16 14z" />
          </g>
          <g className="frog-reed">
            <path d="M308 90c-3-26 3-44 1-62" />
            <path d="M309 44c-9-3-15-12-15-12 7-2 13 3 15 12z" />
          </g>
        </svg>
      </span>
      <span className="frog-water" aria-hidden="true">
        <span className="frog-water__shimmer" aria-hidden="true" />
      </span>
      {ripples.map((rp) => (
        <span
          key={rp.id}
          className={`frog-ripple ${rp.big ? "frog-ripple--big" : ""}`}
          style={{ left: rp.x, top: rp.y }}
          aria-hidden="true"
        />
      ))}
    </>
  );

  return (
    <div className="frog-wrap" ref={reveal}>
      <button type="button" className="zn-back frog-back" onClick={() => go?.("arena")}>
        ← Arena
      </button>

      <header className="frog-head arena-reveal">
        <p className="zn-eyebrow">Eat the Frog · hardest thing first</p>
        <h2 className="frog-title">Name the thing you're dreading. Then eat it.</h2>
        <p className="frog-sub">
          Mark Twain's law: eat a live frog first thing in the morning and nothing worse
          happens to you all day. Your frog is the ONE task you keep dodging — name it,
          do it in real life, then hold down and swallow it whole.
        </p>
      </header>

      {/* ---------------- DECLARE ---------------- */}
      {showDeclare && (
        <div className="zn-card frog-card arena-reveal">
          <p className="zn-eyebrow frog-cardlabel">
            {editing ? "Swap the frog" : "Today's frog · unnamed"}
          </p>

          {hoppedText && !editing && (
            <button type="button" className="frog-hop" onClick={() => declare(hoppedText)}>
              🐸 Yesterday's frog hopped into today — <b>“{hoppedText}”</b>
              <small>Same frog, still croaking. Tap to put it back on the plate.</small>
            </button>
          )}

          <label className="zn-label" htmlFor="frog-input">
            The one task you're dreading most today
          </label>
          <textarea
            id="frog-input"
            className="zn-input frog-input"
            rows={2}
            maxLength={140}
            placeholder="e.g. Call the three cold leads I've been avoiding"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="button"
            className="zn-btn frog-declarebtn"
            disabled={!draft.trim()}
            onClick={() => declare(draft)}
          >
            🐸 Put the frog on the plate
          </button>
          {editing && (
            <button type="button" className="frog-linkbtn" onClick={() => setEditing(false)}>
              Never mind — keep the frog I named
            </button>
          )}
          <p className="zn-hint frog-hint">
            Law of the swamp: one frog a day, the ugliest one first. If there are two,
            eat the bigger one.
          </p>
        </div>
      )}

      {/* ---------------- STARING ---------------- */}
      {staringOn && (
        <div
          ref={heroRef}
          className={`frog-hero frog-stage zn-card arena-reveal ${holding ? "is-holding" : ""}`}
          style={{ "--hold": holdFrac, "--weight": weight }}
        >
          {scene(false)}
          <canvas ref={fliesRef} className="frog-flies" aria-hidden="true" />

          <span className="zn-eyebrow frog-herolabel">Today's frog · staring at you</span>

          <span className="frog-perch">
            <span className="frog-pad" aria-hidden="true" />
            <button
              type="button"
              className="frog-poke"
              onClick={pokeFrog}
              aria-label="Poke the frog"
            >
              <FrogChar mood={frogMood} holdFrac={holdFrac} />
              <span className="frog-flies-buzz" aria-hidden="true" />
            </button>
          </span>

          <span className="frog-text">“{entry.text}”</span>

          {weight > 0.35 && (
            <span className="frog-weightbar" aria-hidden="true">
              <span className="frog-weightbar__fill" />
              <span className="frog-weightbar__txt">
                {weight > 0.75 ? "getting heavy — eat it" : "it's sitting there…"}
              </span>
            </span>
          )}

          <button
            type="button"
            className={`frog-eatbtn ${holding ? "frog-eatbtn--hold" : ""}`}
            onPointerDown={beginHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onKeyDown={holdKeyDown}
            onKeyUp={cancelHold}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Hold to mark the frog eaten"
          >
            <svg className="frog-ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="frog-ring__bg" cx="60" cy="60" r="54" />
              <circle
                className="frog-ring__fg"
                cx="60"
                cy="60"
                r="54"
                strokeDasharray={`${holdFrac * 339.3} 339.3`}
              />
            </svg>
            <span className="frog-eatbtn__glyph" aria-hidden="true">
              {holding ? "😬" : "🍴"}
            </span>
            <span className="frog-eatbtn__label">{holding ? "SWALLOWING…" : "HOLD TO EAT IT"}</span>
          </button>

          <span className="frog-herohint">
            Do it for real first — then hold to swallow. The frog knows if you're lying.
          </span>
          <button type="button" className="frog-linkbtn frog-swapbtn" onClick={startSwap}>
            Wrong frog? Swap it
          </button>
          <span className="frog-vignette" aria-hidden="true" />
        </div>
      )}

      {/* ---------------- EATEN ---------------- */}
      {eaten && (
        <div
          ref={heroRef}
          className={`frog-hero frog-stage frog-hero--eaten zn-card arena-reveal ${
            ateBefore9 ? "frog-hero--sunrise" : ""
          } ${justAte && !ateAtMount.current ? "is-fresh" : ""}`}
        >
          {scene(true)}
          {justAte && !ateAtMount.current && <span className="frog-shock" aria-hidden="true" />}

          <span className="zn-eyebrow frog-herolabel">
            Today's frog · EATEN{eatenAtLabel ? ` at ${eatenAtLabel}` : ""}
          </span>

          <span className="frog-perch" aria-hidden="true">
            <span className="frog-pad frog-pad--calm" aria-hidden="true" />
            <span className="frog-poke frog-poke--done" aria-hidden="true">
              <FrogChar mood="gulped" />
            </span>
          </span>

          <span className="frog-text frog-text--done">“{entry.text}”</span>
          <p className="frog-status">
            {witnessSay("frog_eaten", { name: myName, streak: stats.streak, today: todayK }).line}
          </p>
          <div className="frog-ctarow">
            <button type="button" className="zn-btn frog-provebtn" onClick={goProve}>
              📸 Post it as proof
            </button>
            {ateBefore9 && (
              <button
                type="button"
                className="zn-btn zn-btn--ghost frog-sunrisebtn"
                onClick={() => go?.("arena", "dawn_raid")}
              >
                🌅 Claim the sunrise
              </button>
            )}
          </div>
          <span className="frog-herohint">
            Tomorrow's frog picks itself — come back at dawn and name it.
          </span>
        </div>
      )}

      {/* ---------------- TROPHY POND (stats) ---------------- */}
      <div className="frog-trophy arena-reveal">
        <div className="frog-week" aria-hidden="true">
          {week.map((d) => (
            <span
              key={d.key}
              className={`frog-weekpad ${d.eaten ? "is-eaten" : d.named ? "is-named" : ""} ${
                d.isToday ? "is-today" : ""
              }`}
            >
              <span className="frog-weekpad__lily" />
              {d.eaten && <span className="frog-weekpad__frog">🐸</span>}
              <span className="frog-weekpad__wd">{d.wd}</span>
            </span>
          ))}
        </div>
        <div className="frog-stats">
          <div className="zn-stat frog-stat">
            <span className="frog-flame" data-tier={stats.streak >= 30 ? 3 : stats.streak >= 7 ? 2 : 1} aria-hidden="true" />
            <span className="zn-stat__num">{streakN}</span>
            <span className="zn-stat__label">Day streak</span>
          </div>
          <div className="zn-stat frog-stat">
            <span className="zn-stat__num">{totalN}</span>
            <span className="zn-stat__label">Frogs eaten</span>
          </div>
          <div className="zn-stat frog-stat">
            <span className="zn-stat__num">{before9N}</span>
            <span className="zn-stat__label">Before 9AM</span>
          </div>
        </div>
      </div>

      {/* ---------------- LAW ---------------- */}
      <div className="zn-card frog-card frog-law arena-reveal">
        <p className="zn-eyebrow">Law of the swamp</p>
        <ul className="frog-laws">
          <li>One frog a day — the task you're dodging hardest, not the longest list.</li>
          <li>Eat it FIRST. Every hour it sits there it gets heavier; eaten, it feeds you.</li>
          <li>An uneaten frog never shames you — it just hops into tomorrow, still croaking.</li>
          <li>Swallow before 9AM and the Dawn Raid sunrise board is yours to raid.</li>
        </ul>
        {stats.best > 1 && <p className="frog-best">🏆 Best streak · {stats.best} days</p>}
      </div>
    </div>
  );
}
