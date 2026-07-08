import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useGamification } from "../../hooks/useGamification.js";
import { XP_VALUES, RANKS } from "../../lib/gamification.js";
import { MentorSprite } from "../map-quest/kit.jsx";
import PendantHUD from "../map-quest/PendantHUD.jsx";
import WorldAtlas from "../map-quest/WorldAtlas.jsx";
import WorldScene from "./world/WorldScene.jsx";
import { buildCityWorld, STORY_ORDER } from "./cityWorld.js";
import useJourney from "./useJourney.js";
import HometownJourney from "./hometown/HometownJourney.jsx";
import SpireIgnition from "./SpireIgnition.jsx";
import { markIgnitionSeen, litDistrictIds } from "./journeyStore.js";
import useCinematics from "./useCinematics.js";
import { getDailyEvent, getDailySparks, getStreetFinds } from "./world/streetEvents.js";
import {
  collectSpark,
  sparksCollectedToday,
  markSecret,
  addOdometer,
  hasMilestone,
  loadStreet,
} from "./streetStore.js";
import { todayKey } from "./world/daySeed.js";
import { REWARD } from "./world/worldFxTuning.js";
import CitizenCard from "./CitizenCard.jsx";
import CityPlaza from "./CityPlaza.jsx";
import HallOfChampions from "./HallOfChampions.jsx";
import DistrictCard from "./DistrictCard.jsx";
import DistrictSheet from "./DistrictSheet.jsx";
import MentorDialog from "./MentorDialog.jsx";
import useCityProgress from "./useCityProgress.js";
import useCitySocial from "./useCitySocial.js";
import { QUARTER_ORDER, QUARTER_META, DISTRICTS } from "./cityDistricts.js";
import { MENTORS, THE_GUIDE, getDailyGuideLesson, getSpireCloser } from "./cityMentors.js";
import { getCityStage, getTimeOfDay } from "./cityAtmosphere.js";
import {
  recordVisit,
  recordDistrictVisit,
  hasVisitedAll,
  recordMentorLesson,
} from "./cityStore.js";
import MaskBattle from "./masks/MaskBattle.jsx";
import MaskCodex from "./masks/MaskCodex.jsx";
import MaskCourtFinale from "./masks/MaskCourtFinale.jsx";
import useMasks from "./masks/useMasks.js";
import useEncounterEngine from "./masks/useEncounterEngine.js";
import StoryDialog from "./StoryDialog.jsx";
import {
  getBoss,
  getBossForZone,
  XP_PER_WILD,
  XP_PER_BOSS,
  XP_COURT,
} from "./masks/maskBosses.js";
import { getCritic } from "./masks/wildCritics.js";
import { getEssence } from "./masks/essences.js";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import "../../styles/city.css";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — the living open-world hub
// One city, sixteen districts, every district a real feature. The street
// is walkable now: your Seeker walks it end to end, the camera follows,
// the buildings glow with your actual progress, your people stand in the
// plaza, and every district's mentor teaches the lesson that ends where
// the work begins.
// Canonical home: the City tab inside the Accountability Zone (embedded).
// Also mounted standalone at nav keys "city" / "openworld".
// ════════════════════════════════════════════════════════════════════════

const ALL_DISTRICT_IDS = DISTRICTS.map((d) => d.id);

const POSITION_KEY = "mqw_pos_v1";
const GATES_SPAWN_X = 210; // arriving from the hometown, you enter at the gates

