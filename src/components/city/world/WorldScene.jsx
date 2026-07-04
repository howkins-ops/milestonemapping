import React, { useEffect, useMemo, useRef } from "react";
import useWorldEngine from "./useWorldEngine.js";
import WorldControls from "./WorldControls.jsx";
import PlayerSprite from "./PlayerSprite.jsx";
import CityAmbient from "../CityAmbient.jsx";
import { MentorSprite } from "../../map-quest/kit.jsx";
import "../../../styles/cityWorld.css";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — the scene renderer
// Renders any world config (see worldConfig.js) as a side-scrolling street:
// fixed sky/stars/aurora, two parallax silhouette layers, one main world
// layer holding arches, props, district buildings, NPCs and the character,
// then viewport-fixed haze/ground and the HUD (prompt pill + controls).
// The engine owns every transform; buildings stay real <button>s so tap
// and keyboard-focus work without walking at all.
// ════════════════════════════════════════════════════════════════════════

// Deterministic star field (x %, y %, size px, twinkle delay s).
const STARS = [
  [4, 8, 2, 0], [11, 22, 1, 1.2], [17, 6, 2, 2.5], [23, 15, 1, 0.7],
  [30, 9, 2, 3.1], [36, 24, 1, 1.8], [41, 5, 1, 2.2], [48, 18, 2, 0.4],
  [54, 10, 1, 2.9], [61, 21, 2, 1.5], [66, 7, 1, 3.4], [72, 14, 2, 0.9],
  [78, 5, 1, 2.0], [84, 19, 2, 1.1], [90, 9, 1, 2.7], [95, 16, 2, 0.2],
  [8, 30, 1, 3.7], [58, 28, 1, 0.6], [88, 27, 1, 1.9], [33, 31, 1, 2.4],
];

const PARALLAX = { far: 0.18, mid: 0.45 };
const DOOR_RANGE = 60;

