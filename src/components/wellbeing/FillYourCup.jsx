import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CATEGORIES, ENERGY_MSGS, MILESTONES,
  LEVELS, KILL_STREAKS, getLevel, getNextLevel,
} from "./cupData.js";
import CupWizard from "./CupWizard.jsx";
import "./FillYourCup.css";

const TODAY = new Date().toISOString().split("T")[0];

// ─── Storage ─────────────────────────────────────────────────────────────────

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function loadMyCup() { return load("fyc_my_cup"); }
function saveMyCup(val) { save("fyc_my_cup", val); }

function getInitialState() {
  const saved = load("fill_your_cup");
  let streak = 0;
  let bestStreak = 0;
  let pendingKillStreak = null;

  if (saved?.date) {
    bestStreak = saved.bestStreak || 0;
    const diff = Math.round((new Date(TODAY) - new Date(saved.date)) / 86400000);
    if (diff === 0) return saved;
    if (diff === 1) {
      const prev = saved.streak || 0;
      streak = (saved.filledToday || saved.pct >= 100) ? prev + 1 : prev;
      bestStreak = Math.max(saved.bestStreak || 0, streak);
      // Check if we just crossed a kill streak threshold
      const hit = KILL_STREAKS.find(k => k.streak === streak);
      if (hit) pendingKillStreak = hit;
    }
    // diff > 1: streak resets to 0, best stays
  }

  return {
    date: TODAY,
    completed: [],
    pct: 0,
    filledToday: false,
    streak,
    bestStreak,
    shownMilestones: [],
    weeklyReview: saved?.weeklyReview || {},
    weeklyScores: saved?.weeklyScores || {},
    pendingKillStreak,
  };
}

function buildHabitsMap(customHabits) {
  const map = {};
  CATEGORIES.forEach(cat => {
    cat.habits.forEach((h, i) => { map[`${cat.id}_${i}`] = h.pts; });
  });
  if (customHabits) {
    customHabits.forEach((h, i) => { map[`mycup_${i}`] = h.pts; });
  }
  return map;
}

function computePct(completed, habitsMap, threshold) {
  const pts = completed.reduce((sum, key) => sum + (habitsMap[key] || 0), 0);
  return Math.min(100, Math.round((pts / threshold) * 100));
}

// ─── Animated Cup SVG ─────────────────────────────────────────────────────────

