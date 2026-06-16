import React, { useState, useEffect, useCallback, useRef } from "react";

/* =============================================================================
   MILESTONE QUEST — v2  (Phase 6 + 7 + 8)
   Phase 6: ADHD-paradise dopamine layer — walkable top-down LEVEL ROOM where a
            leveling avatar (with aura/gear) walks to action stations; combos,
            confetti, screen pulses, floating loot, sound + haptic hooks.
   Phase 7: assetRegistry with CSS/emoji fallbacks (never breaks on missing art).
   Phase 8: multi-project WORLDS — each goal is its own world+map, switchable,
            completed worlds archived. (Phase 9 Supabase intentionally skipped.)
   Core-loop rule unchanged: only measurable progress defeats a milestone.
   ============================================================================= */

/* ===== data/gameConfig.js ================================================== */
const C = { bg: "#05030a", card: "#0b0712", cardDeep: "#080510", phoenix: "#7B2CFF", magenta: "#D11EFF", hotPink: "#FF3EDB", cyan: "#00F0FF", mint: "#00FFBF", gold: "#FFC94D", text: "#F2F0F4", textDim: "#9a8fb0", locked: "#3a3450" };
const XP = { formulaStep: 20, formulaGate: 100, action: 40, proofLog: 35, milestone: 250, finalGoal: 1000 };
const CR = { action: 8, proofLog: 10, milestone: 75, finalGoal: 500, claimBonus: 25 };
const levelFromXP = (xp) => Math.floor(xp / 500) + 1;
const xpIntoLevel = (xp) => xp % 500;
const REWARD_COLOR = { small: C.cyan, medium: C.phoenix, large: C.hotPink, legendary: C.gold };

/* ===== data/assetRegistry.js — fallbacks so nothing ever breaks =========== */
const ASSET = {
  node: { locked: "🔒", active: "🔥", complete: "✦", final: "👑" },
  chest: { small: "🎁", medium: "💎", large: "🏆", legendary: "🌟" },
  station: { focused: "🎯", proof: "📈", ritual: "🌅", review: "🗓️", default: "⭐" },
  // avatar tiers unlock with player level — visible progression
  avatarTier: ["🧍", "🚶", "🏃", "🦸", "🧙", "🐉"],
  auraByLevel: (lvl) => [C.textDim, C.cyan, C.mint, C.hotPink, C.magenta, C.gold][Math.min(5, Math.floor((lvl - 1) / 2))],
};
const avatarFor = (lvl) => ASSET.avatarTier[Math.min(ASSET.avatarTier.length - 1, Math.floor((lvl - 1) / 2))];

/* ===== data/poetry.js ====================================================== */
const INTRO_LINES = ["Most people drift.", "They wish. They wait. They watch the days spend themselves.", "You're not here for that.", "You're here to build the map —", "and then walk every inch of it."];
const STEP_POETRY = {
  specificIntentions: { kicker: "NAME IT", line: "A goal you can't measure is just a mood. Make it sharp enough to bleed." },
  futureVision: { kicker: "SEE IT", line: "Write the ending first. Then spend your life catching up to it." },
  strengthsSkills: { kicker: "ARM UP", line: "You already carry weapons. Count them before the climb." },
  resources: { kicker: "GATHER", line: "No one summits alone. Name your people, your tools, your fuel." },
  rewardCategories: { kicker: "EARN IT", line: "Reward isn't bribery. It's proof you kept your word to yourself." },
  milestones: { kicker: "BREAK IT", line: "A mountain is just steps you haven't named yet. Name them backward." },
  focusedActions: { kicker: "MOVE", line: "Vision without motion is decoration. What do you do tomorrow?" },
  milestoneRewards: { kicker: "SEAL IT", line: "Lock a prize behind every level. Make the climb worth the climbing." },
};
const UNLOCK_LINES = ["The formula is forged.", "The map is alive.", "Now — walk it."];

/* ===== data/formulaSteps.js ================================================ */
const STEPS = [
  { key: "specificIntentions", title: "Set Specific Intentions", prompt: "Name the goal that becomes your world.", fields: [
    { name: "goalName", label: "Goal name", placeholder: "Sell 200 accounts", required: true },
    { name: "objective", label: "Objective", placeholder: "Why this goal, in one line", required: true },
    { name: "measure", label: "How you'll measure it", placeholder: "Accounts sold", required: true },
    { name: "deadline", label: "Deadline", type: "date", required: true },
    { name: "iWillStatement", label: "Your \"I will...\" statement", placeholder: "I will...", type: "textarea", required: true }] },
  { key: "futureVision", title: "Create a Clear Future Vision", prompt: "Write it as if already achieved.", fields: [
    { name: "description", label: "What life looks like now it's done", type: "textarea", required: true },
    { name: "emotions", label: "What you feel" }, { name: "identity", label: "Who you've become" },
    { name: "environment", label: "What's changed around you" }, { name: "peopleSay", label: "What others say about you" }] },
  { key: "strengthsSkills", title: "Tap Into Strengths + Skills", prompt: "List the weapons you already carry.", list: true, listLabel: "Strength, skill, trait, win", minItems: 1 },
  { key: "resources", title: "Utilize Resources Around You", prompt: "People, tools, mentors, money, assets.", list: true, listLabel: "Resource", minItems: 1 },
  { key: "rewardCategories", title: "Integrate the Power of Rewards", prompt: "What you'll earn as you climb.", fields: [
    { name: "small", label: "Small reward", placeholder: "First milestone", required: true },
    { name: "medium", label: "Medium reward", placeholder: "Halfway", required: true },
    { name: "large", label: "Large reward", placeholder: "Final goal", required: true }] },
  { key: "milestones", title: "Reverse-Engineer the Timeline", prompt: "Break the final goal backward into levels.", milestoneBuilder: true, minItems: 1 },
  { key: "focusedActions", title: "Take Focused Action", prompt: "What moves the first milestone?", list: true, listLabel: "Focused action", minItems: 1 },
  { key: "milestoneRewards", title: "Attach Rewards to Milestones", prompt: "Lock a reward behind each level.", attachRewards: true },
];

/* ===== data/templates.js — one-tap quick starts =========================== */
const TEMPLATES = [
  { id: "sales", emoji: "💼", name: "Sales Goal", unit: "accounts",
    intent: { goalName: "Sell 200 Accounts", objective: "Build a self-sustaining book of business", measure: "Accounts sold", iWillStatement: "I will sell 200 accounts this year." },
    vision: "I run a thriving book of business with steady referrals and real freedom.",
    strengths: ["Grit", "Fast rapport", "Follow-up discipline"], resources: ["Mentor", "CRM", "Referral network"],
    rewards: { small: "Nice dinner", medium: "Weekend trip", large: "New watch" },
    actions: ["Knock 20 doors", "Send 10 follow-ups", "Morning ritual", "Log proof"],
    levels: [{ title: "First 25", target: 25, reward: "Nice dinner", cat: "small", diff: "easy" }, { title: "Hit 50", target: 50, reward: "New gear", cat: "medium", diff: "medium" }, { title: "Cross 120", target: 120, reward: "Weekend trip", cat: "large", diff: "hard" }, { title: "Finish 200", target: 200, reward: "The watch", cat: "legendary", diff: "legendary" }] },
  { id: "fitness", emoji: "💪", name: "Get Fit", unit: "workouts",
    intent: { goalName: "100 Workouts", objective: "Become strong, lean, and consistent", measure: "Workouts completed", iWillStatement: "I will train 100 times." },
    vision: "I'm strong, energized, and proud of my discipline every single day.",
    strengths: ["Discipline", "Competitive streak"], resources: ["Gym", "Trainer", "Meal plan"],
    rewards: { small: "New shoes", medium: "Massage", large: "Beach trip" },
    actions: ["Train today", "Hit protein", "10k steps", "Sleep 8h"],
    levels: [{ title: "First 10", target: 10, reward: "New shoes", cat: "small", diff: "easy" }, { title: "Reach 40", target: 40, reward: "Massage", cat: "medium", diff: "medium" }, { title: "Reach 75", target: 75, reward: "New fit", cat: "large", diff: "hard" }, { title: "Finish 100", target: 100, reward: "Beach trip", cat: "legendary", diff: "legendary" }] },
  { id: "launch", emoji: "🚀", name: "Ship a Project", unit: "tasks",
    intent: { goalName: "Launch the App", objective: "Ship to the App Store", measure: "Build tasks done", iWillStatement: "I will launch my app." },
    vision: "My app is live, users are signing up, and I built it with my own hands.",
    strengths: ["Builder energy", "Fast learner"], resources: ["Codebase", "Designer", "Beta testers"],
    rewards: { small: "Fancy coffee", medium: "New gear", large: "Launch party" },
    actions: ["Ship one feature", "Fix a bug", "Talk to a user", "Post an update"],
    levels: [{ title: "MVP — 15 tasks", target: 15, reward: "Fancy coffee", cat: "small", diff: "easy" }, { title: "Beta — 40 tasks", target: 40, reward: "New gear", cat: "medium", diff: "medium" }, { title: "Polish — 70 tasks", target: 70, reward: "Day off", cat: "large", diff: "hard" }, { title: "Launch — 90 tasks", target: 90, reward: "Launch party", cat: "legendary", diff: "legendary" }] },
];

/* ===== sound + haptic hooks (graceful, opt-out via mute) ================== */
const Sound = {
  ctx: null, muted: false,
  ping(freq = 660, dur = 0.08, type = "triangle", gain = 0.05) {
    if (this.muted) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = freq; o.connect(g); g.connect(this.ctx.destination);
      g.gain.setValueAtTime(gain, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      o.start(); o.stop(this.ctx.currentTime + dur);
    } catch {}
  },
  chord(freqs, dur = 0.18) { freqs.forEach((f, i) => setTimeout(() => this.ping(f, dur, "sine", 0.045), i * 55)); },
};
function haptic(ms = 12) { try { navigator.vibrate && navigator.vibrate(ms); } catch {} }

/* ===== hooks/useLocalGameSave.js — Phase 8 multi-world ==================== */
const SAVE_KEY = "milestone-quest:v5";
const blankFormula = () => ({ completed: false, currentStep: 0,
  specificIntentions: { goalName: "", objective: "", measure: "", deadline: "", iWillStatement: "" },
  futureVision: { description: "", emotions: "", identity: "", environment: "", peopleSay: "" },
  strengthsSkills: [], resources: [], rewardCategories: { small: "", medium: "", large: "" },
  milestones: [], focusedActions: [], milestoneRewards: [] });
const blankWorld = () => ({ id: uid("world"), formula: blankFormula(),
  game: { unlocked: false, activeMilestoneId: null, completedMilestoneIds: [], unlockedRewardIds: [], claimedRewardIds: [], proofLogs: [], finalGoalComplete: false } });
const blankState = () => ({ userProfile: { name: "", avatar: "🔥" }, seenIntro: false, muted: false,
  // global player progression spans all worlds
  player: { xp: 0, crystals: 0, level: 1, streak: 0, lastQuestDay: null, combo: 0, lastActionTs: 0 },
  worlds: [blankWorld()], activeWorldId: null });
