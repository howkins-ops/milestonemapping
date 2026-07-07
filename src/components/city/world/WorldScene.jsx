import React, { useEffect, useMemo, useRef, useState } from "react";
import useWorldEngine from "./useWorldEngine.js";
import WorldControls from "./WorldControls.jsx";
import PlayerSprite from "./PlayerSprite.jsx";
import StreetEnemies from "./StreetEnemies.jsx";
import CityAmbient from "../CityAmbient.jsx";
import MaskSprite from "../masks/MaskSprite.jsx";
import { MentorSprite } from "../../map-quest/kit.jsx";
import fx from "./fx.js";
import { JUICE } from "./worldFxTuning.js";
import "../../../styles/cityWorld.css";
import "../../../styles/maskCourt.css";
import "../../../styles/cityWorldFx.css";

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

// Lifetime clown-squash count — pure comedy stat, shared by every world.
const BONK_KEY = "mqw_clown_bonks";

function readBonks() {
  try {
    const n = parseInt(localStorage.getItem(BONK_KEY) || "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

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
  // Mask Encounters street layer (all optional — every other world no-ops)
  onStride = null, // (dxAbs, x) — ground strides only, for the encounter engine
  maskLurkers = [], // [{ bossId, x, color, name, mutter }] — materialized bosses
  streetAllies = [], // [{ bossId, essenceColor }] — evolved masks trailing you
  fogOpacity = 1, // the court claimed → the fog thins city-wide
  onFaceBoss = null, // (bossId) — the player CHOSE the fight at the arch
  fxApiRef = null, // Living City: imperative scene FX handle for the page
  onStomp = null, // (kind, chain) — a clown got squashed (rewards layer)
}) {
  const targets = useMemo(() => {
    const list = [];
    for (const b of world.buildings || []) {
      list.push({
        id: `b:${b.id}`,
        type: "door",
        x: Math.round(b.x + b.w / 2),
        range: Math.max(DOOR_RANGE, b.w / 2),
        disabled: Boolean(b.disabled),
        building: b,
      });
    }
    for (const n of world.npcs || []) {
      list.push({
        id: `n:${n.id}`,
        type: "npc",
        x: n.x,
        range: 64,
        disabled: Boolean(n.disabled),
        npc: n,
      });
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
    // materialized mask bosses — soft gates: a walk-up FACE prompt, never a wall
    for (const m of maskLurkers) {
      list.push({ id: `m:${m.bossId}`, type: "mask", x: m.x + 48, range: 80, lurker: m });
    }
    return list;
  }, [world, maskLurkers]);

  // StreetEnemies installs its stomp collision check here; the engine calls
  // it every airborne frame. Nothing runs while the player is on the ground.
  const airFrameRef = useRef(null);
  const [bonks, setBonks] = useState(readBonks);

  // ── Living City juice (Phase 1) ─────────────────────────────────────────
  const fxLayerRef = useRef(null); // particle pool lives in this layer
  const stompChainRef = useRef(0); // stomps without touching the ground
  const charTimersRef = useRef([]); // coil/land class timeouts
  const pushCharTimer = (t) => charTimersRef.current.push(t);
  useEffect(() => {
    const list = charTimersRef.current;
    return () => list.forEach(clearTimeout);
  }, []);

  // Strides feed the encounter engine — but never mid-jump (§3 rule), so
  // the hook reads the airborne flag through a ref the loop can't rebind.
  const airborneRef = useRef(false);
  const onStrideRef = useRef(onStride);
  onStrideRef.current = onStride;

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
    airborne,
    controls,
    getX,
  } = useWorldEngine({
    worldWidth: world.width,
    spawnX: typeof spawnX === "number" ? spawnX : world.spawnX,
    targets,
    parallax: PARALLAX,
    paused,
    reducedMotion,
    onAirFrame: (y, vy) => {
      // air pose — apex hang near the top, forward lean on the way down
      const charEl = charRef.current;
      if (charEl) {
        const apex = Math.abs(vy) < 90;
        charEl.classList.toggle("mqw-char--apex", apex);
        charEl.classList.toggle("mqw-char--fall", !apex && vy < 0);
      }
      if (airFrameRef.current) airFrameRef.current(y, vy);
    },
    onStride: (dxAbs) => {
      if (onStrideRef.current && !airborneRef.current) {
        onStrideRef.current(dxAbs, getXInner());
      }
    },
    onJump: () => {
      // anticipation crouch — one beat; the tap still feels instant
      const charEl = charRef.current;
      if (charEl) {
        charEl.classList.add("mqfx-char--coil");
        pushCharTimer(
          setTimeout(() => charEl.classList.remove("mqfx-char--coil"), JUICE.coilMs)
        );
      }
      fx.burst(fxLayerRef.current, getXInner(), 0, "dust", 2);
    },
    onLand: (impact, { fromBounce }) => {
      stompChainRef.current = 0; // chains only live while airborne
      const charEl = charRef.current;
      if (charEl) {
        charEl.classList.remove("mqw-char--apex", "mqw-char--fall");
        charEl.classList.add("mqfx-char--land");
        pushCharTimer(
          setTimeout(() => charEl.classList.remove("mqfx-char--land"), JUICE.landSquashMs)
        );
      }
      const big = fromBounce || impact > 720;
      fx.burst(fxLayerRef.current, getXInner(), 0, "dust", big ? 7 : JUICE.landDust);
      fx.shake(shakeTarget(), { amp: big ? 3 : 2, ms: 90 });
    },
  });
  airborneRef.current = airborne;
  // getX isn't in scope when the engine config is built — bridge via ref
  const getXBridge = useRef(() => 0);
  getXBridge.current = getX;
  function getXInner() {
    return getXBridge.current();
  }

  // Prefer the engine's layer shake once Camera II lands; fall back to the
  // viewport class meanwhile.
  const shakeTarget = () =>
    controls && typeof controls.addShake === "function" ? controls : viewportRef.current;

  const handleStomp = (kind, pos) => {
    // THE STOMP — hit-stop + shockwave + shake + extra confetti, escalating
    // per chain link (chain = stomps without touching the ground).
    stompChainRef.current += 1;
    const chain = stompChainRef.current;
    fx.hitstop(controls, JUICE.hitstopMs);
    if (pos) {
      fx.ring(fxLayerRef.current, pos.x, pos.y, "#FF3EDB");
      fx.burst(fxLayerRef.current, pos.x, pos.y, "confetti", 4);
    }
    fx.shake(shakeTarget(), {
      amp: Math.min(JUICE.stompShakeCap, JUICE.stompShakeBase + (chain - 1)),
      ms: JUICE.shakeMs,
    });
    if (onStomp) onStomp(kind, chain);
    setBonks((n) => {
      const next = n + 1;
      try {
        localStorage.setItem(BONK_KEY, String(next));
      } catch {
        /* counter just won't persist */
      }
      return next;
    });
  };

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

  // ── Imperative scene FX handle ──────────────────────────────────────────
  // The page drives journey beats through this: eruptions, toasts, flashes.
  // (Camera II adds panTo/zoom/letterbox to the same handle.)
  useEffect(() => {
    if (!fxApiRef) return undefined;
    const api = {
      getX: () => getXBridge.current(),
      toast: (text, color, opts) => fx.toast(viewportRef.current, text, color, opts),
      flash: (opts) => fx.flash(viewportRef.current, opts),
      shake: (opts) => fx.shake(shakeTarget(), opts),
      burstAt: (x, y, kind, n, color) => fx.burst(fxLayerRef.current, x, y, kind, n, color),
      ringAt: (x, y, color) => fx.ring(fxLayerRef.current, x, y, color),
      // POWER-ON — the building performs: windows ramp floor-by-floor, the
      // beacon ignites with a shockwave, sparks burst off the rooftop sign.
      erupt: (buildingId) => {
        const b = (world.buildings || []).find((v) => v.id === buildingId);
        const el = viewportRef.current
          ? viewportRef.current.querySelector(`[data-bid="${buildingId}"]`)
          : null;
        if (!el || !b) return;
        el.classList.add("mqfx-erupt");
        pushCharTimer(setTimeout(() => el.classList.remove("mqfx-erupt"), 1700));
        const vpH = viewportRef.current ? viewportRef.current.clientHeight : 400;
        const x = Math.round(b.x + b.w / 2);
        const topY = Math.round((b.hPct / 100) * vpH);
        pushCharTimer(
          setTimeout(() => {
            fx.ring(fxLayerRef.current, x, topY, b.color);
            fx.burst(fxLayerRef.current, x, topY + 8, "spark", 6, b.color);
          }, 620)
        );
      },
    };
    fxApiRef.current = api;
    return () => {
      if (fxApiRef.current === api) fxApiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, fxApiRef]);

  // ── Acting on the near target ───────────────────────────────────────────
  // Entering a district: the door flares + a district-color flash before the
  // sheet opens — the verb has weight (Phase 1).
  const enterBuilding = (b) => {
    if (!b || !onEnterBuilding) return;
    try {
      const doorEl = viewportRef.current
        ? viewportRef.current.querySelector(`[data-bid="${b.id}"] .mqw-b__door`)
        : null;
      if (doorEl && !b.locked && !b.sealed) {
        doorEl.classList.add("mqfx-doorflare");
        pushCharTimer(setTimeout(() => doorEl.classList.remove("mqfx-doorflare"), 320));
        fx.flash(viewportRef.current, { color: b.color, ms: 110 });
      }
    } catch {
      /* flare is garnish */
    }
    onEnterBuilding(b.id);
  };

  const act = () => {
    if (!nearTarget) return;
    if (nearTarget.type === "door" && onEnterBuilding) {
      enterBuilding(nearTarget.building);
    } else if (nearTarget.type === "npc" && onTalkNpc) {
      onTalkNpc(nearTarget.npc.id);
    } else if (nearTarget.type === "exit" && onExitEdge) {
      onExitEdge(nearTarget.side, nearTarget.edge);
    } else if (nearTarget.type === "mask" && onFaceBoss) {
      onFaceBoss(nearTarget.lurker.bossId);
    }
  };

  // A looming boss mutters its first attack line as you come close — walk
  // past and it's just ambient text; the fight is always a CHOICE.
  const [mutter, setMutter] = useState(null); // { bossId, line, key }
  useEffect(() => {
    if (nearTarget && nearTarget.type === "mask" && nearTarget.lurker.mutter) {
      setMutter({
        bossId: nearTarget.lurker.bossId,
        line: nearTarget.lurker.mutter,
        key: Date.now(),
      });
    }
  }, [nearTarget]);

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
      prompt = b.sealed
        ? { label: `${b.name} — SEALED`, key: "◈", color: "#7B2CFF" }
        : b.locked
          ? { label: `${b.name} — powered down`, key: "⏻", color: "rgba(242,240,244,0.65)" }
          : { label: `Enter — ${b.name}`, key: "⏎", color: b.color };
    } else if (nearTarget.type === "npc") {
      prompt = { label: `Talk — ${nearTarget.npc.name}`, key: "⏎", color: nearTarget.npc.color };
    } else if (nearTarget.type === "exit") {
      prompt = { label: nearTarget.edge.label || "Leave", key: "⏎", color: "#7B2CFF" };
    } else if (nearTarget.type === "mask") {
      prompt = { label: `FACE — ${nearTarget.lurker.name}`, key: "⚔", color: nearTarget.lurker.color };
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
            className={`mqw-b is-${b.glowState || "dim"}${b.locked ? " is-locked" : ""}${b.next ? " is-next" : ""}${b.sealed ? " is-sealed" : ""}`}
            data-bid={b.id}
            style={{
              left: b.x,
              width: b.w,
              height: `${b.hPct}%`,
              "--b-color": b.color,
              "--b-glow": b.glow,
            }}
            onClick={() => enterBuilding(b)}
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

        {(world.maskDens || []).map((d, i) => (
          <span
            key={`fog${i}`}
            className="mqk-fogbank"
            style={{ left: d.x, width: d.w, "--fog-opacity": fogOpacity }}
            aria-hidden="true"
          />
        ))}

        {maskLurkers.map((m) => (
          <div
            key={m.bossId}
            className="mqk-lurk"
            style={{ left: m.x, "--lurk-color": m.color }}
            aria-hidden="true"
          >
            <div className="mqk-lurk__inner">
              <MaskSprite kind={m.bossId} />
            </div>
            <span className="mqk-lurk__tag">{m.name}</span>
            {mutter && mutter.bossId === m.bossId ? (
              <span key={mutter.key} className="mqk-lurk__mutter">
                “{mutter.line}”
              </span>
            ) : null}
          </div>
        ))}

        {/* juice layer — pooled particles/rings live here (Phase 1) */}
        <div ref={fxLayerRef} className="mqfx-layer" aria-hidden="true" />

        {(world.enemies || []).length ? (
          <StreetEnemies
            enemies={world.enemies}
            charRef={charRef}
            airFrameRef={airFrameRef}
            onBounce={controls.bounce}
            onStomp={handleStomp}
          />
        ) : null}

        <div
          ref={charRef}
          className={`mqw-char ${walking ? "mqw-char--walk" : "mqw-char--idle"}${facing === -1 ? " mqw-char--face-left" : ""}${airborne ? " mqw-char--air" : ""}`}
          aria-hidden="true"
        >
          <div className="mqw-char__flip" style={{ marginLeft: -25 }}>
            <PlayerSprite glow={playerGlow} />
          </div>
          {streetAllies.map((a, i) => (
            <div
              key={a.bossId}
              className="mqk-ally"
              style={{
                left: -(52 + i * 30),
                "--ally-glow": a.essenceColor || "#3f8cff",
                "--bob-delay": `${i * 0.22}s`,
              }}
            >
              <div className="mqk-ally__bob">
                <MaskSprite kind={a.bossId} evolved />
              </div>
            </div>
          ))}
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

      {bonks > 0 && (world.enemies || []).length ? (
        <div className="mqw-bonks" aria-hidden="true">
          🤡 ×{bonks} squashed
        </div>
      ) : null}
    </div>
  );
}
