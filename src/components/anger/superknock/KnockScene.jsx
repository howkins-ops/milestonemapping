import React, { useEffect, useMemo, useRef, useState } from "react";
import { SkIconSheet, SkIcon, Porch, BlockDoor, YardTells } from "./skArt.jsx";
import { houseState, travelCost, quotaFor } from "./skWeek.js";
import {
  createKnockMeter, stepKnockMeter, stopKnockMeter, canRetry, resetKnockMeter,
  knockOutcome, createWait, stepWait, sweetBand, VERDICT, PEEK,
} from "./skKnock.js";
import { KNOCK, STANCE, LEAD, FIGHT, WAIT_S } from "./skTuning.js";
import { CARDS, FAMILY_KEYS } from "./skObjections.js";
import { PROPS } from "./skStreet.js";
import { homeownerFor } from "./skHomeowners.js";
import { sfxKnock, sfxDoorChime, sfxWhoosh, sfxFootstep, sfxPop, sfxImpact } from "../../../lib/sfx.js";

/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — PHASE 2, THE KNOCK RUN.

   ── WHY THIS IS A STRIP AND NOT A WALK ───────────────────────────────────
   The bible says "walk the same street". Eight hundred and fifty metres at
   walking pace is TEN MINUTES against a seven-minute clock — the knock run
   as literally specified cannot physically traverse its own street. Even at a
   jog it is 212 seconds of travel, leaving time for two or three doors.

   So THE BLOCK is a strip of twenty doors and travel is charged, not walked.
   Everything the walk was for survives: you still read the street by looking
   at the doors (your hanger is on them), you still make the routing decision
   (a near cluster is cheaper than criss-crossing), and the ride's spatial
   choices still matter later. What is gone is four minutes of holding a
   button, and four minutes is most of a day.

   ── THE THREE DECISIONS AT EVERY DOOR ────────────────────────────────────
   Stance, then the deck, then the meter — and the wait after. The deck LOCKS
   when you knock, which is the only reason reading his yard means anything.
   ════════════════════════════════════════════════════════════════════════ */

const MODE = { block: "block", porch: "porch" };

