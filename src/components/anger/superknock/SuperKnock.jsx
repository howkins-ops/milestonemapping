import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import RideScene from "./RideScene.jsx";
import KnockScene from "./KnockScene.jsx";
import FightScene from "./FightScene.jsx";
import { DayBrief, RideBoard, DayResults, WeekBoard } from "./DayBoard.jsx";
import { buildStreet } from "./skStreet.js";
import { loadWeek, saveWeek, resetWeek, nextStreet, loadActive, saveActive, clearActive } from "./skStore.js";
import { applyRide, applyDoor, endDay, startDay, houseState, doorClockCost, CLOSE } from "./skWeek.js";
import { createClock, remaining, charge, pauseClock, resumeClock, timeOfDay, packClock, unpackClock } from "./skClock.js";
import { unpackFight, packFight, RESULT } from "./skFight.js";
import { homeownerFor } from "./skHomeowners.js";
import { loadHeat } from "../heat/heatStore.js";
import { HEAT, DAYS } from "./skTuning.js";
import "../../../styles/super-knock.css";

/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — the shell. State machine, clock ownership, persistence.

   ── THE MACHINE ──────────────────────────────────────────────────────────
     week → brief → RIDE → rideBoard → BLOCK ⇄ PORCH → FIGHT → BLOCK
                                          └──────── clock out / END DAY ────→ results → next day

   ── THE RESUME LAW, THREE DIFFERENT ANSWERS ──────────────────────────────
     RIDE  is ATOMIC. Never resumed. Restoring position, velocity, camera,
           hangers in flight and a cart is ten times the work of replaying it,
           so an interrupted ride is simply VOID: replay free, no life lost,
           no clock burned. Largest complexity saving in the build, and it
           costs the player nothing.
     BLOCK resumes. Snapshot after every door resolves.
     FIGHT resumes, and that one matters — losing a forty-second fight to a
           text message is how a game gets deleted. It is five numbers.

   ── THE CLOCK ────────────────────────────────────────────────────────────
   Anchored and recomputed from Date.now(), never decremented (the Hoops law).
   BANKS AND PAUSES on `hidden`, deliberately unlike Hoops which snaps
   forward — a phone call at 09:20 must not cost you the day. And on `hidden`
   only, never `blur`: an iOS notification banner fires blur without hidden,
   and pausing for it reads as a stutter.

   `dayEndedRef` is non-negotiable. Without it the 250ms interval and a
   visibilitychange can both fire the day-end and double-count the quota.

   ── HEAT ─────────────────────────────────────────────────────────────────
   The Door's heat meter is READ and never written. Sharing the write path
   looked elegant and is a trap: `door_heat_v1` rolls over on the real
   calendar day and caps at 8, so a player doing the whole week in one sitting
   gets no cooling — and seven window smashes, the most REWARDED action in
   phase 1, would pin them at HUNTED and hard-lock phase 2 by Wednesday.
   Meanwhile Sunday's five sales would refund five heat straight out of The
   Door's own economy. Two meters, one number on screen, neither corrupting
   the other.
   ════════════════════════════════════════════════════════════════════════ */

const VIEW = { week: "week", brief: "brief", ride: "ride", rideBoard: "rideBoard", block: "block", fight: "fight", results: "results" };

