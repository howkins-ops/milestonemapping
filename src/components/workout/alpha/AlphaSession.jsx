import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stepper } from "../IronWorkout.jsx";
import { RestRing, BlockClock } from "./CircuitTimer.jsx";
import DensityMeter from "./DensityMeter.jsx";
import TempoTimer from "./TempoTimer.jsx";
import SegmentTracker from "./SegmentTracker.jsx";
import ExerciseHowTo from "./ExerciseHowTo.jsx";
import ExerciseHero from "./ExerciseHero.jsx";
import HL from "./HL.jsx";
import SessionBriefing, { blockTitle, protocolLine, KIND_BLURBS } from "./SessionBriefing.jsx";
import BlockArt from "./BlockArt.jsx";
import { assessBlock, suggestWeight } from "./engine/autoDifficulty.js";
import { blockVolume, workCapacity, bumpPrompt, beatsPrevious } from "./engine/densityEngine.js";
import { moveByName } from "./data/moves.js";
import { exerciseInfo, holdSeconds } from "./data/exercises.js";
import { sfxPlateClank, sfxChalkPoof, sfxImpact, sfxCoin, sfxRoundBell } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   ALPHA SESSION — the guided wizard for any campaign workout.
   Flow: briefing → [block intro → block play] × N → verdicts.
   Block kinds: circuit · straight · totalreps · density · tempo.
   Sets land in the SAME shape the tracker saves, so every campaign
   session lives in The Log and feeds the PR Wall.
   ═══════════════════════════════════════════════════════════════ */

const exKey = (n) => String(n || "").trim().toLowerCase();
const parseReps = (repsStr) => {
  const m = String(repsStr || "").match(/\d+/);
  return m ? Math.min(Number(m[0]), 100) : 10;
};
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
/* timed work: planks, swings, climbers — logged as seconds in the reps slot */
const isHoldExercise = (ex) =>
  Boolean(exerciseInfo(ex.name)?.hold) || /\d+\s*s\b/i.test(String(ex.reps)) || /hold/i.test(String(ex.reps));

