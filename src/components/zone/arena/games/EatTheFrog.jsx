// Eat the Frog — the original accountability ritual, standing on its own two
// webbed feet. Name the ONE task you're dreading most today (the frog), let it
// sit there staring at you, then HOLD to swallow it — hardest thing first, the
// rest of the day is dessert. Solo + local-first: the ritual persists in
// localStorage (arena_frog_v1, ~90 days kept); squad glory still flows through
// real proofs — eat before 9AM and the Dawn Raid sunrise board is one tap away.
//
// Ownership: this file + EatTheFrog.css only. All witness/notification copy
// through witnessLines.js.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import { sfxPop, sfxSplat, sfxBubble, sfxCoin, sfxPhoenix } from "../../../../lib/sfx.js";
import { slamHeavy } from "../../../../lib/haptics.js";
import "./EatTheFrog.css";

const STORE_KEY = "arena_frog_v1";
const HOLD_MS = 1400; // the swallow — long enough to mean it, short enough to crave
const KEEP_DAYS = 90;
const MINT = "#00FFBF";

// Local YYYY-MM-DD (matches how the Zone stamps local_date on proofs).
const dayKey = (d = new Date()) => d.toLocaleDateString("en-CA");

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
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

export default function EatTheFrog({ go }) {
  const { member } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const myName = member?.username ? `@${member.username}` : "You";

  const [days, setDays] = useState(loadDays);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdFrac, setHoldFrac] = useState(0);
  const holdRaf = useRef(null);
  const holdPt = useRef({ x: 0, y: 0 });
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(holdRaf.current);
    };
  }, []);

  const todayK = dayKey();
  const entry = days[todayK] || null;
  const eaten = Boolean(entry?.eatenAt);
  const eatenAtLabel = eaten ? eatenLabel(entry.eatenAt) : null;
  const ateBefore9 = eaten && new Date(entry.eatenAt).getHours() < 9;
  const stats = useMemo(() => frogStats(days), [days]);

  // Yesterday's frog left uneaten → it hopped into today. No shame, one tap.
  const yEntry = !entry ? days[yesterdayKey()] : null;
  const hoppedText = yEntry && !yEntry.eatenAt && yEntry.text ? yEntry.text : null;

  const commit = useCallback((mutate) => {
    setDays((prev) => {
      const next = { ...prev };
      mutate(next);
      saveDays(next);
      return next;
    });
  }, []);

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
      try {
        sfxPop();
      } catch {
        /* audio never blocks */
      }
      pushToast?.({
        type: "info",
        title: "Frog named 🐸",
        message: witnessSay("frog_declared", { name: myName, frog: clean, today: k }).line,
      });
    },
    [commit, pushToast, myName]
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
    try {
      sfxSplat();
      sfxCoin();
      if (newStreak === 7 || newStreak === 30 || newStreak > Math.max(1, stats.best)) {
        sfxPhoenix();
      }
    } catch {
      /* silent */
    }
    slamHeavy();
    try {
      burst(holdPt.current.x, holdPt.current.y, MINT);
    } catch {
      /* confetti optional */
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
  }, [commit, stats.streak, stats.best, burst, celebrate, pushToast, myName]);

  const cancelHold = useCallback(() => {
    cancelAnimationFrame(holdRaf.current);
    setHolding(false);
    setHoldFrac(0);
  }, []);

  const beginHold = useCallback(
    (e) => {
      if (!entry || eaten || holding) return;
      e.preventDefault?.();
      holdPt.current = {
        x: e.clientX ?? window.innerWidth / 2,
        y: e.clientY ?? window.innerHeight / 2,
      };
      try {
        sfxBubble();
      } catch {
        /* silent */
      }
      setHolding(true);
      const start = performance.now();
      const step = (now) => {
        if (!aliveRef.current) return;
        const frac = Math.min(1, (now - start) / HOLD_MS);
        setHoldFrac(frac);
        if (frac >= 1) {
          setHolding(false);
          setHoldFrac(0);
          finishEat();
          return;
        }
        holdRaf.current = requestAnimationFrame(step);
      };
      holdRaf.current = requestAnimationFrame(step);
    },
    [entry, eaten, holding, finishEat]
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

  const showDeclare = !eaten && (!entry || editing);

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
      {entry && !eaten && !editing && (
        <div className="frog-hero zn-card arena-reveal">
          <span className="frog-swamp" aria-hidden="true" />
          <span className={`frog-beast ${holding ? "frog-beast--squirm" : ""}`} aria-hidden="true">
            🐸
          </span>
          <span className="zn-eyebrow frog-herolabel">Today's frog · staring at you</span>
          <span className="frog-text">“{entry.text}”</span>

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
        </div>
      )}

      {/* ---------------- EATEN ---------------- */}
      {eaten && (
        <div className="frog-hero frog-hero--eaten zn-card arena-reveal">
          <span className="frog-swamp frog-swamp--calm" aria-hidden="true" />
          <span className="frog-beast frog-beast--gone" aria-hidden="true">
            😋
          </span>
          <span className="zn-eyebrow frog-herolabel">
            Today's frog · EATEN{eatenAtLabel ? ` at ${eatenAtLabel}` : ""}
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
                className="zn-btn zn-btn--ghost"
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

      {/* ---------------- STATS ---------------- */}
      <div className="frog-stats arena-reveal">
        <div className="zn-stat frog-stat">
          <span className="zn-stat__num">{stats.streak}</span>
          <span className="zn-stat__label">Day streak</span>
        </div>
        <div className="zn-stat frog-stat">
          <span className="zn-stat__num">{stats.total}</span>
          <span className="zn-stat__label">Frogs eaten</span>
        </div>
        <div className="zn-stat frog-stat">
          <span className="zn-stat__num">{stats.before9}</span>
          <span className="zn-stat__label">Before 9AM</span>
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
