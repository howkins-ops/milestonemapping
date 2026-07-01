import React, { useState } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import PressureForge from "./PressureForge.jsx";
import StormCaptain from "../storm/StormCaptain.jsx";
import SwampValve from "../shadow/swamp/SwampValve.jsx";
import { loadForgeState, clearForgeTrail } from "./pressureForgeStore.js";
import { getLevel, getNextLevel } from "./pressureForgeData.js";
import "../../styles/anger.css";

/* ════════════════════════════════════════════════════════════════════════
   THE ANGER GYM — four games for turning heat into something useful.

   1 · Trigger Popper  — anger / rejection arcade      (coming soon)
   2 · Swamp Valve     — funny, safe pressure release   (LIVE)
   3 · Storm Captain   — overwhelm survival             (LIVE)
   4 · Pressure Forge  — stress → one clean action       (LIVE)

   Popper, Valve and Captain bleed off raw heat. Forge is where you learn to
   keep it and shape it. This hub is the training floor that ties them together.
   ════════════════════════════════════════════════════════════════════════ */

const XP_FORGE = 30;
const XP_STORM = 25;
const XP_VALVE = 25;

const GAMES = [
  {
    id: "forge",
    name: "Pressure Forge",
    when: "Stressed, behind, or under the gun",
    relic: "The Blacksmith",
    sub: "Entrepreneur & sales pressure — sort it, cool it, reframe it, and walk out with one clean move.",
    tag: "Turn pressure into power",
    accent: "#FFB000",
    live: true,
    featured: true,
  },
  {
    id: "popper",
    name: "Trigger Popper",
    when: "A trigger just hijacked you",
    relic: "The Arcade",
    sub: "Pop the triggers before they run you. An anger & rejection reflex game.",
    tag: "Anger / rejection arcade",
    accent: "#FF3B5C",
    live: false,
  },
  {
    id: "valve",
    name: "Swamp Valve",
    when: "You need to vent — safely",
    relic: "The Release",
    sub: "Let the pressure out without the wreckage. A funny, safe release valve.",
    tag: "Safe pressure release",
    accent: "#00FFBF",
    live: true,
  },
  {
    id: "storm",
    name: "Storm Captain",
    when: "Everything's hitting at once",
    relic: "The Helm",
    sub: "Steer the ship through the overwhelm. Survive the storm, one wave at a time.",
    tag: "Overwhelm survival",
    accent: "#00F0FF",
    live: true,
  },
];

