import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useGamification } from "../../hooks/useGamification.js";
import { XP_VALUES, RANKS } from "../../lib/gamification.js";
import { MentorSprite } from "../map-quest/kit.jsx";
import CityScene from "./CityScene.jsx";
import CitizenCard from "./CitizenCard.jsx";
import CityPlaza from "./CityPlaza.jsx";
import HallOfChampions from "./HallOfChampions.jsx";
import DistrictCard from "./DistrictCard.jsx";
import DistrictSheet from "./DistrictSheet.jsx";
import MentorDialog from "./MentorDialog.jsx";
import useCityProgress from "./useCityProgress.js";
import useCitySocial from "./useCitySocial.js";
import { QUARTER_ORDER, QUARTER_META, DISTRICTS } from "./cityDistricts.js";
import { MENTORS, THE_GUIDE, getDailyGuideLesson } from "./cityMentors.js";
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
// One city, sixteen districts, every district a real feature. The skyline
// evolves with your rank, the buildings glow with your actual progress,
// your people stand in the plaza, and every district's mentor teaches the
// lesson that ends where the work begins.
// Canonical home: the City tab inside the Accountability Zone (embedded).
// Also mounted standalone at nav keys "city" / "openworld".
// ════════════════════════════════════════════════════════════════════════

const ALL_DISTRICT_IDS = DISTRICTS.map((d) => d.id);

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
  const arrivalFired = useRef(false);
  useEffect(() => {
    if (arrivalFired.current) return;
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
  }, []);

  // ── Interactions ────────────────────────────────────────────────────────
  const openDistrict = (district) => {
    if (!district) return;
    recordDistrictVisit(district.id);
    if (hasVisitedAll(ALL_DISTRICT_IDS)) unlockAchievement("city_all_districts");
    setSelected(district);
  };

  const openDistrictById = (id) => {
    openDistrict(districts.find((d) => d.id === id) || null);
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
    if (mentor) setLesson({ mentor, district });
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
  };

  // ── The Guide's daily pointer ───────────────────────────────────────────
  const guide = getDailyGuideLesson(new Date(), ALL_DISTRICT_IDS);
  const guideDistrict = districts.find((d) => d.id === guide.districtId) || null;

  const buildings = districts.map((d) => ({
    id: d.id,
    name: d.name,
    icon: d.icon,
    color: d.color,
    glow: d.glow,
    glowState: d.glowState,
    position: d.position,
  }));

  return (
    <div className={`mqc-root${embedded ? " mqc-root--embedded" : ""}`}>
      <header className="mqc-head">
        <div>
          <h2 className="mqc-head__title">MAPQUEST CITY</h2>
          <p className="mqc-head__sub">{stage.blurb}</p>
        </div>
        <span className="mqc-pulse" aria-label={`City pulse ${cityPulse} percent, ${litCount} districts lit`}>
          <span className="mqc-pulse__dot" aria-hidden="true" />
          Pulse {cityPulse}% · {litCount}/{districts.length} lit
          {radiantCount > 0 ? ` · ${radiantCount} radiant` : ""}
        </span>
      </header>

      <CityScene
        stage={stage}
        timeOfDay={timeOfDay}
        buildings={buildings}
        reducedMotion={reducedMotion}
        onBuildingTap={openDistrictById}
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
        const qDistricts = districts.filter((d) => d.quarter === qKey);
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
          onClose={() => setSelected(null)}
          onEnter={enterDistrict}
          onLesson={hearLesson}
        />
      ) : null}

      {hallOpen ? (
        <HallOfChampions social={social} onClose={() => setHallOpen(false)} />
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
    </div>
  );
}