function loadSavedX() {
  try {
    const raw = sessionStorage.getItem(POSITION_KEY);
    const n = Number(raw);
    return raw != null && Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

// Dev fast-path into a mask fight: ?maskfight=broke-king | wild:snooze |
// relapse:broke-king. Invalid ids are ignored.
function parseDevFight() {
  try {
    const v = new URLSearchParams(window.location.search).get("maskfight");
    if (!v) return null;
    if (v.startsWith("wild:")) {
      return getCritic(v.slice(5)) ? { type: "wild", id: v.slice(5) } : null;
    }
    if (v.startsWith("relapse:")) {
      return getBoss(v.slice(8)) ? { type: "relapse", id: v.slice(8) } : null;
    }
    return getBoss(v) ? { type: "boss", id: v } : null;
  } catch {
    return null;
  }
}

export default function MapQuestCityPage({
  onNavigate,
  onOpenProject, // reserved for future district deep-links
  onOpenMapQuest,
  embedded = false,
}) {
  const { addXP, unlockAchievement, celebrate, settings } = useAppData();
  const { rank } = useGamification();
  const social = useCitySocial();
  const { ctx, districts, cityPulse, litCount, radiantCount } = useCityProgress(social);

  const [selected, setSelected] = useState(null); // district in the sheet
  const [hallOpen, setHallOpen] = useState(false);
  const [lesson, setLesson] = useState(null); // { mentor, district }
  const [ignition, setIgnition] = useState(false); // GATE 2 cinematic
  const [battle, setBattle] = useState(parseDevFight); // mask encounter overlay
  const [framing, setFraming] = useState(null); // one-time Guide consent beat
  const [streetToast, setStreetToast] = useState(null); // boss materialization
  const [codexOpen, setCodexOpen] = useState(false); // the Mask Codex panel
  const [courtFinale, setCourtFinale] = useState(false); // fifth evolution
  const fxApi = useRef(null); // Living City — imperative scene FX handle
  const cine = useCinematics(fxApi, { guideColor: THE_GUIDE.color }); // Phase 7

  // ── The Mask Court (Pokémon encounter layer) ────────────────────────────
  const masks = useMasks();
  const evolvedAllies = Object.keys(masks.integrated).map((id) => {
    const ess = getEssence(masks.integrated[id]?.essence);
    return { bossId: id, essenceColor: ess ? ess.color : "#3f8cff" };
  });
  const battleAllies = evolvedAllies.filter((a) => !battle || a.bossId !== battle.id);

  // Proof Lock → "make it today's mission" (Top Five has room for 5)
  const { todayLog, addTopFiveTask } = useDailyLog();
  const handleMakeMission = (proofText) => {
    const text = String(proofText || "").trim();
    const tasks = (todayLog && todayLog.topFive) || [];
    if (!text || tasks.length >= 5) return false;
    addTopFiveTask(text);
    return true;
  };

  const handleBattleComplete = (result) => {
    if (result.type === "wild") {
      masks.recordWildWin(result.id, result.fear);
      const critic = getCritic(result.id);
      addXP(XP_PER_WILD, `Named ${critic ? critic.name : "a wild critic"}`);
    } else if (result.type === "boss") {
      const { firstEver, firstCourt } = masks.recordIntegration(result.id, {
        essence: result.essenceId,
        proof: result.proof,
        fears: result.fears,
      });
      const b = getBoss(result.id);
      if (firstEver && b) {
        addXP(XP_PER_BOSS, `${b.evolved.name} joins your court`);
        unlockAchievement(`mask_evolved_${result.id}`);
      }
      if (firstCourt) {
        addXP(XP_COURT, "THE COURT IS YOURS");
        unlockAchievement("mask_court_sovereign");
        setCourtFinale(true);
      }
    } else if (result.type === "relapse") {
      masks.recordRelapseWin(result.id, result.fear);
      addXP(XP_PER_WILD, "Old voice re-named");
    }
    setBattle(null);
    engine.clearEncounter();
  };

  const handleBattleWalkAway = () => {
    masks.recordWalkAway();
    setBattle(null);
    engine.clearEncounter();
  };

  // ── The journey — LIT tutorial chain (new citizens only) ────────────────
  const journey = useJourney(districts, {
    onPowerOn: (id) => {
      const d = DISTRICTS.find((x) => x.id === id);
      if (!d) return;
      // the directed shot: letterbox → pan → eruption → title card — then
      // the celebration toast rides in after the camera work (Phase 7)
      cine.powerOn({ id: d.id, name: d.name, color: d.color }).then(() => {
        celebrate({
          variant: "project",
          title: `${d.name.toUpperCase()} POWERS ON`,
          subtitle: "A new district joins the grid.",
          detail: "The city grows as you do.",
        });
      });
    },
    onLit: (id) => {
      const d = DISTRICTS.find((x) => x.id === id);
      if (!d) return;
      if (fxApi.current) fxApi.current.erupt(id); // LIT — full eruption
      addXP(XP_VALUES.mentorLesson || 10, `${d.name} lit`);
      celebrate({
        variant: "project",
        title: `${d.name.toUpperCase()} — LIT`,
        subtitle: "Lesson heard. First real move made.",
        detail: "The Spire is watching the lights come on.",
      });
    },
    onSpireOpen: () => {
      addXP(XP_VALUES.cityFirstVisit || 25, "GATE 2 — the Spire opens");
      unlockAchievement("spire_open");
      // the city salutes first: pan to the Spire, every lit beacon answers
      // in story order — THEN the ignition overlay (Phase 7)
      const litSet = new Set(litDistrictIds());
      const litInOrder = STORY_ORDER.filter((sid) => litSet.has(sid));
      cine.spireSalute(world, litInOrder).then(() => setIgnition(true));
    },
  });

  const journeyDistricts = districts.map((d) => ({
    ...d,
    locked: !journey.isUnlocked(d.id),
    next: journey.nextStopId === d.id,
    sealed: d.id === "alchemist-spire" && !journey.spireOpen,
  }));

  const reducedMotion = useMemo(() => {
    if (settings && settings.reducedMotion) return true;
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }, [settings]);

  const rankIndex = Math.max(
    0,
    RANKS.findIndex((r) => r.name === ((rank && rank.name) || RANKS[0].name))
  );
  const stage = getCityStage(rankIndex);
  const timeOfDay = getTimeOfDay();

  // ── Arrival rewards (idempotent via cityStore) ──────────────────────────
  // Only fires once the journey is actually in the city — a new citizen in
  // the hometown hasn't arrived yet.
  const arrivalFired = useRef(false);
  useEffect(() => {
    if (arrivalFired.current || journey.world !== "city") return;
    arrivalFired.current = true;
    const { firstVisit, newDay } = recordVisit();
    if (firstVisit) {
      addXP(XP_VALUES.cityFirstVisit, "First steps into Milestone City");
      unlockAchievement("city_arrival");
      celebrate({
        variant: "project",
        title: "WELCOME TO MILESTONE CITY",
        subtitle: "Every feature is a district. Every district is your life.",
        detail: "The city grows as you do.",
      });
    } else if (newDay) {
      addXP(XP_VALUES.cityDailySweep, "The city stirs as you return");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.world]);

  // ── Interactions ────────────────────────────────────────────────────────
  const openDistrict = (district) => {
    if (!district) return;
    recordDistrictVisit(district.id);
    if (hasVisitedAll(ALL_DISTRICT_IDS)) unlockAchievement("city_all_districts");
    setSelected(district);
  };

  const openDistrictById = (id) => {
    openDistrict(journeyDistricts.find((d) => d.id === id) || null);
  };

  const enterDistrict = (district) => {
    if (!district) return;
    setSelected(null);
    setLesson(null);
    const action = district.action || {};
    if (action.type === "quest") {
      if (onOpenMapQuest) onOpenMapQuest();
      else if (onNavigate) onNavigate("milestones");
      return;
    }
    if (action.type === "panel") {
      setHallOpen(true);
      if (social.online && social.leaderboard.length > 0) {
        unlockAchievement("hall_of_champions");
      }
      return;
    }
    if (action.type === "navigate" && action.route && onNavigate) {
      onNavigate(action.route);
    }
  };

  const hearLesson = (district) => {
    const mentor = MENTORS[district && district.id];
    if (!mentor) return;
    // Every lesson ends where the story begins: a closing beat that ties
    // this feature to the Spire (see SPIRE_CLOSERS in cityMentors.js).
    const closer = getSpireCloser(district.id);
    const withCloser =
      closer && mentor.lesson && Array.isArray(mentor.lesson.beats)
        ? {
            ...mentor,
            lesson: {
              ...mentor.lesson,
              beats: [
                ...mentor.lesson.beats,
                { speaker: mentor.name, lines: [closer] },
              ],
            },
          }
        : mentor;
    setLesson({ mentor: withCloser, district });
  };

  const finishLesson = (mentor) => {
    if (!mentor) return;
    const { firstEver, firstToday, heardCount } = recordMentorLesson(mentor.id);
    if (firstToday) {
      const amount = (mentor.lesson && mentor.lesson.xp) || XP_VALUES.mentorLesson;
      addXP(amount, `Lesson from ${mentor.name}`);
    }
    if (firstEver) unlockAchievement("first_lesson");
    if (heardCount >= 8) unlockAchievement("city_scholar");
    journey.refresh(); // the LIT engine sees the lesson immediately
  };

  // ── The Guide's daily pointer ───────────────────────────────────────────
  const guide = getDailyGuideLesson(new Date(), ALL_DISTRICT_IDS);
  const guideDistrict = journeyDistricts.find((d) => d.id === guide.districtId) || null;

  // ── Locked-sheet context ────────────────────────────────────────────────
  const selectedLocked = Boolean(selected && !journey.isUnlocked(selected.id));
  const selectedStoryIdx = selected ? STORY_ORDER.indexOf(selected.id) : -1;
  const selectedPrev =
    selectedStoryIdx > 0
      ? journeyDistricts.find((d) => d.id === STORY_ORDER[selectedStoryIdx - 1]) || null
      : null;

  // ── The walkable street ─────────────────────────────────────────────────
  // Every district's Guide stands beside their door — the tutorial teachers.
  const doorMentors = {};
  for (const d of journeyDistricts) {
    const m = MENTORS[d.id];
    if (m) doorMentors[d.id] = { name: m.name, color: m.color };
  }
  const world = buildCityWorld(journeyDistricts, {
    guideName: THE_GUIDE.name,
    guideColor: THE_GUIDE.color,
    mentors: doorMentors,
  });
  const [citySpawnX, setCitySpawnX] = useState(() => loadSavedX());
  const scenePaused = Boolean(selected || hallOpen || lesson || ignition || battle || framing);

  // ── Wild ambush engine (rides the walk loop's stride hook) ──────────────
  const encounterEnabled =
    journey.world === "city" &&
    !scenePaused &&
    !masks.encountersOff &&
    !masks.isSessionSnoozed();

  const engine = useEncounterEngine({
    maskDens: world.maskDens || [],
    spawnX: typeof citySpawnX === "number" ? citySpawnX : world.spawnX,
    enabled: encounterEnabled,
    isNight: timeOfDay.key === "night",
    hasEverAmbushed: (masks.state.stats.ambushes || 0) > 0,
    relapsePool: masks.relapseEligibleBossIds(),
    onEncounter: (enc) => {
      masks.recordAmbush();
      if (!masks.firstFramingSeen) setFraming(enc);
      else setBattle(enc);
    },
  });

  // ── Living City rewards (Phase 9): sparks, finds, odometer, event ───────
  const streetDay = todayKey();
  const nextStopB = world.buildings.find((b) => b.id === journey.nextStopId);
  const sparksData = useMemo(
    () => getDailySparks(world.width, { litFrontierX: nextStopB ? nextStopB.x : 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [world.width, journey.nextStopId, streetDay]
  );
  const [collected, setCollected] = useState(() => sparksCollectedToday());
  const [foundSecretIds, setFoundSecretIds] = useState(() => Object.keys(loadStreet().secrets));
  const [boots, setBoots] = useState(() => hasMilestone("street_25k"));
  const streetFinds = useMemo(() => getStreetFinds(world), [world]);

  const handleCollectSpark = (i) => {
    const { firstTime, count, sweep } = collectSpark(i, sparksData.count, streetDay);
    if (!firstTime) return;
    setCollected((c) => [...c, i]);
    addXP(REWARD.sparkXP, "Street spark"); // +1, daily-capped by the fixed spawn count
    if (fxApi.current) {
      fxApi.current.sparkPing(count);
      fxApi.current.toast(`✦ ${count}/${sparksData.count}`, "#00F0FF");
    }
    if (sweep) {
      addXP(REWARD.sweepXP, "STREET SWEEP — every spark today");
      unlockAchievement("street_sweep");
      if (fxApi.current) fxApi.current.toast("STREET SWEEP ✦ EVERY SPARK", "#FFD166", { big: true });
    }
  };

  const handleSecretFind = (secret) => {
    const { firstTime } = markSecret(secret.id);
    if (!firstTime) return;
    setFoundSecretIds((s) => [...s, secret.id]);
    unlockAchievement(`street_find_${secret.id}`);
    if (fxApi.current) {
      fxApi.current.burstAt(secret.x, secret.air ? 84 : 12, "spark", 6, "#FFD166");
      fxApi.current.toast(secret.line, "#FFD166", { big: true });
    }
  };

  // odometer — write-behind every 2s of walking (and on pagehide)
  const odoRef = useRef({ buf: 0, timer: 0 });
  const flushOdometer = () => {
    const o = odoRef.current;
    o.timer = 0;
    if (o.buf <= 0) return;
    const px = o.buf;
    o.buf = 0;
    const { fresh } = addOdometer(px);
    for (const m of fresh) {
      unlockAchievement(m.key);
      if (m.key === "street_25k") setBoots(true); // first cosmetic — the boot trim
      if (fxApi.current) fxApi.current.toast(m.label, "#FFD166", { big: true });
    }
  };
  const flushRef = useRef(flushOdometer);
  flushRef.current = flushOdometer;
  useEffect(() => {
    const onHide = () => flushRef.current();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      flushRef.current();
    };
  }, []);

  // the daily street event — one toast at entry, once per day per session
  useEffect(() => {
    if (journey.world !== "city") return undefined;
    const ev = getDailyEvent();
    if (!ev) return undefined;
    try {
      if (sessionStorage.getItem("mq_event_seen") === streetDay) return undefined;
      sessionStorage.setItem("mq_event_seen", streetDay);
    } catch {
      /* announce anyway */
    }
    const t = setTimeout(() => {
      if (fxApi.current) fxApi.current.toast(`${ev.name} — ${ev.line}`, ev.color, { big: true });
    }, 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.world]);

  // ── Living City stride wrapper ──────────────────────────────────────────
  // One walk hook feeds them all: the mask encounter engine, the cinema
  // observer (zone cards / whispers / Spire dread) — and the odometer.
  const spireSealed = !journey.spireOpen && !journey.legacy;
  const handleStride = (dxAbs, x) => {
    engine.onStride(dxAbs, x);
    cine.onStride(x, world, { spireSealed });
    odoRef.current.buf += dxAbs;
    if (!odoRef.current.timer) {
      odoRef.current.timer = setTimeout(() => flushRef.current(), REWARD.odometerFlushMs);
    }
  };

  // the Spire hum rides the scene's sound layer (Phase 8)
  useEffect(() => {
    cine.spireHumRef.current = (on) => {
      if (fxApi.current && fxApi.current.spireHum) fxApi.current.spireHum(on);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Boss stages materialize at their chapter's end (soft gate) ──────────
  // Chapter complete (legacy users are past training — always complete)
  // AND ≥1 wild fight won → the mask looms beside the arch + one toast, once.
  useEffect(() => {
    if (journey.world !== "city" || masks.wildWinCount < 1) return;
    for (const z of world.maskZones || []) {
      const b = getBossForZone(z.label);
      if (!b || masks.isIntegrated(b.id) || masks.state.materialized[b.id]) continue;
      const complete = journey.legacy ? true : z.ids.every((id) => journey.isLit(id));
      if (!complete) continue;
      const { firstTime } = masks.maybeMaterialize(b.id);
      if (firstTime) {
        setStreetToast({
          key: Date.now(),
          color: b.color,
          text: `You leveled up. That's when it gets loud. ${b.name} is waiting at the end of the chapter.`,
        });
        break; // one materialization moment at a time
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.journey, masks.state, journey.world]);

  useEffect(() => {
    if (!streetToast) return undefined;
    const t = setTimeout(() => setStreetToast(null), 6200);
    return () => clearTimeout(t);
  }, [streetToast]);

  // Materialized, un-fought bosses loom on the street; evolved ones walk
  // behind you instead.
  const maskLurkers = (world.maskZones || [])
    .map((z) => ({ z, b: getBossForZone(z.label) }))
    .filter(({ b }) => b && masks.state.materialized[b.id] && !masks.isIntegrated(b.id))
    .map(({ z, b }) => ({
      bossId: b.id,
      x: z.lurkX,
      color: b.color,
      name: b.name,
      mutter: b.attacks[0],
    }));

  const handleFaceBoss = (bossId) => {
    const b = getBoss(bossId);
    if (!b || masks.isIntegrated(bossId)) return;
    const zone = (world.maskZones || []).find((z) => {
      const zb = getBossForZone(z.label);
      return zb && zb.id === bossId;
    });
    setBattle({ type: "boss", id: bossId, zoneAccent: zone ? zone.accent : b.color });
  };

  // ── Hometown ⇄ city transitions ─────────────────────────────────────────
  const handleHometownComplete = ({ firstEver }) => {
    if (firstEver) {
      addXP(XP_VALUES.hometownDeparture, "The road out of the hometown");
      unlockAchievement("hometown_departure");
    }
    try {
      sessionStorage.setItem(POSITION_KEY, String(GATES_SPAWN_X));
    } catch {
      /* no-op */
    }
    setCitySpawnX(GATES_SPAWN_X);
    journey.refresh(); // completeHometown already moved the world to "city"
  };

  const handleCityExit = (side) => {
    if (side === "left") journey.setWorld("hometown"); // THE ROAD HOME
  };

  // ── World #1: the hometown ──────────────────────────────────────────────
  if (journey.world === "hometown") {
    return (
      <div className={`mqc-root${embedded ? " mqc-root--embedded" : ""}`}>
        <header className="mqc-head">
          <div>
            <h2 className="mqc-head__title">THE HOMETOWN</h2>
            <p className="mqc-head__sub">Where the road starts.</p>
          </div>
        </header>
        <HometownJourney
          reducedMotion={reducedMotion}
          onComplete={handleHometownComplete}
        />
        <PendantHUD />
      </div>
    );
  }

  return (
    <div className={`mqc-root${embedded ? " mqc-root--embedded" : ""}`}>
      <header className="mqc-head">
        <div>
          <h2 className="mqc-head__title">MILESTONE CITY</h2>
          <p className="mqc-head__sub">{stage.blurb}</p>
        </div>
        {!journey.legacy && !journey.spireOpen ? (
          <span
            className="mqc-pulse"
            aria-label={`Training: ${journey.litCount} of ${journey.litTotal} districts lit`}
          >
            <span className="mqc-pulse__dot" aria-hidden="true" />
            TRAINING {journey.litCount}/{journey.litTotal} · THE SPIRE WATCHES
          </span>
        ) : (
          <span className="mqc-pulse" aria-label={`City pulse ${cityPulse} percent, ${litCount} districts lit`}>
            <span className="mqc-pulse__dot" aria-hidden="true" />
            Pulse {cityPulse}% · {litCount}/{districts.length} lit
            {radiantCount > 0 ? ` · ${radiantCount} radiant` : ""}
          </span>
        )}
      </header>

      <div className="mqk-scenewrap">
        <WorldScene
          world={world}
          stage={stage}
          timeOfDay={timeOfDay}
          spawnX={citySpawnX}
          paused={scenePaused}
          reducedMotion={reducedMotion}
          persistKey={POSITION_KEY}
          fxApiRef={fxApi}
          onStride={handleStride}
          sparks={sparksData.sparks}
          collectedSparks={collected}
          onCollectSpark={handleCollectSpark}
          secrets={streetFinds}
          foundSecrets={foundSecretIds}
          onSecretFind={handleSecretFind}
          playerBoots={boots}
          maskLurkers={maskLurkers}
          streetAllies={evolvedAllies}
          fogOpacity={masks.courtClaimed ? 0.5 : 1}
          onFaceBoss={handleFaceBoss}
          onEnterBuilding={openDistrictById}
          onTalkNpc={(id) => {
            if (id && id.startsWith("mentor:")) {
              const district = journeyDistricts.find((d) => d.id === id.slice(7));
              if (district) hearLesson(district);
              return;
            }
            if (guideDistrict) openDistrict(guideDistrict);
          }}
          onExitEdge={handleCityExit}
        />
        <button
          type="button"
          className="mqk-hudchip"
          onClick={() => setCodexOpen(true)}
          aria-label={`Open the Mask Codex — ${masks.integratedCount} of 5 masks evolved`}
        >
          🎭 {masks.integratedCount}/5
        </button>
      </div>

      <button
        type="button"
        className="mqc-panel mqc-guide"
        onClick={() => (guideDistrict ? openDistrict(guideDistrict) : null)}
        aria-label={`The Guide: ${guide.line}`}
      >
        <span className="mqc-guide__sprite" aria-hidden="true">
          <MentorSprite size={46} color={THE_GUIDE.color} staff />
        </span>
        <span className="mqc-guide__txt">
          <span className="mqc-guide__name">{THE_GUIDE.name}</span>
          <p className="mqc-guide__line">“{guide.line}”</p>
        </span>
        <span className="mqc-guide__go" aria-hidden="true">→</span>
      </button>

      <div className="mqc-citizenwrap">
        <CitizenCard social={social} progress={ctx} />
      </div>

      <CityPlaza social={social} />

      {QUARTER_ORDER.map((qKey) => {
        const meta = QUARTER_META[qKey];
        const qDistricts = journeyDistricts.filter((d) => d.quarter === qKey);
        if (!meta || qDistricts.length === 0) return null;
        return (
          <section
            key={qKey}
            className="mqc-d-quarter"
            style={{ "--q-accent": meta.accent }}
            aria-label={meta.label}
          >
            <div className="mqc-d-quarter__head">
              <h3 className="mqc-d-quarter__label">{meta.label}</h3>
            </div>
            <p className="mqc-d-quarter__blurb">{meta.blurb}</p>
            <div className="mqc-d-grid">
              {qDistricts.map((d) => (
                <DistrictCard key={d.id} district={d} onOpen={openDistrict} />
              ))}
            </div>
          </section>
        );
      })}

      {selected ? (
        <DistrictSheet
          district={selected}
          locked={selectedLocked}
          sealed={Boolean(selected.sealed)}
          gateNote={
            selected.sealed
              ? `THE SPIRE IS SEALED — ${journey.litCount}/${journey.litTotal} districts lit. Hear each door's lesson and make one real move inside it; when the whole city is lit, the tower opens.`
              : null
          }
          prevDistrict={selectedPrev}
          onGoPrev={openDistrict}
          onClose={() => setSelected(null)}
          onEnter={enterDistrict}
          onLesson={hearLesson}
        />
      ) : null}

      {hallOpen ? (
        <HallOfChampions social={social} onClose={() => setHallOpen(false)} />
      ) : null}

      <WorldAtlas
        current="city"
        onJump={(j) => {
          if (j.type === "hometown") journey.setWorld("hometown");
          else if ((j.type === "spire" || j.type === "crossing") && onOpenMapQuest) {
            if (j.type === "spire") {
              try { sessionStorage.setItem("mq_spire_floor_v1", String(j.idx || 0)); } catch { /* no-op */ }
            }
            onOpenMapQuest();
          }
        }}
      />

      {ignition ? (
        <SpireIgnition
          onClimb={() => {
            markIgnitionSeen();
            setIgnition(false);
            if (onOpenMapQuest) onOpenMapQuest();
          }}
          onClose={() => {
            markIgnitionSeen();
            setIgnition(false);
          }}
        />
      ) : null}

      {lesson ? (
        <MentorDialog
          mentor={lesson.mentor}
          district={lesson.district}
          onClose={() => setLesson(null)}
          onFinishLesson={finishLesson}
          onEnterDistrict={enterDistrict}
        />
      ) : null}

      {framing ? (
        <StoryDialog
          scene={{
            title: "THE FIRST AMBUSH",
            color: THE_GUIDE.color,
            sprite: "mentor",
            speakerName: THE_GUIDE.name,
            epithet: "The Guide",
            beats: [
              {
                speaker: THE_GUIDE.name,
                lines: [
                  "That voice you just heard? It lives here too. It's not a monster — it's protection that never got trained.",
                  "You can't outrun it, but you can NAME it. Naming is the only thing that lands. Ready?",
                ],
              },
            ],
            doneLabel: "FACE IT",
            altLabel: "NOT NOW",
          }}
          onDone={() => {
            masks.markFramingSeen();
            const enc = framing;
            setFraming(null);
            setBattle(enc);
          }}
          onAlt={() => {
            // free exit — quiet streets for the rest of the session
            masks.markFramingSeen();
            masks.snoozeSession();
            engine.clearEncounter();
            setFraming(null);
          }}
        />
      ) : null}

      {battle ? (
        <MaskBattle
          encounter={battle}
          reducedMotion={reducedMotion}
          allies={battleAllies}
          onComplete={handleBattleComplete}
          onWalkAway={handleBattleWalkAway}
          onMakeMission={handleMakeMission}
        />
      ) : null}

      {codexOpen ? <MaskCodex masks={masks} onClose={() => setCodexOpen(false)} /> : null}

      {courtFinale ? (
        <MaskCourtFinale masks={masks} onClose={() => setCourtFinale(false)} />
      ) : null}

      {streetToast ? (
        <div
          key={streetToast.key}
          className="mqk-streettoast"
          style={{ "--toast-color": streetToast.color }}
          role="status"
        >
          {streetToast.text}
        </div>
      ) : null}

      <PendantHUD />
    </div>
  );
}
