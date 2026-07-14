import React from "react";
import ClearDaySun from "../clearday/ClearDaySun.jsx";
import useClearDayStatus from "../clearday/useClearDayStatus.js";
import { PROGRAM_DAYS } from "../clearday/clearDayStore.js";

/* Dashboard status card for CLEARDAY — renders only once the Claim is
   made. Opens the mode via the same global event the urge-SOS entry
   points use (App.jsx listens for "mm:open-clearday"), so no prop
   plumbing through CommandCenter. Styles live in globals.css (.cdd-*)
   because this renders before the lazy CLEARDAY chunk loads. */

export default function ClearDayStatusCard() {
  const cd = useClearDayStatus();
  if (!cd.onboarded) return null;

  return (
    <button
      type="button"
      className="cdd-card"
      onClick={() => window.dispatchEvent(new Event("mm:open-clearday"))}
    >
      <span className="cdd-sun" aria-hidden="true">
        <ClearDaySun variant="emblem" />
      </span>
      <span className="cdd-copy">
        <span className="cdd-title">CLEARDAY — DAY {cd.day} OF {PROGRAM_DAYS}</span>
        <span className="cdd-sub">{cd.votes} votes on the ballot · none of them expire</span>
        <span className={`cdd-status ${cd.ritualOpen ? "cdd-status--open" : "cdd-status--done"}`}>
          {cd.ritualOpen ? "today's ritual is open" : cd.closedClear ? "day closed clear ✓" : "day logged honestly"}
        </span>
      </span>
      <span className="cdd-arrow" aria-hidden="true">→</span>
    </button>
  );
}
