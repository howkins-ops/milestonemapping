// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — Progress engine
// Builds one cross-feature ctx from useAppData() slices plus small PURE
// localStorage readers (never mounts other features' stateful hooks), then
// maps the district registry into live { progress, glowState } entries.
// ════════════════════════════════════════════════════════════════════════
import { useMemo } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { getOverallProgress, getRewardsFromMilestones } from "../../lib/progress.js";
import { computeReviewStreak } from "../../lib/utils.js";
import { getTodayKey } from "../../lib/dates.js";
import { QUEST_CHAPTERS } from "../map-quest/questChapters.js";
import { loadForgeState } from "../anger/pressureForgeStore.js";
import { SHIFTS, loadShiftsState } from "../../data/shiftsData.js";
import { DISTRICTS, getGlowState } from "./cityDistricts.js";

/* ── Pure storage readers (try/catch, no writes, no hooks) ─────────────── */

function readJSON(key) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

// Alchemist quest — key "milestone-quest:mode-v1", shape { chapters:{[key]:{complete}} }.
function readQuest() {
  const available = QUEST_CHAPTERS.filter((c) => c.available);
  const total = Math.max(1, available.length);
  const saved = readJSON("milestone-quest:mode-v1");
  const done =
    saved && saved.chapters && typeof saved.chapters === "object" ? saved.chapters : {};
  const ordered = [...available].sort((a, b) => (a.number || 0) - (b.number || 0));
  let completed = 0;
  for (const c of ordered) {
    if (done[c.key] && done[c.key].complete) completed += 1;
  }
  const next = ordered.find((c) => !(done[c.key] && done[c.key].complete));
  return {
    completed,
    total,
    activeChapter: next ? next.number : total,
    activeTitle: next ? next.title : "",
  };
}

// Shadow work — key "shadow_work_v2". Its day keys are NOT zero-padded, so we
// mirror that exact format when checking whether the streak is still alive.
function shadowDayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readShadow() {
  const saved = readJSON("shadow_work_v2");
  const essences = Array.isArray(saved && saved.essences) ? saved.essences.length : 0;
  let streak = 0;
  const s = saved && saved.streak;
  if (s && typeof s === "object" && s.last) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    if (s.last === shadowDayKey() || s.last === shadowDayKey(y)) {
      streak = Math.max(0, Number(s.current) || 0);
    }
  }
  return { essences, streak };
}

// Anger Gym — pure exported reader (rolls its own streak lapse).
function readForge() {
  try {
    const s = loadForgeState() || {};
    return {
      totalForged: Math.max(0, Number(s.totalForged) || 0),
      streak: Math.max(0, Number(s.streak) || 0),
    };
  } catch {
    return { totalForged: 0, streak: 0 };
  }
}

// 5 Shifts training — pure exported reader, shape { completed: [ids] }.
function readShifts() {
  try {
    const s = loadShiftsState() || {};
    const count = Array.isArray(s.completed) ? s.completed.length : 0;
    return { completed: Math.min(count, SHIFTS.length), total: SHIFTS.length };
  } catch {
    return { completed: 0, total: 5 };
  }
}

// Fill Your Cup — key "fill_your_cup", shape { date, pct, streak, ... }.
// pct only counts for today; the streak survives a 1-day gap (house model).
function readCup() {
  const saved = readJSON("fill_your_cup");
  if (!saved || typeof saved !== "object") return { pct: 0, streak: 0, visited: false };
  const today = getTodayKey();
  let pct = 0;
  let streak = 0;
  if (saved.date === today) {
    pct = Math.max(0, Math.min(100, Number(saved.pct) || 0));
    streak = Math.max(0, Number(saved.streak) || 0);
  } else if (saved.date) {
    const diff = Math.round((new Date(today) - new Date(saved.date)) / 86400000);
    streak = diff >= 2 ? 0 : Math.max(0, Number(saved.streak) || 0);
  }
  return { pct, streak, visited: true };
}

// B.L.A.Z.E. — key "blazeRealTrainingOS.v2", shape { done: { [pageId]: bool } }.
function readBlaze() {
  const saved = readJSON("blazeRealTrainingOS.v2");
  if (!saved || typeof saved !== "object") return { done: 0, visited: false };
  const doneMap = saved.done && typeof saved.done === "object" ? saved.done : {};
  const done = Object.values(doneMap).filter(Boolean).length;
  return { done, visited: true };
}

// City store — key "mapquest_city_v1", field visitedDistricts (array or map).
function readVisited() {
  const saved = readJSON("mapquest_city_v1");
  const v = saved && saved.visitedDistricts;
  if (Array.isArray(v)) {
    const map = {};
    for (const id of v) {
      if (typeof id === "string" && id) map[id] = true;
    }
    return map;
  }
  if (v && typeof v === "object") return { ...v };
  return {};
}

