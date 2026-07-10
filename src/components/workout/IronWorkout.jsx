import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useWorkout } from "./useWorkout.js";
import { useAlpha } from "./alpha/useAlpha.js";
import AlphaMode from "./alpha/AlphaMode.jsx";
import ProgramConsole from "./alpha/ProgramConsole.jsx";
import BookOfIron from "./alpha/BookOfIron.jsx";
import FridgePage from "./alpha/FridgePage.jsx";
import ExerciseHowTo from "./alpha/ExerciseHowTo.jsx";
import PlanBuilder from "./alpha/PlanBuilder.jsx";
import { exerciseInfo } from "./alpha/data/exercises.js";
import {
  sfxPlateClank,
  sfxChalkPoof,
  sfxRoundBell,
  sfxImpact,
} from "../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE IRON
   blackened steel · chalk dust · ember heat
   nav: today (campaign hub) · program (phases console) · fridge ·
   book (all readable content) · records (PR wall + history).
   cover → today; live custom sessions ride plan → session.
   Persisted to Supabase (workout_* tables) via useWorkout.
   ═══════════════════════════════════════════════════════════════ */

const EMBER = "#FF6A2B";
const CHALK = "#E8E4DA";

export const STEELS = [
  { id: "gunmetal", label: "gunmetal", css: "linear-gradient(150deg,#2e3238,#1a1d21 55%,#0d0e10)" },
  { id: "carbon", label: "carbon", css: "linear-gradient(150deg,#232323,#141414 55%,#0a0a0a)" },
  { id: "blued", label: "blued", css: "linear-gradient(150deg,#1f2a3d,#131a28 55%,#0a0d14)" },
  { id: "rust", label: "rust", css: "linear-gradient(150deg,#3a221a,#221310 55%,#100907)" },
];
export const EMBLEMS = ["▲", "◆", "⬢", "✦", "⚡", "✕"];

/* Template lifts use CANONICAL library names (from alpha/data/exercises.js)
   so every seeded plan resolves its image + how-to. */
export const TEMPLATES = [
  {
    key: "push", name: "PUSH DAY", focus: "chest · shoulders · triceps", steel: "gunmetal", emblem: "▲",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 135 },
      { name: "Barbell Overhead Press", sets: 3, reps: 10, weight: 75 },
      { name: "Incline DB Chest Press", sets: 3, reps: 10, weight: 40 },
      { name: "Chest Dip", sets: 3, reps: 12, weight: 0 },
      { name: "Triceps Pushdown", sets: 3, reps: 12, weight: 40 },
    ],
  },
  {
    key: "pull", name: "PULL DAY", focus: "back · biceps", steel: "blued", emblem: "◆",
    exercises: [
      { name: "Barbell Deadlift", sets: 4, reps: 6, weight: 185 },
      { name: "Barbell Bent-Over Row", sets: 4, reps: 8, weight: 115 },
      { name: "Lat Pulldown", sets: 3, reps: 10, weight: 100 },
      { name: "Barbell Curl", sets: 3, reps: 12, weight: 45 },
      { name: "Face Pull", sets: 3, reps: 15, weight: 30 },
    ],
  },
  {
    key: "legs", name: "LEG DAY", focus: "quads · hams · calves", steel: "carbon", emblem: "⬢",
    exercises: [
      { name: "Back Squat", sets: 4, reps: 8, weight: 155 },
      { name: "Barbell Romanian Deadlift", sets: 3, reps: 10, weight: 135 },
      { name: "Leg Press", sets: 3, reps: 12, weight: 230 },
      { name: "Walking Lunge", sets: 3, reps: 12, weight: 0 },
      { name: "Calf Raise", sets: 4, reps: 15, weight: 90 },
    ],
  },
  {
    key: "full", name: "FULL BODY", focus: "the big five", steel: "rust", emblem: "⚡",
    exercises: [
      { name: "Back Squat", sets: 3, reps: 8, weight: 155 },
      { name: "Bench Press", sets: 3, reps: 8, weight: 135 },
      { name: "Barbell Bent-Over Row", sets: 3, reps: 8, weight: 115 },
      { name: "Barbell Overhead Press", sets: 3, reps: 10, weight: 75 },
      { name: "Push-Up", sets: 3, reps: 15, weight: 0 },
    ],
  },
];