function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const hh = Math.floor(m / 60);
  if (hh < 24) return `${hh}h ago`;
  const d = Math.floor(hh / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export default function AngerGymPage() {
  const [view, setView] = useState(null); // null=hub | "forge"
  const [refresh, setRefresh] = useState(0);
  const { addXP, celebrate } = useAppData();

  const onForgeComplete = (payload) => {
    addXP(XP_FORGE, "Pressure forged");
    celebrate({
      variant: "reward",
      title: "PRESSURE FORGED",
      subtitle: payload.action ? `Next move: ${payload.action}` : "One clean action forged.",
      detail: payload.leveledUp && payload.level ? `New level: ${payload.level.name}` : payload.insight,
    });
  };

  const onStormComplete = (payload) => {
    addXP(XP_STORM, "Storm captained");
    celebrate({
      variant: "reward",
      title: "STORM CAPTAINED",
      subtitle: payload.action ? `Clean action: ${payload.action}` : "You kept the wheel.",
      detail: payload.leveledUp && payload.level ? `New rank: ${payload.level.name}` : payload.insight,
    });
  };

  // SwampValve uses the Shadow-tool contract: onFinish(tool, takeaway).
  const onValveComplete = (_tool, takeaway) => {
    addXP(XP_VALVE, "Pressure valved");
    celebrate({
      variant: "reward",
      title: "PRESSURE VALVED",
      subtitle: "Released clean — no swamp damage.",
      detail: takeaway,
    });
  };

  if (view === "forge") {
    return (
      <PressureForge
        onClose={() => { setView(null); setRefresh((n) => n + 1); }}
        onComplete={onForgeComplete}
      />
    );
  }

  if (view === "storm") {
    return (
      <StormCaptain
        onClose={() => { setView(null); setRefresh((n) => n + 1); }}
        onComplete={onStormComplete}
      />
    );
  }

  if (view === "valve") {
    return (
      <SwampValve
        onClose={() => { setView(null); setRefresh((n) => n + 1); }}
        onFinish={(tool, takeaway) => {
          onValveComplete(tool, takeaway);
          setView(null);
          setRefresh((n) => n + 1);
        }}
      />
    );
  }

  return <Hub key={refresh} onOpen={(id) => setView(id)} />;
}

function Hub({ onOpen }) {
  const state = loadForgeState();
  const level = getLevel(state.totalForged);
  const next = getNextLevel(state.totalForged);
  const featured = GAMES.find((g) => g.featured);
  const rest = GAMES.filter((g) => !g.featured);
  const [, force] = useState(0);

  const card = (g, i) => (
    <button
      key={g.id}
      className={`ag-card ${g.featured ? "ag-card--featured" : ""} ${g.live ? "" : "ag-card--soon"}`}
      style={{ "--acc": g.accent, "--i": i }}
      onClick={() => g.live && onOpen(g.id)}
      disabled={!g.live}
      aria-label={g.live ? `Open ${g.name}` : `${g.name} — coming soon`}
    >
      <div className="ag-card__aura" />
      <div className="ag-card__scan" />
      <div className="ag-card__topline">
        <span className="ag-card__when">{g.when}</span>
        <span className="ag-card__relic">{g.relic}</span>
      </div>
      <div className="ag-card__body">
        <span className="ag-card__tag">{g.tag}</span>
        <h2>{g.name}</h2>
        <p>{g.sub}</p>
      </div>
      <span className="ag-card__cta">{g.live ? "Enter →" : "Coming soon"}</span>
    </button>
  );

  return (
    <div className="ag-hub">
      <div className="ag-hub__head">
        <div className="ag-forge" aria-hidden>
          <div className="ag-forge__glow" />
          <div className="ag-forge__embers" />
        </div>
        <p className="ag-hub__kicker">Emotional Performance · The Anger Gym</p>
        <h1 className="ag-hero-title">Anger Gym</h1>
        <p className="ag-hub__sub">
          Four games for the heat. Three of them let you bleed pressure off safely — one teaches you to
          keep it and forge it into action. You don&rsquo;t come here to calm down. You come here to get <b>trained</b>.
        </p>

        {state.totalForged > 0 && (
          <div className="ag-levelrow">
            <div className="ag-level" style={{ "--lc": level.color }}>
              <span className="ag-level__icon">{level.icon}</span>
              <span className="ag-level__name">{level.name}</span>
            </div>
            {state.streak > 0 && (
              <div className="ag-streak"><span>🔥</span> {state.streak} day forge streak</div>
            )}
            {next && (
              <div className="ag-level__next">{next.min - state.totalForged} more to {next.icon} {next.name}</div>
            )}
          </div>
        )}
      </div>

      <div className="ag-grid">
        {featured && card(featured, 0)}
        <div className="ag-grid__row">
          {rest.map((g, i) => card(g, i + 1))}
        </div>
      </div>

      {/* Forge trail */}
      <div className="ag-trail">
        <div className="ag-trail__head">
          <span className="ag-trail__title">Your forge trail</span>
          {state.history.length > 0 && (
            <button className="ag-trail__clear" onClick={() => { clearForgeTrail(); force((n) => n + 1); }}>Clear</button>
          )}
        </div>
        {state.history.length === 0 ? (
          <p className="ag-trail__empty">Every round you forge leaves a receipt here — the pressure, the drop in heat, and the one move you chose.</p>
        ) : (
          <ul className="ag-trail__list">
            {state.history.slice(0, 6).map((row) => (
              <li key={row.at} className="ag-trail__row">
                <span className="ag-trail__dot" />
                <div className="ag-trail__main">
                  <div className="ag-trail__meta">
                    <span className="ag-trail__src">{row.source}</span>
                    <span className="ag-trail__heat">🔥 {row.heatBefore}→{row.heatAfter}</span>
                    <span className="ag-trail__time">{timeAgo(row.at)}</span>
                  </div>
                  {row.action && <p className="ag-trail__text">🔨 {row.action}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