/* ── Derivations over app data ─────────────────────────────────────────── */

// Walk dailyLogs backwards from today, counting days with at least one
// completed Top-Five task. An unfinished *today* doesn't break the chain.
function walkDailyStreak(dailyLogs) {
  const logs = dailyLogs && typeof dailyLogs === "object" ? dailyLogs : {};
  const hasWin = (key) => {
    const log = logs[key];
    if (!log) return false;
    if (log.completedTopFive) return true;
    return Array.isArray(log.topFive) && log.topFive.some((t) => t && t.done);
  };
  const d = new Date();
  if (!hasWin(getTodayKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (streak < 730 && hasWin(getTodayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Zone social snapshot → { zone_streak, consistencyPct } (null when offline).
function readZone(social) {
  const online = Boolean(social && social.online !== false && social.member);
  if (!online) return null;
  const member = social.member;
  const zone_streak = Math.max(0, Number(member.zone_streak) || 0);
  const rows = Array.isArray(social.leaderboard)
    ? social.leaderboard
    : Array.isArray(social.board)
      ? social.board
      : [];
  const mine = rows.find(
    (r) =>
      r &&
      ((member.user_id && r.user_id === member.user_id) ||
        r.is_me === true ||
        (member.username && r.username === member.username))
  );
  let consistencyPct = null;
  if (mine && mine.consistency_pct != null && Number.isFinite(Number(mine.consistency_pct))) {
    consistencyPct = Math.max(0, Math.min(100, Number(mine.consistency_pct)));
  }
  return { zone_streak, consistencyPct };
}

/* ── The hook ──────────────────────────────────────────────────────────── */

export default function useCityProgress(social) {
  const {
    projects,
    milestones,
    dailyLogs,
    weeklyReviews,
    visionBoard,
    identity,
    achievements,
    xp,
  } = useAppData();

  return useMemo(() => {
    // Local feature stores (re-read whenever app data or social changes —
    // a city re-render always reflects the latest saved state).
    const quest = readQuest();
    const shadow = readShadow();
    const forge = readForge();
    const shifts = readShifts();
    const cup = readCup();
    const blaze = readBlaze();
    const visited = readVisited();
    const zone = readZone(social);

    // App-data derivations.
    const overallProgress = getOverallProgress(milestones);
    const activeProjectCount = Array.isArray(projects)
      ? projects.filter((p) => p && p.status !== "completed").length
      : 0;
    const todayLog = (dailyLogs && dailyLogs[getTodayKey()]) || null;
    const topFive = Array.isArray(todayLog && todayLog.topFive) ? todayLog.topFive : [];
    const today = {
      done: topFive.filter((t) => t && t.done).length,
      total: topFive.length,
    };
    const reviewStreak = computeReviewStreak(weeklyReviews);
    const allRewards = getRewardsFromMilestones(milestones);
    const rewards = {
      claimed: allRewards.filter((r) => r.status === "claimed").length,
      unlocked: allRewards.filter((r) => r.status !== "locked").length,
      total: allRewards.length,
    };

    const ctx = {
      // raw slices (districts may reach into these directly)
      projects,
      milestones,
      dailyLogs,
      weeklyReviews,
      visionBoard,
      identity,
      achievements,
      xp,
      achievementsCount: Array.isArray(achievements) ? achievements.length : 0,
      // derived
      overallProgress,
      activeProjectCount,
      today,
      dailyStreakLocal: walkDailyStreak(dailyLogs),
      reviewStreak,
      rewards,
      // sibling feature stores
      quest,
      shadow,
      forge,
      shifts,
      cup,
      blaze,
      visited,
      zone,
    };

    const districts = DISTRICTS.map((d) => {
      const progress = d.readProgress(ctx);
      return { ...d, progress, glowState: getGlowState(progress) };
    });

    const sum = districts.reduce((acc, d) => acc + clamp01(d.progress.value), 0);
    const cityPulse = districts.length ? Math.round((sum / districts.length) * 100) : 0;
    const litCount = districts.filter(
      (d) => d.glowState === "lit" || d.glowState === "radiant"
    ).length;
    const radiantCount = districts.filter((d) => d.glowState === "radiant").length;

    return {
      ctx,
      districts,
      cityPulse,
      litCount,
      radiantCount,
      questChapter: quest.activeChapter,
      questTotal: quest.total,
    };
  }, [
    projects,
    milestones,
    dailyLogs,
    weeklyReviews,
    visionBoard,
    identity,
    achievements,
    xp,
    social,
  ]);
}