/* ── plan → blocks: consecutive exercises sharing a non-null `group`
   run back-to-back as a superset; everything else is a singleton.
   Old flat plans (no group) → all singletons → identical behavior.
   Shared by PlanBuilder and LiveSession. ── */
export function deriveBlocks(exercises = []) {
  const raw = [];
  let cur = null;
  exercises.forEach((ex, i) => {
    const g = ex.group;
    if (cur && g != null && cur.group === g) {
      cur.members.push(i);
    } else {
      cur = { group: g, members: [i] };
      raw.push(cur);
    }
  });
  return raw.map((b) => {
    const last = exercises[b.members[b.members.length - 1]];
    return {
      members: b.members,
      superset: b.members.length > 1,
      rounds: Math.max(1, ...b.members.map((mi) => exercises[mi].sets || 1)),
      rest: last.rest ?? null,
    };
  });
}

export const CREED = [
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
/* a lift is timed if the plan item says so, or the library entry is a hold */
const isHoldEx = (ex) => !!(ex?.hold ?? exerciseInfo(ex?.name)?.hold);

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
      <div className="iw-racked-sub">workout saved to your log ✓</div>
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
      <button className="iw-btn-ghost" onClick={onSkip}>skip rest → next set</button>
    </div>
  );
}

/* ── creed visuals (rendered by the Book of Iron's Creed chapter) ── */
export function CreedVisual({ v }) {
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
  const alpha = useAlpha(userId);

  const [view, setView] = useState(() => {
    // deep links (e.g. Sunday Review → the fridge) skip the cover
    try {
      const hint = window.sessionStorage.getItem("iron_view");
      if (hint === "alpha:stockpile") {
        window.sessionStorage.removeItem("iron_view");
        return { name: "fridge" };
      }
      if (hint && hint.startsWith("alpha")) {
        window.sessionStorage.removeItem("iron_view");
        return { name: "today" };
      }
    } catch { /* silent */ }
    return { name: "cover" };
  }); // cover | today | program | fridge | book | records | plan | session | session-detail
  const [opening, setOpening] = useState(false);
  const [racked, setRacked] = useState(null); // {summary, after}
  const [pageKey, setPageKey] = useState(0);
  const [recordsTab, setRecordsTab] = useState("prs"); // prs | history
  const [alphaEntry, setAlphaEntry] = useState(null); // deep entry into the campaign (gate/boss/session)
  const [alphaImmersive, setAlphaImmersive] = useState(false); // hide nav during crossing/session/boss

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

  const workoutData = { sessions, prs, addSession, addPR, bestPRs, lastWeights };

  /* trait levels from real behavior (Book of Iron · trait tree) */
  const traitLevels = useMemo(() => {
    const ev = alpha.events || [];
    const count = (k) => ev.filter((e) => e.kind === k).length;
    const alphaSessions = (sessions || []).filter((s) => s.meta?.alpha);
    const lowersHonored = alphaSessions.filter((s) =>
      (s.meta.alpha.verdicts || []).some((v) => v.verdict === "lower")).length;
    return {
      helpful: Math.min(5, Math.floor(count("fridge_stocked") / 2)),
      confident: Math.min(5, Math.floor(alphaSessions.length / 5)),
      vain: Math.min(5, Math.floor(count("cardio") / 3)),
      prideful: Math.min(5, count("week_complete")),
      humble: Math.min(5, lowersHonored),
      tolerant: Math.min(5, Math.floor(count("fast_complete") / 5)),
      dedicated: Math.min(5, count("phase_complete") * 2 + Math.floor(count("week_complete") / 4)),
    };
  }, [alpha.events, sessions]);

  const openBook = () => {
    setOpening(true);
    sfxPlateClank(settings);
    setTimeout(() => {
      setOpening(false);
      go({ name: "today" });
    }, 850);
  };

  /* IronWorkout mounts fresh on every open (WorkoutMode conditional
     render), so the initial view — cover, or a deep-link target — is
     decided once in the useState initializer above. No reset effect:
     it would race the deep-link consumption. */

  /* save a finished session + its PRs, then slam the plate */
  const rackSession = (result) => {
    const row = addSession(result.session);
    result.prs.forEach((p) => addPR({ ...p, session_id: row.id }));
    const xp = 20 + result.prs.length * 15;
    addXP(xp, "Iron session racked");
    setRacked({
      summary: { ...result.session, prCount: result.prs.length },
      after: () => { setRecordsTab("history"); go({ name: "records" }); },
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

      {(alpha.state.flags.crossingDone || plans.length > 0) && (
        <button className="iw-btn-ember iw-btn-forge iw-btn-wide" onClick={() => {
          if (alpha.state.flags.crossingDone || plans.length === 0) go({ name: "today" });
          else go({ name: "plan", id: (lastSession && plans.find((p) => p.id === lastSession.plan_id)?.id) || plans[0].id });
        }}>
          <span className="iw-btn-main">ENTER THE 45</span>
          <span className="iw-btn-sub">today&apos;s session is ready</span>
        </button>
      )}

      <button className="iw-exit-link" onClick={onExit}>
        ✕ exit THE IRON
      </button>
    </div>
  );

  /* ── SINGLE PLAN (edit + launch) — reached from the Program console ── */
  const renderPlan = () => {
    const p = plans.find((x) => x.id === view.id);
    if (!p) return null;
    return (
      <PlanPage key={`p${p.id}${pageKey}`} plan={p} settings={settings}
        onBack={() => go({ name: "program" })}
        onEdit={() => go({ name: "builder", id: p.id })}
        onStart={() => go({ name: "session", id: p.id })}
      />
    );
  };

  /* ── BUILDER (create / reforge a custom plan) ── */
  const renderBuilder = () => {
    const existing = view.id ? plans.find((x) => x.id === view.id) : null;
    return (
      <PlanBuilder key={`b${view.id || "new"}${pageKey}`} plan={existing} settings={settings}
        onCancel={() => go(existing ? { name: "plan", id: existing.id } : { name: "program" })}
        onSave={(data) => {
          if (existing) { patchPlan(existing.id, data); go({ name: "plan", id: existing.id }); }
          else { const row = addPlan(data); go({ name: "plan", id: row.id }); }
        }}
        onDelete={existing ? () => { removePlan(existing.id); go({ name: "program" }); } : undefined}
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

  /* ── RECORDS — the PR wall + the history, one page ── */
  const renderRecords = () => {
    const best = [...bestPRs.values()].sort((a, b) => b.weight - a.weight);
    return (
      <div className="iw-page iw-page-in" key={`r${pageKey}`}>
        <div className="iw-eyebrow">{recordsTab === "prs" ? "chalk on brick" : "every rep, in the book"}</div>
        <h2 className="iw-display iw-page-title">Records</h2>
        <div className="iw-rec-tabs">
          <button className={`iw-chip-btn ${recordsTab === "prs" ? "iw-chip-on" : ""}`}
            onClick={() => setRecordsTab("prs")}>✦ PR wall</button>
          <button className={`iw-chip-btn ${recordsTab === "history" ? "iw-chip-on" : ""}`}
            onClick={() => setRecordsTab("history")}>❒ history</button>
        </div>

        {recordsTab === "prs" ? (
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
        ) : (
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
        )}
      </div>
    );
  };

  /* ── SESSION DETAIL ── */
  const renderSessionDetail = () => {
    const s = sessions.find((x) => x.id === view.id);
    if (!s) return null;
    const sessionPRs = prs.filter((p) => p.session_id === s.id);
    return (
      <div className="iw-page iw-page-in" key={`sd${s.id}`}>
        <button className="iw-back" onClick={() => { setRecordsTab("history"); go({ name: "records" }); }}>❮ records</button>
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
    { id: "today", label: "today", glyph: "⚡" },
    { id: "program", label: "program", glyph: "▦" },
    { id: "fridge", label: "fridge", glyph: "🧊" },
    { id: "book", label: "book", glyph: "❖" },
    { id: "records", label: "records", glyph: "✦" },
  ];
  const navOn = (id) =>
    view.name === id ||
    (id === "program" && ["plan", "plans"].includes(view.name)) ||
    (id === "records" && view.name === "session-detail");
  const showNav = !["cover", "session", "builder"].includes(view.name) && !alphaImmersive;

  const enterCampaign = (entry) => {
    setAlphaEntry(entry || null);
    go({ name: "today" });
  };

  return (
    <div className="iw-root">
      <div className="iw-vignette" aria-hidden="true" />
      <div className="iw-frame">
        {view.name === "cover" && renderCover()}
        {view.name === "today" && (
          <AlphaMode key={`al${pageKey}`} alpha={alpha} workoutData={workoutData}
            initialView={alphaEntry}
            onImmersiveChange={setAlphaImmersive}
            onOpenFridge={() => go({ name: "fridge" })} />
        )}
        {view.name === "program" && (
          <ProgramConsole key={`pg${pageKey}`} alpha={alpha} sessions={sessions} plans={plans}
            settings={settings}
            onOpenPlan={(id) => go({ name: "plan", id })}
            onNewPlan={() => go({ name: "builder" })}
            onEnterCampaign={enterCampaign} />
        )}
        {view.name === "fridge" && (
          <FridgePage key={`fr${pageKey}`} alpha={alpha} addXP={addXP} settings={settings} />
        )}
        {view.name === "book" && (
          <BookOfIron key={`bk${pageKey}`} alpha={alpha} prs={prs} traitLevels={traitLevels}
            creedSeen={creedSeen} markCreedSeen={markCreedSeen} addXP={addXP} settings={settings}
            onOpenProgram={() => go({ name: "program" })}
            onOpenRoad={() => enterCampaign({ name: "map" })}
            onFight={(bossId) => enterCampaign({ name: "boss", bossId, from: { name: "zone" } })} />
        )}
        {view.name === "plan" && renderPlan()}
        {view.name === "builder" && renderBuilder()}
        {view.name === "session" && renderSession()}
        {view.name === "records" && renderRecords()}
        {view.name === "session-detail" && renderSessionDetail()}
      </div>

      {showNav && (
        <nav className="iw-nav">
          {NAV.map((n) => (
            <button key={n.id}
              className={`iw-nav-btn ${navOn(n.id) ? "iw-nav-on" : ""}`}
              onClick={() => { if (n.id === "today") setAlphaEntry(null); go({ name: n.id }); }}>
              <span className="iw-nav-glyph">{n.glyph}</span>
              <span>{n.label}</span>
            </button>
          ))}
          <button className="iw-nav-btn" onClick={onExit}>
            <span className="iw-nav-glyph">✕</span><span>close</span>
          </button>
        </nav>
      )}

      {racked && (
        <RackedOverlay settings={settings} summary={racked.summary}
          onDone={() => { const cb = racked.after; setRacked(null); cb(); }} />
      )}
    </div>
  );
}

/* ═══════════════ PLAN PAGE (preview + launch) ═══════════════ */
function PlanPage({ plan, onBack, onEdit, onStart }) {
  const exercises = plan.exercises || [];
  const blocks = deriveBlocks(exercises);

  const target = (ex) =>
    isHoldEx(ex)
      ? `${ex.sets} × ${ex.reps}s`
      : `${ex.sets} × ${ex.reps}${ex.weight > 0 ? ` · ${ex.weight} lbs` : " · BW"}`;

  return (
    <div className="iw-page iw-page-in">
      <button className="iw-back" onClick={onBack}>❮ the rack</button>
      <div className="iw-plan-opener" style={{ background: STEELS.find((x) => x.id === plan.steel)?.css }}>
        <div className="iw-plan-opener-emblem">{plan.emblem}</div>
        <h2 className="iw-display iw-plan-opener-title">{plan.name}</h2>
        {plan.focus && <div className="iw-plan-opener-focus">{plan.focus}</div>}
      </div>

      {exercises.length > 0 && (
        <button className="iw-btn-ember iw-btn-forge iw-btn-wide" onClick={onStart}>
          <span className="iw-btn-main">ENTER THE 45</span>
          <span className="iw-btn-sub">step under the bar</span>
        </button>
      )}

      <div className="iw-eyebrow iw-shelf-label">the lifts</div>
      <div className="iw-stack">
        {blocks.map((b, bi) => (
          <div key={bi} className={b.superset ? "iw-super-bracket" : ""}>
            {b.superset && <div className="iw-super-tag">superset · {b.rounds} rounds</div>}
            {b.members.map((mi) => {
              const ex = exercises[mi];
              return (
                <div key={mi} className="iw-ex-row">
                  <span className="iw-ex-name">{ex.name}</span>
                  <span className="iw-ex-target">{target(ex)}</span>
                </div>
              );
            })}
          </div>
        ))}
        {exercises.length === 0 && <div className="iw-empty">no lifts yet — open the builder</div>}
      </div>

      <button className="iw-newplan" onClick={onEdit}>✎ edit in the builder</button>
    </div>
  );
}

/* ═══════════════ LIVE SESSION ═══════════════ */
const REST_PRESETS = [60, 90, 120, 180];

function LiveSession({ plan, bestPRs, lastWeights, onFinish, onAbort, settings }) {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const planExercises = plan.exercises || [];
  const blocks = useMemo(() => deriveBlocks(planExercises), [plan]);

  const [blockIdx, setBlockIdx] = useState(0);
  const [memberPos, setMemberPos] = useState(0);
  const [restLen, setRestLen] = useState(90);
  const [restSecs, setRestSecs] = useState(90);
  const [resting, setResting] = useState(false);
  const [prFlash, setPrFlash] = useState(null);
  const [confirmAbort, setConfirmAbort] = useState(false);

  /* per-exercise logged sets + the working weight/reps steppers (index-keyed) */
  const [logged, setLogged] = useState(() => planExercises.map(() => []));
  const [work, setWork] = useState(() => planExercises.map((ex) => ({
    weight: lastWeights.get(exKey(ex.name)) ?? ex.weight ?? 0,
    reps: ex.reps ?? 10,
  })));
  const sessionPRs = useRef(new Map());

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  const block = blocks[blockIdx];
  if (!block) return null;
  const curIdx = block.members[Math.min(memberPos, block.members.length - 1)];
  const ex = planExercises[curIdx];
  if (!ex) return null;
  const hold = isHoldEx(ex);
  const sets = logged[curIdx];
  const w = work[curIdx];

  const memberDone = (mi) => logged[mi].length >= (planExercises[mi].sets || 1);
  const blockDone = block.members.every(memberDone);
  const isLastBlock = blockIdx >= blocks.length - 1;
  const anySetLogged = logged.some((s) => s.length > 0);
  const restForBlock = block.rest ?? restLen;

  const setWorkAt = (patch) => {
    setWork((prev) => prev.map((x, i) => (i === curIdx ? { ...x, ...patch } : x)));
  };

  const commitSet = (set) => {
    setLogged((prev) => prev.map((s, i) => (i === curIdx ? [...s, set] : s)));
    sfxPlateClank(settings);
    try { if (navigator.vibrate) navigator.vibrate(20); } catch { /* silent */ }

    /* PR check: real weight only — never for holds. Heavier than the wall AND this session. */
    if (!hold && set.weight > 0) {
      const k = exKey(ex.name);
      const wall = bestPRs.get(k);
      const mine = sessionPRs.current.get(k);
      if ((!wall || set.weight > wall.weight) && (!mine || set.weight > mine.weight)) {
        const pr = { exercise: ex.name, weight: set.weight, reps: set.reps };
        sessionPRs.current.set(k, pr);
        setPrFlash(pr);
      }
    }

    /* superset: hop to the next member with no rest; otherwise rest the block */
    if (block.superset && memberPos < block.members.length - 1) {
      setMemberPos(memberPos + 1);
    } else {
      setRestSecs(restForBlock);
      setResting(true);
    }
  };

  const logSet = () => commitSet({ weight: w.weight, reps: w.reps });
  const logHold = (secs) => commitSet({ weight: 0, reps: Math.max(1, Math.round(secs)) });

  const onRestDone = () => {
    setResting(false);
    if (block.superset && !blockDone) setMemberPos(0); // start the next superset round
  };

  const goNextBlock = () => {
    setResting(false);
    setMemberPos(0);
    setBlockIdx((b) => Math.min(blocks.length - 1, b + 1));
    sfxChalkPoof(settings);
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
      session: { plan_id: plan.id, plan_name: plan.name, duration_s, total_volume, total_sets, exercises },
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
        {blocks.map((b, i) => (
          <span key={i} className={`iw-prog-cell ${i < blockIdx || b.members.every(memberDone) ? "iw-prog-done" : ""} ${i === blockIdx ? "iw-prog-now" : ""}`} />
        ))}
      </div>

      {block.superset && (
        <div className="iw-super-banner">
          superset · {block.members.map((mi) => planExercises[mi].name).join(" + ")}
        </div>
      )}

      <div className="iw-eyebrow">
        {block.superset ? `move ${memberPos + 1} of ${block.members.length}` : `lift ${blockIdx + 1} of ${blocks.length}`}
      </div>
      <h2 className="iw-display iw-session-lift">{ex.name}</h2>
      <div className="iw-session-target">
        target {ex.sets} × {hold ? `${ex.reps}s` : ex.reps}
        {ex.weight > 0 && !hold ? ` · ${ex.weight} lbs` : ""}
        {bestPRs.get(exKey(ex.name)) && !hold && (
          <span className="iw-session-pr-hint"> · wall: {bestPRs.get(exKey(ex.name)).weight} lbs</span>
        )}
      </div>
      {ex.note && <div className="iw-session-note">✎ {ex.note}</div>}
      <ExerciseHowTo key={exKey(ex.name)} name={ex.name}
        defaultOpen={!hold && !lastWeights.has(exKey(ex.name)) && sets.length === 0} />

      <div className="iw-set-chips">
        {sets.map((s, i) => (
          <span key={i} className="iw-set-chip iw-set-chip-done">
            {hold ? `${s.reps}s` : s.weight > 0 ? `${s.weight} × ${s.reps}` : `BW × ${s.reps}`}
          </span>
        ))}
        {Array.from({ length: Math.max(0, ex.sets - sets.length) }).map((_, i) => (
          <span key={`g${i}`} className="iw-set-chip iw-set-chip-ghost">set {sets.length + i + 1}</span>
        ))}
      </div>

      {resting ? (
        <RestTimer seconds={restSecs} settings={settings}
          onDone={onRestDone} onSkip={onRestDone} />
      ) : hold ? (
        <HoldControl key={`${curIdx}-${sets.length}`} seconds={ex.reps || 30} settings={settings} onLog={logHold} />
      ) : (
        <>
          <div className="iw-work-steppers">
            <Stepper label="lbs" value={w.weight} step={5} min={0} onChange={(v) => setWorkAt({ weight: v })} wide />
            <Stepper label="reps" value={w.reps} min={1} max={100} onChange={(v) => setWorkAt({ reps: v })} />
          </div>
          <button className="iw-btn-ember iw-btn-wide iw-log-set-btn" onClick={logSet}>
            ✓ LOG SET <span className="iw-btn-sub">· set done</span>
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
        {!isLastBlock && (
          <button className={`iw-btn-ghost ${blockDone ? "iw-btn-ready" : ""}`} onClick={goNextBlock}>
            next {block.superset ? "block" : "lift"} ❯
          </button>
        )}
        {anySetLogged && (
          <button className={`${isLastBlock && blockDone ? "iw-btn-ember" : "iw-btn-ghost"}`} onClick={finish}>
            ■ FINISH &amp; SAVE WORKOUT
          </button>
        )}
      </div>

      {prFlash && <PRFlash pr={prFlash} settings={settings} onDone={() => setPrFlash(null)} />}

      {confirmAbort && (
        <div className="iw-modal-veil" onClick={() => setConfirmAbort(false)}>
          <div className="iw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="iw-eyebrow">leave the workout?</div>
            <p className="iw-body">Nothing gets saved unless you finish. Leave now, or keep training.</p>
            <div className="iw-modal-actions">
              <button className="iw-btn-ghost" onClick={onAbort}>leave — nothing saved</button>
              <button className="iw-btn-ember" onClick={() => setConfirmAbort(false)}>keep training</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── hold control: countdown for timed moves (planks, carries, swings) ── */
function HoldControl({ seconds, onLog, settings }) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(0);
  useEffect(() => { if (!running) setLeft(seconds); }, [seconds, running]);
  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + left * 1000;
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setLeft(rem);
      if (rem <= 0) {
        clearInterval(iv);
        setRunning(false);
        sfxRoundBell(settings);
        try { if (navigator.vibrate) navigator.vibrate([60, 80, 60]); } catch { /* silent */ }
        onLog(seconds);
      }
    }, 200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  const frac = seconds > 0 ? left / seconds : 0;
  return (
    <div className="iw-hold">
      <div className="iw-rest-ring iw-hold-ring" style={{ "--iw-frac": frac }}>
        <span className="iw-rest-num">{left}</span>
        <span className="iw-rest-unit">hold</span>
      </div>
      {running ? (
        <button className="iw-btn-ghost" onClick={() => { setRunning(false); onLog(Math.max(1, seconds - left)); }}>■ stop &amp; log</button>
      ) : (
        <button className="iw-btn-ember iw-btn-wide iw-log-set-btn" onClick={() => setRunning(true)}>
          ▶ START THE {seconds}s HOLD
        </button>
      )}
    </div>
  );
}
