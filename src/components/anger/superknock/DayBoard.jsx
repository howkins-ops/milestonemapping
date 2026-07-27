import React from "react";
import { SkIconSheet, SkIcon, BlockDoor } from "./skArt.jsx";
import { DAYS, QUOTA, LEAD, HEAT } from "./skTuning.js";
import { houseState, quotaFor, STRIKES_TO_FIRED, WEDNESDAY } from "./skWeek.js";

/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — THE BOARDS. Everything between the playing.

   These screens exist to make the WEEK legible, and one of them carries the
   whole persistence layer on its back: the Tuesday-night board has to tell
   you, in your own numbers, that tomorrow's NO SOLICITING signs are your
   handwriting. If Wednesday reads as a difficulty spike the game chose,
   nothing else in the week matters.
   ════════════════════════════════════════════════════════════════════════ */

const fmtN = (n) => (n || 0).toLocaleString();

/* ── the morning brief ────────────────────────────────────────────────────*/

export function DayBrief({ week, day, onStart, onQuit }) {
  const cfg = DAYS[day];
  const need = quotaFor(day);
  const signs = week.houses.filter((h) => h.noSolicit).length;
  const dead = week.houses.filter((h) => h.dead).length;
  const sold = week.houses.filter((h) => h.sold).length;

  return (
    <div className="sk-board">
      <SkIconSheet />
      <button type="button" className="sk-back sk-back--abs" onClick={onQuit} aria-label="Leave">←</button>
      <p className="sk-board__kick">STREET {week.street} · DAY {day + 1} OF 7</p>
      <h1 className="sk-board__day">{cfg.name}</h1>
      <p className="sk-board__tag">{cfg.tag}</p>

      <div className="sk-brief">
        <div className="sk-brief__row">
          <span>TODAY'S QUOTA</span>
          <b>{need} {need === 1 ? "SALE" : "SALES"}</b>
        </div>
        {week.banked > 0 && (
          <div className="sk-brief__row sk-brief__row--good">
            <span>BANKED FROM YESTERDAY</span><b>+{week.banked}</b>
          </div>
        )}
        <div className="sk-brief__row">
          <span>STRIKES</span>
          <b className={week.strikes > 0 ? "is-bad" : ""}>{week.strikes} / {STRIKES_TO_FIRED}</b>
        </div>
        {sold > 0 && <div className="sk-brief__row"><span>CLOSED THIS WEEK</span><b>{sold}</b></div>}
        {signs > 0 && <div className="sk-brief__row sk-brief__row--bad"><span>NO SOLICITING</span><b>{signs} doors</b></div>}
        {dead > 0 && <div className="sk-brief__row sk-brief__row--bad"><span>WRITTEN OFF</span><b>{dead} doors</b></div>}
        {week.weekHeat >= HEAT.copPatrolAt && (
          <div className="sk-brief__row sk-brief__row--bad">
            <span><SkIcon name="heat" size={12} /> HEAT</span><b>{week.weekHeat.toFixed(1)}</b>
          </div>
        )}
      </div>

      <div className="sk-board__how">
        <p><b>THE RUN.</b> One pass. Left thumb steers and throttles, right thumb throws. Hold a throw button to see where it lands, let go to throw.</p>
        <p><b>THE LANES.</b> Middle of the road hooks the handle — that is the money. His grass reaches the window, and costs you all week. The far side only reaches the mailbox.</p>
      </div>

      <button type="button" className="sk-go" onClick={onStart}>START THE RUN</button>
    </div>
  );
}

/* ── after the ride ───────────────────────────────────────────────────────*/

export function RideBoard({ result, street, week, day, onContinue }) {
  const rows = [
    ["HOOKED", result.hot, "hot"],
    ["ON THE DOOR / MAT", result.covered - result.hot - result.dead - result.hostile, "warm"],
    ["THROUGH A WINDOW", result.hostile, "hostile"],
    ["IN THE BUSHES", result.dead, "dead"],
  ];
  return (
    <div className="sk-board">
      <SkIconSheet />
      <p className="sk-board__kick">{DAYS[day].name} · THE RUN</p>
      <h1 className="sk-board__day">{fmtN(result.score)}</h1>
      <p className="sk-board__tag">
        {result.perfect ? "EVERY DOOR ON THE STREET. Nothing wasted." : `${result.covered} of ${street.houses.length} doors touched`}
      </p>

      <div className="sk-brief">
        {rows.map(([label, n, k]) => (
          <div key={label} className="sk-brief__row">
            <span className={`sk-lead--${k}`}>{label}</span><b>{n || 0}</b>
          </div>
        ))}
        <div className="sk-brief__row"><span>BEST RUN OF HITS</span><b>×{result.bestCombo || 0}</b></div>
        <div className="sk-brief__row"><span>HANGERS LEFT</span><b>{result.ammoLeft}</b></div>
      </div>

      {result.dead > 0 && (
        <p className="sk-note sk-note--bad">
          {result.dead} {result.dead === 1 ? "hanger" : "hangers"} in the bushes. Those doors will not open today.
        </p>
      )}
      {result.hostile > 0 && (
        <p className="sk-note sk-note--bad">
          Broken glass pays triple and boards up tomorrow. He will remember on Wednesday.
        </p>
      )}

      <button type="button" className="sk-go" onClick={onContinue}>WORK THE BLOCK</button>
    </div>
  );
}

/* ── after the day ────────────────────────────────────────────────────────*/

