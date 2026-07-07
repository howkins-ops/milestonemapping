import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useWorkout } from "./useWorkout.js";
import AlphaMode from "./alpha/AlphaMode.jsx";
import {
  sfxPlateClank,
  sfxChalkPoof,
  sfxRoundBell,
  sfxImpact,
  sfxCoin,
} from "../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE IRON
   blackened steel · chalk dust · ember heat
   spaces: cover → creed → plans → plan → session → wall → log
   Persisted to Supabase (workout_* tables) via useWorkout.
   ═══════════════════════════════════════════════════════════════ */

const EMBER = "#FF6A2B";
const CHALK = "#E8E4DA";

const STEELS = [
  { id: "gunmetal", label: "gunmetal", css: "linear-gradient(150deg,#2e3238,#1a1d21 55%,#0d0e10)" },
  { id: "carbon", label: "carbon", css: "linear-gradient(150deg,#232323,#141414 55%,#0a0a0a)" },
  { id: "blued", label: "blued", css: "linear-gradient(150deg,#1f2a3d,#131a28 55%,#0a0d14)" },
  { id: "rust", label: "rust", css: "linear-gradient(150deg,#3a221a,#221310 55%,#100907)" },
];
const EMBLEMS = ["▲", "◆", "⬢", "✦", "⚡", "✕"];

const LIBRARY = [
  "Bench Press", "Incline DB Press", "Overhead Press", "Dips", "Push-ups",
  "Triceps Pushdown", "Deadlift", "Barbell Row", "Lat Pulldown", "Pull-ups",
  "Barbell Curl", "Face Pull", "Squat", "Romanian Deadlift", "Leg Press",
  "Walking Lunge", "Calf Raise", "Hip Thrust", "Plank", "Farmer Carry",
];

const TEMPLATES = [
  {
    key: "push", name: "PUSH DAY", focus: "chest · shoulders · triceps", steel: "gunmetal", emblem: "▲",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 135 },
      { name: "Overhead Press", sets: 3, reps: 10, weight: 75 },
      { name: "Incline DB Press", sets: 3, reps: 10, weight: 40 },
      { name: "Dips", sets: 3, reps: 12, weight: 0 },
      { name: "Triceps Pushdown", sets: 3, reps: 12, weight: 40 },
    ],
  },
  {
    key: "pull", name: "PULL DAY", focus: "back · biceps", steel: "blued", emblem: "◆",
    exercises: [
      { name: "Deadlift", sets: 4, reps: 6, weight: 185 },
      { name: "Barbell Row", sets: 4, reps: 8, weight: 115 },
      { name: "Lat Pulldown", sets: 3, reps: 10, weight: 100 },
      { name: "Barbell Curl", sets: 3, reps: 12, weight: 45 },
      { name: "Face Pull", sets: 3, reps: 15, weight: 30 },
    ],
  },
  {
    key: "legs", name: "LEG DAY", focus: "quads · hams · calves", steel: "carbon", emblem: "⬢",
    exercises: [
      { name: "Squat", sets: 4, reps: 8, weight: 155 },
      { name: "Romanian Deadlift", sets: 3, reps: 10, weight: 135 },
      { name: "Leg Press", sets: 3, reps: 12, weight: 230 },
      { name: "Walking Lunge", sets: 3, reps: 12, weight: 0 },
      { name: "Calf Raise", sets: 4, reps: 15, weight: 90 },
    ],
  },
  {
    key: "full", name: "FULL BODY", focus: "the big five", steel: "rust", emblem: "⚡",
    exercises: [
      { name: "Squat", sets: 3, reps: 8, weight: 155 },
      { name: "Bench Press", sets: 3, reps: 8, weight: 135 },
      { name: "Barbell Row", sets: 3, reps: 8, weight: 115 },
      { name: "Overhead Press", sets: 3, reps: 10, weight: 75 },
      { name: "Push-ups", sets: 3, reps: 15, weight: 0 },
    ],
  },
];

const CREED = [
  {
    k: "iron", visual: "plate",
    title: "The Iron never lies.",
    body: "A hundred and thirty-five pounds is always a hundred and thirty-five pounds. No spin, no story, no excuses. Five plates. Two minutes. Then the room is yours.",
  },
  {
    k: "showup", visual: "streak",
    title: "Showing up is the whole secret.",
    body: "Across every training study ever run, one variable predicts results above all others — adherence. Not the perfect program. Not intensity. The lifters who transform are the ones who keep the appointment. Consistency beats intensity, every single time.",
  },
  {
    k: "overload", visual: "overload",
    title: "Progressive overload.",
    body: "The body adapts to exactly what you ask of it, then stops. Growth lives in the small ask: one more rep than last time, or two and a half more pounds. That is the entire engine of strength. This log exists to make the small ask visible.",
  },
  {
    k: "rest", visual: "rest",
    title: "Rest is part of the lift.",
    body: "Two to three minutes between heavy sets measurably outperforms rushing — more strength, more muscle per session. And the muscle itself is built after you leave: in food and in sleep. The rest timer is not downtime. It is the second half of the set.",
  },
  {
    k: "log", visual: "chalk",
    title: "What gets logged gets lifted.",
    body: "Lifters who track their sessions gain measurably more than those who train from memory — the log is what turns effort into evidence. Every set you rack lands in the book. Every personal record goes up on the wall. Chalk up.",
  },
];

