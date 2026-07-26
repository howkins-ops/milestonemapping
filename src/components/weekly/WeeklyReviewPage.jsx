import React, { useState, useMemo } from "react";
import MilestoneReviewCards from "./MilestoneReviewCards.jsx";
import ReviewHistory from "./ReviewHistory.jsx";
import SundayReviewWizard from "./SundayReviewWizard.jsx";
import {
  BriefingTable,
  CompassRose,
  CrateMark,
  FlameMark,
  ReceiptMark,
  BoltMark,
  ChevronMark
} from "./strategyArt.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { computeReviewStreak } from "../../lib/utils.js";
import { getCurrentWeekNumber } from "../../lib/dates.js";
import "../../styles/strategyRoom.css";

/* ════════════════════════════════════════════════════════════════════
   THE STRATEGY ROOM

   What was here: a page header that said "STRATEGY ROOM", then a title
   that said "Sunday Review: Update the map before the next mission
   begins.", then a subtitle that said "The week is not over until the
   lesson is captured.", then a card that said "Begin the Sunday Review"
   with a subtitle describing the seven screens you were about to see.
   Four restatements of one idea before the first tap.

   Now: the table IS the header. One card, one question — *is this week
   closed?* — answered by its own state before you read a word.
   ════════════════════════════════════════════════════════════════════ */

function Gauge({ art, value, unit, label }) {
  return (
    <span className="sr-gauge">
      <span className="sr-gauge__art" aria-hidden="true">{art}</span>
      <span className="sr-gauge__col">
        <span className="sr-gauge__num">
          {value}
          {unit && <small>{unit}</small>}
        </span>
        <span className="sr-gauge__label">{label}</span>
      </span>
    </span>
  );
}

export default function WeeklyReviewPage() {
  const [active, setActive] = useState(false);
  const { weeklyReviews } = useAppData();

  const weekNo = getCurrentWeekNumber();
  const reviewStreak = useMemo(() => computeReviewStreak(weeklyReviews), [weeklyReviews]);
  const last = weeklyReviews.length > 0 ? weeklyReviews[0] : null;
  const filed = Boolean(last && last.weekNumber === weekNo);
  const openReceipts = last ? (last.commitments || []).length : 0;

  if (active) return <SundayReviewWizard onClose={() => setActive(false)} />;

  return (
    <div className="sroom anim-fade-in">
      {/* ── 1 · THE BRIEFING TABLE ────────────────────────────────── */}
      <button
        type="button"
        className={`sr-card sr-brief${filed ? " is-filed" : ""}`}
        onClick={() => setActive(true)}
      >
        <span className="sr-card__art" aria-hidden="true">
          <BriefingTable />
        </span>
        <span className="sr-card__scrim" aria-hidden="true" />

        <span className="sr-card__body sr-brief__body">
          <span className="sr-brief__stamp">
            <span className="sr-brief__crest" aria-hidden="true">
              <CompassRose />
            </span>
            <span className="sr-brief__stampcol">
              <span className="sr-kicker">Strategy Room</span>
              <span className="sr-brief__week">
                Week {weekNo} · {filed ? "Filed" : "Open"}
              </span>
            </span>
          </span>

          <span className="sr-brief__title">
            {filed ? "The week is" : "Close the"}
            <em>{filed ? "sealed" : "week"}</em>
          </span>

          <span className="sr-brief__line">
            {filed
              ? openReceipts > 0
                ? `Signed off. ${openReceipts} commitment${openReceipts > 1 ? "s are" : " is"} live until next Sunday.`
                : "Signed off. Nothing outstanding."
              : "The week isn't over until the lesson is written down."}
          </span>

          <span className="sr-brief__panel">
            <Gauge
              art={<FlameMark tone={reviewStreak > 0 ? "fire" : "dead"} />}
              value={reviewStreak}
              unit={reviewStreak === 1 ? " wk" : " wks"}
              label="Review streak"
            />
            <Gauge
              art={<ReceiptMark stamped={openReceipts === 0} />}
              value={openReceipts}
              label={openReceipts === 1 ? "Open receipt" : "Open receipts"}
            />
            <Gauge art={<BoltMark />} value="150" unit=" xp" label="On transmit" />
          </span>

          <span className="sr-brief__go">
            {filed ? "File it again" : "Enter the room"}
            <ChevronMark />
          </span>
        </span>
      </button>

      {/* ── 2 · THE FRONTS ────────────────────────────────────────── */}
      <MilestoneReviewCards />

      {/* ── 3 · THE STOCKPILE ─────────────────────────────────────── */}
      <button
        type="button"
        className="sr-card sr-stock"
        onClick={() => {
          try {
            window.sessionStorage.setItem("iron_view", "alpha:stockpile");
          } catch {
            /* silent */
          }
          window.dispatchEvent(new Event("mm:open-iron"));
        }}
      >
        <span className="sr-stock__well" aria-hidden="true">
          <CrateMark />
        </span>
        <span className="sr-stock__col">
          <span className="sr-stock__kicker">Sunday's first check</span>
          <span className="sr-stock__title">The Stockpile</span>
          <span className="sr-stock__sub">Raid list, prep guide, fill the fridge.</span>
        </span>
        <span className="sr-stock__chev" aria-hidden="true">
          <ChevronMark />
        </span>
      </button>

      {/* ── 4 · THE ARCHIVE ───────────────────────────────────────── */}
      <ReviewHistory />
    </div>
  );
}