function AnimatedCup({ pct, pour = false }) {
  const isFull = pct >= 100;
  const isEmpty = pct === 0;
  const fillY = 215 - (195 * Math.min(pct, 100) / 100);

  return (
    <div className={`fyc-cup ${isFull ? "fyc-cup--full" : ""} ${isEmpty ? "fyc-cup--empty" : ""} ${pour ? "fyc-cup--pour" : ""}`}>
      <svg viewBox="0 0 200 240" className="fyc-cup__svg" aria-hidden="true">
        <defs>
          <clipPath id="fyc-clip">
            <path d="M 30 20 L 170 20 L 147 202 Q 140 218 100 218 Q 60 218 53 202 Z" />
          </clipPath>
          <linearGradient id="fyc-liq" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#D11EFF" />
            <stop offset="100%" stopColor="#00FFBF" />
          </linearGradient>
          <linearGradient id="fyc-glass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <filter id="fyc-glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="fyc-glow-sm">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g clipPath="url(#fyc-clip)">
          <rect className="fyc-liquid-rect"
            x="0" y={fillY} width="200" height={215 - fillY}
            fill="url(#fyc-liq)" opacity="0.88" />
          {pct > 2 && pct < 100 && (
            <path className="fyc-wave"
              d={`M -50 ${fillY} Q 25 ${fillY - 8} 100 ${fillY} Q 175 ${fillY + 8} 250 ${fillY} L 250 ${fillY + 20} L -50 ${fillY + 20} Z`}
              fill="rgba(0,240,255,0.4)" />
          )}
          {pct > 15 && [
            { cx: 70, f: 0.7, r: 3, cls: "fyc-b0" },
            { cx: 100, f: 0.5, r: 2, cls: "fyc-b1" },
            { cx: 130, f: 0.8, r: 3.5, cls: "fyc-b2" },
            { cx: 85, f: 0.35, r: 2.5, cls: "fyc-b3" },
          ].map(({ cx, f, r, cls }) => (
            <circle key={cls} className={`fyc-bubble ${cls}`}
              cx={cx} cy={fillY + (215 - fillY) * f} r={r}
              fill="rgba(255,255,255,0.18)" />
          ))}
        </g>

        <path d="M 30 20 L 170 20 L 147 202 Q 140 218 100 218 Q 60 218 53 202 Z"
          fill="url(#fyc-glass)"
          stroke={isFull ? "#00FFBF" : isEmpty ? "rgba(209,30,255,0.3)" : "#D11EFF"}
          strokeWidth={isFull ? "2.5" : "1.5"}
          filter={isFull ? "url(#fyc-glow)" : "url(#fyc-glow-sm)"}
          className="fyc-outline" />
        <path d="M 147 80 Q 182 80 182 118 Q 182 155 147 155"
          fill="none"
          stroke={isFull ? "#00FFBF" : "rgba(209,30,255,0.45)"}
          strokeWidth="9" strokeLinecap="round"
          filter={isFull ? "url(#fyc-glow)" : undefined} />
        <line x1="30" y1="20" x2="170" y2="20"
          stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" />
        {isEmpty && (
          <g stroke="#D11EFF" strokeWidth="1" opacity="0.35">
            <polyline points="80,70 86,100 78,130" fill="none" />
            <polyline points="118,90 124,120 116,148" fill="none" />
          </g>
        )}
        {isFull && (
          <ellipse cx="100" cy="118" rx="88" ry="98"
            fill="none" stroke="#D11EFF" strokeWidth="1.5" opacity="0.4"
            className="fyc-aura" />
        )}
        <text x="100" y="130" textAnchor="middle"
          fill="white" fontSize="26" fontWeight="800"
          fontFamily="inherit" filter="url(#fyc-glow)"
          className="fyc-pct-svg">
          {Math.round(pct)}%
        </text>
      </svg>
    </div>
  );
}

// ─── Particle canvas ──────────────────────────────────────────────────────────

function ParticleField({ pct }) {
  const ref = useRef(null);
  const raf = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    const H = (canvas.height = canvas.parentElement?.offsetHeight || 600);
    const cols = ["#00F0FF", "#D11EFF", "#FF3EDB", "#00FFBF"];
    const pts = Array.from({ length: 8 + Math.floor(pct / 8) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 1 + Math.random() * 2,
      col: cols[Math.floor(Math.random() * cols.length)],
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.15 + Math.random() * 0.35),
      a: 0.15 + Math.random() * 0.5,
    }));
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col; ctx.globalAlpha = p.a;
        ctx.shadowBlur = 8; ctx.shadowColor = p.col;
        ctx.fill(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
      }
      raf.current = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf.current);
  }, [pct]);
  return <canvas ref={ref} className="fyc-particles" aria-hidden="true" />;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONF_COLS = ["#00F0FF", "#D11EFF", "#FF3EDB", "#00FFBF", "#fff", "#ffd166"];
const CONF_PIECES = Array.from({ length: 72 }, (_, i) => ({
  id: i, col: CONF_COLS[i % CONF_COLS.length],
  left: (i / 72) * 100, size: 5 + (i % 5) * 2,
  delay: (i % 20) * 0.07, dur: 2.2 + (i % 8) * 0.25,
}));

