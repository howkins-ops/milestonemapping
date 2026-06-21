import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

// Pure function: enforce sequential milestone unlocking across all projects.
// idempotent — calling it on already-normalized data returns the same result.
function normalizeMilestoneStatuses(milestones) {
  if (!Array.isArray(milestones) || milestones.length === 0) return milestones;
  const byProject = {};
  milestones.forEach((m) => {
    if (!m.projectId) return;
    if (!byProject[m.projectId]) byProject[m.projectId] = [];
    byProject[m.projectId].push(m);
  });
  const updates = {};
  Object.values(byProject).forEach((group) => {
    const sorted = [...group].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let foundCurrent = false;
    sorted.forEach((m) => {
      if (m.status === "completed") return;
      if (!foundCurrent) {
        const hasDone = (m.actions || []).some((a) => a.done);
        updates[m.id] = hasDone ? "in_progress" : "active";
        foundCurrent = true;
      } else {
        updates[m.id] = "locked";
      }
    });
  });
  const hasChanges = milestones.some((m) => updates[m.id] !== undefined && updates[m.id] !== m.status);
  if (!hasChanges) return milestones;
  return milestones.map((m) => (updates[m.id] !== undefined ? { ...m, status: updates[m.id] } : m));
}
import { useLocalStorage } from "./useLocalStorage.js";
import { STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_IDENTITY } from "../lib/constants.js";
import { safeRemove } from "../lib/storage.js";
import { uid } from "../lib/id.js";
import { getTodayKey, getCurrentWeekNumber } from "../lib/dates.js";
import { XP_VALUES, getRankFromXP } from "../lib/gamification.js";
import {
  getAchievementById,
  isAchievementUnlocked,
  unlockAchievement as unlockInList
} from "../lib/achievements.js";
import { computeReviewStreak, computeCommitmentStreak } from "../lib/utils.js";
import { validateImportPayload } from "../lib/validators.js";
import { playSound } from "../lib/sounds.js";
import { buildSampleData } from "../lib/sampleData.js";
import { supabase } from "../lib/supabase.js";
import { getProfile, createProfileIfMissing } from "../lib/profileService.js";
import { upsertGratitudeEntry } from "../lib/gratitudeService.js";
import { upsertPriorities } from "../lib/dailyPriorityService.js";
import { createProof } from "../lib/dailyProofService.js";
import { upsertWeeklyReview } from "../lib/weeklyReviewService.js";
import { updateXP, incrementStat, updateStreak, ensureStatsRow } from "../lib/statsService.js";
import { setMemory } from "../lib/memoryService.js";
import { upsertProject, deleteProject as dbDeleteProject } from "../lib/projectService.js";
import { upsertMilestone, completeMilestoneInDB, deleteMilestone as dbDeleteMilestone } from "../lib/milestoneService.js";

const AppDataContext = createContext(null);

function emptyDailyLog(date) {
  return {
    date,
    topFive: [],
    gratitude: { entry1: "", entry2: "", entry3: "" },
    battlePlan: "",
    biggestWin: "",
    lesson: "",
    tomorrowUpgrade: "",
    completedTopFive: false
  };
}

