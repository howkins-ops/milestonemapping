import React, { useEffect, useMemo, useState } from "react";
import WorldScene from "../world/WorldScene.jsx";
import StoryDialog from "../StoryDialog.jsx";
import DepartureCinematic from "./DepartureCinematic.jsx";
import {
  buildHometownWorld,
  beatForInteraction,
  HOMETOWN_BEATS,
  ROAD_OUT_INDEX,
  HOMETOWN_DUST,
} from "./hometownWorld.js";
import { loadJourney, recordHometownBeat, completeHometown } from "../journeyStore.js";

// ════════════════════════════════════════════════════════════════════════
// THE HOMETOWN — journey orchestration
// Wraps WorldScene with the hometown config, maps doors/NPC to story
// beats (linear via journey.hometown.nextBeat — completed beats replay as
// memories, skipping ahead is not a thing), and runs the departure
// cinematic when the road out is taken. onComplete({ firstEver }) lets
// the city page award the one-time XP/achievement and switch worlds —
// so users who skipped the hometown can still earn it later by walking
// the road home.
// ════════════════════════════════════════════════════════════════════════

export default function HometownJourney({ reducedMotion = false, onComplete }) {
  const [hometown, setHometown] = useState(() => loadJourney().hometown);
  const [activeBeat, setActiveBeat] = useState(null);
  const [cinematic, setCinematic] = useState(false);

  const revisit = Boolean(hometown.completedAt);

  // The restless morning plays itself on first arrival.
  useEffect(() => {
    if (hometown.nextBeat === 0) {
      const t = setTimeout(() => setActiveBeat(HOMETOWN_BEATS[0]), 900);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const world = useMemo(
    () => buildHometownWorld({ nextBeat: hometown.nextBeat, spawnAtRoad: revisit }),
    [hometown.nextBeat, revisit]
  );

  const playInteraction = (kind, id) => {
    const beat = beatForInteraction(kind, id);
    if (!beat) return;
    if (beat.index > hometown.nextBeat) return; // linear story — no skipping
    setActiveBeat(beat);
  };

  const onDialogDone = () => {
    if (activeBeat) {
      recordHometownBeat(activeBeat.id, activeBeat.index);
      setHometown(loadJourney().hometown);
    }
    setActiveBeat(null);
  };

  const onExitEdge = (side) => {
    if (side !== "right") return;
    if (hometown.nextBeat < ROAD_OUT_INDEX) return;
    setCinematic(true);
  };

  return (
    <>
      <WorldScene
        world={world}
        spawnX={world.spawnX}
        paused={Boolean(activeBeat || cinematic)}
        reducedMotion={reducedMotion}
        playerGlow={HOMETOWN_DUST}
        showAmbient={false}
        onEnterBuilding={(id) => playInteraction("building", id)}
        onTalkNpc={(id) => playInteraction("npc", id)}
        onExitEdge={onExitEdge}
      />

      {activeBeat ? (
        <StoryDialog
          scene={activeBeat.scene}
          onDone={onDialogDone}
          onClose={revisit ? () => setActiveBeat(null) : undefined}
        />
      ) : null}

      {cinematic ? (
        <DepartureCinematic
          onDone={() => {
            const { firstEver } = completeHometown();
            setCinematic(false);
            if (onComplete) onComplete({ firstEver });
          }}
        />
      ) : null}
    </>
  );
}