export default function AlphaSession({ workout, phase, bestPRs, lastWeights, settings, onFinish, onAbort }) {
  const blocks = workout.blocks;
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [briefed, setBriefed] = useState(false);
  const [intro, setIntro] = useState(true);
  const [blockIdx, setBlockIdx] = useState(0);
  const [confirmAbort, setConfirmAbort] = useState(false);
  const [prFlash, setPrFlash] = useState(null);
  const [verdictCard, setVerdictCard] = useState(null); // {rows: [{exercise, total, lastWeight, verdict}]}
  const verdictsRef = useRef([]);
  const sessionPRs = useRef(new Map());
  /* logged sets per exercise name, in workout order */
  const loggedRef = useRef(new Map()); // name -> [{weight, reps}]
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  const block = blocks[blockIdx];
  const isTempoWorkout = workout.style === "tempo";
  const anyLogged = loggedRef.current.size > 0;

  /* A-block max weight — the D closer computes off it */
  const aBlockMax = useMemo(() => {
    const aEx = blocks.find((b) => b.key === "A")?.exercises || [];
    let max = 0;
    for (const e of aEx) {
      for (const s of loggedRef.current.get(e.name) || []) max = Math.max(max, s.weight);
    }
    return max;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockIdx]);

  const logSet = (name, weight, reps, { silent } = {}) => {
    const list = loggedRef.current.get(name) || [];
    loggedRef.current.set(name, [...list, { weight, reps }]);
    if (!silent) sfxPlateClank(settings);
    try { if (navigator.vibrate) navigator.vibrate(15); } catch { /* silent */ }
    /* PR check against the wall + this session */
    if (weight > 0) {
      const k = exKey(name);
      const wall = bestPRs.get(k);
      const mine = sessionPRs.current.get(k);
      if ((!wall || weight > wall.weight) && (!mine || weight > mine.weight)) {
        const pr = { exercise: name, weight, reps };
        sessionPRs.current.set(k, pr);
        setPrFlash(pr);
        sfxImpact(3, settings);
        setTimeout(() => setPrFlash(null), 2200);
      }
    }
    rerender();
  };

  /* verdict rows for a set of lifts — holds excluded (their "reps" are seconds) */
  const verdictRows = (names) =>
    names
      .map((name) => {
        const sets = loggedRef.current.get(name) || [];
        const total = sets.reduce((s, x) => s + x.reps, 0);
        const lastWeight = sets.length ? sets[sets.length - 1].weight : 0;
        return { exercise: name, total, lastWeight, verdict: assessBlock(total) };
      })
      .filter((r) => r.total > 0 && !exerciseInfo(r.exercise)?.hold);

  const finishBlock = (blockDef) => {
    /* the 5×5 rule: judge each lift of an autoregulated pair */
    if (blockDef.autoregulate) {
      const rows = verdictRows(blockDef.exercises.map((e) => e.name));
      if (rows.length) {
        rows.forEach((r) => verdictsRef.current.push({ exercise: r.exercise, totalReps: r.total, verdict: r.verdict.verdict }));
        setVerdictCard({ rows });
        return; // verdict card's continue button advances
      }
    }
    /* auto-difficulty verdicts on straight working blocks */
    if (blockDef.kind === "straight" && (blockDef.rounds || 1) > 1 && !blockDef.ladder) {
      const rows = verdictRows([blockDef.exercises[0]?.name]);
      if (rows.length) {
        rows.forEach((r) => verdictsRef.current.push({ exercise: r.exercise, totalReps: r.total, verdict: r.verdict.verdict }));
        setVerdictCard({ rows });
        return;
      }
    }
    advanceBlock();
  };

  const advanceBlock = () => {
    setVerdictCard(null);
    if (blockIdx < blocks.length - 1) {
      sfxChalkPoof(settings);
      setBlockIdx(blockIdx + 1);
      setIntro(true);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const duration_s = Math.floor((Date.now() - startRef.current) / 1000);
    const exercises = [...loggedRef.current.entries()].map(([name, sets]) => ({ name, sets }));
    const total_volume = exercises.reduce((s, e) => s + e.sets.reduce((x, t) => x + t.weight * t.reps, 0), 0);
    const total_sets = exercises.reduce((s, e) => s + e.sets.length, 0);
    onFinish({
      session: {
        plan_id: null,
        plan_name: `ALPHA · ${workout.name}`,
        duration_s, total_volume, total_sets, exercises,
      },
      prs: [...sessionPRs.current.values()],
      verdicts: verdictsRef.current,
    });
  };

  return (
    <div className="iw-page iw-page-in iw-al-session" style={{ "--iw-al-accent": phase.accent }}>
      <div className="iw-session-top">
        <button className="iw-back" onClick={() => (anyLogged ? setConfirmAbort(true) : onAbort())}>❮ {workout.name}</button>
        {briefed && <span className="iw-session-clock" style={{ color: phase.accent }}>{fmtDur(elapsed)}</span>}
      </div>

      {briefed && isTempoWorkout && <SegmentTracker blocks={blocks} currentKey={block.key} accent={phase.accent} />}
      {briefed && !isTempoWorkout && (
        <div className="iw-session-progress">
          {blocks.map((b, i) => (
            <span key={`${b.key}-${i}`} className={`iw-prog-cell ${i < blockIdx ? "iw-prog-done" : ""} ${i === blockIdx ? "iw-prog-now" : ""}`} />
          ))}
        </div>
      )}

      {!briefed ? (
        <SessionBriefing workout={workout} phase={phase} lastWeights={lastWeights}
          onStart={() => {
            setBriefed(true);
            startRef.current = Date.now();
            setElapsed(0);
            sfxCoin(settings);
          }} />
      ) : verdictCard ? (
        <VerdictCard card={verdictCard} onNext={advanceBlock} />
      ) : intro ? (
        <BlockIntroCard block={block} index={blockIdx} count={blocks.length}
          onBegin={() => { setIntro(false); sfxChalkPoof(settings); }} />
      ) : (
        <BlockPlayer key={`${block.key}-${blockIdx}`} block={block} phase={phase}
          lastWeights={lastWeights} bestPRs={bestPRs} settings={settings}
          aBlockMax={aBlockMax}
          logSet={logSet} logged={loggedRef.current}
          onBlockDone={() => finishBlock(block)} />
      )}

      {briefed && anyLogged && !verdictCard && !intro && (
        <button className="iw-btn-ghost iw-btn-wide iw-al-rackearly" onClick={finishSession}>
          ■ FINISH &amp; SAVE WORKOUT
        </button>
      )}

      {prFlash && (
        <div className="iw-prflash">
          <span className="iw-prflash-tag">NEW PR</span>
          <span className="iw-prflash-lift">{prFlash.exercise}</span>
          <span className="iw-prflash-num">{prFlash.weight} lbs × {prFlash.reps}</span>
        </div>
      )}

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

/* ── the block gate: what this block is and how it runs ── */
function BlockIntroCard({ block, index, count, onBegin }) {
  return (
    <div className="iw-al-blockintro iw-drop-in">
      <BlockArt kind={block.kind} className="iw-al-blockintro-art" label={blockTitle(block)} />
      <div className="iw-eyebrow">block {block.key} · {index + 1} of {count}</div>
      <h2 className="iw-display iw-session-lift">{blockTitle(block)}</h2>
      <div className="iw-al-brief-protocol"><HL text={protocolLine(block)} /></div>
      <p className="iw-body"><HL text={KIND_BLURBS[block.kind]} /></p>
      <div className="iw-set-chips iw-al-intro-chips">
        {block.exercises.map((e, i) => (
          <span key={`${i}-${e.name}`} className="iw-set-chip">{e.name} · {e.reps}</span>
        ))}
      </div>
      {block.note && <div className="iw-al-fastline"><HL text={block.note} /></div>}
      <button className="iw-btn-ember iw-btn-wide" onClick={onBegin}>▶ begin block {block.key}</button>
    </div>
  );
}

/* ── the auto-difficulty verdict (one row per judged lift) ── */
function VerdictCard({ card, onNext }) {
  return (
    <div className="iw-al-verdict iw-drop-in">
      <div className="iw-eyebrow">the forge speaks</div>
      {card.rows.map((r) => {
        const next = r.lastWeight > 0 ? suggestWeight(r.lastWeight, r.verdict) : 0;
        return (
          <div key={r.exercise} className="iw-al-verdict-row">
            <div className="iw-al-verdict-lift">{r.exercise} · {r.total} total reps</div>
            <div className={`iw-al-verdict-word iw-al-verdict-${r.verdict.verdict}`}>
              {r.verdict.verdict === "lower" ? "TOO HEAVY" : r.verdict.verdict === "raise" ? "TOO LIGHT" : "FORGE ZONE"}
            </div>
            <p className="iw-body">
              <HL text={`${r.verdict.line}${next > 0 && next !== r.lastWeight ? ` Next time: ~${next} lbs.` : ""}`} />
            </p>
          </div>
        );
      })}
      <button className="iw-btn-ember iw-btn-wide" onClick={onNext}>next block ❯</button>
    </div>
  );
}

/* ── the hold clock: timed work logs seconds, bell at zero ── */
function HoldRing({ seconds, settings, onDone }) {
  const [left, setLeft] = useState(seconds);
  const startedRef = useRef(Date.now());
  useEffect(() => {
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.ceil((startedRef.current + seconds * 1000 - Date.now()) / 1000));
      setLeft(rem);
      if (rem <= 0) {
        clearInterval(iv);
        sfxRoundBell(settings);
        try { if (navigator.vibrate) navigator.vibrate([60, 80, 60]); } catch { /* silent */ }
        onDone(seconds);
      }
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="iw-rest iw-al-holdring">
      <div className="iw-rest-ring" style={{ "--iw-frac": seconds > 0 ? left / seconds : 0 }}>
        <span className="iw-rest-num">{left}</span>
        <span className="iw-rest-unit">hold</span>
      </div>
      <button className="iw-btn-ghost"
        onClick={() => onDone(Math.max(1, Math.min(seconds, Math.round((Date.now() - startedRef.current) / 1000))))}>
        broke early — log what I held
      </button>
    </div>
  );
}

/* ═══════════════ BLOCK PLAYER ═══════════════ */
function BlockPlayer({ block, phase, lastWeights, bestPRs, settings, aBlockMax, logSet, logged, onBlockDone }) {
  if (block.kind === "density") {
    return <DensityBlock block={block} phase={phase} lastWeights={lastWeights} settings={settings} logSet={logSet} onDone={onBlockDone} />;
  }
  if (block.kind === "totalreps") {
    return <TotalRepsBlock block={block} lastWeights={lastWeights} settings={settings} logSet={logSet} logged={logged} onDone={onBlockDone} />;
  }
  return <RoundsBlock block={block} phase={phase} lastWeights={lastWeights} bestPRs={bestPRs}
    settings={settings} aBlockMax={aBlockMax} logSet={logSet} logged={logged} onDone={onBlockDone} />;
}

/* ── circuit / straight / tempo (round-based) ── */
function RoundsBlock({ block, phase, lastWeights, bestPRs, settings, aBlockMax, logSet, logged, onDone }) {
  const rounds = block.rounds || 1;
  const exercises = block.exercises;
  const [round, setRound] = useState(1);
  const [exIdx, setExIdx] = useState(0);
  const [rest, setRest] = useState(null); // {seconds, label, after, next}
  const ex = exercises[exIdx];
  const hold = isHoldExercise(ex);
  const [setLive, setSetLive] = useState(block.kind !== "tempo"); // tempo sets are armed manually
  const [holding, setHolding] = useState(false);
  const [holdSecs, setHoldSecs] = useState(() => holdSeconds(ex.reps, 45));
  const isCloser = Boolean(block.closer);
  const move = moveByName(ex.name);

  const suggested = useMemo(() => {
    if (isCloser && block.lightPctOfA && aBlockMax > 0) {
      const pct = (block.lightPctOfA[0] + block.lightPctOfA[1]) / 2 / 100;
      return Math.max(0, Math.round((aBlockMax * pct) / 5) * 5);
    }
    return lastWeights.get(exKey(ex.name)) ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.name]);

  const [weight, setWeight] = useState(suggested);
  const [reps, setReps] = useState(parseReps(ex.reps));
  useEffect(() => {
    setWeight(suggested); setReps(parseReps(ex.reps));
    setSetLive(block.kind !== "tempo");
    setHolding(false); setHoldSecs(holdSeconds(ex.reps, 45));
    /* eslint-disable-next-line */
  }, [exIdx, round]);

  const wall = bestPRs.get(exKey(ex.name));
  const doneSets = (logged.get(ex.name) || []).length;
  const neverLifted = !lastWeights.has(exKey(ex.name)) && doneSets === 0;

  /* where the wizard goes after this set */
  const lastEx = exIdx === exercises.length - 1;
  const lastRound = round === rounds;
  const nextLabel = lastEx && lastRound
    ? null
    : lastEx ? `round ${round + 1} — ${exercises[0].name}` : exercises[exIdx + 1].name;

  const advanceAfterLog = () => {
    setSetLive(block.kind !== "tempo");
    setHolding(false);
    if (lastEx && lastRound) { onDone(); return; }
    const restLen = lastEx ? (block.restBetweenRounds ?? 90) : (block.restBetweenEx ?? 0);
    const after = () => {
      if (lastEx) { setRound(round + 1); setExIdx(0); } else { setExIdx(exIdx + 1); }
    };
    if (restLen > 0) setRest({ seconds: restLen, label: lastEx ? "round rest" : "rest", after, next: nextLabel });
    else after();
  };

  const rack = () => { logSet(ex.name, weight, reps); advanceAfterLog(); };
  const holdDone = (heldSecs) => { logSet(ex.name, 0, heldSecs); advanceAfterLog(); };

  if (rest) {
    return (
      <>
        <RestRing seconds={rest.seconds} label={rest.label} settings={settings} accent={phase.accent}
          onDone={() => { const a = rest.after; setRest(null); a(); }}
          onSkip={() => { const a = rest.after; setRest(null); a(); }} />
        {rest.next && <div className="iw-al-nextup">next up · <strong>{rest.next}</strong></div>}
      </>
    );
  }

  return (
    <div className="iw-al-blockplay">
      <div className="iw-eyebrow">
        block {block.key} · {block.kind === "tempo" ? `tempo round ${round}/${rounds}` : rounds > 1 ? `round ${round} of ${rounds}` : block.bookend ? "the bookend — one honest set" : isCloser ? "the closer — light and long" : "working set"}
        {exercises.length > 1 ? ` · move ${exIdx + 1}/${exercises.length}` : ""}
      </div>
      <h2 className="iw-display iw-session-lift">{ex.name}</h2>
      <div className="iw-session-target">
        target {ex.reps}
        {wall && <span className="iw-session-pr-hint"> · wall: {wall.weight} lbs</span>}
        {isCloser && aBlockMax > 0 && <span className="iw-session-pr-hint"> · {block.lightPctOfA?.[0]}–{block.lightPctOfA?.[1]}% of your bookend</span>}
      </div>
      <ExerciseHero name={ex.name} />
      {move && <div className="iw-al-movecue">✦ signature move — {move.genericName}. <HL text={move.cue} /></div>}
      <ExerciseHowTo key={`${ex.name}-${exIdx}-${round}`} name={ex.name} defaultOpen={neverLifted} showImage={false} />
      {block.note && <div className="iw-al-fastline"><HL text={block.note} /></div>}

      {doneSets > 0 && (
        <div className="iw-set-chips">
          {(logged.get(ex.name) || []).map((s, i) => (
            <span key={i} className="iw-set-chip iw-set-chip-done">
              {s.weight > 0 ? `${s.weight} × ${s.reps}` : hold ? `${s.reps}s` : `BW × ${s.reps}`}
            </span>
          ))}
        </div>
      )}

      {hold ? (
        holding ? (
          <HoldRing seconds={holdSecs} settings={settings} onDone={holdDone} />
        ) : (
          <>
            <div className="iw-work-steppers">
              <Stepper label="seconds" value={holdSecs} step={5} min={5} max={300} onChange={setHoldSecs} wide />
            </div>
            <button className="iw-btn-ember iw-btn-wide iw-log-set-btn"
              onClick={() => { sfxCoin(settings); setHolding(true); }}>
              ▶ start the hold — {holdSecs}s
            </button>
          </>
        )
      ) : (
        <>
          {block.kind === "tempo" && (
            <>
              <TempoTimer tempo={block.tempo} running={setLive} settings={settings} />
              {!setLive && (
                <button className="iw-btn-ghost iw-btn-wide" onClick={() => { sfxCoin(settings); setSetLive(true); }}>
                  ▶ start the set — ride the cadence
                </button>
              )}
            </>
          )}
          <div className="iw-work-steppers">
            <Stepper label="lbs" value={weight} step={5} min={0} onChange={setWeight} wide />
            <Stepper label="reps" value={reps} min={1} max={100} onChange={setReps} />
          </div>
          <button className={`iw-btn-ember iw-btn-wide iw-log-set-btn ${block.kind === "tempo" && !setLive ? "iw-btn-off" : ""}`}
            disabled={block.kind === "tempo" && !setLive} onClick={rack}>
            ✓ LOG SET <span className="iw-btn-sub">· set done</span>
          </button>
        </>
      )}

      {nextLabel && !holding && <div className="iw-al-nextup">next up · <strong>{nextLabel}</strong></div>}
    </div>
  );
}

/* ── totalreps: accumulate to N in as many sets as it takes ── */
function TotalRepsBlock({ block, lastWeights, settings, logSet, logged, onDone }) {
  const ex = block.exercises[0];
  const target = block.totalReps || 20;
  const [reps, setReps] = useState(5);
  const [rest, setRest] = useState(false);
  const done = (logged.get(ex.name) || []).reduce((s, x) => s + x.reps, 0);
  const neverLifted = !lastWeights.has(exKey(ex.name)) && done === 0;

  const rack = () => {
    logSet(ex.name, 0, reps);
    if (done + reps >= target) { onDone(); return; }
    setRest(true);
  };

  if (rest) {
    return <RestRing seconds={block.restBetweenRounds ?? 90} label="rest" settings={settings}
      onDone={() => setRest(false)} onSkip={() => setRest(false)} />;
  }

  return (
    <div className="iw-al-blockplay">
      <div className="iw-eyebrow">block {block.key} · the count</div>
      <h2 className="iw-display iw-session-lift">{ex.name}</h2>
      <ExerciseHero name={ex.name} />
      <ExerciseHowTo name={ex.name} defaultOpen={neverLifted} showImage={false} />
      <div className="iw-al-totalreps">
        <span className="iw-al-tr-num">{done}</span>
        <span className="iw-al-tr-slash">/</span>
        <span className="iw-al-tr-target">{target}</span>
      </div>
      <div className="iw-al-bc-bar"><div className="iw-al-bc-fill" style={{ width: `${Math.min(100, (done / target) * 100)}%` }} /></div>
      {block.note && <div className="iw-al-fastline">{block.note}</div>}
      <div className="iw-work-steppers">
        <Stepper label="reps this set" value={reps} min={1} max={50} onChange={setReps} wide />
      </div>
      <button className="iw-btn-ember iw-btn-wide iw-log-set-btn" onClick={rack}>✓ LOG SET <span className="iw-btn-sub">· set done</span></button>
    </div>
  );
}

/* ── density: two timed runs, weight bump between ── */
function DensityBlock({ block, phase, lastWeights, settings, logSet, onDone }) {
  const [stage, setStage] = useState("setup"); // setup | run | rest | bump | done-check
  const [run, setRun] = useState(1);
  const [weights, setWeights] = useState(() =>
    Object.fromEntries(block.exercises.map((e) => [e.name, lastWeights.get(exKey(e.name)) ?? 45])));
  const [exIdx, setExIdx] = useState(0);
  const [reps, setReps] = useState(5);
  const [turns, setTurns] = useState({ 1: [], 2: [] });
  const [running, setRunning] = useState(false);
  const runStartRef = useRef(0);

  const ex = block.exercises[exIdx];
  const vol = blockVolume(turns[run]);
  const ghost = run === 2 ? blockVolume(turns[1]) : null;
  const elapsedS = running ? (Date.now() - runStartRef.current) / 1000 : block.minutes * 60;
  const capacity = workCapacity(vol, Math.max(1, elapsedS));

  const startRun = () => {
    sfxCoin(settings);
    runStartRef.current = Date.now();
    setRunning(true);
    setStage("run");
  };

  const rackTurn = () => {
    const w = weights[ex.name] ?? 0;
    logSet(ex.name, w, reps, { silent: true });
    sfxChalkPoof(settings);
    setTurns((t) => ({ ...t, [run]: [...t[run], { weight: w, reps }] }));
    setExIdx((exIdx + 1) % block.exercises.length);
  };

  const runExpired = () => {
    setRunning(false);
    sfxPlateClank(settings);
    if (run === 1) setStage("rest");
    else setStage("done-check");
  };

  if (stage === "setup") {
    return (
      <div className="iw-al-blockplay">
        <div className="iw-eyebrow">block {block.key} · density · {block.minutes} minutes · load at {block.repMax}</div>
        <h2 className="iw-display iw-session-lift">Set the bar</h2>
        <p className="iw-al-fastline"><HL text={`Alternate ${block.exercises.map((e) => e.name).join(" ↔ ")} — ${block.repsPerTurn} reps a turn, as many turns as the clock allows. The block runs TWICE.`} /></p>
        {block.exercises.map((e) => (
          <div key={e.name} className="iw-al-density-setw">
            <Stepper label={`${e.name} (lbs)`} value={weights[e.name]} step={5} min={0} wide
              onChange={(v) => setWeights((w) => ({ ...w, [e.name]: v }))} />
            <ExerciseHowTo name={e.name} defaultOpen={!lastWeights.has(exKey(e.name))} />
          </div>
        ))}
        <button className="iw-btn-ember iw-btn-wide" onClick={startRun}>▶ start run 1 — {block.minutes}:00</button>
      </div>
    );
  }

  if (stage === "rest") {
    return <RestRing seconds={block.restAfter ?? 240} label="between runs" settings={settings} accent={phase.accent}
      onDone={() => setStage("bump")} onSkip={() => setStage("bump")} />;
  }

  if (stage === "bump") {
    return (
      <div className="iw-al-blockplay iw-drop-in">
        <div className="iw-eyebrow">between runs · load the bar</div>
        <h2 className="iw-display iw-session-lift">Run 2 — heavier.</h2>
        {block.exercises.map((e) => {
          const p = bumpPrompt(block, weights[e.name]);
          return (
            <div key={e.name} className="iw-al-density-setw">
              <div className="iw-al-fastline">{e.name}: <HL text={p.line} /></div>
              <Stepper label={`${e.name} (lbs)`} value={weights[e.name] === p.suggested ? p.suggested : weights[e.name]} step={5} min={0} wide
                onChange={(v) => setWeights((w) => ({ ...w, [e.name]: v }))} />
              {p.suggested !== weights[e.name] && (
                <button className="iw-chip-btn" onClick={() => setWeights((w) => ({ ...w, [e.name]: p.suggested }))}>
                  take the suggestion — {p.suggested} lbs
                </button>
              )}
            </div>
          );
        })}
        <button className="iw-btn-ember iw-btn-wide" onClick={() => { setRun(2); setExIdx(0); startRun(); }}>
          ▶ start run 2 — beat {ghostFmt(blockVolume(turns[1]))}
        </button>
      </div>
    );
  }

  if (stage === "done-check") {
    const result = beatsPrevious(blockVolume(turns[2]), blockVolume(turns[1]));
    return (
      <div className="iw-al-blockplay iw-drop-in">
        <div className="iw-eyebrow">block {block.key} · the ledger</div>
        <div className={`iw-al-verdict-word ${result.beat ? "iw-al-verdict-raise" : "iw-al-verdict-hold"}`}>
          {result.beat ? `GHOST BEATEN · +${result.marginPct}%` : "THE GHOST HOLDS"}
        </div>
        <p className="iw-body">
          <HL text={`Run 1: ${ghostFmt(blockVolume(turns[1]))} · Run 2: ${ghostFmt(blockVolume(turns[2]))}.${result.beat ? " Same clock, heavier bar, more iron moved — that's density." : " It happens. The ghost remembers; so will you."}`} />
        </p>
        <button className="iw-btn-ember iw-btn-wide" onClick={onDone}>next block ❯</button>
      </div>
    );
  }

  /* stage === run */
  return (
    <div className="iw-al-blockplay">
      <BlockClock seconds={block.minutes * 60} running={running} onExpire={runExpired}
        label={`block ${block.key} · run ${run}`} />
      <DensityMeter volume={vol} ghostVolume={ghost} capacity={capacity} run={run} />
      <h2 className="iw-display iw-session-lift">{ex.name}</h2>
      <div className="iw-session-target">{weights[ex.name] > 0 ? `${weights[ex.name]} lbs` : "bodyweight"} · {block.repsPerTurn} a turn</div>
      <ExerciseHero name={ex.name} />
      <ExerciseHowTo key={ex.name} name={ex.name} showImage={false} />
      <div className="iw-work-steppers">
        <Stepper label="reps this turn" value={reps} min={1} max={12} onChange={setReps} wide />
      </div>
      <button className="iw-btn-ember iw-btn-wide iw-log-set-btn" onClick={rackTurn}>✓ LOG TURN <span className="iw-btn-sub">· {block.repsPerTurn} reps done</span></button>
      <button className="iw-btn-ghost iw-btn-wide" onClick={runExpired}>end the run early</button>
    </div>
  );
}

const ghostFmt = (v) => `${Math.round(v).toLocaleString()} lbs`;
