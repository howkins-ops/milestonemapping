import React, { useState, useMemo, useCallback } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useMapQuestState } from "../map-quest/useMapQuestState.js";
import { getChapterByKey } from "../map-quest/questChapters.js";
import { useShadowWork } from "./useShadowWork.js";
import useDescent from "./useDescent.js";
import { DEPTH_QUEST_KEYS } from "./descentStore.js";
import { XP_VALUES } from "../../lib/gamification.js";
import { maskCardSrc } from "./shell.jsx";
import ShadowAlchemist from "./ShadowAlchemist.jsx";
import TheBurn from "./TheBurn.jsx";
import HoldTheLine from "./HoldTheLine.jsx";
import SwampValve from "./swamp/SwampValve.jsx";
import ReframeForge from "./ReframeForge.jsx";
import InnerChild from "./InnerChild.jsx";
import SelfCompassion from "./SelfCompassion.jsx";
import Grounding from "./Grounding.jsx";
import IntegrationTool from "./IntegrationTool.jsx";
import RideTheWave from "./RideTheWave.jsx";
import EssenceGallery from "./EssenceGallery.jsx";
import { maskCards } from "../../data/maskCards.js";
import "../../styles/shadow.css";
import "../../styles/shadowRealm.css";
import "../../styles/wave.css";

// Nine chambers of the Shadow Realm. The descent is a guided journey — you
// start in the still waters and earn your way down to the transmutation
// rituals; Integration is the Moon Gate you leave through.
const TOOLS = [
  { id: "bufca",      name: "The Burn",         when: "Something just hit the fan",  relic: "Phoenix Fire",        sub: "BUFCA — Breakdown, Upset, Facts, Commitment, Action. Then write the old story down and burn it.", accent: "#FF9A3C", sigil: "burn",    wide: true },
  { id: "alchemist",  name: "Shadow Alchemist", when: "A mask took the wheel",       relic: "Transmutation Forge", sub: "Name the Survival Mechanism running you — then transmute the mask into its essence.", accent: "#FACC15", sigil: "mask",    wide: true },
  { id: "line",       name: "Hold the Line",    when: "Anger is rising",             relic: "Pressure Crystal",    sub: "Cool the body, name the heat, choose your response.",                    accent: "#FF3B5C", sigil: "crystal" },
  { id: "swamp",      name: "Swamp Valve",      when: "Pressure is building",        relic: "Pressure Valve",      sub: "Better out safely than trapped inside — vent the steam before the system blows.", accent: "#2FE0A6", sigil: "valve" },
  { id: "reframe",    name: "Reframe Forge",    when: "An old belief is loud",       relic: "Belief Flame",        sub: "Melt the old story down and forge a truer one.",                          accent: "#7B2CFF", sigil: "flame" },
  { id: "inner",      name: "Inner Child",      when: "Something old got triggered", relic: "Safe Harbor",         sub: "Turn toward the younger you — and give them what they needed.",           accent: "#D11EFF", sigil: "harbor" },
  { id: "compassion", name: "Self-Compassion",  when: "Being hard on yourself",      relic: "Warm Light",          sub: "Answer the inner critic with the kindness you'd give a friend.",          accent: "#FF3EDB", sigil: "light" },
  { id: "ground",     name: "Grounding",        when: "Overwhelmed / spiralling",    relic: "Anchor Stone",        sub: "5-4-3-2-1 your senses back to solid ground.",                             accent: "#00FFBF", sigil: "anchor" },
  { id: "integrate",  name: "Integration",      when: "Closing the loop",            relic: "Moon Gate",           sub: "Let it sit. Let it move through you. Walk back out as yourself.",         accent: "#00F0FF", sigil: "moongate", wide: true },
];
const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
const TOOL_LABEL = Object.fromEntries(TOOLS.map((t) => [t.name, t.accent]));

