import React from "react";
import { IconSheet, GameIcon } from "../door/GameIcons.jsx";
import { LEAD_TABLE } from "../doorLeadTransform.js";
import { DOOR_LADDER, getDoorLevel } from "../doorLevels.js";
import { doorsCovered } from "./routeStreet.js";

/* ════════════════════════════════════════════════════════════════════════
   THE FLYER BOARD — the two cards either side of the run.

   `intro`   what the run is and what it buys you
   `results` what you actually did to the five doors that remember

   The results card has one job beyond scorekeeping: make the connection
   between the throw and the fight explicit BEFORE the player walks up to a
   door and wonders why it took thirty-two knocks. A consequence the player
   can't trace back to their own choice reads as the game being unfair.
   ════════════════════════════════════════════════════════════════════════ */

const LEAD_ORDER = ["hot", "warm", "lukewarm", "hostile", "dead"];

export default function FlyerBoard({
  variant = "intro", street, result, leads = {}, cleared = 0, total = 5,
  onStart, onSkip, onClose,
}) {
  if (variant === "intro") {
    return (
      <div className="dr-stage dr-board">
        <IconSheet />
        <div className="dr-top">
          <button className="dg-back" onClick={onClose}>← Anger Gym</button>
          <span className="dr-top__title">THE ROUTE</span>
          <span className="dr-top__score">{cleared}/{total} CLOSED</span>
        </div>

        <p className="dr-board__kick">6:40 AM · THE BAG IS FULL</p>
        <h1 className="dr-board__h">Ride it once<br />before you knock it.</h1>
        <p className="dr-board__lead">
          Twenty houses on this block. Five of them are yours to close — the rest just
          have windows. Ride the street on the segway and put a door hanger on every
          door you can reach.
        </p>

        <div className="dr-lanes">
          <div className="dr-lane">
            <span className="dr-lane__k">MIDDLE OF THE ROAD</span>
            <b>THE HANDLE</b>
            <span>Hook it and he answers half-expecting you. The best shot in the game, from the only lane with traffic in it.</span>
          </div>
          <div className="dr-lane">
            <span className="dr-lane__k">HIS GRASS</span>
            <b>THE WINDOW</b>
            <span>Worth the most, costs the most. He opens swinging and the door takes a third longer.</span>
          </div>
          <div className="dr-lane">
            <span className="dr-lane__k">FAR SIDE</span>
            <b>THE MAILBOX</b>
            <span>Safe points. Doesn&rsquo;t warm anybody up.</span>
          </div>
        </div>

        <p className="dr-board__note">
          Hold a throw button to see where it lands. Let go to throw. Miss into the
          bushes and he never sees it at all.
        </p>

        <button className="dr-go" onClick={onStart}>
          <GameIcon name="door" size={18} /> RIDE THE BLOCK
        </button>
        <button className="dr-quiet" onClick={onSkip}>Skip it — just walk the street</button>
      </div>
    );
  }

  const covered = result ? doorsCovered(result.leads || {}) : 0;
  const rows = DOOR_LADDER.map((lv) => ({ lv, lead: leads[lv.id] || "none" }));

  return (
    <div className="dr-stage dr-board">
      <IconSheet />
      <div className="dr-top">
        <button className="dg-back" onClick={onClose}>← Anger Gym</button>
        <span className="dr-top__title">THE RUN</span>
      </div>

      <p className="dr-board__kick">THE BAG IS EMPTY</p>
      <h1 className="dr-board__h">{(result?.score ?? 0).toLocaleString()}</h1>
      <p className="dr-board__lead">
        {covered === 0
          ? "Not one of the five got a hanger. Every door on this block plays it straight today."
          : `${covered} of 5 doors carry your hanger. The other fifteen were just windows.`}
      </p>

      <ul className="dr-leadlist">
        {rows.map(({ lv, lead }) => {
          const t = LEAD_TABLE[lead];
          return (
            <li key={lv.id} className={`dr-leadrow is-${lead}`}>
              <span className="dr-leadrow__n">{lv.title}</span>
              <span className="dr-leadrow__s">{t.label || "NO HANGER"}</span>
              <span className="dr-leadrow__e">
                {lead === "none" || lead === "warm"
                  ? "as it comes"
                  : `${t.taps < 1 ? "−" : "+"}${Math.abs(Math.round((t.taps - 1) * 100))}% door`}
              </span>
            </li>
          );
        })}
      </ul>

      {rows.some((r) => r.lead === "hostile") && (
        <p className="dr-board__warn">
          Broken glass. There&rsquo;s plywood on that window now and he has been waiting all day.
        </p>
      )}
      {rows.some((r) => r.lead === "dead") && (
        <p className="dr-board__warn">
          One&rsquo;s face-down in a hedge. As far as that house knows, you never came.
        </p>
      )}

      <button className="dr-go" onClick={onStart}>
        <GameIcon name="fist" size={18} /> WALK THE BLOCK
      </button>
    </div>
  );
}

export { LEAD_ORDER };