export function DayResults({ report, week, street, day, onNext, onRetryWeek, onNextStreet, onQuit }) {
  if (report.fired) {
    return (
      <div className="sk-board sk-board--end">
        <SkIconSheet />
        <p className="sk-board__kick">THE PAPER, WEDNESDAY EDITION</p>
        <h1 className="sk-board__day sk-board__day--bad">ROOKIE WASHES OUT</h1>
        <p className="sk-board__tag">Three quotas missed. They gave the street to somebody else.</p>
        <div className="sk-brief">
          <div className="sk-brief__row"><span>DAYS WORKED</span><b>{day + 1}</b></div>
          <div className="sk-brief__row"><span>FINAL SCORE</span><b>{fmtN(week.score)}</b></div>
          <div className="sk-brief__row"><span>DOORS CLOSED</span><b>{week.houses.filter((h) => h.sold).length}</b></div>
        </div>
        <button type="button" className="sk-go" onClick={onRetryWeek}>TAKE THE STREET AGAIN</button>
        <button type="button" className="sk-quiet" onClick={onQuit}>LEAVE IT</button>
      </div>
    );
  }

  if (report.last) {
    const won = report.won;
    return (
      <div className="sk-board sk-board--end">
        <SkIconSheet />
        <p className="sk-board__kick">SUNDAY NIGHT</p>
        <h1 className={`sk-board__day ${won ? "" : "sk-board__day--bad"}`}>
          {won ? "THE WEEK IS YOURS" : "YOU FINISHED IT"}
        </h1>
        <p className="sk-board__tag">
          {won ? "Seven days, one street, and you know every door on it." : "Not the numbers they wanted. But you walked it to the end."}
        </p>
        <div className="sk-brief">
          <div className="sk-brief__row"><span>SCORE</span><b>{fmtN(week.score)}</b></div>
          <div className="sk-brief__row"><span>QUOTAS MET</span><b>{week.quotaMet.filter(Boolean).length} / 7</b></div>
          <div className="sk-brief__row"><span>DOORS CLOSED</span><b>{week.houses.filter((h) => h.sold).length}</b></div>
          <div className="sk-brief__row"><span>STRIKES</span><b>{week.strikes}</b></div>
        </div>
        {won && week.street < 3 && (
          <button type="button" className="sk-go" onClick={onNextStreet}>
            TAKE STREET {week.street + 1}
          </button>
        )}
        <button type="button" className="sk-quiet" onClick={onRetryWeek}>RUN THIS STREET AGAIN</button>
        <button type="button" className="sk-quiet" onClick={onQuit}>DONE</button>
      </div>
    );
  }

  const tomorrow = DAYS[day + 1];
  return (
    <div className="sk-board">
      <SkIconSheet />
      <p className="sk-board__kick">{DAYS[day].name} · CLOSING UP</p>
      <h1 className={`sk-board__day ${report.met ? "" : "sk-board__day--bad"}`}>
        {report.met ? "QUOTA MET" : "QUOTA MISSED"}
      </h1>
      <p className="sk-board__tag">
        {report.sales} sold, needed {report.need}{report.banked > 0 ? ` · ${report.banked} banked` : ""}
      </p>

      <div className="sk-brief">
        <div className="sk-brief__row"><span>STRIKES</span>
          <b className={report.strikes > 0 ? "is-bad" : ""}>{report.strikes} / {STRIKES_TO_FIRED}</b>
        </div>
        <div className="sk-brief__row"><span>SCORE</span><b>{fmtN(report.score)}</b></div>
      </div>

      {/* ── THE KEYSTONE. Tuesday night has to name the debt out loud. ──── */}
      {report.signsComingTomorrow > 0 && (
        <div className="sk-keystone">
          <SkIcon name="sign" size={20} />
          <div>
            <b>{report.signsComingTomorrow} NO SOLICITING {report.signsComingTomorrow === 1 ? "SIGN" : "SIGNS"} GO UP TONIGHT.</b>
            <span>Broken glass and tyre tracks. They talked to each other about you.</span>
          </div>
        </div>
      )}

      <div className="sk-tomorrow">
        <span className="sk-tomorrow__k">TOMORROW</span>
        <b>{tomorrow.name}</b>
        <span>{tomorrow.tag} · quota {QUOTA[day + 1]}</span>
      </div>

      <button type="button" className="sk-go" onClick={onNext}>SLEEP ON IT</button>
    </div>
  );
}

/* ── the week board, on entry ─────────────────────────────────────────────*/

export function WeekBoard({ week, street, onResume, onNewWeek, onQuit }) {
  return (
    <div className="sk-board">
      <SkIconSheet />
      <button type="button" className="sk-back sk-back--abs" onClick={onQuit} aria-label="Leave">←</button>
      <p className="sk-board__kick">SUPER KNOCK</p>
      <h1 className="sk-board__day">STREET {week.street}</h1>
      <p className="sk-board__tag">One street. Twenty doors. Seven days.</p>

      <div className="sk-weekrow">
        {DAYS.map((d, i) => (
          <div key={d.key} className={`sk-weekrow__d ${i === week.day ? "is-now" : ""} ${week.quotaMet[i] ? "is-met" : i < week.day ? "is-miss" : ""}`}>
            <span>{d.name.slice(0, 3)}</span>
            <b>{QUOTA[i]}</b>
          </div>
        ))}
      </div>

      <div className="sk-minimap">
        {street.houses.map((h) => {
          const st = houseState(week, h.idx, week.day, h.noSolicit);
          return <BlockDoor key={h.idx} house={h} state={st} lead={null} size={26} />;
        })}
      </div>

      <button type="button" className="sk-go" onClick={onResume}>
        {week.day === 0 && week.score === 0 ? "START THE WEEK" : `CONTINUE — ${DAYS[week.day].name}`}
      </button>
      <button type="button" className="sk-quiet" onClick={onNewWeek}>NEW WEEK</button>
    </div>
  );
}

export default DayBrief;