// The descent, top (gentle) to bottom (the heavy rituals, then the way out).
// Depths unlock one at a time — see useDescent.js. Zone ids double as the
// unlock keys and the CSS accent keys (shadowRealm.css .swr-zone--*).
const ZONES = [
  { id: "waters",   label: "Depth I · The Still Waters",  tag: "gentle entry — soften, settle, breathe",         tools: ["ground", "compassion"] },
  { id: "undertow", label: "Depth II · The Undertow",     tag: "pressure and heat you learn to hold",            tools: ["line", "swamp"] },
  { id: "stories",  label: "Depth III · The Old Stories", tag: "beliefs and echoes that still speak",            tools: ["reframe", "inner"] },
  { id: "furnace",  label: "Depth IV · The Furnace",      tag: "the heavy transmutation — masks turned to gold", tools: ["alchemist", "bufca"] },
  { id: "moongate", label: "Depth V · The Moon Gate",     tag: "the way back out",                               tools: ["integrate"] },
];
const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));

const MOTES = [
  { x: "8%",  y: "12%", c: "rgba(0,240,255,0.8)",  d: "9s",  delay: "0s" },
  { x: "84%", y: "18%", c: "rgba(209,30,255,0.8)", d: "11s", delay: "1.4s" },
  { x: "22%", y: "34%", c: "rgba(255,62,219,0.7)", d: "10s", delay: "3s" },
  { x: "92%", y: "42%", c: "rgba(0,255,191,0.7)",  d: "12s", delay: "0.8s" },
  { x: "12%", y: "56%", c: "rgba(0,240,255,0.7)",  d: "9.5s", delay: "2.2s" },
  { x: "76%", y: "64%", c: "rgba(123,44,255,0.8)", d: "11s", delay: "4.4s" },
  { x: "30%", y: "78%", c: "rgba(255,62,219,0.7)", d: "10s", delay: "1s" },
  { x: "88%", y: "86%", c: "rgba(0,240,255,0.8)",  d: "9s",  delay: "3.6s" },
  { x: "6%",  y: "92%", c: "rgba(0,255,191,0.7)",  d: "12s", delay: "5s" },
];

function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