export function AppDataProvider({ children, userId = null, userEmail = null }) {
  const [projects, setProjects] = useLocalStorage(STORAGE_KEYS.projects, []);
  const [milestones, setMilestones] = useLocalStorage(STORAGE_KEYS.milestones, []);
  const [dailyLogs, setDailyLogs] = useLocalStorage(STORAGE_KEYS.dailyLogs, {});
  const [weeklyReviews, setWeeklyReviews] = useLocalStorage(STORAGE_KEYS.weeklyReviews, []);
  const [visionBoard, setVisionBoard] = useLocalStorage(STORAGE_KEYS.visionBoard, []);
  const [identity, setIdentity] = useLocalStorage(STORAGE_KEYS.identity, DEFAULT_IDENTITY);
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const [achievements, setAchievements] = useLocalStorage(STORAGE_KEYS.achievements, []);
  const [xp, setXP] = useLocalStorage(STORAGE_KEYS.xp, 0);

  // Profile loaded from Supabase
  const [profile, setProfile] = useState(null);

  // Sync status for UI feedback
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle'|'saving'|'saved'|'offline'|'error'

  // ── Supabase cloud sync ─────────────────────────────────────────────────────
  const cloudReady = useRef(false);
  const syncTimer = useRef(null);

  // On mount: pull cloud data from blob, then load profile
  useEffect(() => {
    if (!supabase || !userId) {
      cloudReady.current = true;
      return;
    }
    supabase
      .from("user_data")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data: row, error }) => {
        if (error) console.error("Supabase load error:", error);
        if (row?.data) {
          const d = row.data;
          if (Array.isArray(d.projects)) setProjects(d.projects);
          if (Array.isArray(d.milestones)) setMilestones(normalizeMilestoneStatuses(d.milestones));
          if (d.dailyLogs && typeof d.dailyLogs === "object") setDailyLogs(d.dailyLogs);
          if (Array.isArray(d.weeklyReviews)) setWeeklyReviews(d.weeklyReviews);
          if (Array.isArray(d.visionBoard)) setVisionBoard(d.visionBoard);
          if (d.identity) setIdentity({ ...DEFAULT_IDENTITY, ...d.identity });
          if (d.settings) setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
          if (Array.isArray(d.achievements)) setAchievements(d.achievements);
          if (typeof d.xp === "number") setXP(d.xp);
        }
        cloudReady.current = true;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Load profile from normalized profiles table
  useEffect(() => {
    if (!supabase || !userId) return;
    ensureStatsRow(userId);
    getProfile(userId).then(({ data }) => {
      if (data) {
        setProfile(data);
      } else {
        createProfileIfMissing(userId, userEmail).then((created) => {
          if (created) setProfile(created);
        });
      }
    });
  }, [userId, userEmail]);

  // Transient UI state
  const [toasts, setToasts] = useState([]);
  const [celebrations, setCelebrations] = useState([]);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const xpRef = useRef(xp);
  xpRef.current = xp;
  const achievementsRef = useRef(achievements);
  achievementsRef.current = achievements;

  /* ---------------- toasts ---------------- */

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((toast) => {
    const id = uid("toast");
    setToasts((prev) => [...prev.slice(-4), { id, type: "info", ...toast }]);
    return id;
  }, []);

  /* ---------------- celebrations ---------------- */

  const celebrate = useCallback((overlay) => {
    setCelebrations((prev) => [...prev, { id: uid("cel"), ...overlay }]);
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebrations((prev) => prev.slice(1));
  }, []);

  /* ---------------- gamification ---------------- */

  const addXP = useCallback(
    (amount, label = "XP earned") => {
      if (!amount) return;
      const before = Math.max(0, Number(xpRef.current) || 0);
      const after = before + amount;
      xpRef.current = after;
      setXP(after);

      const rankBefore = getRankFromXP(before);
      const rankAfter = getRankFromXP(after);
      if (rankAfter.name !== rankBefore.name) {
        celebrate({
          variant: "rank",
          title: "RANK UPGRADED",
          subtitle: "Your evidence is becoming identity.",
          detail: `${rankBefore.name} → ${rankAfter.name}`
        });
        playSound("levelup", settingsRef.current);
      }
      pushToast({ type: "xp", title: `+${amount} XP`, message: label });

      // Sync XP to user_stats
      if (userId) updateXP(userId, after);
    },
    [setXP, celebrate, pushToast, userId]
  );

  const unlockAchievement = useCallback(
    (id) => {
      const list = Array.isArray(achievementsRef.current) ? achievementsRef.current : [];
      if (isAchievementUnlocked(list, id)) return;
      const def = getAchievementById(id);
      if (!def) return;
      const next = unlockInList(list, id);
      achievementsRef.current = next;
      setAchievements(next);
      pushToast({
        type: "achievement",
        title: `Achievement: ${def.title}`,
        message: def.description,
        icon: def.icon
      });
      playSound("chime", settingsRef.current);
    },
    [setAchievements, pushToast]
  );

  /* ---------------- blob cloud save (debounced) ---------------- */

  useEffect(() => {
    if (!supabase || !userId || !cloudReady.current) return;
    clearTimeout(syncTimer.current);
    setSyncStatus("saving");
    syncTimer.current = setTimeout(async () => {
      const snapshot = {
        app: "milestone_mapping",
        version: 2,
        projects,
        milestones,
        dailyLogs,
        weeklyReviews,
        visionBoard,
        identity,
        settings,
        achievements,
        xp
      };
      const { error } = await supabase
        .from("user_data")
        .upsert({ user_id: userId, data: snapshot, updated_at: new Date().toISOString() });
      if (error) {
        console.error("Supabase save error:", error);
        setSyncStatus("error");
      } else {
        setSyncStatus("saved");
        // Auto-reset to idle after 3s
        setTimeout(() => setSyncStatus("idle"), 3000);
      }
    }, 3000);
    return () => clearTimeout(syncTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, projects, milestones, dailyLogs, weeklyReviews, visionBoard, identity, settings, achievements, xp]);

  // One-time migration: enforce sequential status on existing localStorage data
  const statusMigratedRef = useRef(false);
  useEffect(() => {
    if (statusMigratedRef.current) return;
    if (milestones.length === 0) return;
    statusMigratedRef.current = true;
    const normalized = normalizeMilestoneStatuses(milestones);
    if (normalized !== milestones) setMilestones(normalized);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestones]);

  // One-time migration: milestones without a project get a home
  const migratedRef = useRef(false);
  useEffect(() => {
    if (migratedRef.current) return;
    migratedRef.current = true;
    const orphans = milestones.filter((m) => !m.projectId);
    if (orphans.length === 0) return;
    const home = {
      id: uid("proj"),
      title: "General Missions",
      category: "Personal Growth",
      icon: "🗺️",
      color: "cyan",
      description: "Milestones mapped before projects existed.",
      whyItMatters: "",
      futureVision: "",
      targetDate: "",
      status: "active",
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setProjects((prev) => [...prev, home]);
    setMilestones((prev) => prev.map((m) => (m.projectId ? m : { ...m, projectId: home.id })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- projects ---------------- */

  const createProject = useCallback(
    (data, milestoneTitles = []) => {
      const project = {
        id: uid("proj"),
        title: "",
        category: "Business",
        icon: "🚀",
        color: "cyan",
        description: "",
        whyItMatters: "",
        futureVision: "",
        targetDate: "",
        status: "active",
        createdAt: new Date().toISOString(),
        completedAt: null,
        ...data
      };
      const shells = milestoneTitles
        .map((t) => t.trim())
        .filter(Boolean)
        .map((title, i) => ({
          id: uid("ms"),
          projectId: project.id,
          title,
          category: project.category,
          description: "",
          whyItMatters: "",
          futureVision: "",
          oldIdentity: "",
          newIdentity: "",
          targetDate: "",
          priority: "medium",
          status: i === 0 ? "active" : "locked",
          rewardSmall: "",
          rewardMedium: "",
          rewardLarge: "",
          targetValue: null,
          currentValue: 0,
          unit: "",
          actions: [],
          notes: "",
          createdAt: new Date(Date.now() + i).toISOString(),
          completedAt: null,
          rewardsClaimed: { small: false, medium: false, large: false }
        }));

      const isFirst = projects.length === 0;
      setProjects((prev) => [...prev, project]);
      if (shells.length) setMilestones((prev) => [...prev, ...shells]);
      addXP(XP_VALUES.projectCreated, "Project mapped");
      if (isFirst) unlockAchievement("mission_mapped");
      pushToast({ type: "success", title: "Project mapped", message: "The treasure now has coordinates." });
      playSound("tada", settingsRef.current);

      // Dual-write to normalized table
      if (userId) {
        upsertProject(userId, project);
        shells.forEach((ms) => upsertMilestone(userId, ms));
        incrementStat(userId, "projects_active");
      }
      return project;
    },
    [projects.length, setProjects, setMilestones, addXP, unlockAchievement, pushToast, userId]
  );

  const updateProject = useCallback(
    (id, patch) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      if (userId) {
        const updated = projects.find((p) => p.id === id);
        if (updated) upsertProject(userId, { ...updated, ...patch });
      }
    },
    [setProjects, projects, userId]
  );

  const deleteProject = useCallback(
    (id) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setMilestones((prev) => prev.filter((m) => m.projectId !== id));
      if (userId) dbDeleteProject(userId, id);
    },
    [setProjects, setMilestones, userId]
  );

  /* ---------------- milestones ---------------- */

  const createMilestone = useCallback(
    (data) => {
      const existingForProject = data?.projectId
        ? milestones.filter((m) => m.projectId === data.projectId)
        : [];
      const hasNonLocked = existingForProject.some(
        (m) => m.status === "active" || m.status === "in_progress" || m.status === "completed"
      );
      const milestone = {
        id: uid("ms"),
        title: "",
        category: "Personal Growth",
        description: "",
        whyItMatters: "",
        futureVision: "",
        oldIdentity: "",
        newIdentity: "",
        targetDate: "",
        priority: "medium",
        status: hasNonLocked ? "locked" : "active",
        rewardSmall: "",
        rewardMedium: "",
        rewardLarge: "",
        targetValue: null,
        currentValue: 0,
        unit: "",
        actions: [],
        notes: "",
        createdAt: new Date().toISOString(),
        completedAt: null,
        rewardsClaimed: { small: false, medium: false, large: false },
        ...data
      };
      const isFirst = milestones.length === 0;
      setMilestones((prev) => [...prev, milestone]);
      addXP(XP_VALUES.milestoneCreated, "Milestone mapped");
      if (isFirst) unlockAchievement("mission_mapped");
      pushToast({ type: "success", title: "Milestone mapped", message: "The future now has coordinates." });
      playSound("tada", settingsRef.current);

      if (userId) {
        upsertMilestone(userId, milestone);
        incrementStat(userId, "milestones_created");
      }
      return milestone;
    },
    [milestones.length, setMilestones, addXP, unlockAchievement, pushToast, userId]
  );

  const updateMilestone = useCallback(
    (id, patch) => {
      setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      if (userId) {
        const updated = milestones.find((m) => m.id === id);
        if (updated) upsertMilestone(userId, { ...updated, ...patch });
      }
    },
    [setMilestones, milestones, userId]
  );

  const deleteMilestone = useCallback(
    (id) => {
      setMilestones((prev) => prev.filter((m) => m.id !== id));
      if (userId) dbDeleteMilestone(userId, id);
    },
    [setMilestones, userId]
  );

  // Reorder a project's milestones. Trail display order = array order, but unlock
  // logic (normalizeMilestoneStatuses / completeMilestone) sorts by createdAt — so
  // a reorder must rewrite BOTH the array order and createdAt to stay consistent.
  const reorderProjectMilestones = useCallback(
    (projectId, orderedIds) => {
      if (!projectId || !Array.isArray(orderedIds) || orderedIds.length === 0) return;

      // Strictly-increasing timestamps spaced 1s apart, anchored in the recent
      // past so they read as sensible dates. createdAt drives unlock order.
      const base = Date.now() - orderedIds.length * 1000;
      const stamp = (i) => new Date(base + i * 1000).toISOString();
      const orderMap = new Map(orderedIds.map((id, i) => [id, i]));

      setMilestones((prev) => {
        // Patch this project's milestones with new createdAt / order_index.
        const patched = prev.map((m) => {
          if (m.projectId !== projectId || !orderMap.has(m.id)) return m;
          const i = orderMap.get(m.id);
          return { ...m, createdAt: stamp(i), order_index: i };
        });

        // Physically reorder so trail array order matches orderedIds: emit the
        // whole reordered project block at the first slot it occupied.
        const reordered = patched
          .filter((m) => m.projectId === projectId && orderMap.has(m.id))
          .sort((a, b) => orderMap.get(a.id) - orderMap.get(b.id));

        let emitted = false;
        const out = [];
        for (const m of patched) {
          if (m.projectId === projectId && orderMap.has(m.id)) {
            if (!emitted) {
              out.push(...reordered);
              emitted = true;
            }
          } else {
            out.push(m);
          }
        }
        // Re-derive active/locked from the new order so status dots update live.
        return normalizeMilestoneStatuses(out);
      });

      // Dual-write reordered milestones to Supabase.
      if (userId) {
        milestones
          .filter((m) => m.projectId === projectId && orderMap.has(m.id))
          .forEach((m) => {
            const i = orderMap.get(m.id);
            upsertMilestone(userId, { ...m, createdAt: stamp(i), order_index: i });
          });
      }
    },
    [setMilestones, milestones, userId]
  );

  const completeMilestone = useCallback(
    (id) => {
      const target = milestones.find((m) => m.id === id);
      if (!target || target.status === "completed") return;

      // Find next locked milestone in this project (will be unlocked)
      const projectMilestones = milestones
        .filter((m) => m.projectId === target.projectId && m.id !== id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const nextLocked = projectMilestones.find((m) => m.status === "locked");

      setMilestones((prev) =>
        prev.map((m) => {
          if (m.id === id) return { ...m, status: "completed", completedAt: new Date().toISOString() };
          if (nextLocked && m.id === nextLocked.id) return { ...m, status: "active" };
          return m;
        })
      );

      if (userId && nextLocked) {
        upsertMilestone(userId, { ...nextLocked, status: "active" });
      }
      celebrate({
        variant: "milestone",
        title: "MILESTONE ACHIEVED",
        subtitle: "Reward unlocked. You became the person who follows through.",
        detail: target.title
      });
      addXP(XP_VALUES.milestoneCompleted, "Milestone achieved");
      unlockAchievement("reward_earned");
      playSound("reward", settingsRef.current);

      if (userId) {
        completeMilestoneInDB(userId, id);
        incrementStat(userId, "milestones_completed");
        setMemory(userId, "goal", "recent_wins", [target.title], "milestone_complete");
      }

      // Was that the final milestone? → PROJECT CONQUERED
      const project = projects.find((p) => p.id === target.projectId);
      if (project && project.status !== "completed") {
        const remaining = milestones.filter(
          (m) => m.projectId === project.id && m.id !== id && m.status !== "completed"
        );
        if (remaining.length === 0) {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === project.id
                ? { ...p, status: "completed", completedAt: new Date().toISOString() }
                : p
            )
          );
          celebrate({
            variant: "project",
            title: "PROJECT CONQUERED",
            subtitle: "Every coordinate reached. The treasure is yours.",
            detail: project.title
          });
          addXP(XP_VALUES.projectCompleted, "Project conquered");
          if (userId) {
            incrementStat(userId, "projects_completed");
            upsertProject(userId, { ...project, status: "completed", completedAt: new Date().toISOString() });
          }
        }
      }
    },
    [milestones, projects, setMilestones, setProjects, addXP, unlockAchievement, celebrate, userId]
  );

  /* ---------------- milestone actions ---------------- */

  const addMilestoneAction = useCallback(
    (milestoneId, text, weekNumber = getCurrentWeekNumber()) => {
      const action = {
        id: uid("act"),
        weekNumber,
        text,
        done: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId ? { ...m, actions: [...(m.actions || []), action] } : m
        )
      );
      if (userId) {
        const ms = milestones.find((m) => m.id === milestoneId);
        if (ms) upsertMilestone(userId, { ...ms, actions: [...(ms.actions || []), action] });
      }
      return action;
    },
    [setMilestones, milestones, userId]
  );

  const updateMilestoneAction = useCallback(
    (milestoneId, actionId, patch) => {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? { ...m, actions: (m.actions || []).map((a) => (a.id === actionId ? { ...a, ...patch } : a)) }
            : m
        )
      );
    },
    [setMilestones]
  );

  const deleteMilestoneAction = useCallback(
    (milestoneId, actionId) => {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? { ...m, actions: (m.actions || []).filter((a) => a.id !== actionId) }
            : m
        )
      );
    },
    [setMilestones]
  );

  const toggleMilestoneAction = useCallback(
    (milestoneId, actionId) => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      const action = milestone && (milestone.actions || []).find((a) => a.id === actionId);
      if (!action) return;
      const nowDone = !action.done;
      updateMilestoneAction(milestoneId, actionId, {
        done: nowDone,
        completedAt: nowDone ? new Date().toISOString() : null
      });
      if (nowDone) {
        addXP(XP_VALUES.milestoneActionCompleted, "Action completed");
        unlockAchievement("first_brick");
        playSound("pop", settingsRef.current);
      }
    },
    [milestones, updateMilestoneAction, addXP, unlockAchievement]
  );

  /* ---------------- daily logs ---------------- */

  const getTodayLog = useCallback(() => {
    const key = getTodayKey();
    return dailyLogs[key] || emptyDailyLog(key);
  }, [dailyLogs]);

  const updateTodayLog = useCallback(
    (patch) => {
      const key = getTodayKey();
      setDailyLogs((prev) => ({
        ...prev,
        [key]: { ...emptyDailyLog(key), ...(prev[key] || {}), ...patch }
      }));
    },
    [setDailyLogs]
  );

  const addTopFiveTask = useCallback(
    (text) => {
      const log = getTodayLog();
      if ((log.topFive || []).length >= 5) return;
      updateTodayLog({
        topFive: [...(log.topFive || []), { id: uid("t5"), text, done: false }]
      });
    },
    [getTodayLog, updateTodayLog]
  );

  const updateTopFiveTask = useCallback(
    (taskId, patch) => {
      const log = getTodayLog();
      updateTodayLog({
        topFive: (log.topFive || []).map((t) => (t.id === taskId ? { ...t, ...patch } : t))
      });
    },
    [getTodayLog, updateTodayLog]
  );

  const deleteTopFiveTask = useCallback(
    (taskId) => {
      const log = getTodayLog();
      updateTodayLog({ topFive: (log.topFive || []).filter((t) => t.id !== taskId) });
    },
    [getTodayLog, updateTodayLog]
  );

  const toggleTopFiveTask = useCallback(
    (taskId) => {
      const log = getTodayLog();
      const task = (log.topFive || []).find((t) => t.id === taskId);
      if (!task) return;
      const nowDone = !task.done;
      const nextTopFive = (log.topFive || []).map((t) =>
        t.id === taskId ? { ...t, done: nowDone } : t
      );
      const allFiveDone = nextTopFive.length === 5 && nextTopFive.every((t) => t.done);
      const firstFullClear = allFiveDone && !log.completedTopFive;

      updateTodayLog({
        topFive: nextTopFive,
        completedTopFive: log.completedTopFive || allFiveDone
      });

      // Dual-write to daily_priorities
      if (userId) {
        upsertPriorities(userId, getTodayKey(), nextTopFive);
      }

      if (nowDone) {
        addXP(XP_VALUES.dailyTaskCompleted, "Daily task completed");
        playSound("pop", settingsRef.current);
      }
      if (firstFullClear) {
        celebrate({
          variant: "day",
          title: "DAY CONQUERED",
          subtitle: "You cast five votes for the future version of you."
        });
        addXP(XP_VALUES.fullTopFiveCompleted, "Top 5 conquered");
        unlockAchievement("day_conquered");
        playSound("tada", settingsRef.current);
        if (userId) {
          incrementStat(userId, "priorities_completed");
          updateStreak(userId);
        }
      }
    },
    [getTodayLog, updateTodayLog, addXP, unlockAchievement, celebrate, userId]
  );

  /* ---------------- tomorrow log (night planning) ---------------- */

  const getTomorrowLog = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const key = getTodayKey(d);
    return dailyLogs[key] || emptyDailyLog(key);
  }, [dailyLogs]);

  const updateTomorrowLog = useCallback(
    (patch) => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const key = getTodayKey(d);
      setDailyLogs((prev) => ({
        ...prev,
        [key]: { ...emptyDailyLog(key), ...(prev[key] || {}), ...patch }
      }));
    },
    [setDailyLogs]
  );

  const addTomorrowTopFiveTask = useCallback(
    (text) => {
      const log = getTomorrowLog();
      if ((log.topFive || []).length >= 5) return;
      updateTomorrowLog({
        topFive: [...(log.topFive || []), { id: uid("t5"), text, done: false }]
      });
    },
    [getTomorrowLog, updateTomorrowLog]
  );

  const updateTomorrowTopFiveTask = useCallback(
    (taskId, patch) => {
      const log = getTomorrowLog();
      updateTomorrowLog({
        topFive: (log.topFive || []).map((t) => (t.id === taskId ? { ...t, ...patch } : t))
      });
    },
    [getTomorrowLog, updateTomorrowLog]
  );

  const deleteTomorrowTopFiveTask = useCallback(
    (taskId) => {
      const log = getTomorrowLog();
      updateTomorrowLog({ topFive: (log.topFive || []).filter((t) => t.id !== taskId) });
    },
    [getTomorrowLog, updateTomorrowLog]
  );

  /* ---------------- weekly reviews ---------------- */

  const saveWeeklyReview = useCallback(
    (review) => {
      const lastWeekChecks = Array.isArray(review.lastWeekChecks) ? review.lastWeekChecks : [];
      const commitments = Array.isArray(review.commitments) ? review.commitments : [];
      const keptCount = lastWeekChecks.filter((c) => c.done).length;
      const commitmentScore = lastWeekChecks.length > 0 ? keptCount / lastWeekChecks.length : null;

      // Compute week_start (Monday of current week)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      const weekStart = monday.toISOString().slice(0, 10);

      const entry = {
        id: uid("wr"),
        date: getTodayKey(),
        weekNumber: getCurrentWeekNumber(),
        week_start: weekStart,
        ...review,
        commitments,
        lastWeekChecks,
        commitmentScore
      };

      const nextReviews = [entry, ...weeklyReviews];
      setWeeklyReviews(nextReviews);

      addXP(XP_VALUES.weeklyReviewCompleted, "Weekly review completed");
      unlockAchievement("sunday_strategist");

      if (keptCount > 0) {
        addXP(keptCount * XP_VALUES.commitmentKept, `${keptCount} commitment${keptCount > 1 ? "s" : ""} kept`);
        unlockAchievement("accountability_first_win");
      }
      if (commitmentScore === 1 && lastWeekChecks.length > 0) {
        addXP(XP_VALUES.allCommitmentsKept, "All commitments kept");
        unlockAchievement("accountability_perfect");
      }

      const reviewStreak = computeReviewStreak(nextReviews);
      if (reviewStreak >= 4) {
        addXP(XP_VALUES.reviewStreak4, "4-week review streak");
        unlockAchievement("review_streak_4");
      }
      const commitmentStreak = computeCommitmentStreak(nextReviews);
      if (commitmentStreak >= 3) {
        unlockAchievement("accountability_streak_3");
      }

      celebrate({ variant: "review", title: "REVIEW COMPLETE", subtitle: "Receipts logged. Next week has coordinates." });
      playSound("chime", settingsRef.current);

      // Dual-write to normalized table
      if (userId) {
        const reviewPayload = {
          week_end: getTodayKey(),
          week_number: entry.weekNumber,
          wins: Array.isArray(review.wins) ? review.wins : [review.biggestWin ?? ""].filter(Boolean),
          lessons: Array.isArray(review.lessons) ? review.lessons : [review.lesson ?? ""].filter(Boolean),
          stuck_points: Array.isArray(review.stuckPoints)
            ? review.stuckPoints
            : [review.avoided ?? review.stuckPoints ?? ""].filter(Boolean),
          next_week_actions: commitments.length > 0 ? commitments : [review.nextWeekActions ?? ""].filter(Boolean),
          commitments,
          last_week_checks: lastWeekChecks,
          score: review.overallScore ?? null,
          reflection: review.notes ?? review.fieldNotes ?? "",
          commitment_score: commitmentScore,
          scores: {
            execution: review.executionScore,
            energy: review.energyScore,
            focus: review.focusScore,
            discipline: review.disciplineScore,
            mindset: review.mindsetScore,
          },
        };
        upsertWeeklyReview(userId, weekStart, reviewPayload);
        incrementStat(userId, "weekly_reviews_completed");
        if (Array.isArray(review.stuckPoints) && review.stuckPoints.length > 0) {
          setMemory(userId, "pattern", "common_stuck_points", review.stuckPoints, "weekly_review");
        }
      }

      return entry;
    },
    [weeklyReviews, setWeeklyReviews, addXP, unlockAchievement, celebrate, userId]
  );

  /* ---------------- rewards ---------------- */

  const claimReward = useCallback(
    (milestoneId, tier) => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) return;
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId
            ? { ...m, rewardsClaimed: { ...(m.rewardsClaimed || {}), [tier]: true } }
            : m
        )
      );
      celebrate({
        variant: "reward",
        title: "REWARD CLAIMED",
        subtitle: "Discipline paid you back.",
        detail: milestone[`reward${tier.charAt(0).toUpperCase()}${tier.slice(1)}`] || ""
      });
      addXP(XP_VALUES.rewardClaimed, "Reward claimed");
      unlockAchievement("reward_earned");
      playSound("reward", settingsRef.current);
      if (userId) incrementStat(userId, "rewards_unlocked");
    },
    [milestones, setMilestones, addXP, unlockAchievement, celebrate, userId]
  );

  /* ---------------- reward images ---------------- */

  const saveRewardImage = useCallback(
    (milestoneId, tier, imageUrl) => {
      const key = `reward${tier.charAt(0).toUpperCase()}${tier.slice(1)}Image`;
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, [key]: imageUrl } : m))
      );
    },
    [setMilestones]
  );

  /* ---------------- daily proof (new feature) ---------------- */

  const saveDailyProof = useCallback(
    async (data) => {
      if (userId) {
        await createProof(userId, { ...data, xp_earned: data.xp_earned ?? 25 });
        incrementStat(userId, "daily_proof_count");
      }
      addXP(data.xp_earned ?? 25, "Daily proof logged");
      pushToast({ type: "success", title: "Proof logged.", message: "Evidence stacks up." });
      playSound("pop", settingsRef.current);
    },
    [userId, addXP, pushToast]
  );

  /* ---------------- vision board ---------------- */

  const addVisionBoardItem = useCallback(
    (item) => {
      const entry = {
        id: uid("vb"),
        imageUrl: "",
        title: "",
        caption: "",
        category: "Dream Life",
        createdAt: new Date().toISOString(),
        ...item
      };
      setVisionBoard((prev) => [entry, ...prev]);
      addXP(XP_VALUES.visionBoardItemAdded, "Vision locked in");
      return entry;
    },
    [setVisionBoard, addXP]
  );

  const deleteVisionBoardItem = useCallback(
    (id) => setVisionBoard((prev) => prev.filter((v) => v.id !== id)),
    [setVisionBoard]
  );

  const updateVisionBoardItem = useCallback(
    (id, patch) => setVisionBoard((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v))),
    [setVisionBoard]
  );

  const attachVisionToProject = useCallback(
    (visionId, projectId) => {
      setVisionBoard((prev) =>
        prev.map((v) =>
          v.id === visionId
            ? { ...v, projectIds: [...new Set([...(v.projectIds || []), projectId])] }
            : v
        )
      );
    },
    [setVisionBoard]
  );

  const detachVisionFromProject = useCallback(
    (visionId, projectId) => {
      setVisionBoard((prev) =>
        prev.map((v) =>
          v.id === visionId
            ? { ...v, projectIds: (v.projectIds || []).filter((pid) => pid !== projectId) }
            : v
        )
      );
    },
    [setVisionBoard]
  );

  /* ---------------- identity ---------------- */

  const updateIdentity = useCallback(
    (patch) => {
      setIdentity((prev) => ({ ...DEFAULT_IDENTITY, ...prev, ...patch }));
      const next = { ...identity, ...patch };
      if (next.futureIdentity || next.powerStatement) {
        unlockAchievement("identity_shift");
      }
      if (userId && next.essenceWords) {
        setMemory(userId, "identity", "essence_words", next.essenceWords, "identity_update");
      }
    },
    [setIdentity, identity, unlockAchievement, userId]
  );

  const addIdentityRule = useCallback(
    (text) => {
      setIdentity((prev) => ({
        ...DEFAULT_IDENTITY,
        ...prev,
        rules: [...((prev && prev.rules) || []), { id: uid("rule"), text }]
      }));
      addXP(XP_VALUES.identityRuleAdded, "Identity rule added");
    },
    [setIdentity, addXP]
  );

  const deleteIdentityRule = useCallback(
    (ruleId) => {
      setIdentity((prev) => ({
        ...DEFAULT_IDENTITY,
        ...prev,
        rules: ((prev && prev.rules) || []).filter((r) => r.id !== ruleId)
      }));
    },
    [setIdentity]
  );

  /* ---------------- settings + data ---------------- */

  const updateSettings = useCallback(
    (patch) => setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch })),
    [setSettings]
  );

  const exportData = useCallback(() => ({
    app: "milestone_mapping",
    version: 2,
    exportedAt: new Date().toISOString(),
    projects, milestones, dailyLogs, weeklyReviews, visionBoard, identity, settings, achievements, xp
  }), [projects, milestones, dailyLogs, weeklyReviews, visionBoard, identity, settings, achievements, xp]);

  const importData = useCallback(
    (data) => {
      const result = validateImportPayload(data);
      if (!result.valid) {
        pushToast({ type: "error", title: "Import failed", message: result.error });
        return false;
      }
      setProjects(data.projects || []);
      setMilestones(data.milestones || []);
      setDailyLogs(data.dailyLogs || {});
      setWeeklyReviews(data.weeklyReviews || []);
      setVisionBoard(data.visionBoard || []);
      setIdentity({ ...DEFAULT_IDENTITY, ...(data.identity || {}) });
      setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || {}) });
      setAchievements(data.achievements || []);
      setXP(Number(data.xp) || 0);
      pushToast({ type: "success", title: "Backup restored", message: "Mission data is back online." });
      return true;
    },
    [setProjects, setMilestones, setDailyLogs, setWeeklyReviews, setVisionBoard,
     setIdentity, setSettings, setAchievements, setXP, pushToast]
  );

  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => safeRemove(key));
    setProjects([]); setMilestones([]); setDailyLogs({}); setWeeklyReviews([]);
    setVisionBoard([]); setIdentity(DEFAULT_IDENTITY); setSettings(DEFAULT_SETTINGS);
    setAchievements([]); setXP(0);
    pushToast({ type: "warning", title: "Data cleared", message: "Fresh map. New mission." });
  }, [setProjects, setMilestones, setDailyLogs, setWeeklyReviews, setVisionBoard,
      setIdentity, setSettings, setAchievements, setXP, pushToast]);

  const loadSampleData = useCallback(() => {
    const sample = buildSampleData();
    setProjects((prev) => [...prev, ...sample.projects]);
    setMilestones((prev) => [...prev, ...sample.milestones]);
    pushToast({ type: "success", title: "Example mission map loaded", message: "Two starter projects are on the world map." });
  }, [setProjects, setMilestones, pushToast]);

  const value = useMemo(
    () => ({
      // identity
      userId,
      userEmail,
      profile,
      setProfile,
      syncStatus,

      // data
      projects, milestones, dailyLogs, weeklyReviews, visionBoard,
      identity, settings, achievements, xp,
      toasts, celebrations,

      // project CRUD
      createProject, updateProject, deleteProject,

      // milestone CRUD
      createMilestone, updateMilestone, deleteMilestone, completeMilestone, reorderProjectMilestones,

      // milestone actions
      addMilestoneAction, updateMilestoneAction, deleteMilestoneAction, toggleMilestoneAction,

      // daily log
      getTodayLog, updateTodayLog,
      addTopFiveTask, updateTopFiveTask, deleteTopFiveTask, toggleTopFiveTask,

      // tomorrow log
      getTomorrowLog, updateTomorrowLog,
      addTomorrowTopFiveTask, updateTomorrowTopFiveTask, deleteTomorrowTopFiveTask,

      // weekly review
      saveWeeklyReview,

      // rewards
      claimReward, saveRewardImage,

      // daily proof
      saveDailyProof,

      // vision board
      addVisionBoardItem, deleteVisionBoardItem, updateVisionBoardItem,
      attachVisionToProject, detachVisionFromProject,

      // identity
      updateIdentity, addIdentityRule, deleteIdentityRule,

      // settings + data ops
      updateSettings, exportData, importData, clearAllData, loadSampleData,

      // gamification
      addXP, unlockAchievement,

      // UI
      pushToast, dismissToast, celebrate, dismissCelebration,
    }),
    [
      userId, userEmail, profile, syncStatus,
      projects, milestones, dailyLogs, weeklyReviews, visionBoard,
      identity, settings, achievements, xp, toasts, celebrations,
      createProject, updateProject, deleteProject,
      createMilestone, updateMilestone, deleteMilestone, completeMilestone, reorderProjectMilestones,
      addMilestoneAction, updateMilestoneAction, deleteMilestoneAction, toggleMilestoneAction,
      getTodayLog, updateTodayLog,
      addTopFiveTask, updateTopFiveTask, deleteTopFiveTask, toggleTopFiveTask,
      getTomorrowLog, updateTomorrowLog,
      addTomorrowTopFiveTask, updateTomorrowTopFiveTask, deleteTomorrowTopFiveTask,
      saveWeeklyReview, claimReward, saveRewardImage, saveDailyProof,
      addVisionBoardItem, deleteVisionBoardItem, updateVisionBoardItem,
      attachVisionToProject, detachVisionFromProject,
      updateIdentity, addIdentityRule, deleteIdentityRule,
      updateSettings, exportData, importData, clearAllData, loadSampleData,
      addXP, unlockAchievement,
      pushToast, dismissToast, celebrate, dismissCelebration,
    ]
  );

  return React.createElement(AppDataContext.Provider, { value }, children);
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}
