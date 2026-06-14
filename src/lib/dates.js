export function getTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getCurrentWeekNumber(date = new Date()) {
  const target = new Date(date.valueOf());
  // ISO week: Thursday determines the week's year
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

export function isSunday(date = new Date()) {
  return date.getDay() === 0;
}

export function formatDisplayDate(date = new Date()) {
  const d = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function formatShortDate(date) {
  const d = typeof date === "string" ? new Date(date.length === 10 ? `${date}T12:00:00` : date) : date;
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntilSunday(date = new Date()) {
  return (7 - date.getDay()) % 7;
}

export function daysUntil(targetDateStr, from = new Date()) {
  if (!targetDateStr) return null;
  const target = new Date(`${targetDateStr}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date(getTodayKey(from) + "T12:00:00");
  return Math.round((target - start) / (24 * 60 * 60 * 1000));
}