/* Relic sigils — geometric stroke glyphs, one per chamber. */
function Sigil({ id }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (id) {
    case "burn": // paper with a lit corner — the BUFCA ritual
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M6 3.5h9l3 3v8.5" />
          <path d="M15 3.5v3h3" />
          <path d="M6 3.5V17" />
          <path d="M12 21.5c-3.4 0-5.5-2-5.5-4.6 0-2 1.4-3 2.5-4.4.6 1 1.6 1.4 1.6 1.4-.3-2 .7-3.6 2.4-4.9-.2 2.6 2.5 3.3 2.5 6.4 0 3.2-1.5 6.1-3.5 6.1z" />
        </svg>
      );
    case "mask": // the survival mask
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M5 5.5C7.2 4.5 9.6 4 12 4s4.8.5 7 1.5v5c0 5.2-3 8.9-7 10.5-4-1.6-7-5.3-7-10.5v-5z" />
          <path d="M8 10.2c.9-.9 2.1-.9 3 0M13 10.2c.9-.9 2.1-.9 3 0" />
          <path d="M9.2 15c1.8 1.3 3.8 1.3 5.6 0" />
        </svg>
      );
    case "crystal": // pressure crystal
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M12 2.8 17.2 9 12 21.2 6.8 9 12 2.8z" />
          <path d="M6.8 9h10.4M12 2.8 9.4 9l2.6 12.2M12 2.8 14.6 9 12 21.2" />
        </svg>
      );
    case "valve": // pressure valve wheel
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <circle cx="12" cy="10" r="5.6" />
          <path d="M12 4.4v11.2M6.4 10h11.2M8 6l8 8M16 6l-8 8" />
          <path d="M12 15.6V21" />
        </svg>
      );
    case "flame": // belief flame
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M12 3c3 3.8 6 5.9 6 9.7A6 6 0 0 1 6 12.7C6 8.9 9 6.8 12 3z" />
          <path d="M12 11.4c1.3 1.7 2.5 2.7 2.5 4.3a2.5 2.5 0 0 1-5 0c0-1.6 1.2-2.6 2.5-4.3z" />
        </svg>
      );
    case "harbor": // safe harbor
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M4 12.5a8 8 0 0 1 16 0" />
          <path d="M4 12.5V18M20 12.5V18" />
          <path d="M12 18.4l-2.7-2.5a1.7 1.7 0 1 1 2.7-2 1.7 1.7 0 1 1 2.7 2L12 18.4z" />
        </svg>
      );
    case "light": // warm light
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <circle cx="12" cy="12" r="3.4" />
          <path d="M12 3.2v2.6M12 18.2v2.6M3.2 12h2.6M18.2 12h2.6M5.9 5.9l1.8 1.8M16.3 16.3l1.8 1.8M18.1 5.9l-1.8 1.8M7.7 16.3l-1.8 1.8" />
        </svg>
      );
    case "anchor": // anchor stone
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <circle cx="12" cy="5" r="2.1" />
          <path d="M12 7.1V21M8.4 10h7.2" />
          <path d="M5 14.2a7 7 0 0 0 14 0M5 14.2l-1.6 1.8M5 14.2l2.2 1M19 14.2l1.6 1.8M19 14.2l-2.2 1" />
        </svg>
      );
    case "moongate": // the gate out
      return (
        <svg viewBox="0 0 24 24" {...common} aria-hidden>
          <path d="M5 20.4v-8a7 7 0 0 1 14 0v8" />
          <path d="M3.4 20.4h17.2" />
          <path d="M14.4 10.4a3.1 3.1 0 1 1-3.4-4.6 3.9 3.9 0 0 0 3.4 4.6z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ShadowWorkPage({ onNavigate }) {
  const [view, setView] = useState(null); // null=hub | tool id | "gallery"
  const { addXP, unlockAchievement, celebrate } = useAppData();
  const { getBrokeKingShadow, isChapterComplete } = useMapQuestState();
  const brokeKingShadow = getBrokeKingShadow();
  const { takeaways, essences, streak, completions, recordCompletion, clearTrail } = useShadowWork();

  // ── The guided descent — depths unlock one at a time (see useDescent.js) ──
  // completions is keyed by the tool's DISPLAY NAME, so carry names not ids.
  const DEPTHS = useMemo(
    () =>
      ZONES.map((z) => ({
        id: z.id,
        toolNames: z.tools.map((id) => TOOL_BY_ID[id].name),
        questKeys: DEPTH_QUEST_KEYS[z.id] || [],
      })),
    []
  );
  if (process.env.NODE_ENV !== "production") {
    // drift guard: every depth tool name must exist in TOOLS or it can never complete
    DEPTHS.forEach((d) =>
      d.toolNames.forEach((n) =>
        console.assert(TOOL_LABEL[n] != null, `[descent] tool name "${n}" not found in TOOLS`)
      )
    );
  }

  const onReveal = useCallback(
    (depthId) => {
      const z = ZONE_BY_ID[depthId];
      addXP(XP_VALUES.mentorLesson, "A new depth opens");
      celebrate({
        variant: "reward",
        title: "A NEW DEPTH OPENS",
        subtitle: z ? z.label : "The descent goes deeper.",
        detail: "You earned your way down. A new chamber is lit.",
      });
    },
    [addXP, celebrate]
  );

  const { isDepthUnlocked, nextLockedDepthId } = useDescent(DEPTHS, {
    completions,
    essences,
    takeaways,
    isChapterComplete,
    onReveal,
  });

  const finish = (tool, takeaway, opts = {}) => {
    const res = recordCompletion({ tool, takeaway, essence: opts.essence });
    const xp = opts.xp ?? (opts.transmuted ? XP_VALUES.shadowTransmutation : XP_VALUES.shadowToolCompleted);
    addXP(xp, `${tool} complete`);
    if (opts.transmuted) unlockAchievement("shadow_alchemist");
    (opts.achievements || []).forEach((id) => unlockAchievement(id));
    if (res.newEssence) {
      celebrate({
        variant: "reward",
        title: "ESSENCE RECLAIMED",
        subtitle: opts.essence ? `${opts.essence.name} → ${opts.essence.essence}` : "A shadow turned to gold.",
        detail: "Added to your Essence Gallery.",
      });
    }
    setView(null);
  };

  const close = () => setView(null);

  if (view === "bufca")      return <TheBurn         onClose={close} onFinish={finish} />;
  if (view === "alchemist")  return <ShadowAlchemist onClose={close} onFinish={finish} />;
  if (view === "line")       return <HoldTheLine     onClose={close} onFinish={finish} />;
  if (view === "swamp")      return <SwampValve      onClose={close} onFinish={finish} />;
  if (view === "reframe")    return <ReframeForge    onClose={close} onFinish={finish} />;
  if (view === "inner")      return <InnerChild      onClose={close} onFinish={finish} />;
  if (view === "compassion") return <SelfCompassion  onClose={close} onFinish={finish} />;
  if (view === "ground")     return <Grounding       onClose={close} onFinish={finish} />;
  if (view === "integrate")  return <IntegrationTool onClose={close} onFinish={finish} takeaways={takeaways} streak={streak} />;
  if (view === "wave")       return <RideTheWave     onClose={close} onFinish={finish} />;
  if (view === "gallery")    return <EssenceGallery  essences={essences} onClose={close} />;

  return (
    <Hub
      open={setView}
      onNavigate={onNavigate}
      brokeKingShadow={brokeKingShadow}
      takeaways={takeaways}
      essences={essences}
      streak={streak}
      onClearTrail={clearTrail}
      isDepthUnlocked={isDepthUnlocked}
      nextLockedDepthId={nextLockedDepthId}
    />
  );
}

