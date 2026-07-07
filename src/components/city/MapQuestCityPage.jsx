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
import { markIgnitionSeen } from "./journeyStore.js";
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
import "../../styles/city.css";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — the living open-world hub
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

  // ── The journey — LIT tutorial chain (new citizens only) ────────────────
  const journey = useJourney(districts, {
    onPowerOn: (id) => {
      const d = DISTRICTS.find((x) => x.id === id);
      if (!d) return;
      celebrate({
        variant: "project",
        title: `${d.name.toUpperCase()} POWERS ON`,
        subtitle: "A new district joins the grid.",
        detail: "The city grows as you do.",
      });
    },
    onLit: (id) => {
      const d = DISTRICTS.find((x) => x.id === id);
      if (!d) return;
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
      setIgnition(true);
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
      addXP(XP_VALUES.cityFirstVisit, "First steps into MapQuest City");
      unlockAchievement("city_arrival");
      celebrate({
        variant: "project",
        title: "WELCOME TO MAPQUEST CITY",
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
  const scenePaused = Boolean(selected || hallOpen || lesson || ignition);

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
          <h2 className="mqc-head__title">MAPQUEST CITY</h2>
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

      <WorldScene
        world={world}
        stage={stage}
        timeOfDay={timeOfDay}
        spawnX={citySpawnX}
        paused={scenePaused}
        reducedMotion={reducedMotion}
        persistKey={POSITION_KEY}
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

      <PendantHUD />
    </div>
  );
}
