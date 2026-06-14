import { useMemo } from "react";
import { useAppData } from "./useAppData.js";
import { getTodayKey } from "../lib/dates.js";

export function computeStreaks(dailyLogs) {
  const conqueredDays = Object.keys(dailyLogs || {})
    .filter((d) => dailyLogs[d] && dailyLogs[d].completedTopFive)
    .sort();

  if (conqueredDays.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < conqueredDays.length; i++) {
    const prev = new Date(`${conqueredDays[i - 1]}T12:00:00`);
    const cur = new Date(`${conqueredDays[i]}T12:00:00`);
    const gap = Math.round((cur - prev) / 86400000);
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const daySet = new Set(conqueredDays);
  let current = 0;
  const cursor = new Date();
  if (!daySet.has(getTodayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (daySet.has(getTodayKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest };
}

export function useDailyLog() {
  const {
    dailyLogs,
    getTodayLog,
    updateTodayLog,
    addTopFiveTask,
    updateTopFiveTask,
    deleteTopFiveTask,
    toggleTopFiveTask,
    getTomorrowLog,
    updateTomorrowLog,
    addTomorrowTopFiveTask,
    updateTomorrowTopFiveTask,
    deleteTomorrowTopFiveTask
  } = useAppData();

  const todayLog = getTodayLog();
  const tomorrowLog = getTomorrowLog();
  const streaks = useMemo(() => computeStreaks(dailyLogs), [dailyLogs]);
  const doneCount = (todayLog.topFive || []).filter((t) => t.done).length;

  return {
    dailyLogs,
    todayLog,
    tomorrowLog,
    doneCount,
    streaks,
    updateTodayLog,
    addTopFiveTask,
    updateTopFiveTask,
    deleteTopFiveTask,
    toggleTopFiveTask,
    updateTomorrowLog,
    addTomorrowTopFiveTask,
    updateTomorrowTopFiveTask,
    deleteTomorrowTopFiveTask
  };
}