function Chamber({ tool, index, side, onOpen }) {
  return (
    <button
      className={`swr-chamber ${tool.wide ? "swr-chamber--wide" : `swr-chamber--${side}`} ${tool.id === "alchemist" || tool.id === "bufca" ? "swr-chamber--gatehouse" : ""} ${tool.id === "integrate" ? "swr-chamber--exit" : ""}`}
      onClick={() => onOpen(tool.id)}
      style={{ "--ac": tool.accent, "--i": index }}
      aria-label={`Enter ${tool.name}`}
    >
      {tool.id === "integrate" && <span className="swr-exitart" aria-hidden />}
      <span className="swr-chamber__ornament" aria-hidden />
      <span className="swr-chamber__ornament2" aria-hidden />
      <div className="swr-totem" aria-hidden>
        <span className="swr-totem__bloom" />
        <span className="swr-totem__ring" />
        <span className="swr-totem__ring swr-totem__ring--2" />
        <Sigil id={tool.sigil} />
      </div>
      <div className="swr-plate">
        <span className="swr-plate__when">{tool.when}</span>
        <h2 className="swr-plate__name">{tool.name}</h2>
        <p className="swr-plate__sub">{tool.sub}</p>
        <span className="swr-plate__enter">Enter ▸</span>
      </div>
      <span className="swr-plate__relic" aria-hidden>{tool.relic}</span>
    </button>
  );
}

/* A locked depth — sealed until the depth above is cleared. Not a button:
   the gate is structural, so there's no way to open a chamber early. The
   frontier depth shows the unlock hint; deeper depths collapse to one dim
   line so the page reads as "your current frontier," not a wall of cards. */
