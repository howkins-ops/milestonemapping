import React, { useMemo, useState } from "react";
import WorldScene from "../../city/world/WorldScene.jsx";
import StoryDialog from "../../city/StoryDialog.jsx";
import useCitySocial from "../../city/useCitySocial.js";
import { isCrossingOpen } from "../../city/journeyStore.js";
import {
  SPIRE_FLOORS,
  buildSpireFloorWorld,
  floorOpen,
  floorComplete,
} from "./spireWorlds.js";
import "../../../styles/spire.css";

// ════════════════════════════════════════════════════════════════════════
// THE SPIRE — walkable WORLD mode of the quest (ACT 2)
// Five floors on the same engine as the hometown and the city street.
// Chapter doors mirror the quest book exactly (same isChapterComplete);
// entering a ready door plays the chapter cinematic via RPGWorldPage.
// The floor keeper talks; your real pack stands around; the elevator east
// opens when the floor's chapters are complete. Floor V's roof exit leads
// to the Crossing once Ch24 is done.
// ════════════════════════════════════════════════════════════════════════

const FLOOR_KEY = "mq_spire_floor_v1";

function loadFloorIdx() {
  try {
    const n = Number(sessionStorage.getItem(FLOOR_KEY));
    return Number.isFinite(n) && n >= 0 && n < SPIRE_FLOORS.length ? n : 0;
  } catch {
    return 0;
  }
}

function saveFloorIdx(i) {
  try {
    sessionStorage.setItem(FLOOR_KEY, String(i));
  } catch {
    /* no-op */
  }
}

const PACK_LINES = [
  "Same tower, same climb. Keep going.",
  "I lit my whole street for this. Worth it.",
  "The floor above gets loud. Name it anyway.",
  "Saw your light come on from the plaza. We see you.",
  "Nobody climbs this thing alone. Not really.",
];

export default function SpireJourney({
  isChapterComplete,
  onEnterChapter,
  onExitToStreets,
  onEnterCrossing,
  reducedMotion = false,
}) {
  const social = useCitySocial();
  const [floorIdx, setFloorIdx] = useState(loadFloorIdx);
  const [dialog, setDialog] = useState(null); // StoryDialog scene

  // Clamp to the highest open floor (saves can't skip ahead).
  const openIdx = useMemo(() => {
    let last = 0;
    SPIRE_FLOORS.forEach((f, i) => {
      if (floorOpen(f, isChapterComplete)) last = i;
    });
    return last;
  }, [isChapterComplete]);

  const idx = Math.min(floorIdx, openIdx);
  const floor = SPIRE_FLOORS[idx];

  const citizens = useMemo(() => {
    const friends = Array.isArray(social.friends) ? social.friends : [];
    return friends.slice(0, 5).map((f, i) => ({
      id: f.user_id || f.username || String(i),
      name: `@${f.username || f.display_name || "citizen"}`,
      color: "#00F0FF",
    }));
  }, [social.friends]);

  const world = useMemo(
    () => buildSpireFloorWorld(floor, isChapterComplete, { citizens }),
    [floor, isChapterComplete, citizens]
  );

  const goToFloor = (i) => {
    const clamped = Math.max(0, Math.min(SPIRE_FLOORS.length - 1, i));
    setFloorIdx(clamped);
    saveFloorIdx(clamped);
  };

  const talkNpc = (id) => {
    if (id === floor.keeper.id) {
      setDialog({
        title: `${floor.num} · ${floor.title.toUpperCase()}`,
        color: floor.keeper.color,
        sprite: "mentor",
        speakerName: floor.keeper.name,
        epithet: "Keeper of this floor",
        beats: floor.keeper.lines.map((line) => ({ speaker: floor.keeper.name.toUpperCase(), lines: [line] })),
        doneLabel: "Back to the climb",
      });
      return;
    }
    if (id.startsWith("citizen:")) {
      const npc = (world.npcs || []).find((n) => n.id === id);
      const line = PACK_LINES[Math.abs(id.length * 7 + idx) % PACK_LINES.length];
      setDialog({
        title: "THE PACK",
        color: "#00F0FF",
        sprite: "mentor",
        speakerName: npc ? npc.name : "A fellow climber",
        epithet: "Climbing the same tower",
        beats: [{ speaker: npc ? npc.name.toUpperCase() : "CLIMBER", lines: [`“${line}”`] }],
        doneLabel: "Keep climbing",
      });
    }
  };

  const exitEdge = (side) => {
    if (side === "left") {
      if (idx > 0) goToFloor(idx - 1);
      else if (onExitToStreets) onExitToStreets();
      return;
    }
    // right — the elevator (only rendered when the floor is complete)
    if (!floorComplete(floor, isChapterComplete)) return;
    if (idx < SPIRE_FLOORS.length - 1) {
      goToFloor(idx + 1);
      return;
    }
    // Floor V roof — the Crossing waits past Ch24.
    if (isCrossingOpen() && onEnterCrossing) onEnterCrossing();
    else {
      setDialog({
        title: "THE ROOF",
        color: "#7B2CFF",
        sprite: "mentor",
        speakerName: "The Alchemist",
        epithet: "Your future self",
        beats: [
          {
            speaker: "THE ALCHEMIST",
            lines: [
              "Past this roof there's a road with five cities on it, and one shadow that walks them all.",
              "Finish the Return first. Then we cross.",
            ],
          },
        ],
        doneLabel: "Back to the climb",
      });
    }
  };

  return (
    <div className="spw-root">
      <div className="spw-floorbar" role="tablist" aria-label="Spire floors">
        {SPIRE_FLOORS.map((f, i) => {
          const open = i <= openIdx;
          const done = floorComplete(f, isChapterComplete);
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              disabled={!open}
              className={`spw-floorchip${i === idx ? " is-now" : ""}${done ? " is-done" : ""}`}
              style={{ "--fc": f.accent }}
              onClick={() => goToFloor(i)}
            >
              {f.num}
            </button>
          );
        })}
      </div>

      <WorldScene
        world={world}
        spawnX={world.spawnX}
        paused={Boolean(dialog)}
        reducedMotion={reducedMotion}
        playerGlow={floor.accent}
        showAmbient={false}
        onEnterBuilding={(id) => {
          const b = (world.buildings || []).find((x) => x.id === id);
          if (b && !b.locked && onEnterChapter) onEnterChapter(id);
        }}
        onTalkNpc={talkNpc}
        onExitEdge={exitEdge}
      />

      {dialog ? (
        <StoryDialog scene={dialog} onDone={() => setDialog(null)} onClose={() => setDialog(null)} />
      ) : null}
    </div>
  );
}