/* ── helpers ── */
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
const dayKey = (iso) => new Date(iso).toDateString();
const relAge = (iso) => {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "today"; if (d === 1) return "yesterday";
  if (d < 21) return `${d} days ago`; if (d < 45) return "a month ago";
  return `${Math.round(d / 30)} months ago`;
};
const fmtDur = (s) => {
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};
const fmtVol = (v) => (v >= 10000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toLocaleString());
const exKey = (name) => String(name || "").trim().toLowerCase();

/* ── stepper: big thumb targets, no typing needed mid-set ──
   (exported for ALPHA MODE sessions, which share the control) */
export function Stepper({ label, value, step = 1, min = 0, max = 2000, onChange, wide }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  return (
    <div className={`iw-stepper ${wide ? "iw-stepper-wide" : ""}`}>
      <span className="iw-eyebrow">{label}</span>
      <div className="iw-stepper-row">
        <button className="iw-step-btn" onClick={() => onChange(clamp(Number((value - step).toFixed(1))))}>−</button>
        <span className="iw-step-val">{value}</span>
        <button className="iw-step-btn" onClick={() => onChange(clamp(Number((value + step).toFixed(1))))}>＋</button>
      </div>
    </div>
  );
}

/* ── RACKED overlay: chalk burst + plate slam after saving a session ── */
function RackedOverlay({ summary, onDone, settings }) {
  useEffect(() => {
    sfxPlateClank(settings);
    try { if (navigator.vibrate) navigator.vibrate([40, 60, 40]); } catch { /* silent */ }
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone]);
  return (
    <div className="iw-racked-veil">
      <div className="iw-racked-plate">
        <div className="iw-racked-bolt" aria-hidden="true" />
        <div className="iw-racked-word">RACKED</div>
        <div className="iw-chalk-burst" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="iw-chalk-fleck" style={{ "--iw-ca": `${i * 36}deg`, animationDelay: `${80 + i * 18}ms` }} />
          ))}
        </div>
      </div>
      <div className="iw-racked-stats">
        <span>{fmtDur(summary.duration_s)}</span>
        <span className="iw-racked-dot">·</span>
        <span>{fmtVol(summary.total_volume)} lbs moved</span>
        {summary.prCount > 0 && (
          <>
            <span className="iw-racked-dot">·</span>
            <span className="iw-racked-pr">{summary.prCount} PR{summary.prCount > 1 ? "s" : ""}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ── PR flash: non-blocking banner during a live session ── */
function PRFlash({ pr, onDone, settings }) {
  useEffect(() => {
    sfxImpact(3, settings);
    try { if (navigator.vibrate) navigator.vibrate([30, 40, 30]); } catch { /* silent */ }
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pr, onDone]);
  return (
    <div className="iw-prflash">
      <span className="iw-prflash-tag">NEW PR</span>
      <span className="iw-prflash-lift">{pr.exercise}</span>
      <span className="iw-prflash-num">{pr.weight} lbs × {pr.reps}</span>
    </div>
  );
}

/* ── rest timer: countdown ring, bell at zero ── */
function RestTimer({ seconds, onDone, onSkip, settings }) {
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
      <div className="iw-rest-ring" style={{ "--iw-frac": frac }}>
        <span className="iw-rest-num">{left}</span>
        <span className="iw-rest-unit">rest</span>
      </div>
      <button className="iw-btn-ghost" onClick={onSkip}>skip — back under the bar</button>
    </div>
  );
}

/* ── creed visuals ── */
function CreedVisual({ v }) {
  if (v === "plate") return (
    <div className="iw-cr-vis"><div className="iw-mini-plate-vis"><span>45</span></div></div>
  );
  if (v === "streak") return (
    <div className="iw-cr-vis iw-cr-week">
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <span key={i} className={`iw-week-cell ${i % 2 === 0 ? "iw-week-on" : ""}`}>{d}</span>
      ))}
    </div>
  );
  if (v === "overload") return (
    <div className="iw-cr-vis iw-cr-overload">
      <span className="iw-chip">135 × 8</span>
      <span className="iw-chip-arrow">→</span>
      <span className="iw-chip iw-chip-ember">137.5 × 8</span>
    </div>
  );
  if (v === "rest") return (
    <div className="iw-cr-vis">
      <div className="iw-rest-ring iw-rest-ring-demo" style={{ "--iw-frac": 0.66 }}>
        <span className="iw-rest-num">120</span>
        <span className="iw-rest-unit">rest</span>
      </div>
    </div>
  );
  return (
    <div className="iw-cr-vis iw-cr-chalk">
      <span className="iw-chip">tracked ＞ remembered</span>
      <span className="iw-chip iw-chip-ember">PRs on the wall</span>
    </div>
  );
}

