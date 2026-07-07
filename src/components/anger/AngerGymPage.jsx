import React, { useState } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import PressureForge from "./PressureForge.jsx";
import StormCaptain from "../storm/StormCaptain.jsx";
import SwampValve from "../shadow/swamp/SwampValve.jsx";
import TheDoorHub from "./TheDoorHub.jsx";
import ObjectionSlam from "./ObjectionSlam.jsx";
import { loadForgeState, clearForgeTrail } from "./pressureForgeStore.js";
import { getLevel, getNextLevel } from "./pressureForgeData.js";
import "../../styles/anger.css";

/* ════════════════════════════════════════════════════════════════════════
   THE ANGER GYM — five games for turning heat into something useful.

   1 · Pressure Forge  — stress → one clean action       (LIVE)
   2 · The Door        — knock through the NOs           (LIVE)
   3 · Objection Slam  — rejection resilience arcade     (LIVE)
   4 · Swamp Valve     — funny, safe pressure release    (LIVE)
   5 · Storm Captain   — overwhelm survival              (LIVE)

   Door and Slam train you to eat rejection for breakfast; Valve and Captain
   bleed off raw heat. Forge is where you learn to keep it and shape it.
   This hub is the training floor that ties them together.
   ════════════════════════════════════════════════════════════════════════ */

const XP_FORGE = 30;
const XP_STORM = 25;
const XP_VALVE = 25;
const XP_DOOR = 20;
const XP_SLAM_LEVEL = 8; // per level cleared — levels are independently replayable

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
    id: "door",
    name: "The Door",
    when: "They keep telling you no",
    relic: "The Threshold",
    sub: "FOUR levels of persistence warfare. Knock through the screaming, chase him behind a gated steel door, saw your way in, and make him regret saying 'come back later.' Bloody Knuckles, power slaps, porch brawls. 21+, sound on.",
    tag: "Persistence arcade · 4 levels · 21+",
    accent: "#FF3B5C",
    live: true,
  },
  {
    id: "slam",
    name: "Objection Slam",
    when: "Their words are getting to you",
    relic: "The Arena",
    sub: "3 customers, pick your fight. They hurl objections OUT LOUD, you slam back like you always wished you could — and sometimes they respect the hustle and close early. Zero cares given. 21+, sound on.",
    tag: "Rejection resilience · 3 levels · 21+",
    accent: "#FF3EDB",
    live: true,
  },
  {
    id: "valve",
    name: "Swamp Valve",
    when: "You need to vent — safely",
    relic: "The Release",
    sub: "Throw what you're carrying INTO the swamp, then drain it. Three swamps — Stress, Rage, Doubt — every one earns its rainbow.",
    tag: "Safe pressure release",
    accent: "#00FFBF",
    live: true,
  },
  {
    id: "storm",
    name: "Storm Captain",
    when: "Everything's hitting at once",
    relic: "The Helm",
    sub: "The overwhelm rides in as storm clouds. Strike each thought down with lightning — then ROAR the whole wave apart.",
    tag: "Overwhelm ride",
    accent: "#00F0FF",
    live: true,
  },
];

// One-time explicit-content confirmation before any RAW (18+) game mounts.
// The "21+ RAW" badge is a promise — this is where the app actually keeps it.
const RAW_ACK_KEY = "anger_raw_ack_v1";

function RawGate({ onConfirm, onBack }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 420, textAlign: "center", background: "rgba(255,59,92,0.06)", border: "1px solid rgba(255,59,92,0.35)", borderRadius: 16, padding: "34px 26px" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }} aria-hidden="true">🔞</div>
        <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>RAW MODE AHEAD</h2>
        <p style={{ margin: "0 0 8px", fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,0.75)" }}>
          This training floor contains <strong>frequent explicit language</strong> and{" "}
          <strong>cartoon violence</strong>, played loud. It's absurdist satire built to
          rejection-proof your nervous system — never real-world advice.
        </p>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          You'll only see this once.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onConfirm}
            style={{ padding: "12px 26px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #FF3B5C, #FF3EDB)", color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: "0.08em", cursor: "pointer" }}
          >
            I'M 18+ — LET ME IN
          </button>
          <button
            type="button"
            onClick={onBack}
            style={{ padding: "12px 22px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.25)", background: "none", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            NOT NOW
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [rawAck, setRawAck] = useState(() => {
    try { return localStorage.getItem(RAW_ACK_KEY) === "1"; } catch { return false; }
  });

  const confirmRaw = () => {
    try { localStorage.setItem(RAW_ACK_KEY, "1"); } catch { /* ignore */ }
    setRawAck(true);
  };

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

  const onDoorComplete = (payload) => {
    addXP(XP_DOOR, "Door broken down");
    celebrate({
      variant: "reward",
      title: payload.level ? `LEVEL ${payload.level}: DOWN` : "DOOR: DOWN",
      subtitle: `${payload.knocks ?? 0} knocks · ${payload.nos ?? 0} NOs survived · zero quits.`,
      detail: payload.takeaway,
    });
  };

  const onSlamComplete = (payload) => {
    addXP(XP_SLAM_LEVEL, "Objections slammed");
    celebrate({
      variant: "reward",
      title: payload.closedEarly ? "CHARMED THE SALE" : (payload.cares <= 20 ? "ZERO CARES GIVEN" : "OBJECTIONS SLAMMED"),
      subtitle: `${payload.deflected} slammed back · ${payload.perfects} without blinking.`,
      detail: payload.takeaway,
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

  if ((view === "door" || view === "slam") && !rawAck) {
    return <RawGate onConfirm={confirmRaw} onBack={() => setView(null)} />;
  }

  if (view === "door") {
    return (
      <TheDoorHub
        onClose={() => { setView(null); setRefresh((n) => n + 1); }}
        onComplete={onDoorComplete}
      />
    );
  }

  if (view === "slam") {
    return (
      <ObjectionSlam
        onClose={() => { setView(null); setRefresh((n) => n + 1); }}
        onComplete={onSlamComplete}
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
          Five games for the heat. Two train you to eat rejection for breakfast, two bleed pressure off
          safely — and one teaches you to keep it and forge it into action. You don&rsquo;t come here to
          calm down. You come here to get <b>trained</b>.
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
