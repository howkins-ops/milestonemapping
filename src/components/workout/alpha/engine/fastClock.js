/* ALPHA MODE — the Fast/Eat clock.
   A daily state machine: a fast of N hours followed by an eating
   window. The user sets when their eating window OPENS (e.g. noon);
   everything else is derived. Plus the weekly Refuel (leptin) meter:
   full right after a cheat/refuel event, draining across 7 days. */

export const DEFAULT_WINDOW_OPEN_HOUR = 12; // noon → 8pm on 16/8

/* status at `now` given the window-open hour and phase fasting spec */
export function clockStatus({ openHour = DEFAULT_WINDOW_OPEN_HOUR, fastHours = 16, eatHours = 8, now = new Date() }) {
  const open = new Date(now);
  open.setHours(openHour, 0, 0, 0);
  let close = new Date(open.getTime() + eatHours * 3600000);

  let phase, target;
  if (now >= open && now < close) {
    phase = "eating";
    target = close;
  } else {
    phase = "fasting";
    if (now < open) {
      target = open;
    } else {
      const nextOpen = new Date(open.getTime() + 24 * 3600000);
      target = nextOpen;
    }
  }
  const remainingS = Math.max(0, Math.floor((target - now) / 1000));
  const spanS = (phase === "eating" ? eatHours : fastHours) * 3600;
  return {
    phase, // "fasting" | "eating"
    remainingS,
    progress: Math.max(0, Math.min(1, 1 - remainingS / spanS)),
    windowLabel: `${fmtHour(openHour)}–${fmtHour((openHour + eatHours) % 24)}`,
  };
}

function fmtHour(h) {
  const hr = ((h + 11) % 12) + 1;
  return `${hr}${h < 12 || h === 24 ? "am" : "pm"}`;
}

/* Refuel meter: 100 right after a refuel (cheat day), draining to 0
   over 7 days — the visual case for the next scheduled feast. */
export function refuelMeter(lastRefuelISO, now = new Date()) {
  if (!lastRefuelISO) return 25; // never refueled: low but not empty
  const days = (now - new Date(lastRefuelISO)) / 86400000;
  return Math.max(0, Math.min(100, Math.round(100 - (days / 7) * 100)));
}

/* fasting streak: consecutive days with a completed fast event */
export function fastStreak(fastEventISOs, now = new Date()) {
  const days = new Set(fastEventISOs.map((iso) => new Date(iso).toDateString()));
  let n = 0;
  const d = new Date(now);
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