function SealedDepth({ zone, prevZone, questKeys = [], collapsed }) {
  const questTitle = questKeys.length ? getChapterByKey(questKeys[0])?.title : null;
  const prevName = prevZone ? prevZone.label.replace(/^Depth [IVX]+ · /, "") : "the depth above";
  return (
    <div className={`swr-sealed ${collapsed ? "swr-sealed--collapsed" : ""}`} aria-disabled="true">
      <span className="swr-sealed__glyph" aria-hidden>⏻</span>
      <div className="swr-sealed__txt">
        <span className="swr-sealed__label">Sealed</span>
        {!collapsed && (
          <p className="swr-sealed__hint">
            Complete both chambers in <b>{prevName}</b> to descend
            {questTitle ? <> · or clear <b>{questTitle}</b> in the Map Quest</> : null}
          </p>
        )}
      </div>
    </div>
  );
}

function Hub({ open, onNavigate, brokeKingShadow, takeaways = [], essences = [], streak, onClearTrail, isDepthUnlocked = () => true, nextLockedDepthId = null }) {
  const ownedIds = new Set(essences.map((e) => e.maskId));
  let chamberIndex = 0;
  let sideFlip = 0;

  return (
    <div className="swr" style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* ── The Gate — you are entering the Shadow Realm ── */}
      <header className="swr-gate">
        <div className="swr-gate__art" aria-hidden>
          <img src="/assets/shadow/gate-temple.jpg" alt="" />
        </div>
        <div className="swr-gate__shade" aria-hidden />
        <div className="swr-gate__veil swr-gate__veil--l" aria-hidden />
        <div className="swr-gate__veil swr-gate__veil--r" aria-hidden />
        <div className="swr-gate__flash" aria-hidden />
        <p className="swr-gate__kicker">You are entering the Shadow Realm</p>
        <h1 className="sx-hero-title">Shadow Work</h1>
        <p className="swr-gate__sub">
          Where the heavy stuff gets turned into gold. Descend chamber by chamber, meet what&rsquo;s running you, and walk back out as yourself.
        </p>
        {streak?.current > 0 && (
          <div className="sx-streak">
            <span className="sx-streak__flame">🔥</span>
            <span className="sx-streak__num">{streak.current}</span>
            <span className="sx-streak__label">day inner-work streak</span>
          </div>
        )}
      </header>

      {/* ── Twin emergency doors — cool water beside molten fire ── */}
      <div className="sos-duo">
        <button className="wave-sosbar" onClick={() => open("wave")} aria-label="Open Anxiety SOS — Ride the Wave">
          <span className="wave-sosbar__icon" aria-hidden>🌊</span>
          <span className="wave-sosbar__txt">
            <span className="wave-sosbar__kicker">Anxiety SOS · right now</span>
            <span className="wave-sosbar__title">Ride the Wave</span>
            <span className="wave-sosbar__sub">Panic or overwhelm rising? Feel the wave, ride it, choose one brave step.</span>
          </span>
          <span className="wave-sosbar__go">START →</span>
        </button>
        <button
          className="wave-sosbar anger-gymbar"
          onClick={() => (onNavigate ? onNavigate("anger") : open("line"))}
          aria-label="Open the Anger Gym — turn pressure into power"
        >
          <span className="wave-sosbar__icon" aria-hidden>🔥</span>
          <span className="wave-sosbar__txt">
            <span className="wave-sosbar__kicker">Anger · right now</span>
            <span className="wave-sosbar__title">The Anger Gym</span>
            <span className="wave-sosbar__sub">Heat in your chest? Forge it — pressure becomes power, not damage.</span>
          </span>
          <span className="wave-sosbar__go">ENTER →</span>
        </button>
      </div>

      {/* ── The Sanctum — essences reclaimed so far ── */}
      <button className="swr-sanctum" onClick={() => open("gallery")}>
        <div className="swr-sanctum__orbs" aria-hidden>
          {maskCards.map((m) =>
            ownedIds.has(m.id) ? (
              <img key={m.id} className="swr-sanctum__orb" src={maskCardSrc(m.id, "essence-card")} alt=""
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
            ) : (
              <span key={m.id} className="swr-sanctum__orb locked">◇</span>
            )
          )}
        </div>
        <div className="swr-sanctum__txt">
          <div className="swr-sanctum__kicker">The Sanctum</div>
          <div className="swr-sanctum__title">Essence Gallery</div>
          <div className="swr-sanctum__sub">{essences.length} of {maskCards.length} shadows turned to gold</div>
        </div>
        <span className="swr-sanctum__go">OPEN →</span>
      </button>

      {/* ── A shadow from the Map Quest walks with you ── */}
      {brokeKingShadow && (
        <div className="swr-omen">
          <span className="swr-omen__icon" aria-hidden>👑</span>
          <div style={{ flex: 1 }}>
            <div className="swr-omen__kicker">Map Quest · a shadow walks with you</div>
            <div className="swr-omen__title">The Broke King walks with you</div>
            <div className="swr-omen__sub">
              Open the <b>Shadow Alchemist</b> when you feel money panic, shame spirals, or the sense of being behind.
            </div>
          </div>
        </div>
      )}

      {/* ── The Descent ── */}
      <div className="swr-descent" aria-label="The descent — shadow work chambers">
        <div className="swr-air" aria-hidden>
          <span className="swr-air__fog swr-air__fog--a" />
          <span className="swr-air__fog swr-air__fog--b" />
          <span className="swr-air__fog swr-air__fog--c" />
          {MOTES.map((m, i) => (
            <span key={i} className="swr-air__mote" style={{ "--x": m.x, "--y": m.y, "--c": m.c, "--d": m.d, "--delay": m.delay }} />
          ))}
        </div>
        {ZONES.map((zone, zi) => {
          const unlocked = isDepthUnlocked(zone.id);
          const isFrontier = zone.id === nextLockedDepthId; // the next one to earn
          const collapsed = !unlocked && !isFrontier;        // deeper than the frontier
          const prevZone = zi > 0 ? ZONES[zi - 1] : null;
          return (
            <section
              key={zone.id}
              className={`swr-zone swr-zone--${zone.id}${unlocked ? "" : " swr-zone--locked"}${collapsed ? " swr-zone--collapsed" : ""}`}
            >
              <div className="swr-zone__marker" style={{ "--i": chamberIndex + zi }}>
                <span className="swr-zone__rune" aria-hidden />
                <span className="swr-zone__label">{zone.label}</span>
                <span className="swr-zone__tag">{zone.tag}</span>
              </div>
              {unlocked ? (
                zone.tools.map((id) => {
                  const tool = TOOL_BY_ID[id];
                  const side = tool.wide ? null : (sideFlip++ % 2 === 0 ? "left" : "right");
                  return <Chamber key={id} tool={tool} index={chamberIndex++} side={side} onOpen={open} />;
                })
              ) : (
                <SealedDepth
                  zone={zone}
                  prevZone={prevZone}
                  questKeys={DEPTH_QUEST_KEYS[zone.id] || []}
                  collapsed={collapsed}
                />
              )}
            </section>
          );
        })}
      </div>

      {/* ── Footprints — the trail you leave in the dark ── */}
      <div className="swr-footprints">
        <div className="swr-footprints__head">
          <span className="swr-footprints__title">Footprints · your trail</span>
          {takeaways.length > 0 && <button className="swr-footprints__clear" onClick={onClearTrail}>Clear</button>}
        </div>
        {takeaways.length === 0 ? (
          <p className="swr-footprints__empty">Every chamber you enter leaves a footprint here — proof of the work, in your own words.</p>
        ) : (
          <ul className="swr-footprints__list">
            {takeaways.slice(0, 6).map((row, i) => (
              <li key={row.at ?? i} className="swr-footprints__row" style={{ "--row-accent": TOOL_LABEL[row.tool] || "var(--brand-cyan)" }}>
                <span className="swr-footprints__dot" />
                <div className="swr-footprints__main">
                  <div className="swr-footprints__meta">
                    <span className="swr-footprints__tool">{row.tool}</span>
                    <span className="swr-footprints__time">{row.at ? timeAgo(row.at) : ""}</span>
                  </div>
                  <p className="swr-footprints__text">{row.takeaway}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