function migrate(s) {
  const base = blankState();
  const merged = { ...base, ...s, player: { ...base.player, ...(s.player || {}) } };
  if (!merged.worlds || !merged.worlds.length) merged.worlds = [blankWorld()];
  if (!merged.activeWorldId) merged.activeWorldId = merged.worlds[0].id;
  return merged;
}
function loadSave() { try { const r = localStorage.getItem(SAVE_KEY); if (!r) { const b = blankState(); b.activeWorldId = b.worlds[0].id; return b; } return migrate(JSON.parse(r)); } catch { const b = blankState(); b.activeWorldId = b.worlds[0].id; return b; } }
function persist(s) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch {} }

/* ===== hooks/useMilestoneGame.js — engine ================================= */
function useMilestoneGame() {
  const [state, setState] = useState(loadSave);
  const [fx, setFx] = useState(null);
  const [loot, setLoot] = useState(null);
  const [chestFx, setChestFx] = useState(null);
  const [burst, setBurst] = useState(null);   // {x,y,color} confetti origin
  const [levelUp, setLevelUp] = useState(null); // player level-up flash
  useEffect(() => persist(state), [state]);
  useEffect(() => { Sound.muted = state.muted; }, [state.muted]);
  const update = useCallback((fn) => setState((s) => fn(clone(s))), []);

  const world = () => state.worlds.find((w) => w.id === state.activeWorldId) || state.worlds[0];
  const withWorld = (s, fn) => { const w = s.worlds.find((x) => x.id === s.activeWorldId) || s.worlds[0]; fn(w, s); return s; };

  const setSeenIntro = useCallback(() => update((s) => { s.seenIntro = true; return s; }), [update]);
  const toggleMute = useCallback(() => update((s) => { s.muted = !s.muted; return s; }), [update]);

  const setField = useCallback((k, f, v) => update((s) => withWorld(s, (w) => { if (f == null) w.formula[k] = v; else w.formula[k][f] = v; })), [update]);
  const setStep = useCallback((i) => update((s) => withWorld(s, (w) => { w.formula.currentStep = i; })), [update]);
  const addMilestone = useCallback((m) => update((s) => withWorld(s, (w) => { w.formula.milestones.push({ id: uid("ms"), title: m.title || "Untitled", description: "", targetValue: +m.targetValue || 0, currentValue: 0, unit: m.unit || "", deadline: m.deadline || "", rewardId: null, rewardTitle: "", rewardCategory: m.difficulty === "legendary" ? "legendary" : "small", difficulty: m.difficulty || "medium", status: "locked", actions: [], proofLogs: [], createdAt: nowISO(), completedAt: null }); })), [update]);
  const removeMilestone = useCallback((id) => update((s) => withWorld(s, (w) => { w.formula.milestones = w.formula.milestones.filter((m) => m.id !== id); })), [update]);
  const attachReward = useCallback((id, title, cat) => update((s) => withWorld(s, (w) => { const m = w.formula.milestones.find((x) => x.id === id); if (m) { m.rewardTitle = title; m.rewardCategory = cat; } })), [update]);

  const grantXP = (s, xp, cr) => { const before = s.player.level; s.player.xp += xp; s.player.crystals += cr; s.player.level = levelFromXP(s.player.xp); if (s.player.level > before) { setLevelUp({ level: s.player.level, id: Math.random() }); Sound.chord([523, 659, 784, 1046]); haptic(30); } };

  const unlockJourney = useCallback(() => update((s) => withWorld(s, (w) => {
    const ms = w.formula.milestones.map((m, i) => ({ ...m, status: i === 0 ? "active" : "locked", rewardId: uid("rw"), actions: w.formula.focusedActions.map((a) => ({ id: uid("ac"), label: a, doneToday: null })) }));
    w.formula.milestones = ms; w.formula.completed = true;
    w.formula.milestoneRewards = ms.map((m) => ({ id: m.rewardId, title: m.rewardTitle || `${cap(m.rewardCategory)} reward`, description: m.title, category: m.rewardCategory, linkedMilestoneId: m.id, status: "locked", unlockedAt: null, claimedAt: null }));
    w.game.unlocked = true; w.game.activeMilestoneId = ms[0]?.id || null; grantXP(s, XP.formulaGate, 0);
  })), [update]);

  // ACTION at a station — combo system + loot + burst at given screen coords. Optionally nudges the bar.
  const doAction = useCallback((milestoneId, actionId, origin, progressEach = 0) => {
    update((s) => withWorld(s, (w) => {
      const today = dayKey(); const m = w.formula.milestones.find((x) => x.id === milestoneId); if (!m) return;
      const a = m.actions.find((x) => x.id === actionId); if (a) a.doneToday = today;
      if (progressEach > 0) m.currentValue = Math.max(0, Math.min(m.targetValue, m.currentValue + progressEach));
      const now = Date.now();
      s.player.combo = (now - s.player.lastActionTs < 9000) ? s.player.combo + 1 : 1;
      s.player.lastActionTs = now;
      const mult = 1 + Math.min(4, s.player.combo - 1) * 0.25;
      const gx = Math.round(XP.action * mult), gc = Math.round(CR.action * mult);
      grantXP(s, gx, gc);
      if (s.player.lastQuestDay !== today) { s.player.streak += 1; s.player.lastQuestDay = today; }
      setLoot({ xp: gx, crystals: gc, combo: s.player.combo, id: Math.random() });
    }));
    if (origin) setBurst({ ...origin, color: C.cyan, id: Math.random() });
    Sound.ping(700 + Math.random() * 120); haptic(10);
  }, [update]);

  const setProgress = useCallback((id, v) => update((s) => withWorld(s, (w) => { const m = w.formula.milestones.find((x) => x.id === id); if (m) m.currentValue = Math.max(0, +v || 0); })), [update]);
  // quick +/- progress, anywhere — no hunting. Optional loot+burst when positive.
  const bumpProgress = useCallback((id, delta, origin) => {
    update((s) => withWorld(s, (w) => { const m = w.formula.milestones.find((x) => x.id === id); if (!m) return; m.currentValue = Math.max(0, Math.min(m.targetValue, m.currentValue + delta)); if (delta > 0) grantXP(s, 10, 3); }));
    if (delta > 0) { setLoot({ xp: 10, crystals: 3, id: Math.random() }); if (origin) setBurst({ ...origin, color: C.mint, id: Math.random() }); Sound.ping(620 + Math.random() * 100); haptic(8); }
  }, [update]);
  const addProof = useCallback((id, note, bump, origin) => { update((s) => withWorld(s, (w) => { const m = w.formula.milestones.find((x) => x.id === id); if (!m) return; const log = { id: uid("pf"), milestoneId: id, type: "text", title: "Proof", note, value: bump || null, createdAt: nowISO() }; m.proofLogs.push(log); w.game.proofLogs.push(log); if (bump) m.currentValue = Math.max(0, m.currentValue + Number(bump)); grantXP(s, XP.proofLog, CR.proofLog); })); setLoot({ xp: XP.proofLog, crystals: CR.proofLog, id: Math.random() }); if (origin) setBurst({ ...origin, color: C.magenta, id: Math.random() }); Sound.ping(520, 0.12); haptic(14); }, [update]);

  const completeMilestone = useCallback((id) => {
    let triggered = null;
    update((s) => withWorld(s, (w) => {
      const list = w.formula.milestones; const m = list.find((x) => x.id === id);
      if (!m || m.currentValue < m.targetValue) return;
      m.status = "complete"; m.completedAt = nowISO(); w.game.completedMilestoneIds.push(m.id);
      grantXP(s, XP.milestone, CR.milestone);
      const reward = w.formula.milestoneRewards.find((r) => r.linkedMilestoneId === m.id);
      if (reward) { reward.status = "unlocked"; reward.unlockedAt = nowISO(); w.game.unlockedRewardIds.push(reward.id); }
      const next = list.find((x) => x.status === "locked");
      if (next) { next.status = "active"; w.game.activeMilestoneId = next.id; triggered = { kind: "milestone", title: m.title, reward: reward?.title, next: next.title }; }
      else { w.game.activeMilestoneId = null; w.game.finalGoalComplete = true; grantXP(s, XP.finalGoal, CR.finalGoal); triggered = { kind: "ascension", title: m.title }; }
    }));
    if (triggered) { setFx(triggered); Sound.chord([659, 784, 988, 1318], 0.22); haptic(40); }
  }, [update]);

  const openChest = useCallback((rewardId) => { const w = world(); const r = w.formula.milestoneRewards.find((x) => x.id === rewardId); if (r && r.status === "unlocked") { setChestFx({ reward: r }); Sound.ping(880, 0.1); } }, [state]);
  const confirmClaim = useCallback((rewardId) => { update((s) => withWorld(s, (w) => { const r = w.formula.milestoneRewards.find((x) => x.id === rewardId); if (r && r.status === "unlocked") { r.status = "claimed"; r.claimedAt = nowISO(); w.game.claimedRewardIds.push(r.id); s.player.crystals += CR.claimBonus; } })); setChestFx(null); Sound.chord([784, 1046, 1318]); haptic(24); }, [update]);

  /* Phase 8 — worlds */
  const newWorld = useCallback(() => update((s) => { const w = blankWorld(); s.worlds.push(w); s.activeWorldId = w.id; return s; }), [update]);
  const switchWorld = useCallback((id) => update((s) => { s.activeWorldId = id; return s; }), [update]);
  const deleteWorld = useCallback((id) => update((s) => { s.worlds = s.worlds.filter((w) => w.id !== id); if (!s.worlds.length) s.worlds = [blankWorld()]; if (s.activeWorldId === id) s.activeWorldId = s.worlds[0].id; return s; }), [update]);

  /* DEMO seed — preview without filling the formula (kept in v2) */
  const loadDemo = useCallback(() => {
    update((s) => {
      const w = blankWorld(); w.formula.completed = true; w.formula.currentStep = STEPS.length;
      w.formula.specificIntentions = { goalName: "Sell 200 Accounts", objective: "Build a self-sustaining book", measure: "Accounts", deadline: "2026-12-31", iWillStatement: "I will sell 200 accounts." };
      w.formula.futureVision = { description: "A thriving book of business and real freedom.", emotions: "Proud", identity: "A closer", environment: "Full pipeline", peopleSay: "He delivers." };
      w.formula.strengthsSkills = ["Grit", "Fast rapport", "Follow-up"]; w.formula.resources = ["Mentor", "CRM", "Referrals"];
      w.formula.rewardCategories = { small: "Dinner", medium: "Trip", large: "Watch" };
      w.formula.focusedActions = ["Knock 20 doors", "Send 10 follow-ups", "Morning ritual", "Log proof"];
      const seeds = [
        { t: "First 25", tg: 25, u: "accounts", d: "easy", r: "Nice dinner", c: "small", cur: 25 },
        { t: "Hit 50", tg: 50, u: "accounts", d: "medium", r: "New gear", c: "medium", cur: 34 },
        { t: "Cross 120", tg: 120, u: "accounts", d: "hard", r: "Weekend trip", c: "large", cur: 0 },
        { t: "Final 200", tg: 200, u: "accounts", d: "legendary", r: "The watch", c: "legendary", cur: 0 },
      ];
      w.formula.milestones = seeds.map((m) => ({ id: uid("ms"), title: m.t, description: "", targetValue: m.tg, currentValue: m.cur, unit: m.u, deadline: "", rewardId: uid("rw"), rewardTitle: m.r, rewardCategory: m.c, difficulty: m.d, status: "locked", actions: w.formula.focusedActions.map((a) => ({ id: uid("ac"), label: a, doneToday: null })), proofLogs: [], createdAt: nowISO(), completedAt: null }));
      w.formula.milestones[0].status = "complete"; w.formula.milestones[0].completedAt = nowISO();
      w.formula.milestones[1].status = "active";
      w.formula.milestoneRewards = w.formula.milestones.map((m, i) => ({ id: m.rewardId, title: m.rewardTitle, description: m.title, category: m.rewardCategory, linkedMilestoneId: m.id, status: i === 0 ? "unlocked" : "locked", unlockedAt: i === 0 ? nowISO() : null, claimedAt: null }));
      w.game = { unlocked: true, activeMilestoneId: w.formula.milestones[1].id, completedMilestoneIds: [w.formula.milestones[0].id], unlockedRewardIds: [w.formula.milestoneRewards[0].id], claimedRewardIds: [], proofLogs: [], finalGoalComplete: false };
      s.seenIntro = true; s.worlds.push(w); s.activeWorldId = w.id;
      s.player = { ...s.player, xp: 470, crystals: 140, level: 1, streak: 3, lastQuestDay: dayKey() };
      return s;
    });
  }, [update]);

  // auto-generate milestones from a goal number + unit (e.g. 200 accounts -> 4 levels)
  const autoMilestones = useCallback((total, unit, count) => update((s) => withWorld(s, (w) => {
    const n = Math.max(2, Math.min(8, count || 4)); const per = Math.ceil(total / n);
    const diffs = ["easy", "easy", "medium", "medium", "hard", "hard", "legendary", "legendary"];
    w.formula.milestones = Array.from({ length: n }, (_, i) => {
      const tgt = i === n - 1 ? total : per * (i + 1);
      return { id: uid("ms"), title: i === n - 1 ? `Finish — ${total} ${unit}` : `Reach ${tgt} ${unit}`, description: "", targetValue: tgt, currentValue: 0, unit, deadline: "", rewardId: null, rewardTitle: "", rewardCategory: i === n - 1 ? "legendary" : i >= n - 2 ? "large" : i >= 1 ? "medium" : "small", difficulty: diffs[i] || "hard", status: "locked", actions: [], proofLogs: [], createdAt: nowISO(), completedAt: null };
    });
  })), [update]);
  // one-tap template fill of the whole formula
  const applyTemplate = useCallback((tpl) => update((s) => withWorld(s, (w) => {
    w.formula.specificIntentions = { ...w.formula.specificIntentions, ...tpl.intent };
    w.formula.futureVision = { ...w.formula.futureVision, description: tpl.vision };
    w.formula.strengthsSkills = tpl.strengths; w.formula.resources = tpl.resources;
    w.formula.rewardCategories = tpl.rewards; w.formula.focusedActions = tpl.actions;
    const n = tpl.levels.length;
    w.formula.milestones = tpl.levels.map((lv, i) => ({ id: uid("ms"), title: lv.title, description: "", targetValue: lv.target, currentValue: 0, unit: tpl.unit, deadline: "", rewardId: null, rewardTitle: lv.reward, rewardCategory: lv.cat, difficulty: lv.diff, status: "locked", actions: [], proofLogs: [], createdAt: nowISO(), completedAt: null }));
    w.formula.currentStep = STEPS.length;
  })), [update]);

  const resetAll = useCallback(() => { const b = blankState(); b.activeWorldId = b.worlds[0].id; setState(b); }, []);
  return { state, world: world(), fx, loot, chestFx, burst, levelUp,
    clearFx: () => setFx(null), clearLoot: () => setLoot(null), clearChestFx: () => setChestFx(null), clearBurst: () => setBurst(null), clearLevelUp: () => setLevelUp(null),
    setSeenIntro, toggleMute, setField, setStep, addMilestone, removeMilestone, attachReward, unlockJourney, doAction, setProgress, bumpProgress, autoMilestones, applyTemplate, addProof, completeMilestone, openChest, confirmClaim, newWorld, switchWorld, deleteWorld, loadDemo, resetAll };
}