export default function SuperKnock({ onClose, onComplete }) {
  const [week, setWeek] = useState(loadWeek);
  const [view, setView] = useState(VIEW.week);
  const [leads, setLeads] = useState({});
  const [rideRes, setRideRes] = useState(null);
  const [fightCfg, setFightCfg] = useState(null);
  const [report, setReport] = useState(null);
  const [, force] = useState(0);

  const clockRef = useRef(null);
  const dayEndedRef = useRef(false);
  const resumeFightRef = useRef(null);
  const completedRef = useRef(false);
  const [clockLeft, setClockLeft] = useState(0);

  const street = useMemo(() => buildStreet({ street: week.street, seed: week.seed }), [week.street, week.seed]);
  const doorHeat = useMemo(() => { try { return loadHeat().heat; } catch { return 0; } }, []);

  /* ── body scroll lock, the Zone/CLEARDAY pattern ───────────────────────*/
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── resume a half-played day ──────────────────────────────────────────*/
  useEffect(() => {
    const a = loadActive();
    if (!a || a.day !== week.day || a.street !== week.street) return;
    setLeads(a.leads || {});
    clockRef.current = unpackClock(a.clock);
    if (a.fight) {
      const h = street.houses.find((x) => x.idx === a.fight.houseIdx);
      const f = unpackFight(a.fight, h);
      if (f) {
        resumeFightRef.current = f;
        setFightCfg({ house: h, lead: a.fight.lead, deck: a.fight.deck, aggro: 1, grace: false });
        setView(VIEW.fight);
        return;
      }
    }
    setView(VIEW.block);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── the clock: one interval, one visibility handler ───────────────────*/
  const clockLive = view === VIEW.block || view === VIEW.fight;

  useEffect(() => {
    if (!clockLive || !clockRef.current) return undefined;
    const c = clockRef.current;
    resumeClock(c);
    const tick = () => {
      const left = remaining(c);
      setClockLeft(left);
      if (left <= 0 && !dayEndedRef.current) finishDay();
    };
    tick();
    const iv = window.setInterval(tick, 250);
    return () => { window.clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockLive, view]);

  useEffect(() => {
    const onVis = () => {
      const c = clockRef.current;
      if (!c) return;
      if (document.hidden) {
        /* BANK AND PAUSE. Not snap-forward. */
        pauseClock(c);
        persist();
      } else if (clockLive) {
        resumeClock(c);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockLive, view, week, leads]);

  const persist = useCallback(() => {
    saveWeek(week);
    if (view === VIEW.block || view === VIEW.fight) {
      saveActive({
        phase: view === VIEW.fight ? "fight" : "block",
        day: week.day,
        street: week.street,
        leads,
        clock: clockRef.current ? packClock(clockRef.current) : null,
        fight: view === VIEW.fight && resumeFightRef.current ? packFight(resumeFightRef.current) : null,
      });
    }
  }, [week, view, leads]);

  /* ── flow ──────────────────────────────────────────────────────────────*/

  const beginDay = () => {
    startDay(week, week.day);
    dayEndedRef.current = false;
    clockRef.current = createClock();
    setLeads({});
    setRideRes(null);
    clearActive();
    setView(VIEW.ride);
  };

  const onRideFinish = (res) => {
    const next = { ...week };
    next.houses = week.houses.map((h) => ({ ...h }));
    const table = applyRide(next, res, next.day);
    setWeek(next);
    setLeads(table);
    setRideRes(res);
    saveWeek(next);
    setView(VIEW.rideBoard);
  };

  const onCharge = (seconds) => {
    const c = clockRef.current;
    if (!c) return;
    charge(c, seconds);
    const left = remaining(c);
    setClockLeft(left);
    if (left <= 0 && !dayEndedRef.current) finishDay();
  };

  const onFight = (cfg) => {
    resumeFightRef.current = null;
    setFightCfg(cfg);
    setView(VIEW.fight);
  };

  const onDoorResolved = ({ houseIdx, outcome }) => {
    const next = { ...week, houses: week.houses.map((h) => ({ ...h })), salesByDay: [...week.salesByDay] };
    applyDoor(next, houseIdx, outcome, next.day);
    onCharge(doorClockCost(outcome));
    setWeek(next);
    setFightCfg(null);
    resumeFightRef.current = null;
    setView(VIEW.block);
    window.setTimeout(() => {
      saveWeek(next);
      saveActive({
        phase: "block", day: next.day, street: next.street, leads,
        clock: clockRef.current ? packClock(clockRef.current) : null, fight: null,
      });
    }, 0);
  };

  const onFightDone = (r) => {
    const outcome = r.outcome === RESULT.sale ? CLOSE.sale
      : r.outcome === RESULT.callback ? CLOSE.callback
        : r.outcome === RESULT.hostile ? CLOSE.hostile : CLOSE.walkaway;
    onDoorResolved({ houseIdx: r.houseIdx, outcome });
  };

  function finishDay() {
    if (dayEndedRef.current) return; // the guard. Non-negotiable.
    dayEndedRef.current = true;
    const next = { ...week, houses: week.houses.map((h) => ({ ...h })), quotaMet: [...week.quotaMet], salesByDay: [...week.salesByDay] };
    const rep = endDay(next, week.day);
    setWeek(next);
    setReport(rep);
    saveWeek(next);
    clearActive();
    setView(VIEW.results);

    if (!completedRef.current && (rep.last || rep.fired)) {
      completedRef.current = true;
      onComplete && onComplete({
        street: next.street,
        days: rep.day + 1,
        score: next.score,
        sold: next.houses.filter((h) => h.sold).length,
        won: rep.won,
        fired: rep.fired,
      });
    }
  }

  const nextDay = () => {
    setReport(null);
    setView(VIEW.brief);
  };

  const doResetWeek = () => {
    const w = resetWeek(week);
    completedRef.current = false;
    setWeek(w);
    setReport(null);
    setView(VIEW.week);
  };
  const doNextStreet = () => {
    const w = nextStreet(week);
    completedRef.current = false;
    setWeek(w);
    setReport(null);
    setView(VIEW.week);
  };

  /* ── render ────────────────────────────────────────────────────────────*/
  const tod = clockRef.current ? timeOfDay(clockRef.current) : { text: "08:00", label: "MORNING", openMul: 1 };
  const heatNow = Math.max(0, Math.min(HEAT.max, week.weekHeat + HEAT.doorHeatWeight * doorHeat));

  let body = null;
  if (view === VIEW.week) {
    body = <WeekBoard week={week} street={street} onResume={() => setView(VIEW.brief)} onNewWeek={doResetWeek} onQuit={onClose} />;
  } else if (view === VIEW.brief) {
    body = <DayBrief week={{ ...week, weekHeat: heatNow }} day={week.day} onStart={beginDay} onQuit={onClose} />;
  } else if (view === VIEW.ride) {
    body = (
      <RideScene
        key={`ride-${week.day}-${week.seed}`}
        street={street}
        seed={week.seed + week.day * 17}
        day={week.day}
        streetN={week.street}
        onFinish={onRideFinish}
        onQuit={() => setView(VIEW.brief)}
      />
    );
  } else if (view === VIEW.rideBoard) {
    body = <RideBoard result={rideRes} street={street} week={week} day={week.day} onContinue={() => setView(VIEW.block)} />;
  } else if (view === VIEW.block) {
    body = (
      <KnockScene
        street={street}
        week={week}
        leads={leads}
        day={week.day}
        clockLeft={clockLeft}
        timeText={tod.text}
        timeLabel={tod.label}
        openMul={tod.openMul}
        onFight={onFight}
        onResolved={onDoorResolved}
        onCharge={onCharge}
        onEndDay={finishDay}
      />
    );
  } else if (view === VIEW.fight && fightCfg) {
    body = (
      <FightScene
        key={`f-${fightCfg.house.idx}-${week.day}`}
        house={fightCfg.house}
        owner={homeownerFor(fightCfg.house.idx)}
        lead={fightCfg.lead}
        deck={fightCfg.deck}
        aggro={fightCfg.aggro}
        grace={fightCfg.grace}
        resume={resumeFightRef.current}
        onDone={onFightDone}
      />
    );
  } else if (view === VIEW.results) {
    body = (
      <DayResults
        report={report}
        week={week}
        street={street}
        day={report ? report.day : week.day}
        onNext={nextDay}
        onRetryWeek={doResetWeek}
        onNextStreet={doNextStreet}
        onQuit={onClose}
      />
    );
  }

  return createPortal(
    <div className="sk-app" role="dialog" aria-modal="true" aria-label="Super Knock">
      {body}
    </div>,
    document.body
  );
}
