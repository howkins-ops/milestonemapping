import { useEffect, useState } from "react";
import { loadClearDay, subscribeClearDay, dayNumber } from "./clearDayStore.js";

/* Read-only CLEARDAY status for chrome outside the overlay (topbar,
   dashboard). loadClearDay() returns a fresh object per call, so this
   mirrors ClearDay's subscribe + setState pattern instead of
   useSyncExternalStore. */

function readStatus() {
  const S = loadClearDay();
  const day = dayNumber(S);
  const ritualOpen = Boolean(S.onboarded) && !S.closedDays[day];
  // Evening-aware pulse: the breathing "due" cue only starts at dusk (7pm) —
  // the app is evening-used and both tracks are night-cued (research §4/§5).
  // An all-day pulse is noise; a dusk pulse is a signal.
  const hour = new Date().getHours();
  return {
    onboarded: Boolean(S.onboarded),
    day,
    votes: S.votes,
    closedClear: S.closedDays[day] === "clear",
    ritualOpen: ritualOpen && (hour >= 19 || hour < 4),
  };
}

export default function useClearDayStatus() {
  const [status, setStatus] = useState(readStatus);
  useEffect(() => subscribeClearDay(() => setStatus(readStatus())), []);
  return status;
}