/* utils */
function uid(p = "id") { return `${p}_${Math.random().toString(36).slice(2, 9)}`; }
function nowISO() { return new Date().toISOString(); }
function dayKey() { return new Date().toISOString().slice(0, 10); }
function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function trunc(s, n) { return !s ? "" : s.length > n ? s.slice(0, n) + "…" : s; }
function hexA(hex, a) { const h = hex.replace("#", ""); return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`; }

/* ===== hooks/useReveal.js ================================================== */
function Reveal({ children, delay = 0, y = 24 }) {
  const ref = useRef(null); const [shown, setShown] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(true); return; } const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 }); io.observe(el); return () => io.disconnect(); }, []);
  return <div ref={ref} style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : `translateY(${y}px)`, transition: `opacity .7s cubic-bezier(.2,.8,.2,1) ${delay}ms, transform .7s cubic-bezier(.2,.8,.2,1) ${delay}ms` }}>{children}</div>;
}

/* ===== shared UI =========================================================== */
function NeonCard({ children, accent = C.phoenix, style, glow, onClick }) { return <div onClick={onClick} style={{ background: `linear-gradient(160deg, ${C.card}, ${C.cardDeep})`, border: `1px solid ${hexA(accent, 0.35)}`, borderRadius: 18, padding: 20, boxShadow: glow ? `0 0 28px ${hexA(accent, 0.35)}, inset 0 0 22px ${hexA(accent, 0.06)}` : "0 8px 24px rgba(0,0,0,0.55)", cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>; }
function NeonButton({ children, onClick, disabled, accent = C.magenta, ghost, full, small }) { return <button onClick={onClick} disabled={disabled} style={{ width: full ? "100%" : "auto", padding: small ? "8px 14px" : "13px 22px", borderRadius: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: small ? 12 : 14, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: disabled ? "not-allowed" : "pointer", color: disabled ? C.textDim : ghost ? accent : "#05030a", background: disabled ? "rgba(255,255,255,0.04)" : ghost ? "transparent" : `linear-gradient(135deg, ${accent}, ${C.hotPink})`, border: ghost ? `1px solid ${hexA(accent, 0.5)}` : "none", boxShadow: disabled || ghost ? "none" : `0 0 18px ${hexA(accent, 0.5)}`, opacity: disabled ? 0.55 : 1, transition: "transform .12s ease" }} onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.96)")} onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>{children}</button>; }
function ProgressBar({ value, max = 100, accent = C.cyan, height = 10 }) { const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100)); return <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 999, height, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${accent}, ${C.hotPink})`, boxShadow: `0 0 12px ${hexA(accent, 0.7)}`, transition: "width .5s cubic-bezier(.2,.8,.2,1)" }} /></div>; }
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${hexA(C.phoenix, 0.3)}`, color: C.text, fontSize: 14, fontFamily: "'Inter Tight', system-ui, sans-serif", outline: "none" };
function TextInput({ label, value, onChange, placeholder, type = "text", textarea }) { return <label style={{ display: "block", marginBottom: 14 }}><span style={{ display: "block", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.textDim, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>{textarea ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} /> : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />}</label>; }
const h2 = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 700, color: C.text, margin: "6px 0 8px" };
const chip = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", marginBottom: 6 };
const xBtn = { background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" };
function EmptyHint({ text }) { return <p style={{ fontSize: 12, color: C.textDim, fontStyle: "italic", margin: "8px 0" }}>{text}</p>; }
function LockedTab({ label }) { return <NeonCard accent={C.locked}><div style={{ textAlign: "center", padding: "16px 0" }}><div style={{ fontSize: 36 }}>🔒</div><p style={{ color: C.textDim, fontSize: 13 }}>{label}</p></div></NeonCard>; }

/* ===== FX layer ============================================================ */
function LootToast({ loot, onDone }) { useEffect(() => { if (!loot) return; const t = setTimeout(onDone, 1100); return () => clearTimeout(t); }, [loot]); if (!loot) return null; return <div style={{ position: "fixed", left: "50%", bottom: 100, transform: "translateX(-50%)", zIndex: 80, pointerEvents: "none", animation: "mmLoot 1.1s ease-out forwards" }}><div style={{ background: hexA(C.mint, 0.16), border: `1px solid ${C.mint}`, borderRadius: 999, padding: "8px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: C.mint, boxShadow: `0 0 20px ${hexA(C.mint, 0.5)}` }}>+{loot.xp} XP · +{loot.crystals} 💎{loot.combo > 1 ? `  ×${loot.combo} COMBO!` : ""}</div></div>; }
function Confetti({ burst, onDone }) { useEffect(() => { if (!burst) return; const t = setTimeout(onDone, 900); return () => clearTimeout(t); }, [burst]); if (!burst) return null; const cols = [C.cyan, C.hotPink, C.mint, C.gold, C.magenta]; return <div style={{ position: "fixed", left: burst.x, top: burst.y, zIndex: 82, pointerEvents: "none" }}>{Array.from({ length: 18 }).map((_, i) => { const ang = (Math.PI * 2 * i) / 18, dist = 40 + Math.random() * 50; return <span key={i} style={{ position: "absolute", width: 7, height: 7, borderRadius: 2, background: cols[i % cols.length], "--tx": `${Math.cos(ang) * dist}px`, "--ty": `${Math.sin(ang) * dist}px`, animation: "mmConfetti .85s ease-out forwards" }} />; })}</div>; }
function LevelUpFlash({ levelUp, onDone }) { useEffect(() => { if (!levelUp) return; const t = setTimeout(onDone, 1600); return () => clearTimeout(t); }, [levelUp]); if (!levelUp) return null; return <div style={{ position: "fixed", inset: 0, zIndex: 88, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><div style={{ position: "absolute", inset: 0, background: `radial-gradient(500px 400px at 50% 50%, ${hexA(C.gold, 0.25)}, transparent)`, animation: "mmFade .4s ease" }} /><div style={{ textAlign: "center", animation: "mmPop .6s cubic-bezier(.2,1.4,.4,1)" }}><div style={{ fontSize: 60 }}>{avatarFor(levelUp.level)}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: 4, color: C.gold, fontSize: 13 }}>LEVEL UP</div><div style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 700, color: "transparent", background: `linear-gradient(135deg, ${C.gold}, ${C.hotPink})`, WebkitBackgroundClip: "text" }}>LV {levelUp.level}</div></div></div>; }

/* ===== onboarding ========================================================= */
function GameIntro({ onEnter, onDemo }) {
  const [line, setLine] = useState(0);
  useEffect(() => { if (line >= INTRO_LINES.length) return; const t = setTimeout(() => setLine((l) => l + 1), line === 0 ? 600 : 1400); return () => clearTimeout(t); }, [line]);
  const done = line >= INTRO_LINES.length;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: `radial-gradient(900px 600px at 50% 30%, ${hexA(C.phoenix, 0.25)}, transparent), ${C.bg}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${hexA(C.cyan, 0.03)} 3px)`, pointerEvents: "none" }} />
      <button onClick={onEnter} style={{ position: "absolute", top: 20, right: 20, ...xBtn, fontSize: 12, border: `1px solid ${hexA(C.cyan, 0.4)}`, borderRadius: 999, padding: "6px 14px", color: C.cyan }}>Skip ✕</button>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 12, letterSpacing: 5, color: C.hotPink, fontFamily: "'JetBrains Mono', monospace", marginBottom: 28, animation: "mmFloat 4s ease-in-out infinite" }}>MILESTONE QUEST</div>
        {INTRO_LINES.map((t, i) => <p key={i} style={{ fontFamily: "'Fraunces', serif", fontSize: i === INTRO_LINES.length - 1 ? 30 : 19, fontWeight: i === INTRO_LINES.length - 1 ? 700 : 500, lineHeight: 1.4, margin: "0 0 16px", color: i === INTRO_LINES.length - 1 ? "transparent" : C.text, background: i === INTRO_LINES.length - 1 ? `linear-gradient(135deg, ${C.cyan}, ${C.hotPink})` : "none", WebkitBackgroundClip: i === INTRO_LINES.length - 1 ? "text" : "border-box", opacity: line > i ? 1 : 0, transform: line > i ? "none" : "translateY(16px)", transition: "opacity .9s ease, transform .9s ease", filter: line > i ? "none" : "blur(4px)" }}>{t}</p>)}
        <div style={{ marginTop: 36, opacity: done ? 1 : 0, transform: done ? "none" : "translateY(20px)", transition: "opacity 1s ease .3s, transform 1s ease .3s" }}>
          <NeonButton accent={C.mint} onClick={onEnter}>Begin the Formula →</NeonButton>
          <div style={{ marginTop: 14 }}><button onClick={onDemo} style={{ ...xBtn, fontSize: 12, color: C.gold, border: `1px solid ${hexA(C.gold, 0.4)}`, borderRadius: 999, padding: "6px 14px" }}>⚡ Load demo world (skip setup)</button></div>
        </div>
      </div>
    </div>
  );
}
function StepIntro({ poem }) { return <div style={{ marginBottom: 16, position: "relative", overflow: "hidden", borderRadius: 16, padding: "22px 20px", background: `linear-gradient(135deg, ${hexA(C.phoenix, 0.18)}, ${hexA(C.magenta, 0.06)})`, border: `1px solid ${hexA(C.hotPink, 0.25)}` }}><div style={{ position: "absolute", top: -30, right: -20, fontSize: 120, opacity: 0.06, fontFamily: "'Fraunces', serif" }}>"</div><Reveal y={14}><div style={{ fontSize: 11, letterSpacing: 4, color: C.cyan, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>{poem.kicker}</div></Reveal><Reveal y={14} delay={120}><p style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontStyle: "italic", lineHeight: 1.5, margin: 0, color: C.text }}>{poem.line}</p></Reveal></div>; }

/* ===== Formula Gate ======================================================= */
function FormulaGate({ engine }) {
  const { world, setField, setStep, addMilestone, removeMilestone, attachReward, unlockJourney, loadDemo, applyTemplate, autoMilestones } = engine;
  const f = world.formula; const i = f.currentStep; const step = STEPS[i]; const review = i >= STEPS.length;
  const [unlocking, setUnlocking] = useState(false);
  const stepDone = (idx) => { const s = STEPS[idx], d = f[s.key]; if (s.fields) return s.fields.filter((x) => x.required).every((x) => (d[x.name] || "").trim()); if (s.list) return (d || []).length >= (s.minItems || 1); if (s.milestoneBuilder) return (f.milestones || []).length >= (s.minItems || 1); return true; };
  const count = STEPS.filter((_, k) => stepDone(k)).length; const all = STEPS.every((_, k) => stepDone(k));
  if (f.completed) return <NeonCard accent={C.mint} glow><div style={{ textAlign: "center", padding: "10px 0" }}><div style={{ fontSize: 40 }}>⚗️</div><h2 style={h2}>Formula Locked In</h2><p style={{ color: C.textDim, fontSize: 13 }}>Your map is alive. Head to Journey to walk it.</p></div></NeonCard>;
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, textAlign: "center" }}>QUICK START — TAP A TEMPLATE, EDIT ANYTHING AFTER</div>
        <div style={{ display: "flex", gap: 8 }}>
          {TEMPLATES.map((t) => <button key={t.id} onClick={() => applyTemplate(t)} style={{ flex: 1, padding: "12px 6px", borderRadius: 12, border: `1px solid ${hexA(C.cyan, 0.4)}`, background: "rgba(255,255,255,0.04)", color: C.text, cursor: "pointer" }}><div style={{ fontSize: 22 }}>{t.emoji}</div><div style={{ fontSize: 10, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.name}</div></button>)}
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={() => loadDemo()} style={{ ...xBtn, fontSize: 12, color: C.gold, border: `1px solid ${hexA(C.gold, 0.4)}`, borderRadius: 999, padding: "8px 16px" }}>⚡ Load demo world — skip the setup</button></div>
      </div>
      <NeonCard accent={C.cyan} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: C.textDim }}><span>FORMULA GATE</span><span>{count} / {STEPS.length} STEPS</span></div>
        <ProgressBar value={count} max={STEPS.length} accent={C.cyan} />
        <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>{STEPS.map((s, k) => <button key={s.key} onClick={() => setStep(k)} title={s.title} style={{ width: 26, height: 26, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: k === i ? "#05030a" : stepDone(k) ? C.mint : C.textDim, background: k === i ? C.cyan : stepDone(k) ? hexA(C.mint, 0.15) : "rgba(255,255,255,0.05)", fontFamily: "'JetBrains Mono', monospace" }}>{stepDone(k) && k !== i ? "✓" : k + 1}</button>)}</div>
      </NeonCard>
      {review ? <Review f={f} all={all} onJump={setStep} onUnlock={() => setUnlocking(true)} /> : (
        <div key={step.key}>
          <StepIntro poem={STEP_POETRY[step.key]} />
          <Reveal delay={80}><NeonCard accent={C.phoenix} glow>
            <div style={{ fontSize: 11, letterSpacing: 2, color: C.hotPink, fontFamily: "'JetBrains Mono', monospace" }}>STEP {i + 1}</div>
            <h2 style={h2}>{step.title}</h2>
            <p style={{ color: C.textDim, fontSize: 13, marginTop: -4, marginBottom: 16 }}>{step.prompt}</p>
            {step.fields && step.fields.map((fld) => <TextInput key={fld.name} label={fld.label + (fld.required ? " *" : "")} value={f[step.key][fld.name] || ""} placeholder={fld.placeholder} type={fld.type === "textarea" ? "text" : fld.type || "text"} textarea={fld.type === "textarea"} onChange={(v) => setField(step.key, fld.name, v)} />)}
            {step.list && <ListEditor label={step.listLabel} items={f[step.key]} onChange={(arr) => setField(step.key, null, arr)} />}
            {step.milestoneBuilder && <MilestoneBuilder milestones={f.milestones} onAdd={addMilestone} onRemove={removeMilestone} onAuto={autoMilestones} goalName={f.specificIntentions.goalName} measure={f.specificIntentions.measure} />}
            {step.attachRewards && <RewardAttacher milestones={f.milestones} rc={f.rewardCategories} onAttach={attachReward} />}
          </NeonCard></Reveal>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}><NeonButton ghost accent={C.cyan} onClick={() => setStep(Math.max(0, i - 1))} disabled={i === 0}>Back</NeonButton><div style={{ flex: 1 }} /><NeonButton accent={C.magenta} onClick={() => setStep(i + 1)} disabled={!stepDone(i)}>{i === STEPS.length - 1 ? "Review" : "Next"}</NeonButton></div>
        </div>
      )}
      {unlocking && <UnlockSequence onDone={() => { setUnlocking(false); unlockJourney(); }} />}
    </div>
  );
}
function UnlockSequence({ onDone }) { const [line, setLine] = useState(0); useEffect(() => { if (line >= UNLOCK_LINES.length) { const t = setTimeout(onDone, 900); return () => clearTimeout(t); } const t = setTimeout(() => setLine((l) => l + 1), 1100); return () => clearTimeout(t); }, [line]); return <div style={{ position: "fixed", inset: 0, zIndex: 100, background: `radial-gradient(700px 500px at 50% 50%, ${hexA(C.mint, 0.25)}, ${C.bg})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "mmFade .4s ease" }}><div style={{ fontSize: 56, animation: "mmSpin 3s linear infinite", marginBottom: 20 }}>⚗️</div>{UNLOCK_LINES.map((t, i) => <p key={i} style={{ fontFamily: "'Fraunces', serif", fontSize: i === UNLOCK_LINES.length - 1 ? 34 : 22, fontWeight: 700, margin: "0 0 12px", color: i === UNLOCK_LINES.length - 1 ? "transparent" : C.text, background: i === UNLOCK_LINES.length - 1 ? `linear-gradient(135deg, ${C.cyan}, ${C.hotPink})` : "none", WebkitBackgroundClip: i === UNLOCK_LINES.length - 1 ? "text" : "border-box", opacity: line > i ? 1 : 0, transform: line > i ? "none" : "scale(0.8)", transition: "opacity .7s ease, transform .7s ease" }}>{t}</p>)}</div>; }
function ListEditor({ label, items, onChange }) { const [d, setD] = useState(""); const add = () => { if (d.trim()) { onChange([...items, d.trim()]); setD(""); } }; return <div><div style={{ display: "flex", gap: 8, marginBottom: 10 }}><input value={d} placeholder={label} onChange={(e) => setD(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} style={{ ...inputStyle, flex: 1 }} /><NeonButton small accent={C.mint} onClick={add}>Add</NeonButton></div>{items.map((it, k) => <div key={k} style={chip}><span style={{ fontSize: 13 }}>{it}</span><button onClick={() => onChange(items.filter((_, j) => j !== k))} style={xBtn}>✕</button></div>)}{items.length === 0 && <EmptyHint text="Add at least one to continue." />}</div>; }
function MilestoneBuilder({ milestones, onAdd, onRemove, onAuto, goalName, measure }) {
  const [m, setM] = useState({ title: "", targetValue: "", unit: "", deadline: "", difficulty: "medium" });
  const [auto, setAuto] = useState({ total: "", unit: measure || "units", count: 4 });
  const submit = () => { if (!m.title.trim() || !m.targetValue) return; onAdd(m); setM({ title: "", targetValue: "", unit: "", deadline: "", difficulty: "medium" }); };
  return <div>
    <div style={{ padding: 12, borderRadius: 12, background: hexA(C.cyan, 0.07), border: `1px solid ${hexA(C.cyan, 0.3)}`, marginBottom: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: 1, color: C.cyan, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>⚡ AUTO-BUILD LEVELS FROM YOUR NUMBER</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input style={{ ...inputStyle, width: 90 }} type="number" placeholder="200" value={auto.total} onChange={(e) => setAuto({ ...auto, total: e.target.value })} />
        <input style={{ ...inputStyle, flex: 1 }} placeholder="unit (accounts)" value={auto.unit} onChange={(e) => setAuto({ ...auto, unit: e.target.value })} />
        <select style={{ ...inputStyle, width: 64 }} value={auto.count} onChange={(e) => setAuto({ ...auto, count: +e.target.value })}>{[3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}</select>
      </div>
      <div style={{ marginTop: 8 }}><NeonButton small full accent={C.cyan} disabled={!auto.total} onClick={() => onAuto(+auto.total, auto.unit || "units", auto.count)}>Generate {auto.count} levels</NeonButton></div>
    </div>
    <div style={{ fontSize: 10, color: C.textDim, textAlign: "center", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>— or add one at a time —</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}><input style={{ ...inputStyle, gridColumn: "1 / -1" }} placeholder="Milestone title" value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} /><input style={inputStyle} type="number" placeholder="Target #" value={m.targetValue} onChange={(e) => setM({ ...m, targetValue: e.target.value })} /><input style={inputStyle} placeholder="Unit" value={m.unit} onChange={(e) => setM({ ...m, unit: e.target.value })} /><input style={inputStyle} type="date" value={m.deadline} onChange={(e) => setM({ ...m, deadline: e.target.value })} /><select style={inputStyle} value={m.difficulty} onChange={(e) => setM({ ...m, difficulty: e.target.value })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="legendary">Legendary</option></select></div><NeonButton small accent={C.mint} onClick={submit}>+ Add Milestone</NeonButton>
    <div style={{ marginTop: 12 }}>{milestones.map((ms, k) => <div key={ms.id} style={{ ...chip, flexDirection: "column", alignItems: "flex-start", gap: 2 }}><div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}><strong style={{ fontSize: 13 }}>LVL {k + 1} · {ms.title}</strong><button onClick={() => onRemove(ms.id)} style={xBtn}>✕</button></div><span style={{ fontSize: 11, color: C.textDim }}>Target {ms.targetValue} {ms.unit} · {ms.difficulty}</span></div>)}{milestones.length === 0 && <EmptyHint text="Auto-build above, or add one at a time — these become your map." />}</div>
  </div>;
}
function RewardAttacher({ milestones, rc, onAttach }) { if (!milestones.length) return <EmptyHint text="Add milestones in Step 6 first." />; return <div>{milestones.map((ms, k) => <div key={ms.id} style={{ ...chip, flexDirection: "column", alignItems: "stretch", gap: 6 }}><strong style={{ fontSize: 13 }}>LVL {k + 1} · {ms.title}</strong><input style={inputStyle} placeholder={`Reward (e.g. ${rc.small || "a treat"})`} value={ms.rewardTitle} onChange={(e) => onAttach(ms.id, e.target.value, ms.rewardCategory)} /><select style={inputStyle} value={ms.rewardCategory} onChange={(e) => onAttach(ms.id, ms.rewardTitle, e.target.value)}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="legendary">Legendary</option></select></div>)}</div>; }
function Review({ f, all, onJump, onUnlock }) { const row = (label, value, jump) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${hexA(C.phoenix, 0.15)}` }}><div><div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div><div style={{ fontSize: 13, color: value ? C.text : C.hotPink }}>{value || "— missing —"}</div></div><button onClick={() => onJump(jump)} style={{ ...xBtn, color: C.cyan }}>edit</button></div>; return <Reveal><NeonCard accent={C.mint} glow><h2 style={h2}>Review Your Formula</h2>{row("Goal", f.specificIntentions.goalName, 0)}{row("Vision", trunc(f.futureVision.description, 60), 1)}{row("Strengths", `${f.strengthsSkills.length} listed`, 2)}{row("Resources", `${f.resources.length} listed`, 3)}{row("Milestones", `${f.milestones.length} levels`, 5)}{row("Actions", `${f.focusedActions.length} listed`, 6)}<div style={{ marginTop: 18 }}><NeonButton full accent={C.mint} onClick={onUnlock} disabled={!all}>🔓 Unlock Journey World</NeonButton>{!all && <p style={{ fontSize: 11, color: C.hotPink, marginTop: 8, textAlign: "center" }}>Complete every required step to unlock.</p>}</div></NeonCard></Reveal>; }

/* ===== Journey World (map) ================================================ */
function JourneyWorld({ engine, onEnterLevel }) { const { world } = engine; const { formula, game } = world; if (!game.unlocked) return <NeonCard accent={C.locked}><div style={{ textAlign: "center", padding: "20px 0" }}><div style={{ fontSize: 44 }}>🔒</div><h2 style={h2}>Journey World Locked</h2><p style={{ color: C.textDim, fontSize: 13 }}>Build your formula first. Your goal becomes the world.</p></div></NeonCard>; return <div><JourneyMap formula={formula} game={game} onEnterLevel={onEnterLevel} />{game.finalGoalComplete && <Ascension game={game} formula={formula} player={engine.state.player} />}{!game.finalGoalComplete && <p style={{ textAlign: "center", fontSize: 12, color: C.textDim, marginTop: 4 }}>Tap your active level to enter the room.</p>}</div>; }
function JourneyMap({ formula, game, onEnterLevel }) {
  const nodes = [...formula.milestones, { id: "final", title: formula.specificIntentions.goalName, status: game.finalGoalComplete ? "final-complete" : "final", final: true }];
  const n = nodes.length; const H = Math.max(360, n * 116); const W = 320;
  const pts = nodes.map((_, i) => ({ x: i % 2 === 0 ? 80 : W - 80, y: 60 + i * ((H - 120) / Math.max(1, n - 1)) }));
  const path = pts.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `Q ${pts[i - 1].x} ${(pts[i - 1].y + p.y) / 2} ${(pts[i - 1].x + p.x) / 2} ${(pts[i - 1].y + p.y) / 2} T ${p.x} ${p.y}`).join(" ");
  const cleared = game.completedMilestoneIds.length;
  return (
    <NeonCard accent={C.phoenix} glow style={{ marginBottom: 14, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(300px 200px at 20% 10%, ${hexA(C.phoenix, 0.18)}, transparent), radial-gradient(300px 200px at 80% 80%, ${hexA(C.cyan, 0.12)}, transparent)`, pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: C.hotPink, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>JOURNEY WORLD</div>
        <h2 style={{ ...h2, marginBottom: 4 }}>{formula.specificIntentions.goalName}</h2>
        <p style={{ fontSize: 12, color: C.textDim, marginTop: 0, marginBottom: 8 }}>{cleared} / {formula.milestones.length} levels cleared</p>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.cyan} /><stop offset="100%" stopColor={C.hotPink} /></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          <path d={path} fill="none" stroke={hexA(C.locked, 0.6)} strokeWidth="5" strokeLinecap="round" strokeDasharray="2 10" />
          <path d={path} fill="none" stroke="url(#pg)" strokeWidth="4" strokeLinecap="round" filter="url(#gl)" style={{ strokeDasharray: 2000, strokeDashoffset: 2000 - (2000 * Math.min(1, cleared / Math.max(1, n - 1))), transition: "stroke-dashoffset 1s ease" }} />
          {nodes.map((nd, i) => <MapNode key={nd.id} node={nd} index={i} x={pts[i].x} y={pts[i].y} milestone={formula.milestones[i]} onEnterLevel={onEnterLevel} />)}
        </svg>
      </div>
    </NeonCard>
  );
}
function MapNode({ node, index, x, y, milestone, onEnterLevel }) {
  const isFinal = node.final; const status = node.status; const tappable = !isFinal && status !== "locked";
  const cfg = isFinal ? { color: status === "final-complete" ? C.mint : C.hotPink, icon: ASSET.node.final, label: status === "final-complete" ? "ASCENDED" : "FINAL" } : { locked: { color: C.locked, icon: ASSET.node.locked, label: "LOCKED" }, active: { color: C.cyan, icon: ASSET.node.active, label: "ACTIVE" }, complete: { color: C.mint, icon: ASSET.node.complete, label: "CLEAR" } }[status];
  return (
    <g style={{ opacity: status === "locked" ? 0.55 : 1, cursor: tappable ? "pointer" : "default" }} onClick={() => tappable && onEnterLevel(milestone.id)}>
      {status === "active" && <circle cx={x} cy={y} r="26" fill="none" stroke={cfg.color} strokeWidth="2" opacity="0.5"><animate attributeName="r" values="22;30;22" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" /></circle>}
      <circle cx={x} cy={y} r="20" fill={hexA(cfg.color, 0.14)} stroke={cfg.color} strokeWidth="2.5" filter={status === "active" || isFinal ? "url(#gl)" : "none"} />
      <text x={x} y={y + 6} textAnchor="middle" fontSize="17">{cfg.icon}</text>
      <text x={x} y={y - 28} textAnchor="middle" fill={cfg.color} fontSize="9" fontFamily="'JetBrains Mono', monospace" letterSpacing="1">{isFinal ? cfg.label : `LVL ${index + 1}`}</text>
      <text x={x} y={y + 36} textAnchor="middle" fill={C.text} fontSize="10" fontFamily="'Inter Tight', sans-serif">{trunc(node.title, 16)}</text>
      {milestone && status !== "locked" && <text x={x} y={y + 49} textAnchor="middle" fill={C.textDim} fontSize="8" fontFamily="'JetBrains Mono', monospace">{milestone.currentValue}/{milestone.targetValue} {trunc(milestone.unit, 6)}</text>}
      {tappable && <text x={x} y={y + 61} textAnchor="middle" fill={cfg.color} fontSize="7" fontFamily="'JetBrains Mono', monospace" letterSpacing="1">TAP TO ENTER</text>}
    </g>
  );
}

/* ===== PHASE 6: walkable top-down LEVEL ROOM ==============================
   Your avatar walks (tap-to-move) to action stations. Reaching a station
   triggers the action panel; doing it fires confetti at the station.       */
function LevelRoom({ engine, milestoneId, onBack }) {
  const { world, state, doAction, setProgress, bumpProgress, addProof, completeMilestone, openChest } = engine;
  const m = world.formula.milestones.find((x) => x.id === milestoneId);
  const reward = world.formula.milestoneRewards.find((r) => r.linkedMilestoneId === milestoneId);
  const roomRef = useRef(null);
  const [avatar, setAvatar] = useState({ x: 50, y: 78 }); // % coords
  const [target, setTarget] = useState({ x: 50, y: 78 });
  const [activeStation, setActiveStation] = useState(null);
  const [panel, setPanel] = useState(null); // station object when avatar arrives
  const lvl = state.player.level;

  // stations laid out around the room
  const stations = (m?.actions || []).slice(0, 6).map((a, i) => {
    const cols = 3, gx = 22 + (i % cols) * 28, gy = 26 + Math.floor(i / cols) * 26;
    return { id: a.id, label: a.label, x: gx, y: gy, done: a.doneToday === dayKey(), icon: stationIcon(a.label) };
  });
  const progressStation = { id: "__progress", label: "Update Progress", x: 84, y: 70, icon: "📈" };
  const chestStation = reward ? { id: "__chest", label: "Reward Chest", x: 16, y: 70, icon: reward.status === "unlocked" ? ASSET.chest[reward.category] : reward.status === "claimed" ? "✅" : "🔒" } : null;
  const allStations = [...stations, progressStation, ...(chestStation ? [chestStation] : [])];

  // walk animation toward target
  useEffect(() => {
    let raf; const step = () => { setAvatar((p) => { const dx = target.x - p.x, dy = target.y - p.y; const d = Math.hypot(dx, dy); if (d < 1.5) return target; return { x: p.x + dx * 0.18, y: p.y + dy * 0.18 }; }); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [target]);

  // arrival detection
  useEffect(() => {
    if (!activeStation) return;
    const d = Math.hypot(avatar.x - activeStation.x, avatar.y - activeStation.y);
    if (d < 4 && !panel) { setPanel(activeStation); haptic(8); }
  }, [avatar, activeStation]);

  if (!m) return null;
  const can = m.currentValue >= m.targetValue;
  const pct = Math.min(100, (m.currentValue / (m.targetValue || 1)) * 100);
  const idx = world.formula.milestones.findIndex((x) => x.id === milestoneId);
  const diffColor = { easy: C.mint, medium: C.cyan, hard: C.hotPink, legendary: C.gold }[m.difficulty] || C.cyan;
  const aura = ASSET.auraByLevel(lvl);

  const tapMove = (e) => {
    const rect = roomRef.current.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;
    setTarget({ x: Math.max(6, Math.min(94, cx)), y: Math.max(14, Math.min(90, cy)) });
    setActiveStation(null); setPanel(null);
  };
  const goToStation = (st) => { setTarget({ x: st.x, y: st.y + 8 }); setActiveStation(st); setPanel(null); };

  const stationOrigin = (st) => { const rect = roomRef.current?.getBoundingClientRect(); if (!rect) return null; return { x: rect.left + (st.x / 100) * rect.width - 4, y: rect.top + (st.y / 100) * rect.height - 4 }; };

  return (
    <div>
      <button onClick={onBack} style={{ ...xBtn, fontSize: 13, marginBottom: 10, color: C.cyan }}>← Back to map</button>

      {/* boss header */}
      <NeonCard accent={diffColor} glow style={{ marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(260px 160px at 80% 0%, ${hexA(diffColor, 0.2)}, transparent)`, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: 11, letterSpacing: 2, color: diffColor, fontFamily: "'JetBrains Mono', monospace" }}>LEVEL {idx + 1} · {m.status === "complete" ? "CLEARED" : "ACTIVE"}</div><span style={{ fontSize: 10, color: diffColor, border: `1px solid ${hexA(diffColor, 0.5)}`, borderRadius: 999, padding: "2px 10px", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{m.difficulty}</span></div>
          <h2 style={{ ...h2, marginBottom: 10 }}>{m.title}</h2>
          <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Milestone HP — drive it to target</div>
          <div style={{ position: "relative" }}><ProgressBar value={pct} accent={diffColor} height={16} /><div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: C.text, textShadow: "0 1px 2px rgba(0,0,0,.6)" }}>{m.currentValue} / {m.targetValue} {m.unit}</div></div>
        </div>
      </NeonCard>

      {/* QUICK PROGRESS — always here, no hunting */}
      <NeonCard accent={C.mint} style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 1, color: C.textDim, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>Log progress fast</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
          {[-1, +1, +5, +10].map((d) => <button key={d} onClick={(e) => bumpProgress(m.id, d, { x: e.clientX - 4, y: e.clientY - 4 })} disabled={m.status === "complete" || (d < 0 && m.currentValue === 0)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 15, color: "#05030a", background: d < 0 ? hexA(C.locked, 0.8) : `linear-gradient(135deg, ${C.mint}, ${C.cyan})`, opacity: (m.status === "complete" || (d < 0 && m.currentValue === 0)) ? 0.4 : 1, boxShadow: d > 0 ? `0 0 14px ${hexA(C.mint, 0.4)}` : "none" }}>{d > 0 ? `+${d}` : d}</button>)}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: C.textDim, marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>{m.currentValue} / {m.targetValue} {m.unit} · {Math.max(0, m.targetValue - m.currentValue)} to go</div>
      </NeonCard>

      <div ref={roomRef} onClick={tapMove} style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 18, marginBottom: 14, overflow: "hidden", cursor: "pointer", background: `radial-gradient(420px 360px at 50% 40%, ${hexA(diffColor, 0.14)}, ${C.cardDeep})`, border: `1px solid ${hexA(diffColor, 0.4)}`, boxShadow: `inset 0 0 60px ${hexA(diffColor, 0.12)}` }}>
        {/* floor grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${hexA(diffColor, 0.08)} 1px, transparent 1px), linear-gradient(90deg, ${hexA(diffColor, 0.08)} 1px, transparent 1px)`, backgroundSize: "14% 14%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 8, left: 12, fontSize: 9, letterSpacing: 2, color: hexA(diffColor, 0.8), fontFamily: "'JetBrains Mono', monospace", pointerEvents: "none" }}>TAP A STATION TO ENTER ITS ROOM · TAP FLOOR TO WALK</div>

        {/* stations */}
        {allStations.map((st) => (
          <div key={st.id} onClick={(e) => { e.stopPropagation(); goToStation(st); }} style={{ position: "absolute", left: `${st.x}%`, top: `${st.y}%`, transform: "translate(-50%,-50%)", textAlign: "center", cursor: "pointer" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: st.done ? hexA(C.mint, 0.12) : hexA(C.phoenix, 0.16), border: `2px solid ${st.done ? C.mint : hexA(C.cyan, 0.6)}`, boxShadow: st.done ? "none" : `0 0 14px ${hexA(C.cyan, 0.4)}`, animation: st.done ? "none" : "mmFloat 3s ease-in-out infinite" }}>{st.done ? "✓" : st.icon}</div>
            <div style={{ fontSize: 8, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", marginTop: 2, maxWidth: 70 }}>{trunc(st.label, 12)}</div>
          </div>
        ))}

        {/* avatar with level aura + gear */}
        <div style={{ position: "absolute", left: `${avatar.x}%`, top: `${avatar.y}%`, transform: "translate(-50%,-60%)", transition: "none", pointerEvents: "none", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: -10, borderRadius: "50%", background: `radial-gradient(circle, ${hexA(aura, 0.5)}, transparent 70%)`, animation: "mmPulse 2s ease-in-out infinite" }} />
          <div style={{ position: "relative", fontSize: 30, filter: `drop-shadow(0 0 8px ${aura})` }}>{avatarFor(lvl)}</div>
          <div style={{ position: "relative", fontSize: 8, color: aura, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>LV{lvl}</div>
        </div>
      </div>

      {/* combo meter */}
      {state.player.combo > 1 && <div style={{ textAlign: "center", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", color: C.gold, fontSize: 13, fontWeight: 700 }}>🔥 {state.player.combo}× COMBO — keep moving!</div>}

      {/* contextual panel when avatar reaches a station */}
      {panel && panel.id === "__progress" && <ProgressPanel m={m} onSave={(v) => setProgress(m.id, v)} onProof={(note, bump) => addProof(m.id, note, bump, stationOrigin(panel))} onClose={() => setPanel(null)} />}
      {panel && panel.id === "__chest" && reward && <ChestPanel r={reward} onOpen={() => openChest(reward.id)} onClose={() => setPanel(null)} />}
      {panel && panel.id !== "__progress" && panel.id !== "__chest" && (
        <StationScene station={panel} milestone={m} onDo={() => { doAction(m.id, panel.id, stationOrigin(panel), 1); setPanel(null); setActiveStation(null); }} onClose={() => setPanel(null)} />
      )}

      <NeonButton full accent={C.hotPink} disabled={!can || m.status === "complete"} onClick={() => { completeMilestone(m.id); onBack(); }}>{m.status === "complete" ? "✦ Level Cleared" : can ? "✦ Defeat Milestone" : `Hit ${m.targetValue} ${m.unit} to defeat`}</NeonButton>
    </div>
  );
}
function stationIcon(label) { const l = label.toLowerCase(); if (l.includes("ritual") || l.includes("morning")) return ASSET.station.ritual; if (l.includes("proof") || l.includes("log")) return ASSET.station.proof; if (l.includes("review")) return ASSET.station.review; return ASSET.station.focused; }

/* themed mini-room scene per station type — its own art + vibe */
const SCENE_THEME = {
  ritual: { bg1: "#FFA94D", bg2: "#7B2CFF", icon: "🌅", title: "The Dawn Room", line: "Win the morning, win the day. Light it up." },
  proof: { bg1: "#00F0FF", bg2: "#00FFBF", icon: "📈", title: "The Evidence Vault", line: "Proof beats hope. Show what moved." },
  review: { bg1: "#D11EFF", bg2: "#7B2CFF", icon: "🗓️", title: "The War Table", line: "Zoom out. Re-aim. Then strike again." },
  focused: { bg1: "#FF3EDB", bg2: "#00F0FF", icon: "🎯", title: "The Focus Forge", line: "One action. All your fire. Go." },
};
function sceneFor(label) { const l = label.toLowerCase(); if (l.includes("ritual") || l.includes("morning")) return SCENE_THEME.ritual; if (l.includes("proof") || l.includes("log")) return SCENE_THEME.proof; if (l.includes("review")) return SCENE_THEME.review; return SCENE_THEME.focused; }
function StationScene({ station, milestone, onDo, onClose }) {
  const t = sceneFor(station.label);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 92, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(2,1,6,0.7)", backdropFilter: "blur(4px)", animation: "mmFade .25s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", animation: "mmRise .35s cubic-bezier(.2,.8,.2,1)", border: `1px solid ${hexA(t.bg1, 0.5)}`, borderBottom: "none" }}>
        {/* themed scene header */}
        <div style={{ position: "relative", height: 180, background: `radial-gradient(220px 160px at 30% 20%, ${hexA(t.bg1, 0.5)}, transparent), radial-gradient(220px 180px at 80% 90%, ${hexA(t.bg2, 0.45)}, transparent), ${C.cardDeep}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {/* floating ambient particles */}
          {Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ position: "absolute", left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, fontSize: 10 + (i % 3) * 5, opacity: 0.35, animation: `mmFloat ${3 + (i % 3)}s ease-in-out ${i * 0.2}s infinite` }}>✦</div>)}
          <div style={{ fontSize: 64, filter: `drop-shadow(0 0 24px ${t.bg1})`, animation: "mmFloat 3s ease-in-out infinite" }}>{t.icon}</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: C.text, marginTop: 6 }}>{t.title}</div>
        </div>
        {/* body */}
        <div style={{ background: `linear-gradient(160deg, ${C.card}, ${C.cardDeep})`, padding: 22 }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 16, color: C.text, margin: "0 0 4px" }}>{t.line}</p>
          <p style={{ fontSize: 12, color: C.textDim, margin: "0 0 16px" }}>{station.label}</p>
          {station.done ? <p style={{ color: C.mint, fontSize: 13, textAlign: "center", padding: "10px 0" }}>✓ Done for today — come back tomorrow for more loot.</p> : <>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10, textAlign: "center" }}>+{XP.action} XP · +1 {milestone.unit || "progress"} · builds combo + streak</div>
            <NeonButton full accent={t.bg1} onClick={onDo}>⚡ Take this action</NeonButton>
          </>}
          <div style={{ textAlign: "center", marginTop: 10 }}><button onClick={onClose} style={{ ...xBtn, fontSize: 11 }}>leave room</button></div>
        </div>
      </div>
    </div>
  );
}

function ProgressPanel({ m, onSave, onProof, onClose }) {
  const [val, setVal] = useState(m.currentValue); const [proof, setProof] = useState(""); const [bump, setBump] = useState("");
  useEffect(() => setVal(m.currentValue), [m.currentValue]);
  return (
    <NeonCard accent={C.magenta} glow style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: C.magenta, fontFamily: "'JetBrains Mono', monospace" }}>PROGRESS STATION</div>
      <h3 style={{ ...h2, fontSize: 18 }}>Update Progress</h3>
      <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Set measured total ({m.unit || "units"})</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}><input type="number" value={val} onChange={(e) => setVal(e.target.value)} style={{ ...inputStyle, flex: 1 }} /><NeonButton small accent={C.cyan} onClick={() => onSave(val)}>Save</NeonButton></div>
      <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Log proof (+bump)</div>
      <textarea rows={2} value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Evidence of progress…" style={{ ...inputStyle, marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 8 }}><input type="number" value={bump} onChange={(e) => setBump(e.target.value)} placeholder={`+${m.unit || "units"}`} style={{ ...inputStyle, width: 110 }} /><div style={{ flex: 1 }} /><NeonButton small accent={C.mint} disabled={!proof.trim()} onClick={() => { onProof(proof.trim(), bump ? Number(bump) : 0); setProof(""); setBump(""); }}>Log proof</NeonButton></div>
      {m.proofLogs.length > 0 && <div style={{ marginTop: 12 }}>{m.proofLogs.slice().reverse().slice(0, 3).map((p) => <div key={p.id} style={{ ...chip, flexDirection: "column", alignItems: "flex-start", gap: 2 }}><span style={{ fontSize: 12 }}>{p.note}{p.value ? ` (+${p.value})` : ""}</span><span style={{ fontSize: 9, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{p.createdAt.slice(0, 10)}</span></div>)}</div>}
      <div style={{ marginTop: 8 }}><button onClick={onClose} style={{ ...xBtn, fontSize: 11 }}>close</button></div>
    </NeonCard>
  );
}
function ChestPanel({ r, onOpen, onClose }) {
  const color = REWARD_COLOR[r.category] || C.phoenix;
  return <NeonCard accent={color} glow style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, letterSpacing: 2, color, fontFamily: "'JetBrains Mono', monospace" }}>REWARD STATION</div>
    <h3 style={{ ...h2, fontSize: 18 }}>{r.title}</h3>
    <p style={{ fontSize: 12, color: C.textDim, marginTop: -4 }}>{cap(r.category)} · {r.description}</p>
    {r.status === "unlocked" ? <NeonButton full accent={color} onClick={onOpen}>Open chest</NeonButton> : r.status === "claimed" ? <p style={{ color: C.mint, fontSize: 13 }}>✅ Claimed.</p> : <p style={{ color: C.textDim, fontSize: 13 }}>🔒 Clear this level to unlock.</p>}
    <div style={{ marginTop: 8 }}><button onClick={onClose} style={{ ...xBtn, fontSize: 11 }}>close</button></div>
  </NeonCard>;
}

function Ascension({ game, formula, player }) { return <NeonCard accent={C.mint} glow style={{ marginBottom: 14, textAlign: "center" }}><div style={{ fontSize: 40 }}>👑</div><h2 style={h2}>Final Goal Ascended</h2><p style={{ color: C.textDim, fontSize: 13 }}>Every milestone conquered. The world is complete.</p><div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}><St v={player.xp} l="Total XP" /><St v={player.crystals} l="Crystals" /><St v={formula.milestones.length} l="Levels" /></div></NeonCard>; }
function St({ v, l }) { return <div><div style={{ fontSize: 20, fontWeight: 800, color: C.mint, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div><div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase" }}>{l}</div></div>; }

/* ===== cinematics ========================================================= */
function MilestoneCinematic({ fx, onClose }) {
  if (!fx) return null; const asc = fx.kind === "ascension";
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: `radial-gradient(600px 500px at 50% 45%, ${hexA(asc ? C.mint : C.hotPink, 0.3)}, rgba(2,1,6,0.92))`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "mmFade .35s ease" }}>
    <div style={{ position: "absolute", width: 4, height: 4 }}>{Array.from({ length: 16 }).map((_, i) => <div key={i} style={{ position: "absolute", width: 2, height: 170, background: `linear-gradient(${asc ? C.mint : C.hotPink}, transparent)`, transformOrigin: "top center", transform: `rotate(${(360 / 16) * i}deg)`, opacity: 0.5, animation: "mmRay 1.2s ease-out" }} />)}</div>
    <div style={{ position: "relative", textAlign: "center", maxWidth: 380 }}><div style={{ fontSize: 64, animation: "mmPop .6s cubic-bezier(.2,1.4,.4,1)" }}>{asc ? "👑" : "✦"}</div><h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, margin: "10px 0", color: "transparent", background: `linear-gradient(135deg, ${C.cyan}, ${C.hotPink})`, WebkitBackgroundClip: "text" }}>{asc ? "Final Goal Ascended" : "Milestone Defeated"}</h2><p style={{ color: C.text, fontSize: 14, lineHeight: 1.5 }}>{asc ? "You walked every inch of the map. The world is complete." : <>You cleared <strong>{fx.title}</strong>.{fx.reward ? <> Open its chest in the room or Vault.</> : null}</>}</p>{!asc && fx.next && <p style={{ fontSize: 12, color: C.cyan, fontFamily: "'JetBrains Mono', monospace" }}>NEXT LEVEL ACTIVE: {fx.next}</p>}<div style={{ marginTop: 18 }}><NeonButton accent={asc ? C.mint : C.hotPink} onClick={onClose}>{asc ? "Stand in it" : "Back to Journey World"}</NeonButton></div></div>
  </div>;
}
function ChestOpening({ chestFx, onClaim, onClose }) {
  const [stage, setStage] = useState(0);
  useEffect(() => { if (!chestFx) { setStage(0); return; } setStage(0); const t1 = setTimeout(() => setStage(1), 1100); const t2 = setTimeout(() => setStage(2), 1800); return () => { clearTimeout(t1); clearTimeout(t2); }; }, [chestFx]);
  if (!chestFx) return null; const r = chestFx.reward; const color = REWARD_COLOR[r.category] || C.phoenix; const icon = ASSET.chest[r.category];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 95, background: `radial-gradient(620px 520px at 50% 45%, ${hexA(color, 0.32)}, rgba(2,1,6,0.94))`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "mmFade .3s ease" }}>
      {stage >= 1 && <div style={{ position: "absolute", width: 4, height: 4 }}>{Array.from({ length: 20 }).map((_, i) => <div key={i} style={{ position: "absolute", width: 2, height: 240, background: `linear-gradient(${color}, transparent)`, transformOrigin: "top center", transform: `rotate(${(360 / 20) * i}deg)`, opacity: 0.6, animation: "mmRayBig 1.6s ease-out forwards" }} />)}</div>}
      {stage >= 2 && <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{Array.from({ length: 18 }).map((_, i) => <div key={i} style={{ position: "absolute", left: `${50 + Math.cos(i) * 30}%`, top: `${45 + Math.sin(i * 1.7) * 26}%`, fontSize: 12 + (i % 3) * 4, opacity: 0, animation: `mmSpark 1.4s ease-out ${i * 0.05}s forwards` }}>✦</div>)}</div>}
      <div style={{ position: "relative", textAlign: "center", maxWidth: 380 }}>
        <div style={{ fontSize: 84, animation: stage === 0 ? "mmShake .4s ease-in-out infinite" : stage === 1 ? "mmBlast .6s ease-out forwards" : "mmFloat 3s ease-in-out infinite", filter: `drop-shadow(0 0 24px ${hexA(color, 0.8)})` }}>{stage < 2 ? icon : "✨"}</div>
        {stage < 2 ? <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 3, color, marginTop: 16 }}>{stage === 0 ? "OPENING…" : "✦ ✦ ✦"}</p> : (
          <div style={{ animation: "mmRise .6s ease-out" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color, fontFamily: "'JetBrains Mono', monospace", marginTop: 8 }}>{cap(r.category)} REWARD UNLOCKED</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, margin: "8px 0", color: "transparent", background: `linear-gradient(135deg, ${color}, ${C.hotPink})`, WebkitBackgroundClip: "text" }}>{r.title}</h2>
            <p style={{ color: C.textDim, fontSize: 13 }}>Earned by clearing <strong style={{ color: C.text }}>{r.description}</strong></p>
            <p style={{ color: C.mint, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>+{CR.claimBonus} 💎 claim bonus</p>
            <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center" }}><NeonButton accent={color} onClick={() => onClaim(r.id)}>Claim it</NeonButton><NeonButton ghost accent={C.textDim} onClick={onClose}>Later</NeonButton></div>
            <p style={{ fontSize: 10, color: C.textDim, marginTop: 12, fontStyle: "italic" }}>Now go enjoy it. You earned this one for real.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Reward Vault ======================================================= */
function RewardVault({ engine }) {
  const { world, openChest } = engine; if (!world.game.unlocked) return <LockedTab label="The Vault fills as you defeat milestones." />;
  const rewards = world.formula.milestoneRewards; const unlocked = rewards.filter((r) => r.status === "unlocked");
  return <div><NeonCard accent={C.magenta} style={{ marginBottom: 14 }}><h2 style={h2}>Reward Vault</h2><p style={{ color: C.textDim, fontSize: 12, margin: 0 }}>Cleared a level? Tap its chest to open it.{unlocked.length ? ` ${unlocked.length} ready.` : ""}</p></NeonCard>{rewards.map((r) => <ChestCard key={r.id} r={r} onOpen={() => openChest(r.id)} />)}{!rewards.length && <EmptyHint text="No rewards yet — attach them in the Formula." />}</div>;
}
function ChestCard({ r, onOpen }) {
  const color = REWARD_COLOR[r.category] || C.phoenix;
  if (r.status === "locked") return <NeonCard accent={C.locked} style={{ marginBottom: 10, opacity: 0.6 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontSize: 28, filter: "grayscale(1)" }}>🔒</div><div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{r.title}</strong><div style={{ fontSize: 11, color: C.textDim }}>{cap(r.category)} · {r.description}</div><div style={{ fontSize: 10, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>Clear the level to open</div></div></div></NeonCard>;
  if (r.status === "claimed") return <NeonCard accent={C.mint} style={{ marginBottom: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontSize: 28 }}>✅</div><div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{r.title}</strong><div style={{ fontSize: 11, color: C.textDim }}>{cap(r.category)} · claimed</div>{r.claimedAt && <div style={{ fontSize: 10, color: C.mint, fontFamily: "'JetBrains Mono', monospace" }}>Claimed {r.claimedAt.slice(0, 10)}</div>}</div></div></NeonCard>;
  return <NeonCard accent={color} glow onClick={onOpen} style={{ marginBottom: 10, cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontSize: 30, animation: "mmShake 2.4s ease-in-out infinite", filter: `drop-shadow(0 0 10px ${hexA(color, 0.7)})` }}>{ASSET.chest[r.category]}</div><div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{r.title}</strong><div style={{ fontSize: 11, color: C.textDim }}>{cap(r.category)} · {r.description}</div><div style={{ fontSize: 10, color, fontFamily: "'JetBrains Mono', monospace" }}>● Ready to open</div></div><NeonButton small accent={color} onClick={(e) => { e.stopPropagation(); onOpen(); }}>Open</NeonButton></div></NeonCard>;
}

/* ===== Hall of Wins ======================================================= */
function HallOfWins({ engine }) {
  const { world, state } = engine; const { formula, game } = world;
  if (!game.unlocked) return <LockedTab label="Your trophies appear here as you win." />;
  const cleared = formula.milestones.filter((m) => m.status === "complete");
  const claimed = formula.milestoneRewards.filter((r) => r.status === "claimed");
  return (
    <div>
      <NeonCard accent={C.gold} glow style={{ marginBottom: 14, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(240px 160px at 50% 0%, ${hexA(C.gold, 0.2)}, transparent)`, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}><div style={{ fontSize: 36 }}>🏛️</div><h2 style={{ ...h2, marginBottom: 4 }}>Hall of Wins</h2><p style={{ color: C.textDim, fontSize: 12, margin: 0 }}>{formula.specificIntentions.goalName}</p><div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14 }}><St v={cleared.length} l="Levels won" /><St v={claimed.length} l="Rewards" /><St v={game.proofLogs.length} l="Proof" /></div></div>
      </NeonCard>
      {game.finalGoalComplete && <NeonCard accent={C.mint} glow style={{ marginBottom: 14, textAlign: "center" }}><div style={{ fontSize: 32 }}>👑</div><strong style={{ fontSize: 15, display: "block", marginTop: 4 }}>World Complete</strong></NeonCard>}
      <div style={{ fontSize: 11, letterSpacing: 2, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", margin: "4px 0 10px" }}>TROPHY SHELF</div>
      {cleared.length === 0 && <EmptyHint text="No wins yet. Go defeat a milestone — your first trophy lands here." />}
      {cleared.map((m, i) => { const reward = formula.milestoneRewards.find((r) => r.linkedMilestoneId === m.id); const color = REWARD_COLOR[reward?.category] || C.mint; return <Reveal key={m.id} delay={i * 40}><NeonCard accent={color} style={{ marginBottom: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ fontSize: 30, filter: `drop-shadow(0 0 8px ${hexA(color, 0.6)})` }}>{reward && reward.status === "claimed" ? ASSET.chest[reward.category] : "✦"}</div><div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{m.title}</strong><div style={{ fontSize: 11, color: C.textDim }}>{m.targetValue} {m.unit} · {m.difficulty}{m.completedAt ? ` · won ${m.completedAt.slice(0, 10)}` : ""}</div>{reward && <div style={{ fontSize: 11, color, marginTop: 2 }}>{reward.status === "claimed" ? `🎁 ${reward.title} — claimed` : reward.status === "unlocked" ? `🎁 ${reward.title} — ready` : ""}</div>}</div></div></NeonCard></Reveal>; })}
    </div>
  );
}

/* ===== Phase 8: Worlds picker ============================================= */
function WorldsScreen({ engine }) {
  const { state, switchWorld, newWorld, deleteWorld } = engine;
  return (
    <div>
      <NeonCard accent={C.phoenix} style={{ marginBottom: 14 }}><h2 style={h2}>Your Worlds</h2><p style={{ color: C.textDim, fontSize: 12, margin: 0 }}>Each goal is its own world with its own map. Switch anytime.</p></NeonCard>
      {state.worlds.map((w) => {
        const active = w.id === state.activeWorldId; const name = w.formula.specificIntentions.goalName || "Untitled world";
        const done = w.game.finalGoalComplete; const cleared = w.game.completedMilestoneIds.length; const total = w.formula.milestones.length;
        return <NeonCard key={w.id} accent={active ? C.cyan : done ? C.mint : C.locked} glow={active} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 26 }}>{done ? "👑" : w.game.unlocked ? "🗺️" : "⚗️"}</div>
            <div style={{ flex: 1 }}><strong style={{ fontSize: 14 }}>{name}{active ? " ·" : ""}{active && <span style={{ color: C.cyan, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}> ACTIVE</span>}</strong><div style={{ fontSize: 11, color: C.textDim }}>{w.game.unlocked ? `${cleared}/${total} levels${done ? " · complete" : ""}` : "Formula not built yet"}</div></div>
            {!active && <NeonButton small accent={C.cyan} onClick={() => switchWorld(w.id)}>Enter</NeonButton>}
            {state.worlds.length > 1 && <button onClick={() => { if (confirm(`Delete "${name}"?`)) deleteWorld(w.id); }} style={{ ...xBtn, fontSize: 14 }}>🗑️</button>}
          </div>
        </NeonCard>;
      })}
      <NeonButton full accent={C.mint} onClick={newWorld}>+ New World</NeonButton>
    </div>
  );
}

/* ===== HUD: StatBar + Nav ================================================= */
function StatBar({ player }) { const into = xpIntoLevel(player.xp); const stat = (icon, label, val, accent) => <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 18 }}>{icon}</div><div style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>{val}</div><div style={{ fontSize: 9, letterSpacing: 1, color: C.textDim, textTransform: "uppercase" }}>{label}</div></div>; return <NeonCard accent={C.cyan} style={{ padding: 16 }}><div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}><div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 20 }}>{avatarFor(player.level)}</div><div style={{ fontSize: 9, color: ASSET.auraByLevel(player.level), textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Hero</div></div>{stat("⚡", "Level", player.level, C.cyan)}{stat("💎", "Crystals", player.crystals, C.magenta)}{stat("🔥", "Streak", `${player.streak}d`, C.hotPink)}</div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textDim, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}><span>LVL {player.level}</span><span>{into} / 500 XP</span></div><ProgressBar value={into} max={500} accent={C.cyan} height={8} /></NeonCard>; }
function Nav({ tab, setTab, unlocked }) { const tabs = [{ id: "worlds", label: "Worlds", icon: "🌐", always: true }, { id: "formula", label: "Formula", icon: "⚗️", always: true }, { id: "journey", label: "Journey", icon: "🗺️" }, { id: "rewards", label: "Vault", icon: "💎" }, { id: "hall", label: "Hall", icon: "🏛️" }]; return <div style={{ display: "flex", gap: 6, marginTop: 16 }}>{tabs.map((t) => { const locked = !t.always && !unlocked; const active = tab === t.id; return <button key={t.id} onClick={() => !locked && setTab(t.id)} disabled={locked} style={{ flex: 1, padding: "10px 2px", borderRadius: 12, border: "none", cursor: locked ? "not-allowed" : "pointer", background: active ? `linear-gradient(135deg, ${C.phoenix}, ${C.magenta})` : "rgba(255,255,255,0.04)", boxShadow: active ? `0 0 16px ${hexA(C.magenta, 0.5)}` : "none", color: locked ? C.locked : C.text, opacity: locked ? 0.5 : 1 }}><div style={{ fontSize: 15 }}>{locked ? "🔒" : t.icon}</div><div style={{ fontSize: 8, letterSpacing: 1, textTransform: "uppercase", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{t.label}</div></button>; })}</div>; }

/* ===== GameShell / page =================================================== */
export default function MilestoneQuestPage() {
  const engine = useMilestoneGame();
  const { state, world, fx, loot, chestFx, burst, levelUp, clearFx, clearLoot, clearChestFx, clearBurst, clearLevelUp, confirmClaim, setSeenIntro, toggleMute, loadDemo } = engine;
  const [tab, setTab] = useState(world.formula.completed ? "journey" : "formula");
  const [showIntro, setShowIntro] = useState(!state.seenIntro && !world.formula.completed);
  const [levelId, setLevelId] = useState(null);
  useEffect(() => { if (world.formula.completed && tab === "formula") setTab("journey"); /* eslint-disable-next-line */ }, [world.formula.completed]);
  useEffect(() => { setLevelId(null); }, [state.activeWorldId]);
  const enterLevel = (id) => { setLevelId(id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const titles = { worlds: "Your Worlds", formula: "Build the Formula", journey: "Journey World", rewards: "Reward Vault", hall: "Hall of Wins" };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1200px 600px at 50% -10%, ${hexA(C.phoenix, 0.18)}, transparent), ${C.bg}`, color: C.text, fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,600;9..144,0,700;9..144,1,500&family=Inter+Tight:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes mmFade { from{opacity:0} to{opacity:1} }
        @keyframes mmFloat { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-6px) } }
        @keyframes mmPulse { 0%,100%{ transform:scale(1); opacity:.6 } 50%{ transform:scale(1.25); opacity:.9 } }
        @keyframes mmSpin { to { transform: rotate(360deg) } }
        @keyframes mmPop { 0%{ transform:scale(0); opacity:0 } 100%{ transform:scale(1); opacity:1 } }
        @keyframes mmRay { 0%{ opacity:.7; height:0 } 100%{ opacity:0; height:180px } }
        @keyframes mmRayBig { 0%{ opacity:.8; height:0 } 100%{ opacity:0; height:240px } }
        @keyframes mmLoot { 0%{ opacity:0; transform:translateX(-50%) translateY(20px) scale(.8) } 25%{ opacity:1; transform:translateX(-50%) translateY(0) scale(1) } 80%{ opacity:1 } 100%{ opacity:0; transform:translateX(-50%) translateY(-46px) scale(1) } }
        @keyframes mmShake { 0%,100%{ transform:rotate(-4deg) } 25%{ transform:rotate(4deg) } 50%{ transform:rotate(-3deg) } 75%{ transform:rotate(3deg) } }
        @keyframes mmBlast { 0%{ transform:scale(1) } 40%{ transform:scale(1.4) } 100%{ transform:scale(0); opacity:0 } }
        @keyframes mmRise { 0%{ opacity:0; transform:translateY(20px) } 100%{ opacity:1; transform:translateY(0) } }
        @keyframes mmSpark { 0%{ opacity:0; transform:scale(0) translateY(0) } 30%{ opacity:1; transform:scale(1) } 100%{ opacity:0; transform:scale(.6) translateY(-30px) } }
        @keyframes mmConfetti { 0%{ opacity:1; transform:translate(0,0) rotate(0) } 100%{ opacity:0; transform:translate(var(--tx),var(--ty)) rotate(220deg) } }
        * { -webkit-tap-highlight-color: transparent; }
        ::placeholder { color: ${C.locked}; }
        select option { background: ${C.cardDeep}; }
        @media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important } }
      `}</style>

      {showIntro && <GameIntro onEnter={() => { setShowIntro(false); setSeenIntro(); }} onDemo={() => { loadDemo(); setShowIntro(false); setTab("journey"); }} />}
      <MilestoneCinematic fx={fx} onClose={clearFx} />
      <ChestOpening chestFx={chestFx} onClaim={confirmClaim} onClose={clearChestFx} />
      <LootToast loot={loot} onDone={clearLoot} />
      <Confetti burst={burst} onDone={clearBurst} />
      <LevelUpFlash levelUp={levelUp} onDone={clearLevelUp} />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: C.hotPink, fontFamily: "'JetBrains Mono', monospace" }}>MILESTONE QUEST</div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, margin: 0, background: `linear-gradient(135deg, ${C.cyan}, ${C.hotPink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{levelId ? "Level Room" : titles[tab]}</h1>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={toggleMute} title="Sound" style={{ ...xBtn, fontSize: 15 }}>{state.muted ? "🔇" : "🔊"}</button>
            <button onClick={() => { if (confirm("Reset EVERYTHING (all worlds)?")) { engine.resetAll(); setShowIntro(true); setLevelId(null); setTab("formula"); } }} title="Reset" style={{ ...xBtn, fontSize: 15 }}>↻</button>
          </div>
        </div>
        <StatBar player={state.player} />
        {!levelId && <Nav tab={tab} setTab={setTab} unlocked={world.game.unlocked} />}
        <div style={{ marginTop: 16 }}>
          {levelId ? <LevelRoom engine={engine} milestoneId={levelId} onBack={() => setLevelId(null)} /> : <>
            {tab === "worlds" && <WorldsScreen engine={engine} />}
            {tab === "formula" && <FormulaGate engine={engine} />}
            {tab === "journey" && <JourneyWorld engine={engine} onEnterLevel={enterLevel} />}
            {tab === "rewards" && <RewardVault engine={engine} />}
            {tab === "hall" && <HallOfWins engine={engine} />}
          </>}
        </div>
        <p style={{ textAlign: "center", fontSize: 10, color: C.locked, marginTop: 28, fontFamily: "'JetBrains Mono', monospace" }}>v3 · QUICK PROGRESS · STATION ROOMS · TEMPLATES + AUTO-LEVELS</p>
      </div>
    </div>
  );
}
