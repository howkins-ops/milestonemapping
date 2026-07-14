import { useEffect, useState } from "react";
import { loadClearDay, subscribeClearDay, dayNumber } from "./clearDayStore.js";

/* Read-only CLEARDAY status for chrome outside the overlay (topbar,
   dashboard). loadClearDay() returns a fresh object per call, so this
   mirrors ClearDay's subscribe + setState pattern instead of
   useSyncExternalStore. */

function readStatus() {
  const S = loadClearDay();
  const day = dayNumber(S);
  return {
    onboarded: Boolean(S.onboarded),
    day,
    votes: S.votes,
    closedClear: S.closedDays[day] === "clear",
    ritualOpen: Boolean(S.onboarded) && !S.closedDays[day],
  };
}

export default function useClearDayStatus() {
  const [status, setStatus] = useState(readStatus);
  useEffect(() => subscribeClearDay(() => setStatus(readStatus())), []);
  return status;
}