/* ═══════════════ MAIN ═══════════════ */
export default function IronWorkout({ onExit, startOpen = false }) {
  const { userId, settings, addXP } = useAppData();
  const {
    plans, sessions, prs, creedSeen,
    addPlan, patchPlan, removePlan, addSession, addPR, markCreedSeen,
  } = useWorkout(userId);

  const [view, setView] = useState(() => {
    // deep links (e.g. Sunday Review → Stockpile) skip the cover
    try {
      const hint = window.sessionStorage.getItem("iron_view");
      if (hint && hint.startsWith("alpha")) return { name: "alpha" };
    } catch { /* silent */ }
    return { name: "cover" };
  }); // cover | creed | plans | plan | session | alpha | wall | log | session-detail
  const [creedStep, setCreedStep] = useState(0);
  const [opening, setOpening] = useState(false);
  const [racked, setRacked] = useState(null); // {summary, after}
  const [pageKey, setPageKey] = useState(0);
  const [newPlanOpen, setNewPlanOpen] = useState(false);

  const go = useCallback((v) => {
    setView(v);
    setPageKey((k) => k + 1);
    sfxChalkPoof(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  /* streak: consecutive training days */
  const streak = useMemo(() => {
    const days = new Set(sessions.map((s) => dayKey(s.created_at)));
    let n = 0; const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [sessions]);

  const lastSession = sessions[0] || null;

  const weekCount = useMemo(() => {
    const now = Date.now();
    return sessions.filter((s) => now - new Date(s.created_at).getTime() < 7 * 86400000).length;
  }, [sessions]);

  /* best PR per exercise (for detection + the wall) */
  const bestPRs = useMemo(() => {
    const map = new Map();
    for (const p of prs) {
      const k = exKey(p.exercise);
      const cur = map.get(k);
      if (!cur || p.weight > cur.weight || (p.weight === cur.weight && p.reps > cur.reps)) map.set(k, p);
    }
    return map;
  }, [prs]);

  /* last weight used per exercise, from the newest session that has it */
  const lastWeights = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      for (const ex of s.exercises || []) {
        const k = exKey(ex.name);
        if (!map.has(k)) {
          const last = (ex.sets || []).filter((x) => x.weight > 0).pop();
          if (last) map.set(k, last.weight);
        }
      }
    }
    return map;
  }, [sessions]);

  const openBook = () => {
    setOpening(true);
    sfxPlateClank(settings);
    setTimeout(() => {
      setOpening(false);
      go(creedSeen ? { name: "plans" } : { name: "creed" });
      if (!creedSeen) setCreedStep(0);
    }, 850);
  };

  /* IronWorkout mounts fresh on every open (WorkoutMode conditional
     render), so the initial view — cover, or a deep-link target — is
     decided once in the useState initializer above. No reset effect:
     it would race AlphaMode's consumption of the deep-link hint. */

  const finishCreed = () => {
    markCreedSeen();
    go({ name: "plans" });
  };

  /* save a finished session + its PRs, then slam the plate */
  const rackSession = (result) => {
    const row = addSession(result.session);
    result.prs.forEach((p) => addPR({ ...p, session_id: row.id }));
    const xp = 20 + result.prs.length * 15;
    addXP(xp, "Iron session racked");
    setRacked({
      summary: { ...result.session, prCount: result.prs.length },
      after: () => go({ name: "log" }),
    });
  };

  /* ── COVER ── */
  const renderCover = () => (
    <div className="iw-cover-wrap">
      <div className={`iw-plate3d ${opening ? "iw-plate-opening" : ""}`}>
        <button className="iw-cover" onClick={openBook} aria-label="Enter The Iron">
          <div className="iw-cover-ring" aria-hidden="true" />
          <div className="iw-cover-bolts" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="iw-bolt" style={{ "--iw-ba": `${i * 60}deg` }} />
            ))}
          </div>
          <div className="iw-cover-frame">
            <div className="iw-cover-rule" />
            <h1 className="iw-cover-title">THE<br />IRON</h1>
            <div className="iw-cover-sub">every rep goes in the book</div>
            <div className="iw-cover-rule" />
            <div className="iw-cover-meta">
              <span>{streak > 0 ? `day ${streak}` : "day zero"}</span>
              <span className="iw-cover-dot">·</span>
              <span>{lastSession ? `last lift ${relAge(lastSession.created_at)}` : "unracked"}</span>
            </div>
            <div className="iw-cover-open">tap to enter</div>
          </div>
        </button>
      </div>

      <div className="iw-cover-stats">
        <div className="iw-stat"><span className="iw-stat-num">{sessions.length}</span><span className="iw-stat-label">sessions</span></div>
        <div className="iw-stat"><span className="iw-stat-num">{weekCount}</span><span className="iw-stat-label">this week</span></div>
        <div className="iw-stat"><span className="iw-stat-num">{bestPRs.size}</span><span className="iw-stat-label">PRs on the wall</span></div>
      </div>

      {plans.length > 0 && (
        <button className="iw-btn-ember iw-btn-wide" onClick={() => go({ name: "plan", id: (lastSession && plans.find((p) => p.id === lastSession.plan_id)?.id) || plans[0].id })}>
          ⚡ start today&apos;s workout
        </button>
      )}

      <button className="iw-exit-link" onClick={onExit}>
        ✕ rack the plate — back to the map
      </button>
    </div>
  );

  /* ── CREED ── */
  const renderCreed = () => {
    const s = CREED[creedStep];
    const last = creedStep === CREED.length - 1;
    return (
      <div className="iw-page iw-page-in" key={`cr${creedStep}`}>
        <div className="iw-cr-dots">
          {CREED.map((_, i) => <span key={i} className={`iw-dot ${i <= creedStep ? "iw-dot-on" : ""}`} />)}
        </div>
        <div className="iw-cr-card">
          <h2 className="iw-display iw-cr-title">{s.title}</h2>
          <CreedVisual v={s.visual} />
          <p className="iw-body iw-cr-body">{s.body}</p>
        </div>
        <div className="iw-cr-nav">
          {!creedSeen && !last && (
            <button className="iw-btn-ghost" onClick={finishCreed}>skip — I&apos;ll read later</button>
          )}
          {(creedSeen || last) && creedStep > 0 && (
            <button className="iw-btn-ghost" onClick={() => setCreedStep(creedStep - 1)}>back</button>
          )}
          <button className="iw-btn-ember" onClick={() => (last ? finishCreed() : setCreedStep(creedStep + 1))}>
            {last ? "open the rack" : "next plate"}
          </button>
        </div>
      </div>
    );
  };

  /* ── PLANS INDEX ── */
  const renderPlans = () => (
    <div className="iw-page iw-page-in" key={`pl${pageKey}`}>
      <div className="iw-eyebrow">the rack</div>
      <h2 className="iw-display iw-page-title">Your Plans</h2>
      <div className="iw-stack">
        {plans.map((p) => {
          const lastRun = sessions.find((s) => s.plan_id === p.id);
          return (
            <button key={p.id} className="iw-plan-card" style={{ background: STEELS.find((x) => x.id === p.steel)?.css }}
              onClick={() => go({ name: "plan", id: p.id })}>
              <div className="iw-plan-emblem">{p.emblem}</div>
              <div className="iw-plan-text">
                <span className="iw-plan-name">{p.name}</span>
                <span className="iw-plan-sub">
                  {(p.exercises || []).length} lifts{p.focus ? ` · ${p.focus}` : ""}
                </span>
                <span className="iw-plan-last">{lastRun ? `last run ${relAge(lastRun.created_at)}` : "never run — first time under the bar"}</span>
              </div>
              <span className="iw-plan-go">❯</span>
            </button>
          );
        })}
      </div>
      <button className="iw-newplan" onClick={() => setNewPlanOpen(true)}>＋ forge a new plan</button>
      {plans.length === 0 && (
        <div className="iw-empty">an empty rack is a loud invitation — forge your first plan</div>
      )}
    </div>
  );

  /* ── SINGLE PLAN (edit + launch) ── */
  const renderPlan = () => {
    const p = plans.find((x) => x.id === view.id);
    if (!p) return null;
    return (
      <PlanPage key={`p${p.id}${pageKey}`} plan={p} settings={settings}
        onBack={() => go({ name: "plans" })}
        onPatch={(patch) => patchPlan(p.id, patch)}
        onDelete={() => { removePlan(p.id); go({ name: "plans" }); }}
        onStart={() => go({ name: "session", id: p.id })}
      />
    );
  };

  /* ── LIVE SESSION ── */
  const renderSession = () => {
    const p = plans.find((x) => x.id === view.id);
    if (!p) return null;
    return (
      <LiveSession key={`s${p.id}`} plan={p} settings={settings}
        bestPRs={bestPRs} lastWeights={lastWeights}
        onAbort={() => go({ name: "plan", id: p.id })}
        onFinish={rackSession}
      />
    );
  };

  /* ── THE WALL (PRs) ── */
  const renderWall = () => {
    const best = [...bestPRs.values()].sort((a, b) => b.weight - a.weight);
    return (
      <div className="iw-page iw-page-in" key={`w${pageKey}`}>
        <div className="iw-eyebrow">chalk on brick</div>
        <h2 className="iw-display iw-page-title">The PR Wall</h2>
        <div className="iw-wall">
          {best.map((p) => (
            <div key={p.id} className="iw-pr-card">
              <div className="iw-pr-lift">{p.exercise}</div>
              <div className="iw-pr-num">{p.weight}<span className="iw-pr-unit">lbs</span></div>
              <div className="iw-pr-meta">× {p.reps} · {fmtDate(p.created_at)}</div>
            </div>
          ))}
          {best.length === 0 && (
            <div className="iw-empty">the wall is bare — your first PR is one honest set away</div>
          )}
        </div>
      </div>
    );
  };

  /* ── THE LOG (history) ── */
  const renderLog = () => (
    <div className="iw-page iw-page-in" key={`l${pageKey}`}>
      <div className="iw-eyebrow">the book</div>
      <h2 className="iw-display iw-page-title">The Log</h2>
      <div className="iw-stack">
        {sessions.map((s, i) => {
          const prCount = prs.filter((p) => p.session_id === s.id).length;
          return (
            <button key={s.id} className="iw-log-card iw-drop-in" style={{ animationDelay: `${Math.min(i * 55, 550)}ms` }}
              onClick={() => go({ name: "session-detail", id: s.id })}>
              <div className="iw-log-top">
                <span className="iw-log-name">{s.plan_name || "freestyle"}</span>
                <span className="iw-log-date">{fmtDate(s.created_at)}</span>
              </div>
              <div className="iw-log-nums">
                <span>{fmtDur(s.duration_s)}</span>
                <span className="iw-cover-dot">·</span>
                <span>{fmtVol(s.total_volume)} lbs</span>
                <span className="iw-cover-dot">·</span>
                <span>{s.total_sets} sets</span>
                {prCount > 0 && <span className="iw-log-pr">✦ {prCount} PR{prCount > 1 ? "s" : ""}</span>}
              </div>
            </button>
          );
        })}
        {sessions.length === 0 && <div className="iw-empty">the book opens on a blank page — rack session one</div>}
      </div>
    </div>
  );

  /* ── SESSION DETAIL ── */
  const renderSessionDetail = () => {
    const s = sessions.find((x) => x.id === view.id);
    if (!s) return null;
    const sessionPRs = prs.filter((p) => p.session_id === s.id);
    return (
      <div className="iw-page iw-page-in" key={`sd${s.id}`}>
        <button className="iw-back" onClick={() => go({ name: "log" })}>❮ the log</button>
        <div className="iw-eyebrow">{fmtDate(s.created_at)}</div>
        <h2 className="iw-display iw-page-title">{s.plan_name || "freestyle"}</h2>
        <div className="iw-log-nums iw-detail-nums">
          <span>{fmtDur(s.duration_s)}</span>
          <span className="iw-cover-dot">·</span>
          <span>{fmtVol(s.total_volume)} lbs moved</span>
          <span className="iw-cover-dot">·</span>
          <span>{s.total_sets} sets</span>
        </div>
        {sessionPRs.length > 0 && (
          <div className="iw-detail-prs">
            {sessionPRs.map((p) => (
              <span key={p.id} className="iw-chip iw-chip-ember">✦ {p.exercise} — {p.weight} × {p.reps}</span>
            ))}
          </div>
        )}
        <div className="iw-stack">
          {(s.exercises || []).map((ex, i) => (
            <div key={i} className="iw-detail-ex">
              <div className="iw-detail-ex-name">{ex.name}</div>
              <div className="iw-detail-sets">
                {(ex.sets || []).map((set, j) => (
                  <span key={j} className="iw-set-chip">
                    {set.weight > 0 ? `${set.weight} × ${set.reps}` : `BW × ${set.reps}`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── nav ── */
  const NAV = [
    { id: "plans", label: "plans", glyph: "▦" },
    { id: "alpha", label: "alpha", glyph: "⚡" },
    { id: "wall", label: "the wall", glyph: "✦" },
    { id: "log", label: "the log", glyph: "❒" },
  ];
  const showNav = !["cover", "session", "creed"].includes(view.name);

  return (
    <div className="iw-root">
      <div className="iw-vignette" aria-hidden="true" />
      <div className="iw-frame">
        {view.name === "cover" && renderCover()}
        {view.name === "creed" && renderCreed()}
        {view.name === "plans" && renderPlans()}
        {view.name === "plan" && renderPlan()}
        {view.name === "session" && renderSession()}
        {view.name === "alpha" && (
          <AlphaMode key={`al${pageKey}`}
            workoutData={{ sessions, prs, addSession, addPR, bestPRs, lastWeights }} />
        )}
        {view.name === "wall" && renderWall()}
        {view.name === "log" && renderLog()}
        {view.name === "session-detail" && renderSessionDetail()}
      </div>

      {showNav && (
        <nav className="iw-nav">
          {NAV.map((n) => (
            <button key={n.id}
              className={`iw-nav-btn ${view.name === n.id || (n.id === "plans" && view.name === "plan") || (n.id === "log" && view.name === "session-detail") ? "iw-nav-on" : ""}`}
              onClick={() => go({ name: n.id })}>
              <span className="iw-nav-glyph">{n.glyph}</span>
              <span>{n.label}</span>
            </button>
          ))}
          <button className="iw-nav-btn" onClick={() => { setCreedStep(0); go({ name: "creed" }); }}>
            <span className="iw-nav-glyph">▲</span><span>creed</span>
          </button>
          <button className="iw-nav-btn" onClick={onExit}>
            <span className="iw-nav-glyph">✕</span><span>close</span>
          </button>
        </nav>
      )}

      {racked && (
        <RackedOverlay settings={settings} summary={racked.summary}
          onDone={() => { const cb = racked.after; setRacked(null); cb(); }} />
      )}

      {newPlanOpen && (
        <NewPlanModal onClose={() => setNewPlanOpen(false)} onCreate={(plan) => {
          const row = addPlan(plan);
          setNewPlanOpen(false);
          go({ name: "plan", id: row.id });
        }} />
      )}
    </div>
  );
}

/* ═══════════════ PLAN PAGE (edit + launch) ═══════════════ */
function PlanPage({ plan, onBack, onPatch, onDelete, onStart, settings }) {
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const exercises = plan.exercises || [];

  const addExercise = (ex) => {
    onPatch({ exercises: [...exercises, ex] });
    sfxCoin(settings);
    setAdding(false);
  };
  const removeExercise = (i) => {
    onPatch({ exercises: exercises.filter((_, j) => j !== i) });
  };

  return (
    <div className="iw-page iw-page-in">
      <button className="iw-back" onClick={onBack}>❮ the rack</button>
      <div className="iw-plan-opener" style={{ background: STEELS.find((x) => x.id === plan.steel)?.css }}>
        <div className="iw-plan-opener-emblem">{plan.emblem}</div>
        <h2 className="iw-display iw-plan-opener-title">{plan.name}</h2>
        {plan.focus && <div className="iw-plan-opener-focus">{plan.focus}</div>}
      </div>

      {exercises.length > 0 && (
        <button className="iw-btn-ember iw-btn-wide" onClick={onStart}>⚡ start session</button>
      )}

      <div className="iw-eyebrow iw-shelf-label">the lifts</div>
      <div className="iw-stack">
        {exercises.map((ex, i) => (
          <div key={i} className="iw-ex-row">
            <span className="iw-ex-name">{ex.name}</span>
            <span className="iw-ex-target">
              {ex.sets} × {ex.reps}{ex.weight > 0 ? ` · ${ex.weight} lbs` : " · BW"}
            </span>
            <button className="iw-ex-remove" aria-label={`Remove ${ex.name}`} onClick={() => removeExercise(i)}>✕</button>
          </div>
        ))}
        {exercises.length === 0 && <div className="iw-empty">no lifts yet — load the bar below</div>}
      </div>

      {adding ? (
        <AddExerciseForm onAdd={addExercise} onCancel={() => setAdding(false)} />
      ) : (
        <button className="iw-newplan" onClick={() => setAdding(true)}>＋ add a lift</button>
      )}

      {!confirmDelete ? (
        <button className="iw-danger-link" onClick={() => setConfirmDelete(true)}>melt this plan down</button>
      ) : (
        <div className="iw-danger-row">
          <span>sure? sessions already logged stay in the book.</span>
          <button className="iw-btn-ghost" onClick={() => setConfirmDelete(false)}>keep it</button>
          <button className="iw-danger-btn" onClick={onDelete}>melt it</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ ADD EXERCISE FORM ═══════════════ */
function AddExerciseForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const canAdd = name.trim().length > 0;
  return (
    <div className="iw-addex">
      <input className="iw-input" value={name} maxLength={60} placeholder="name the lift"
        onChange={(e) => setName(e.target.value)} />
      <div className="iw-lib-chips">
        {LIBRARY.map((l) => (
          <button key={l} className={`iw-chip-btn ${name === l ? "iw-chip-on" : ""}`} onClick={() => setName(l)}>{l}</button>
        ))}
      </div>
      <div className="iw-addex-steppers">
        <Stepper label="sets" value={sets} min={1} max={12} onChange={setSets} />
        <Stepper label="reps" value={reps} min={1} max={100} onChange={setReps} />
        <Stepper label="lbs (0 = bodyweight)" value={weight} step={5} min={0} onChange={setWeight} wide />
      </div>
      <div className="iw-addex-actions">
        <button className="iw-btn-ghost" onClick={onCancel}>cancel</button>
        <button className={`iw-btn-ember ${canAdd ? "" : "iw-btn-off"}`} disabled={!canAdd}
          onClick={() => onAdd({ name: name.trim(), sets, reps, weight })}>
          load it on the bar
        </button>
      </div>
    </div>
  );
}

/* ═══════════════ LIVE SESSION ═══════════════ */
const REST_PRESETS = [60, 90, 120, 180];

function LiveSession({ plan, bestPRs, lastWeights, onFinish, onAbort, settings }) {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [restLen, setRestLen] = useState(90);
  const [resting, setResting] = useState(false);
  const [prFlash, setPrFlash] = useState(null);
  const [confirmAbort, setConfirmAbort] = useState(false);

  const planExercises = plan.exercises || [];

  /* per-exercise logged sets + the working weight/reps steppers */
  const [logged, setLogged] = useState(() => planExercises.map(() => []));
  const [work, setWork] = useState(() => planExercises.map((ex) => ({
    weight: lastWeights.get(exKey(ex.name)) ?? ex.weight ?? 0,
    reps: ex.reps ?? 10,
  })));
  /* best new PR this session, one per exercise: exKey -> {exercise, weight, reps} */
  const sessionPRs = useRef(new Map());

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  const ex = planExercises[idx];
  if (!ex) return null;
  const sets = logged[idx];
  const w = work[idx];
  const targetDone = sets.length >= ex.sets;
  const isLastExercise = idx >= planExercises.length - 1;
  const anySetLogged = logged.some((s) => s.length > 0);

  const setWorkAt = (patch) => {
    setWork((prev) => prev.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  };

  const logSet = () => {
    const set = { weight: w.weight, reps: w.reps };
    setLogged((prev) => prev.map((s, i) => (i === idx ? [...s, set] : s)));
    sfxPlateClank(settings);
    try { if (navigator.vibrate) navigator.vibrate(20); } catch { /* silent */ }

    /* PR check: heavier than anything on the wall AND anything earlier this session */
    if (set.weight > 0) {
      const k = exKey(ex.name);
      const wall = bestPRs.get(k);
      const mine = sessionPRs.current.get(k);
      const beatsWall = !wall || set.weight > wall.weight;
      const beatsMine = !mine || set.weight > mine.weight;
      if (beatsWall && beatsMine) {
        const pr = { exercise: ex.name, weight: set.weight, reps: set.reps };
        sessionPRs.current.set(k, pr);
        setPrFlash(pr);
      }
    }
    setResting(true);
  };

  const finish = () => {
    const duration_s = Math.floor((Date.now() - startRef.current) / 1000);
    const exercises = planExercises
      .map((e, i) => ({ name: e.name, sets: logged[i] }))
      .filter((e) => e.sets.length > 0);
    const total_volume = exercises.reduce(
      (sum, e) => sum + e.sets.reduce((s, x) => s + x.weight * x.reps, 0), 0);
    const total_sets = exercises.reduce((sum, e) => sum + e.sets.length, 0);
    onFinish({
      session: {
        plan_id: plan.id,
        plan_name: plan.name,
        duration_s,
        total_volume,
        total_sets,
        exercises,
      },
      prs: [...sessionPRs.current.values()],
    });
  };

  return (
    <div className="iw-page iw-page-in iw-session">
      <div className="iw-session-top">
        <button className="iw-back" onClick={() => setConfirmAbort(true)}>❮ {plan.name}</button>
        <span className="iw-session-clock">{fmtDur(elapsed)}</span>
      </div>

      <div className="iw-session-progress">
        {planExercises.map((_, i) => (
          <span key={i} className={`iw-prog-cell ${i < idx || logged[i].length > 0 ? "iw-prog-done" : ""} ${i === idx ? "iw-prog-now" : ""}`} />
        ))}
      </div>

      <div className="iw-eyebrow">lift {idx + 1} of {planExercises.length}</div>
      <h2 className="iw-display iw-session-lift">{ex.name}</h2>
      <div className="iw-session-target">
        target {ex.sets} × {ex.reps}
        {bestPRs.get(exKey(ex.name)) && (
          <span className="iw-session-pr-hint"> · wall: {bestPRs.get(exKey(ex.name)).weight} lbs</span>
        )}
      </div>

      <div className="iw-set-chips">
        {sets.map((s, i) => (
          <span key={i} className="iw-set-chip iw-set-chip-done">
            {s.weight > 0 ? `${s.weight} × ${s.reps}` : `BW × ${s.reps}`}
          </span>
        ))}
        {Array.from({ length: Math.max(0, ex.sets - sets.length) }).map((_, i) => (
          <span key={`g${i}`} className="iw-set-chip iw-set-chip-ghost">set {sets.length + i + 1}</span>
        ))}
      </div>

      {resting ? (
        <RestTimer seconds={restLen} settings={settings}
          onDone={() => setResting(false)} onSkip={() => setResting(false)} />
      ) : (
        <>
          <div className="iw-work-steppers">
            <Stepper label="lbs" value={w.weight} step={5} min={0} onChange={(v) => setWorkAt({ weight: v })} wide />
            <Stepper label="reps" value={w.reps} min={1} max={100} onChange={(v) => setWorkAt({ reps: v })} />
          </div>
          <button className="iw-btn-ember iw-btn-wide iw-log-set-btn" onClick={logSet}>
            ⬛ rack the set
          </button>
        </>
      )}

      <div className="iw-rest-presets">
        <span className="iw-eyebrow">rest</span>
        {REST_PRESETS.map((r) => (
          <button key={r} className={`iw-chip-btn ${restLen === r ? "iw-chip-on" : ""}`} onClick={() => setRestLen(r)}>{r}s</button>
        ))}
      </div>

      <div className="iw-session-actions">
        {!isLastExercise && (
          <button className={`iw-btn-ghost ${targetDone ? "iw-btn-ready" : ""}`} onClick={() => { setResting(false); setIdx(idx + 1); sfxChalkPoof(settings); }}>
            next lift ❯
          </button>
        )}
        {anySetLogged && (
          <button className={`${isLastExercise && targetDone ? "iw-btn-ember" : "iw-btn-ghost"}`} onClick={finish}>
            ⬛ rack it — finish session
          </button>
        )}
      </div>

      {prFlash && <PRFlash pr={prFlash} settings={settings} onDone={() => setPrFlash(null)} />}

      {confirmAbort && (
        <div className="iw-modal-veil" onClick={() => setConfirmAbort(false)}>
          <div className="iw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="iw-eyebrow">leave the session?</div>
            <p className="iw-body">Nothing gets saved unless you rack it. Walk away, or finish what you started.</p>
            <div className="iw-modal-actions">
              <button className="iw-btn-ghost" onClick={onAbort}>walk away</button>
              <button className="iw-btn-ember" onClick={() => setConfirmAbort(false)}>stay under the bar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ NEW PLAN MODAL ═══════════════ */
function NewPlanModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [steel, setSteel] = useState("gunmetal");
  const [emblem, setEmblem] = useState("▲");
  const [template, setTemplate] = useState(null);

  const pickTemplate = (t) => {
    setTemplate(t.key);
    setName(t.name);
    setFocus(t.focus);
    setSteel(t.steel);
    setEmblem(t.emblem);
  };

  const create = () => {
    const tpl = TEMPLATES.find((t) => t.key === template);
    onCreate({
      name: name.trim(),
      focus: focus.trim(),
      steel,
      emblem,
      exercises: tpl ? tpl.exercises.map((e) => ({ ...e })) : [],
    });
  };

  return (
    <div className="iw-modal-veil" onClick={onClose}>
      <div className="iw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="iw-eyebrow">forge a plan</div>

        <div className="iw-eyebrow iw-modal-sub">start from a template</div>
        <div className="iw-tpl-row">
          {TEMPLATES.map((t) => (
            <button key={t.key} className={`iw-tpl-card ${template === t.key ? "iw-tpl-on" : ""}`}
              style={{ background: STEELS.find((x) => x.id === t.steel)?.css }}
              onClick={() => pickTemplate(t)}>
              <span className="iw-tpl-emblem">{t.emblem}</span>
              <span className="iw-tpl-name">{t.name}</span>
            </button>
          ))}
        </div>

        <input className="iw-input" placeholder="plan name" value={name} maxLength={48}
          onChange={(e) => { setName(e.target.value); setTemplate(null); }} />
        <input className="iw-input iw-input-sub" placeholder="focus — e.g. chest · triceps (optional)" value={focus} maxLength={40}
          onChange={(e) => setFocus(e.target.value)} />

        <div className="iw-eyebrow iw-modal-sub">steel</div>
        <div className="iw-swatch-row">
          {STEELS.map((s) => (
            <button key={s.id} className={`iw-swatch ${steel === s.id ? "iw-swatch-on" : ""}`}
              style={{ background: s.css }} onClick={() => setSteel(s.id)} aria-label={s.label} />
          ))}
        </div>
        <div className="iw-eyebrow iw-modal-sub">stamp</div>
        <div className="iw-swatch-row">
          {EMBLEMS.map((g) => (
            <button key={g} className={`iw-emblem-pick ${emblem === g ? "iw-swatch-on" : ""}`} onClick={() => setEmblem(g)}>{g}</button>
          ))}
        </div>

        <div className="iw-modal-actions">
          <button className="iw-btn-ghost" onClick={onClose}>cancel</button>
          <button className={`iw-btn-ember ${name.trim() ? "" : "iw-btn-off"}`} disabled={!name.trim()} onClick={create}>
            stamp the steel
          </button>
        </div>
      </div>
    </div>
  );
}
