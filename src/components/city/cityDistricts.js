// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — District registry (pure data + total progress readers)
// The open-world hub is a skyline of 16 districts across 6 quarters.
// Every readProgress(ctx) is a TOTAL function: it never throws, always
// returns { value: 0..1, label, detail, streak }. The ctx object is built
// by useCityProgress — every field is optional here.
// No React. No side effects. No storage access.
// ════════════════════════════════════════════════════════════════════════

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Wrap a reader so it can never throw and always returns a normalized shape.
function total(fn) {
  return function readProgress(ctx) {
    try {
      const r = fn(ctx || {}) || {};
      return {
        value: clamp01(r.value),
        label: typeof r.label === "string" ? r.label : "",
        detail: typeof r.detail === "string" ? r.detail : "",
        streak: Math.max(0, Math.round(num(r.streak))),
      };
    } catch {
      return { value: 0, label: "—", detail: "", streak: 0 };
    }
  };
}

/* ── Quarters ──────────────────────────────────────────────────────────── */

export const QUARTER_ORDER = ["quest", "core", "execution", "inner", "commons", "archive"];

export const QUARTER_META = {
  quest: {
    label: "THE SPIRE",
    accent: "#7B2CFF",
    blurb: "The tower at the center of everything — climb it and the whole city changes with you.",
  },
  core: {
    label: "NEON HEIGHTS",
    accent: "#00F0FF",
    blurb: "Identity, vision, training — the high ground where you decide who runs this city.",
  },
  execution: {
    label: "THE GRID",
    accent: "#00FFBF",
    blurb: "Missions, days, councils, spoils — where intention gets wired into infrastructure.",
  },
  inner: {
    label: "THE UNDERGLOW",
    accent: "#FF3EDB",
    blurb: "The under-city of shadow, pressure, and replenishment — real power is drawn from below.",
  },
  commons: {
    label: "THE COMMONS",
    accent: "#FACC15",
    blurb: "The shared plaza where fire is witnessed — guilds, partners, and the names on the wall.",
  },
  archive: {
    label: "THE ARCHIVE ROW",
    accent: "#D11EFF",
    blurb: "Quiet halls of formula and proof — the knowledge that outlasts the neon.",
  },
};

/* ── Districts ─────────────────────────────────────────────────────────── */