export default function WorldScene({
  world,
  stage = null,
  timeOfDay = null,
  spawnX,
  paused = false,
  reducedMotion = false,
  playerGlow = "#00F0FF",
  showAmbient = true,
  persistKey = null,
  onEnterBuilding,
  onTalkNpc,
  onExitEdge,
}) {
  const targets = useMemo(() => {
    const list = [];
    for (const b of world.buildings || []) {
      list.push({
        id: `b:${b.id}`,
        type: "door",
        x: Math.round(b.x + b.w / 2),
        range: Math.max(DOOR_RANGE, b.w / 2),
        building: b,
      });
    }
    for (const n of world.npcs || []) {
      list.push({ id: `n:${n.id}`, type: "npc", x: n.x, range: 64, npc: n });
    }
    const edges = world.edges || {};
    if (edges.left && edges.left.type === "exit") {
      list.push({ id: "e:left", type: "exit", x: 64, range: 70, edge: edges.left, side: "left" });
    }
    if (edges.right && edges.right.type === "exit") {
      list.push({
        id: "e:right",
        type: "exit",
        x: world.width - 64,
        range: 70,
        edge: edges.right,
        side: "right",
      });
    }
    return list;
  }, [world]);

  const {
    viewportRef,
    layerRef,
    farRef,
    midRef,
    charRef,
    nearTarget,
    walking,
    facing,
    heldDir,
    controls,
    getX,
  } = useWorldEngine({
    worldWidth: world.width,
    spawnX: typeof spawnX === "number" ? spawnX : world.spawnX,
    targets,
    parallax: PARALLAX,
    paused,
    reducedMotion,
  });

  // ── Persist position (sessionStorage) ──────────────────────────────────
  const getXRef = useRef(getX);
  getXRef.current = getX;
  useEffect(() => {
    if (!persistKey) return undefined;
    const save = () => {
      try {
        sessionStorage.setItem(persistKey, String(Math.round(getXRef.current())));
      } catch {
        /* storage unavailable — position just doesn't persist */
      }
    };
    window.addEventListener("pagehide", save);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
    };
  }, [persistKey]);

  // ── Acting on the near target ───────────────────────────────────────────
  const act = () => {
    if (!nearTarget) return;
    if (nearTarget.type === "door" && onEnterBuilding) {
      onEnterBuilding(nearTarget.building.id);
    } else if (nearTarget.type === "npc" && onTalkNpc) {
      onTalkNpc(nearTarget.npc.id);
    } else if (nearTarget.type === "exit" && onExitEdge) {
      onExitEdge(nearTarget.side, nearTarget.edge);
    }
  };

  const actRef = useRef(act);
  actRef.current = act;
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      // real buttons fire their own click on Enter/Space
      if (e.target && e.target.closest && e.target.closest("button")) return;
      const isTyping =
        e.target &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable);
      if (isTyping || paused) return;
      e.preventDefault();
      actRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused]);

  // ── Prompt content ──────────────────────────────────────────────────────
  let prompt = null;
  if (nearTarget && !paused) {
    if (nearTarget.type === "door") {
      const b = nearTarget.building;
      prompt = b.locked
        ? { label: `${b.name} — powered down`, key: "⏻", color: "rgba(242,240,244,0.65)" }
        : { label: `Enter — ${b.name}`, key: "⏎", color: b.color };
    } else if (nearTarget.type === "npc") {
      prompt = { label: `Talk — ${nearTarget.npc.name}`, key: "⏎", color: nearTarget.npc.color };
    } else if (nearTarget.type === "exit") {
      prompt = { label: nearTarget.edge.label || "Leave", key: "⏎", color: "#7B2CFF" };
    }
  }

  const stageClass = (stage && stage.className) || "";
  const todClass = (timeOfDay && timeOfDay.className) || "";
  const themeClass = world.theme || "";

  return (
    <div
      ref={viewportRef}
      className={`mqw-viewport ${themeClass} ${stageClass} ${todClass}${reducedMotion ? " mqw-viewport--still" : ""}`}
      role="group"
      aria-label={world.label || "The world"}
    >
      <div className="mqw-sky" aria-hidden="true" />

      <div className="mqw-stars" aria-hidden="true">
        {STARS.map(([x, y, s, d], i) => (
          <span
            key={i}
            className="mqw-star"
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, "--delay": `${d}s` }}
          />
        ))}
      </div>

      <div className="mqw-aurora" aria-hidden="true" />

      <div
        ref={farRef}
        className="mqw-far"
        aria-hidden="true"
        style={{ width: `calc(100% + ${Math.round(world.width * PARALLAX.far)}px)` }}
      >
        {(world.far || []).map((t, i) => (
          <span
            key={i}
            className="mqw-fart"
            style={{ left: `${t.x}%`, width: t.w, height: `${t.h}%` }}
          />
        ))}
      </div>

      <div
        ref={midRef}
        className="mqw-mid"
        aria-hidden="true"
        style={{ width: `calc(100% + ${Math.round(world.width * PARALLAX.mid)}px)` }}
      >
        {(world.mid || []).map((t, i) => (
          <span
            key={i}
            className={`mqw-midt${t.neon ? " mqw-midt--neon" : ""}`}
            style={{ left: `${t.x}%`, width: t.w, height: `${t.h}%` }}
          />
        ))}
      </div>

      {showAmbient ? <CityAmbient stage={stage} reducedMotion={reducedMotion} /> : null}

      <div ref={layerRef} className="mqw-main" style={{ width: world.width }}>
        {(world.props || []).map((p, i) => {
          if (p.type === "lamp") {
            return (
              <span
                key={`p${i}`}
                className="mqw-lamp"
                style={{ left: p.x, "--lamp-color": p.color || "#00F0FF" }}
                aria-hidden="true"
              />
            );
          }
          if (p.type === "fountain") {
            return (
              <span key={`p${i}`} className="mqw-fountain" style={{ left: p.x }} aria-hidden="true" />
            );
          }
          if (p.type === "gate") {
            return (
              <div key={`p${i}`} className="mqw-gate" style={{ left: p.x }} aria-hidden="true">
                <span className="mqw-gate__arc" />
                {p.label ? <span className="mqw-gate__label">{p.label}</span> : null}
              </div>
            );
          }
          return null;
        })}

        {(world.arches || []).map((a, i) => (
          <div
            key={`a${i}`}
            className="mqw-arch"
            style={{ left: a.x, width: a.w, "--arch-color": a.accent }}
            aria-hidden="true"
          >
            <span className="mqw-arch__bar">{a.label}</span>
          </div>
        ))}

        {(world.buildings || []).map((b) => (
          <button
            key={b.id}
            type="button"
            className={`mqw-b is-${b.glowState || "dim"}${b.locked ? " is-locked" : ""}${b.next ? " is-next" : ""}`}
            style={{
              left: b.x,
              width: b.w,
              height: `${b.hPct}%`,
              "--b-color": b.color,
              "--b-glow": b.glow,
            }}
            onClick={() => onEnterBuilding && onEnterBuilding(b.id)}
            aria-label={`${b.name} district${b.locked ? " — powered down" : ""}`}
          >
            <span className="mqw-b__beacon" aria-hidden="true" />
            <span className="mqw-b__sign" aria-hidden="true">{b.icon}</span>
            <span className="mqw-b__tower" aria-hidden="true" />
            <span className="mqw-b__door" aria-hidden="true" />
            <span className="mqw-b__plate" aria-hidden="true">{b.name}</span>
            <span className="mqw-b__lock" aria-hidden="true">⏻ powered down</span>
          </button>
        ))}

        {(world.npcs || []).map((n) => (
          <button
            key={n.id}
            type="button"
            className="mqw-npc"
            style={{ left: n.x - 30, "--npc-color": n.color }}
            onClick={() => onTalkNpc && onTalkNpc(n.id)}
            aria-label={`Talk to ${n.name}`}
          >
            <MentorSprite size={52} color={n.color} staff />
            <span className="mqw-npc__tag">{n.name}</span>
          </button>
        ))}

        <div
          ref={charRef}
          className={`mqw-char ${walking ? "mqw-char--walk" : "mqw-char--idle"}${facing === -1 ? " mqw-char--face-left" : ""}`}
          aria-hidden="true"
        >
          <div className="mqw-char__flip" style={{ marginLeft: -25 }}>
            <PlayerSprite glow={playerGlow} />
          </div>
        </div>
      </div>

      <div className="mqw-haze" aria-hidden="true" />
      <div className="mqw-ground" aria-hidden="true" />

      {prompt ? (
        <button
          type="button"
          className="mqw-prompt"
          style={{ "--prompt-color": prompt.color }}
          onClick={act}
        >
          <span className="mqw-prompt__key" aria-hidden="true">{prompt.key}</span>
          {prompt.label}
        </button>
      ) : null}

      <WorldControls controls={controls} heldDir={heldDir} />

      {stage || timeOfDay ? (
        <div className="mqw-meta" aria-hidden="true">
          {stage ? <span className="mqw-meta__stage">{stage.name}</span> : null}
          {stage && timeOfDay ? <span className="mqw-meta__dot">·</span> : null}
          {timeOfDay ? <span className="mqw-meta__tod">{timeOfDay.label}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