function Confetti() {
  return (
    <div className="fyc-confetti" aria-hidden="true">
      {CONF_PIECES.map(p => (
        <div key={p.id} className="fyc-confetti__piece"
          style={{ left: `${p.left}%`, width: p.size, height: p.size,
            background: p.col, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}

// ─── Float message ────────────────────────────────────────────────────────────

function FloatMessage({ text, id, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <div className="fyc-float-msg" key={id}>{text}</div>;
}

// ─── Kill Streak Banner ───────────────────────────────────────────────────────

function KillStreakBanner({ ks, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 5000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fyc-ks-overlay" onClick={onDone}>
      <div className="fyc-ks-banner" style={{ "--ksc": ks.color }}>
        <div className="fyc-ks-scan" aria-hidden="true" />
        <div className="fyc-ks-icon">{ks.icon}</div>
        <div className="fyc-ks-name">{ks.name}</div>
        <div className="fyc-ks-streak">🔥 {ks.streak} Day Streak</div>
        <div className="fyc-ks-tagline">{ks.tagline}</div>
        <div className="fyc-ks-sub">{ks.sub}</div>
        <div className="fyc-ks-tap">Tap to continue</div>
      </div>
    </div>
  );
}

// ─── Level Badge ──────────────────────────────────────────────────────────────

function LevelBadge({ streak, bestStreak }) {
  const level = getLevel(streak);
  const next = getNextLevel(streak);
  const daysToNext = next ? next.streakMin - streak : null;

  // Hide the starting "Empty Cup" badge — no demotivating placeholder text.
  if (level.streakMin === 0 && bestStreak === 0) return null;

  return (
    <div className="fyc-level">
      <div className="fyc-level__badge" style={{ "--lc": level.color }}>
        <span className="fyc-level__icon">{level.icon}</span>
        <span className="fyc-level__name">{level.name}</span>
      </div>
      {next && (
        <div className="fyc-level__next">
          {daysToNext}d → {next.icon} {next.name}
        </div>
      )}
      {bestStreak > 0 && (
        <div className="fyc-level__best">Best: {bestStreak} days</div>
      )}
    </div>
  );
}

// ─── Full cup screen ──────────────────────────────────────────────────────────

const DRAIN_MS = 1300;

function FullCupScreen({ streak, level, onReset, onClose }) {
  const [mode, setMode] = useState(null); // null | "drink" | "pour"
  const [drainPct, setDrainPct] = useState(100);

  const start = (which) => {
    if (mode) return;
    setMode(which);
    // Next frame: flip pct to 0 so the liquid transition animates the drain.
    requestAnimationFrame(() => setDrainPct(0));
    setTimeout(() => onReset(), DRAIN_MS);
  };

  const drinking = mode === "drink";
  const pouring = mode === "pour";

  return (
    <div className="fyc-full-screen">
      <div className="fyc-full-screen__inner">
        <div className="fyc-full-cup">
          <AnimatedCup pct={drainPct} pour={pouring} />
        </div>
        <h2 className="fyc-full-title">
          {drinking ? "DRINK UP" : pouring ? "POURED OUT" : "CUP FILLED"}
        </h2>
        <p className="fyc-full-body">
          {mode ? (
            drinking ? (
              <>You took care of yourself.<br />Now you have something to give.</>
            ) : (
              <>Let it go.<br />A fresh cup, a fresh start.</>
            )
          ) : (
            <>You poured back into yourself today.<br />The cup is full — now use it.</>
          )}
        </p>
        {streak > 0 && <div className="fyc-streak fyc-streak--xl">🔥 {streak} Day Streak</div>}

        {!mode && (
          <>
            <div className="fyc-full-actions">
              <button type="button" className="fyc-full-action fyc-full-action--drink"
                onClick={() => start("drink")}>
                Drink it
              </button>
              <button type="button" className="fyc-full-action fyc-full-action--pour"
                onClick={() => start("pour")}>
                Pour it out
              </button>
            </div>
            <button type="button" className="fyc-full-close" onClick={onClose}>
              Keep it full for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Weekly Review ────────────────────────────────────────────────────────────

const WK_QUESTIONS = [
  "What filled your cup the most this week?",
  "What drained your cup the most?",
  "What habit helped your mental health?",
  "What did you avoid that you shouldn't have?",
  "What do you need more of next week?",
  "3 habits you commit to next week:",
];
const WK_CATS = ["Physical", "Mental", "Faith", "Money", "Connect", "Pro", "Emotional", "Discipline"];

function WeeklyReview({ review, scores, onChangeReview, onChangeScore, streak, onBack }) {
  return (
    <div className="fyc fyc--weekly">
      <button type="button" className="fyc-back" onClick={onBack}>← Back</button>
      <h2 className="fyc-title fyc-title--sm">SUNDAY REVIEW</h2>
      <p className="fyc-subtitle">Reflect. Reset. Reload.</p>
      {streak > 0 && <div className="fyc-streak fyc-streak--lg">🔥 {streak} Day Streak</div>}
      <div className="fyc-wk-section">
        {WK_QUESTIONS.map((q, i) => (
          <div key={i} className="fyc-wk-q">
            <label className="fyc-wk-label">{q}</label>
            <textarea className="fyc-wk-input" value={review[i] || ""}
              onChange={e => onChangeReview(i, e.target.value)} rows={3} placeholder="Write freely..." />
          </div>
        ))}
      </div>
      <div className="fyc-wk-wheel">
        <h3 className="fyc-wk-wheel__title">Energy Wheel — Rate Your Week</h3>
        {WK_CATS.map(cat => {
          const val = scores[cat] || 0;
          return (
            <div key={cat} className="fyc-wk-row">
              <span className="fyc-wk-row__label">{cat}</span>
              <div className="fyc-wk-stars">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button"
                    className={`fyc-star ${val >= n ? "fyc-star--on" : ""}`}
                    onClick={() => onChangeScore(cat, n)}>★</button>
                ))}
              </div>
              <div className="fyc-wk-bar">
                <div className="fyc-wk-bar__fill" style={{ width: `${val * 20}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <button type="button" className="fyc-weekly-btn" onClick={onBack}>Save &amp; Go Fill Your Cup</button>
    </div>
  );
}

// ─── Leaderboard / Stats screen ───────────────────────────────────────────────

function StatsScreen({ streak, bestStreak, onBack }) {
  const level = getLevel(streak);
  const next = getNextLevel(streak);

  // Milestone progress map
  return (
    <div className="fyc fyc--weekly">
      <button type="button" className="fyc-back" onClick={onBack}>← Back</button>
      <h2 className="fyc-title fyc-title--sm">YOUR RECORD</h2>
      <p className="fyc-subtitle">Every fill counts. This is your history.</p>

      <div className="fyc-stats-grid">
        <div className="fyc-stat-card">
          <span className="fyc-stat-card__num">{streak}</span>
          <span className="fyc-stat-card__label">Current Streak</span>
        </div>
        <div className="fyc-stat-card fyc-stat-card--gold">
          <span className="fyc-stat-card__num">{bestStreak}</span>
          <span className="fyc-stat-card__label">Best Ever</span>
        </div>
      </div>

      <div className="fyc-stats-level">
        <div className="fyc-stats-level__badge" style={{ "--lc": level.color }}>
          <span>{level.icon}</span>
          <span>{level.name}</span>
        </div>
        <p className="fyc-stats-level__tagline">{level.tagline}</p>
        {next && (
          <p className="fyc-stats-level__next">
            {next.streakMin - streak} more days to unlock <strong>{next.icon} {next.name}</strong>
            {" "}— threshold increases to {next.threshold} pts
          </p>
        )}
      </div>

      <div className="fyc-ks-list">
        <p className="fyc-ks-list__title">Kill Streak History</p>
        {KILL_STREAKS.map(ks => {
          const unlocked = bestStreak >= ks.streak;
          return (
            <div key={ks.streak} className={`fyc-ks-row ${unlocked ? "fyc-ks-row--on" : ""}`}
              style={{ "--ksc": ks.color }}>
              <span className="fyc-ks-row__icon">{unlocked ? ks.icon : "🔒"}</span>
              <div className="fyc-ks-row__info">
                <span className="fyc-ks-row__name">{ks.name}</span>
                <span className="fyc-ks-row__req">{ks.streak} day streak</span>
              </div>
              {unlocked && <span className="fyc-ks-row__check">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function FillYourCup() {
  const [myCup, setMyCup] = useState(() => loadMyCup());
  const [showWizard, setShowWizard] = useState(() => !loadMyCup()?.built);
  const [state, setState] = useState(getInitialState);
  const [activeCat, setActiveCat] = useState(0);
  const [floatMsg, setFloatMsg] = useState(null);
  const [showFull, setShowFull] = useState(false);
  const [activeKS, setActiveKS] = useState(() => {
    // Show pending kill streak on first render
    const s = getInitialState();
    return s.pendingKillStreak || null;
  });
  const [view, setView] = useState("main");
  const floatKey = useRef(null);

  // Derive level and threshold from current streak
  const level = getLevel(state.streak);
  const threshold = level.threshold;

  const allCategories = React.useMemo(() => {
    if (!myCup?.built || !myCup.habits?.length) return CATEGORIES;
    return [{ id: "mycup", icon: "⚡", label: "My Cup", color: "#D11EFF", habits: myCup.habits }, ...CATEGORIES];
  }, [myCup]);

  const habitsMap = React.useMemo(() => buildHabitsMap(myCup?.habits), [myCup]);

  useEffect(() => {
    const { pendingKillStreak: _, ...toSave } = state;
    save("fill_your_cup", toSave);
  }, [state]);

  useEffect(() => {
    if (state.pct >= 100 && !showFull) {
      const t = setTimeout(() => setShowFull(true), 600);
      return () => clearTimeout(t);
    }
  }, [state.pct]);

  const handleWizardComplete = useCallback((habits) => {
    const cup = { built: true, habits };
    saveMyCup(cup);
    setMyCup(cup);
    setShowWizard(false);
    setActiveCat(0);
  }, []);

  const handleHabit = useCallback((catId, hIdx) => {
    const key = `${catId}_${hIdx}`;
    setState(prev => {
      const done = prev.completed.includes(key);
      const next = done ? prev.completed.filter(k => k !== key) : [...prev.completed, key];
      const lvl = getLevel(prev.streak);
      const newPct = computePct(next, habitsMap, lvl.threshold);

      let newShown = [...prev.shownMilestones];
      let milestone = null;
      for (const m of MILESTONES) {
        if (newPct >= m.pct && !newShown.includes(m.pct)) {
          milestone = m; newShown = [...newShown, m.pct]; break;
        }
      }

      if (!done) {
        const txt = milestone ? milestone.msg : ENERGY_MSGS[(floatKey.current || 0) % ENERGY_MSGS.length];
        floatKey.current = (floatKey.current || 0) + 1;
        setFloatMsg({ text: txt, id: floatKey.current });
      }

      return {
        ...prev,
        completed: next,
        pct: newPct,
        shownMilestones: newShown,
        filledToday: prev.filledToday || newPct >= 100,
      };
    });
  }, [habitsMap]);

  const handleResetCup = useCallback(() => {
    // Empty the cup but keep today's "filled" credit so the streak is preserved.
    setState(prev => ({ ...prev, completed: [], pct: 0, shownMilestones: [] }));
    setShowFull(false);
  }, []);

  const handleChangeReview = useCallback((idx, val) => {
    setState(prev => ({ ...prev, weeklyReview: { ...prev.weeklyReview, [idx]: val } }));
  }, []);
  const handleChangeScore = useCallback((cat, val) => {
    setState(prev => ({ ...prev, weeklyScores: { ...prev.weeklyScores, [cat]: val } }));
  }, []);

  if (showWizard) return <CupWizard onComplete={handleWizardComplete} />;

  if (view === "weekly") {
    return <WeeklyReview review={state.weeklyReview} scores={state.weeklyScores}
      onChangeReview={handleChangeReview} onChangeScore={handleChangeScore}
      streak={state.streak} onBack={() => setView("main")} />;
  }

  if (view === "stats") {
    return <StatsScreen streak={state.streak} bestStreak={state.bestStreak} onBack={() => setView("main")} />;
  }

  const cat = allCategories[activeCat] || allCategories[0];
  const isFullDay = new Date().getDay() === 0;
  const next = getNextLevel(state.streak);

  return (
    <div className="fyc">
      {state.pct >= 100 && <Confetti />}

      {/* Kill streak cinematic */}
      {activeKS && <KillStreakBanner ks={activeKS} onDone={() => setActiveKS(null)} />}

      {showFull && <FullCupScreen streak={state.streak} level={level} onReset={handleResetCup} onClose={() => setShowFull(false)} />}

      {/* Header */}
      <div className="fyc-hero">
        <h1 className="fyc-title">FILL YOUR CUP</h1>
      </div>

      {/* Level badge */}
      <LevelBadge streak={state.streak} bestStreak={state.bestStreak} />

      {/* Threshold notice when leveled up */}
      {level.streakMin > 0 && (
        <div className="fyc-threshold-notice">
          <span>⚔️ Level {LEVELS.indexOf(level) + 1} Challenge: need <strong>{threshold} pts</strong> to fill</span>
          {next && <span className="fyc-threshold-notice__next">{next.streakMin - state.streak}d to next level</span>}
        </div>
      )}

      {/* Cup */}
      {state.pct > 0 && (
        <div className="fyc-cup-wrap">
          {floatMsg && (
            <FloatMessage text={floatMsg.text} id={floatMsg.id} onDone={() => setFloatMsg(null)} />
          )}
          <AnimatedCup pct={state.pct} />
          {state.pct >= 100 && (
            <button type="button" className="fyc-full-label" onClick={() => setShowFull(true)}>
            CUP FILLED — TAP TO CELEBRATE
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="fyc-progress-bar">
        <div className="fyc-progress-bar__fill" style={{ width: `${state.pct}%` }} />
        {MILESTONES.map(m => (
          <div key={m.pct}
            className={`fyc-progress-bar__mark ${state.pct >= m.pct ? "fyc-progress-bar__mark--hit" : ""}`}
            style={{ left: `${m.pct}%` }} title={m.msg} />
        ))}
      </div>

      <p className="fyc-question">What will you do today to fill your cup?</p>

      {/* Category tabs */}
      <div className="fyc-cats" role="tablist">
        {allCategories.map((c, i) => {
          const doneCount = state.completed.filter(k => k.startsWith(c.id + "_")).length;
          return (
            <button key={c.id} type="button" role="tab" aria-selected={activeCat === i}
              className={`fyc-cat ${activeCat === i ? "fyc-cat--active" : ""} ${c.id === "mycup" ? "fyc-cat--mycup" : ""}`}
              style={{ "--cc": c.color }}
              onClick={() => setActiveCat(i)}>
              <span className="fyc-cat__icon">{c.icon}</span>
              <span className="fyc-cat__label">{c.label}</span>
              {doneCount > 0 && <span className="fyc-cat__badge">{doneCount}</span>}
            </button>
          );
        })}
      </div>

      {cat.id === "mycup" && (
        <div className="fyc-mycup-header">
          <span>⚡ YOUR PERSONAL CUP</span>
          <button type="button" className="fyc-mycup-rebuild" onClick={() => setShowWizard(true)}>
            Rebuild →
          </button>
        </div>
      )}

      {/* Habit cards */}
      <div className="fyc-habits" role="tabpanel">
        {cat.habits.map((h, i) => {
          const key = `${cat.id}_${i}`;
          const done = state.completed.includes(key);
          return (
            <button key={key} type="button"
              className={`fyc-habit ${done ? "fyc-habit--done" : ""}`}
              style={{ "--cc": cat.color }}
              onClick={() => handleHabit(cat.id, i)}
              aria-pressed={done}>
              <div className="fyc-habit__check" aria-hidden="true">{done ? "✓" : ""}</div>
              <div className="fyc-habit__body">
                <span className="fyc-habit__label">{h.label}</span>
                <span className={`fyc-habit__badge fyc-habit__badge--${h.diff}`}>
                  {h.diff === "identity" ? "IDENTITY SHIFT" : h.diff.toUpperCase()} +{h.pts}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="fyc-footer">
        {!myCup?.built && (
          <button type="button" className="fyc-build-btn" onClick={() => setShowWizard(true)}>
            ⚡ Build My Personal Cup
          </button>
        )}
        <div className="fyc-footer-row">
          <button type="button" className="fyc-weekly-btn" onClick={() => setView("weekly")}>
            {isFullDay ? "📋 Sunday Review" : "📋 Weekly"}
          </button>
          <button type="button" className="fyc-stats-btn" onClick={() => setView("stats")}>
            🏆 Records
          </button>
        </div>
      </div>
    </div>
  );
}