export default function KnockScene({
  street, week, leads, day, clockLeft, timeText, timeLabel, openMul = 1,
  onFight, onResolved, onCharge, onEndDay, resumeAt = null,
}) {
  const [mode, setMode] = useState(MODE.block);
  const [idx, setIdx] = useState(resumeAt);
  const [stance, setStance] = useState("square");
  const [deck, setDeck] = useState(["reflex", "deferral", "hostile"]);
  const [locked, setLocked] = useState(false);
  const [meter, setMeter] = useState(null);
  const [wait, setWait] = useState(null);
  const [msg, setMsg] = useState(null);
  const [peeked, setPeeked] = useState(false);
  const lastIdx = useRef(null);
  const rafRef = useRef(0);
  const meterRef = useRef(null);
  const waitRef = useRef(null);
  const barRef = useRef(null);
  const resolvedRef = useRef(false);

  const house = idx == null ? null : street.houses.find((h) => h.idx === idx);
  const hs = house ? houseState(week, house.idx, day, house.noSolicit) : null;
  const lead = house ? (leads[house.idx] || null) : null;
  const owner = house ? homeownerFor(house.idx) : null;

  /* ── the meter + the wait, on one rAF ──────────────────────────────────
     Both write to a CSS custom property rather than through React — a bar
     that re-renders sixty times a second on a phone is how a 131ms window
     turns into a 200ms one. */
  useEffect(() => {
    if (mode !== MODE.porch) return undefined;
    let last = 0;
    const tick = (t) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      const m = meterRef.current;
      if (m && !m.stopped) {
        stepKnockMeter(m, dt);
        if (barRef.current) barRef.current.style.setProperty("--sk-knock", m.pos.toFixed(4));
      }
      const w = waitRef.current;
      if (w && !w.opened && !w.expired) {
        stepWait(w, dt);
        if (barRef.current) barRef.current.style.setProperty("--sk-wait", (1 - w.left / WAIT_S).toFixed(4));
        if (w.opened) openDoor();
        else if (w.expired) noAnswer();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = 0; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /* ── going to a door ───────────────────────────────────────────────────*/
  function approach(h) {
    const st = houseState(week, h.idx, day, h.noSolicit);
    if (!st.workable) {
      setMsg(st.locked ? "NOT UNTIL SUNDAY" : st.sold ? "ALREADY CLOSED" : st.dead ? "HE NEVER SAW IT" : "NOT TODAY");
      window.setTimeout(() => setMsg(null), 1100);
      return;
    }
    const cost = travelCost(lastIdx.current, h.idx);
    onCharge(cost);
    lastIdx.current = h.idx;
    sfxFootstep(true);
    setIdx(h.idx);
    setStance("square");
    setLocked(false);
    setPeeked(false);
    setMeter(null);
    setWait(null);
    meterRef.current = null;
    waitRef.current = null;
    resolvedRef.current = false;
    setMode(MODE.porch);
  }

  function backToBlock() {
    setMode(MODE.block);
    setIdx(null);
    meterRef.current = null;
    waitRef.current = null;
  }

  /* ── the knock ─────────────────────────────────────────────────────────*/
  function startKnock() {
    if (meterRef.current) return;
    setLocked(true); // THE DECK LOCKS HERE. This is the commitment.
    const m = createKnockMeter(day);
    meterRef.current = m;
    setMeter({ ...m });
  }

  function tapMeter() {
    const m = meterRef.current;
    if (!m || m.stopped) return;
    stopKnockMeter(m);
    setMeter({ ...m });

    if (m.verdict === VERDICT.soft) {
      sfxKnock(0);
      onCharge(KNOCK.softClockPenaltyS);
      setMsg("TOO SOFT — HE DIDN'T HEAR IT");
      /* Always retryable. A sub-150ms hard fail at the end of a seven-minute
         clock is not difficulty, it is a coin flip with your afternoon. */
      window.setTimeout(() => {
        setMsg(null);
        if (canRetry(m)) { resetKnockMeter(m); setMeter({ ...m }); }
        else beginWait(m.verdict);
      }, 900);
      return;
    }
    sfxKnock(m.verdict === VERDICT.hard ? 3 : 2);
    if (m.verdict === VERDICT.hard) setMsg("TOO HARD — HE'S COMING ANGRY");
    else setMsg("CLEAN");
    window.setTimeout(() => setMsg(null), 800);
    beginWait(m.verdict);
  }

  function beginWait(verdict) {
    const out = knockOutcome({
      lead: lead || "none",
      houseOpenMul: hs.openMul,
      stance,
      windowMul: openMul,
      verdict,
    });
    const w = createWait(out);
    w.aggro = out.aggro;
    waitRef.current = w;
    setWait({ ...w });
  }

  function openDoor() {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    sfxDoorChime();
    const w = waitRef.current;
    onFight({
      house,
      lead: lead || "none",
      deck,
      aggro: (w && w.aggro) || 1,
      grace: !!(LEAD[lead] && LEAD[lead].grace),
      stance,
    });
  }

  function noAnswer() {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    sfxWhoosh();
    onResolved({ houseIdx: house.idx, outcome: "walkaway", reason: "noanswer" });
    setMsg("NOBODY CAME");
    window.setTimeout(() => { setMsg(null); backToBlock(); }, 900);
  }

  function leaveNow() {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    onResolved({ houseIdx: house.idx, outcome: "walkaway", reason: "left" });
    backToBlock();
  }

  function peek() {
    if (peeked) return;
    setPeeked(true);
    onCharge(PEEK.costS);
    sfxPop();
  }

  const toggleCard = (k) => {
    if (locked) return;
    setDeck((d) => (d.includes(k) ? d.filter((x) => x !== k) : d.length < FIGHT.deckSize ? [...d, k] : d));
  };

  const band = useMemo(() => sweetBand(day), [day]);
  const sales = week.salesByDay[day];
  const need = quotaFor(day);

  /* ════════════════════════════════════════════════════════════════════ */
  if (mode === MODE.block) {
    return (
      <div className="sk-block">
        <SkIconSheet />
        <div className="sk-block__top">
          <div className="sk-clockbox">
            <SkIcon name="clock" size={14} />
            <span className="sk-clockbox__t">{fmt(clockLeft)}</span>
            <span className="sk-clockbox__w">{timeLabel} · {timeText}</span>
          </div>
          <div className="sk-quota">
            <span className="sk-quota__n">{sales}</span>
            <span className="sk-quota__of">/ {need}</span>
            <span className="sk-quota__l">SOLD</span>
          </div>
        </div>

        <p className="sk-block__hint">THE BLOCK — your hangers are still on the doors. Tap one.</p>

        <div className="sk-block__grid">
          {street.houses.map((h) => {
            const st = houseState(week, h.idx, day, h.noSolicit);
            const l = leads[h.idx] || null;
            return (
              <button
                key={h.idx}
                type="button"
                className={`sk-blockdoor ${st.workable ? "" : "is-off"} ${l === "hot" ? "is-hot" : ""}`}
                onClick={() => approach(h)}
                aria-label={`Number ${h.number}, ${l || "no hanger"}`}
              >
                <BlockDoor house={h} state={st} lead={l} size={40} />
                <span className="sk-blockdoor__n">{h.number}</span>
                {l && <span className={`sk-blockdoor__lead sk-lead--${l}`}>{LEAD[l].label}</span>}
                {!l && <span className="sk-blockdoor__lead sk-lead--none">—</span>}
              </button>
            );
          })}
        </div>

        <button type="button" className="sk-endday" onClick={onEndDay}>END THE DAY</button>
        {msg && <div className="sk-msg">{msg}</div>}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════ */
  const waiting = !!wait && !wait.opened && !wait.expired;
  return (
    <div className="sk-porchwrap" ref={barRef}>
      <SkIconSheet />
      <div className="sk-porch__stage">
        <Porch house={house} state={hs} lead={lead} stance={stance} knocking={!!meter && meter.stopped} peek={peeked} />
      </div>

      <div className="sk-porch__top">
        <button type="button" className="sk-back" onClick={leaveNow} aria-label="Leave this door">←</button>
        <div className="sk-porch__who">
          <span className="sk-porch__num">{house.number}</span>
          <span className="sk-porch__name">{owner.name}</span>
        </div>
        <div className="sk-clockbox sk-clockbox--sm">
          <SkIcon name="clock" size={12} />
          <span className="sk-clockbox__t">{fmt(clockLeft)}</span>
        </div>
      </div>

      <div className="sk-porch__panel">
        {hs.tierLabel && <div className="sk-tier">{hs.tierLabel}</div>}

        {!locked && (
          <>
            <div className="sk-sect">
              <span className="sk-sect__h">WHAT YOU CAN SEE FROM THE STEP</span>
              <YardTells house={house} revealed={peeked ? 99 : Math.max(1, house.props.length - 1)} />
              {!peeked && (
                <button type="button" className="sk-peek" onClick={peek}>
                  LEAN AND LOOK IN — {PEEK.costS}s
                </button>
              )}
            </div>

            <div className="sk-sect">
              <span className="sk-sect__h">WHERE YOU'RE STANDING</span>
              <div className="sk-stance">
                {["back", "square", "crowd"].map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`sk-stance__b ${stance === k ? "is-on" : ""}`}
                    onClick={() => setStance(k)}
                  >{STANCE[k].label}</button>
                ))}
              </div>
            </div>

            <div className="sk-sect">
              <span className="sk-sect__h">
                YOUR THREE — {deck.length}/{FIGHT.deckSize} · locked when you knock
              </span>
              <div className="sk-deck">
                {FAMILY_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`sk-card ${deck.includes(k) ? "is-on" : ""}`}
                    style={{ "--cc": CARDS[k].accent }}
                    onClick={() => toggleCard(k)}
                  >
                    <span className="sk-card__n">{CARDS[k].name}</span>
                    <span className="sk-card__h">{CARDS[k].hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="sk-knockbtn"
              disabled={deck.length !== FIGHT.deckSize}
              onClick={startKnock}
            >
              <SkIcon name="knock" size={18} /> KNOCK
            </button>
          </>
        )}

        {locked && meter && !waiting && !wait && (
          <div className="sk-meter" onPointerDown={tapMeter} role="button" tabIndex={0} aria-label="Stop the knock meter">
            <div className="sk-meter__track">
              <div
                className="sk-meter__sweet"
                style={{ left: `${band.from * 100}%`, width: `${(band.to - band.from) * 100}%` }}
              />
              <div className="sk-meter__head" />
            </div>
            <span className="sk-meter__hint">{meter.stopped ? "" : "TAP IN THE GOLD"}</span>
          </div>
        )}

        {waiting && (
          <div className="sk-wait">
            <div className="sk-wait__bar"><div className="sk-wait__fill" /></div>
            <span className="sk-wait__t">WAITING — {Math.ceil(wait.left)}s</span>
            <button type="button" className="sk-wait__leave" onClick={leaveNow}>WALK</button>
          </div>
        )}
      </div>

      {msg && <div className="sk-msg">{msg}</div>}
    </div>
  );
}

function fmt(s) {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