export const DISTRICTS = [
  // ── THE SPIRE ───────────────────────────────────────────────────────────
  {
    id: "alchemist-spire",
    name: "Alchemist Spire",
    sublabel: "The Inner Alchemist",
    quarter: "quest",
    icon: "◈",
    color: "#7B2CFF",
    glow: "rgba(123, 44, 255, 0.38)",
    action: { type: "quest" },
    lore:
      "The Spire predates the grid — a needle of black glass that hums when a seeker walks its stairs. Twenty chambers rise inside it, each one holding a question you have been avoiding. The city's lights answer to whoever climbs.",
    position: { x: 46, w: 9, h: 5 },
    readProgress: total((ctx) => {
      const q = ctx.quest || {};
      const totalCh = Math.max(1, Math.round(num(q.total)) || 20);
      const completed = Math.max(0, Math.min(totalCh, Math.round(num(q.completed))));
      const active = Math.max(1, Math.min(totalCh, Math.round(num(q.activeChapter)) || 1));
      const doneAll = completed >= totalCh;
      return {
        value: completed / totalCh,
        label: `${completed}/${totalCh} chapters`,
        detail: doneAll ? "The Great Work is complete" : `Ch.${active} active`,
        streak: 0,
      };
    }),
  },

  // ── NEON HEIGHTS ────────────────────────────────────────────────────────
  {
    id: "identity-forge",
    name: "Identity Forge",
    sublabel: "Who you're becoming",
    quarter: "core",
    icon: "⟁",
    color: "#D11EFF",
    glow: "rgba(209, 30, 255, 0.35)",
    action: { type: "navigate", route: "identity" },
    lore:
      "Down in the Forge, old names are melted for parts. Each rule you write is hammered into the frame of the person who replaces you. The smiths here do not ask who you were — only what you are willing to hold to.",
    position: { x: 18.5, w: 5, h: 3 },
    readProgress: total((ctx) => {
      const identity = ctx.identity || {};
      const rules = Array.isArray(identity.rules) ? identity.rules.length : 0;
      const capped = Math.min(rules, 5);
      const hasPower =
        typeof identity.powerStatement === "string" && identity.powerStatement.trim().length > 0;
      return {
        value: (capped + (hasPower ? 1 : 0)) / 6,
        label: `${capped}/5 rules`,
        detail: hasPower ? "Power statement forged" : "Forge your power statement",
        streak: 0,
      };
    }),
  },
  {
    id: "vision-tower",
    name: "Vision Tower",
    sublabel: "See it before it's real",
    quarter: "core",
    icon: "✦",
    color: "#00F0FF",
    glow: "rgba(0, 240, 255, 0.35)",
    action: { type: "navigate", route: "vision" },
    lore:
      "Every window in the Tower shows a different tomorrow, projected so sharply your nervous system files it as memory. The keepers say a future hung in the glass long enough stops being a picture. It becomes a debt the present has to pay.",
    position: { x: 13, w: 5, h: 4 },
    readProgress: total((ctx) => {
      const n = Array.isArray(ctx.visionBoard) ? ctx.visionBoard.length : 0;
      return {
        value: Math.min(n / 6, 1),
        label: `${n}/6 visions`,
        detail:
          n === 0
            ? "The tower stands dark"
            : n >= 6
              ? "Every window burns"
              : "Hang more futures in the glass",
        streak: 0,
      };
    }),
  },
  {
    id: "the-academy",
    name: "The Academy",
    sublabel: "The 5 Shifts",
    quarter: "core",
    icon: "✶",
    color: "#FF3EDB",
    glow: "rgba(255, 62, 219, 0.35)",
    action: { type: "navigate", route: "training" },
    lore:
      "Five lecture halls, five rewrites of your operating system. The Academy doesn't teach you new tricks — it swaps the machinery that runs the old ones. Graduates walk out moving at a different frame rate.",
    position: { x: 24, w: 5, h: 2 },
    readProgress: total((ctx) => {
      const s = ctx.shifts || {};
      const totalShifts = Math.max(1, Math.round(num(s.total)) || 5);
      const completed = Math.max(0, Math.min(totalShifts, Math.round(num(s.completed))));
      return {
        value: completed / totalShifts,
        label: `${completed}/${totalShifts} shifts`,
        detail:
          completed >= totalShifts
            ? "Operating system rewritten"
            : completed === 0
              ? "Enrollment is open"
              : "Next shift awaits",
        streak: 0,
      };
    }),
  },

  // ── THE GRID ────────────────────────────────────────────────────────────
  {
    id: "war-rooms",
    name: "The War Rooms",
    sublabel: "Projects & milestones",
    quarter: "execution",
    icon: "⚑",
    color: "#FF3B5C",
    glow: "rgba(255, 59, 92, 0.35)",
    action: { type: "navigate", route: "milestones" },
    lore:
      "Holo-tables burn all night in the War Rooms, each one a campaign mapped in light. Strategy is cheap in this city; the tables only respect coordinates with dates on them. Cross a milestone off and somewhere a door you couldn't see unlocks.",
    position: { x: 35, w: 5, h: 4 },
    readProgress: total((ctx) => {
      const overall = Math.max(0, Math.min(100, num(ctx.overallProgress)));
      const act = Math.max(0, Math.round(num(ctx.activeProjectCount)));
      return {
        value: overall / 100,
        label: `${overall}% mapped`,
        detail: `${act} active ${act === 1 ? "campaign" : "campaigns"}`,
        streak: 0,
      };
    }),
  },
  {
    id: "daily-nexus",
    name: "Daily Nexus",
    sublabel: "Top Five command post",
    quarter: "execution",
    icon: "✹",
    color: "#00FFBF",
    glow: "rgba(0, 255, 191, 0.35)",
    action: { type: "navigate", route: "daily" },
    lore:
      "The Nexus resets at dawn, five empty slots glowing over the plaza. Every task you close is a vote cast for the person you are becoming, counted in public light. The city keeps the tally even when you don't.",
    position: { x: 29.5, w: 5, h: 2 },
    readProgress: total((ctx) => {
      const t = ctx.today || {};
      const done = Math.max(0, Math.round(num(t.done)));
      const totalT = Math.max(0, Math.round(num(t.total)));
      return {
        value: totalT > 0 ? done / totalT : 0,
        label: `${done}/${totalT || 5} today`,
        detail:
          totalT === 0
            ? "No Top Five set yet"
            : done >= totalT
              ? "Day conquered"
              : "Missions on the board",
        streak: num(ctx.dailyStreakLocal),
      };
    }),
  },
  {
    id: "war-council",
    name: "War Council",
    sublabel: "Weekly review",
    quarter: "execution",
    icon: "⚖",
    color: "#00F0FF",
    glow: "rgba(0, 240, 255, 0.35)",
    action: { type: "navigate", route: "weekly" },
    lore:
      "Once a week the Council convenes above the Grid to weigh receipts against promises. No blame is spoken in that chamber — only evidence, and what the next seven days will be built from. Empires in this city are audited into existence.",
    position: { x: 40.5, w: 5, h: 3 },
    readProgress: total((ctx) => {
      const rs = Math.max(0, Math.round(num(ctx.reviewStreak)));
      const count = Array.isArray(ctx.weeklyReviews) ? ctx.weeklyReviews.length : 0;
      return {
        value: Math.min(rs / 4, 1),
        label: `${Math.min(rs, 4)}/4 week streak`,
        detail:
          count === 0
            ? "The council has not met"
            : `${count} ${count === 1 ? "review" : "reviews"} on record`,
        streak: rs,
      };
    }),
  },
  {
    id: "the-vault",
    name: "The Vault",
    sublabel: "Rewards earned",
    quarter: "execution",
    icon: "❖",
    color: "#FACC15",
    glow: "rgba(250, 204, 21, 0.35)",
    action: { type: "navigate", route: "rewards" },
    lore:
      "The Vault holds nothing you didn't put there. Every reward inside was minted by a promise you kept, and its doors read progress instead of keys. Discipline is the only currency this bank has ever accepted.",
    position: { x: 55.8, w: 5, h: 3 },
    readProgress: total((ctx) => {
      const r = ctx.rewards || {};
      const claimed = Math.max(0, Math.round(num(r.claimed)));
      const unlocked = Math.max(claimed, Math.round(num(r.unlocked)));
      const waiting = unlocked - claimed;
      return {
        value: unlocked > 0 ? claimed / unlocked : 0,
        label: `${claimed}/${unlocked} claimed`,
        detail:
          unlocked === 0
            ? "No rewards unlocked yet"
            : waiting > 0
              ? `${waiting} waiting inside`
              : "Vault settled — go earn more",
        streak: 0,
      };
    }),
  },

  // ── THE UNDERGLOW ───────────────────────────────────────────────────────
  {
    id: "shadow-sanctum",
    name: "Shadow Sanctum",
    sublabel: "The Descent",
    quarter: "inner",
    icon: "☽",
    color: "#D11EFF",
    glow: "rgba(209, 30, 255, 0.35)",
    action: { type: "navigate", route: "essence" },
    lore:
      "Below the lowest rail line, the Sanctum keeps the masks you swore you never wore. Each descent trades a story that ran you in the dark for the essence it was hiding. What you bring back up glows brighter than anything sold on the surface.",
    position: { x: 61.3, w: 6, h: 4 },
    readProgress: total((ctx) => {
      const s = ctx.shadow || {};
      const e = Math.max(0, Math.round(num(s.essences)));
      return {
        value: Math.min(e / 5, 1),
        label: `${e}/5 essences`,
        detail:
          e >= 5
            ? "The gallery is whole"
            : e === 0
              ? "The descent awaits"
              : "Essences recovered from the dark",
        streak: num(s.streak),
      };
    }),
  },
  {
    id: "pressure-forge",
    name: "Pressure Forge",
    sublabel: "Anger Gym",
    quarter: "inner",
    icon: "⚒",
    color: "#FFB000",
    glow: "rgba(255, 176, 0, 0.35)",
    action: { type: "navigate", route: "anger" },
    lore:
      "Steam vents scream over the anvils where the city sends its heat to be worked. Rage arrives raw and leaves as load-bearing steel — the same fire, given a shape that can carry weight. The smiths call it the honest furnace: it burns exactly what you feed it.",
    position: { x: 67.8, w: 5, h: 3 },
    readProgress: total((ctx) => {
      const f = ctx.forge || {};
      const t = Math.max(0, Math.round(num(f.totalForged)));
      return {
        value: Math.min(t / 25, 1),
        label: `${t}/25 forged`,
        detail:
          t === 0
            ? "The anvil is cold"
            : t >= 25
              ? "Master of the forge"
              : "Pressure becoming power",
        streak: num(f.streak),
      };
    }),
  },
  {
    id: "cup-springs",
    name: "The Cup Springs",
    sublabel: "Fill Your Cup",
    quarter: "inner",
    icon: "🜄",
    color: "#00F0FF",
    glow: "rgba(0, 240, 255, 0.35)",
    action: { type: "navigate", route: "wellbeing" },
    lore:
      "Under the neon there is water, and the Springs meter it out one honest cup at a time. The city runs on people who forget they are wells, not pipelines. Those who stop to refill walk back up carrying light the grid can't sell.",
    position: { x: 73.3, w: 5, h: 1 },
    readProgress: total((ctx) => {
      const c = ctx.cup || {};
      if (!c.visited) {
        return { value: 0, label: "Untapped", detail: "The springs wait beneath the city", streak: 0 };
      }
      const pct = Math.max(0, Math.min(100, Math.round(num(c.pct))));
      return {
        value: pct / 100,
        label: `${pct}% full today`,
        detail:
          pct >= 100
            ? "Cup overflowing"
            : pct === 0
              ? "Pour something back in"
              : "Filling steadily",
        streak: num(c.streak),
      };
    }),
  },
  {
    id: "blaze-lab",
    name: "B.L.A.Z.E. Lab",
    sublabel: "Execution engine",
    quarter: "inner",
    icon: "🜂",
    color: "#FF3EDB",
    glow: "rgba(255, 62, 219, 0.35)",
    action: { type: "navigate", route: "blaze" },
    lore:
      "Behind blast doors, the Lab tunes the five-cylinder engine — Being, Leadership, Alignment, Zeal, Execution. Nothing in here is theory; every module is torqued against your actual week. When the engine catches, the whole district hears it.",
    position: { x: 78.8, w: 5, h: 3 },
    readProgress: total((ctx) => {
      const b = ctx.blaze || {};
      const done = Math.max(0, Math.round(num(b.done)));
      if (!b.visited && done === 0) {
        return { value: 0, label: "Sealed", detail: "The lab door hasn't opened yet", streak: 0 };
      }
      return {
        value: Math.min(done / 10, 1),
        label: `${Math.min(done, 10)}/10 modules`,
        detail: done >= 10 ? "Engine at full burn" : "Systems coming online",
        streak: 0,
      };
    }),
  },

  // ── THE COMMONS ─────────────────────────────────────────────────────────
  {
    id: "guild-quarter",
    name: "Guild Quarter",
    sublabel: "The Accountability Zone",
    quarter: "commons",
    icon: "⚭",
    color: "#FFB000",
    glow: "rgba(255, 176, 0, 0.35)",
    action: { type: "navigate", route: "zone" },
    lore:
      "The Quarter runs on witnessed fire: proof posted, streaks tended, partners holding the line for each other. Alone, a flame is a rumor; here it is a record. The braziers only stay lit for people who keep showing up.",
    position: { x: 84.3, w: 5, h: 4 },
    readProgress: total((ctx) => {
      const z = ctx.zone;
      if (!z) return { value: 0, label: "Offline", detail: "Connection required", streak: 0 };
      const zs = Math.max(0, Math.round(num(z.zone_streak)));
      return {
        value: Math.min(zs / 7, 1),
        label: `${zs}-day fire`,
        detail:
          zs === 0
            ? "Post proof to light the fire"
            : zs >= 7
              ? "The quarter blazes"
              : "The guild sees your fire",
        streak: zs,
      };
    }),
  },
  {
    id: "hall-of-champions",
    name: "Hall of Champions",
    sublabel: "Weekly fire board",
    quarter: "commons",
    icon: "♛",
    color: "#FACC15",
    glow: "rgba(250, 204, 21, 0.35)",
    action: { type: "panel", panel: "champions" },
    lore:
      "Names burn on the Hall's long wall, ranked not by talent but by attendance to their own word. Every week the wall resets and asks the same question: who showed up. Consistency is the only crown this city recognizes.",
    position: { x: 89.8, w: 5, h: 2 },
    readProgress: total((ctx) => {
      const z = ctx.zone;
      if (!z) return { value: 0, label: "Offline", detail: "Connection required", streak: 0 };
      if (z.consistencyPct == null || !Number.isFinite(Number(z.consistencyPct))) {
        return {
          value: 0,
          label: "No board yet",
          detail: "Show up — the hall records everything",
          streak: 0,
        };
      }
      const pct = Math.max(0, Math.min(100, Math.round(num(z.consistencyPct))));
      return {
        value: pct / 100,
        label: `${pct}% consistency`,
        detail: pct >= 85 ? "Your name burns on the wall" : "This week's showing, witnessed",
        streak: 0,
      };
    }),
  },

  // ── THE ARCHIVE ROW ─────────────────────────────────────────────────────
  {
    id: "formula-athenaeum",
    name: "Formula Athenaeum",
    sublabel: "The Formula",
    quarter: "archive",
    icon: "∴",
    color: "#D11EFF",
    glow: "rgba(209, 30, 255, 0.35)",
    action: { type: "navigate", route: "formula" },
    lore:
      "Shelved in the Athenaeum is the method itself — the sequence beneath every transformation the city has witnessed. It reads differently each visit, because the reader keeps changing. The librarians insist that is the entire point.",
    position: { x: 2, w: 5, h: 1 },
    readProgress: total((ctx) => {
      const v = ctx.visited || {};
      const visited = Boolean(v["formula-athenaeum"] || v.formula);
      return {
        value: visited ? 1 : 0,
        label: visited ? "Studied" : "Unopened",
        detail: visited
          ? "The formula is in your hands"
          : "Ancient method, untouched shelves",
        streak: 0,
      };
    }),
  },
  {
    id: "observatory",
    name: "The Observatory",
    sublabel: "The science",
    quarter: "archive",
    icon: "◉",
    color: "#00F0FF",
    glow: "rgba(0, 240, 255, 0.35)",
    action: { type: "navigate", route: "science" },
    lore:
      "The Observatory's great lens is not aimed at the sky — it is aimed at behavior, and the evidence is stacked to the dome. Studies, effect sizes, mechanisms: proof that none of this is magic. Which, the keepers note, is what makes it dependable.",
    position: { x: 7.5, w: 5, h: 3 },
    readProgress: total((ctx) => {
      const v = ctx.visited || {};
      const visited = Boolean(v.observatory || v.science);
      return {
        value: visited ? 1 : 0,
        label: visited ? "Observed" : "Dark lens",
        detail: visited
          ? "You've seen the proof"
          : "The evidence waits under the dome",
        streak: 0,
      };
    }),
  },
];

/* ── Glow state ────────────────────────────────────────────────────────── */

// dim → the district sleeps · lit → activity detected · radiant → near-mastery
export function getGlowState(progress) {
  const p = progress || {};
  const value = clamp01(p.value);
  const streak = num(p.streak);
  if (value >= 0.85) return "radiant";
  if (value > 0 || streak >= 1) return "lit";
  return "dim";
}
