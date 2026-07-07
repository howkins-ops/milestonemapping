import React, { useEffect, useMemo, useState } from "react";
import WorldScene from "../world/WorldScene.jsx";
import StoryDialog from "../StoryDialog.jsx";
import DepartureCinematic from "./DepartureCinematic.jsx";
import StationForm from "./StationForm.jsx";
import LetterDesk from "./LetterDesk.jsx";
import QuitJobGame from "./QuitJobGame.jsx";
import {
  buildHometownWorld,
  buildSendoffScene,
  stationByTrigger,
  STATIONS,
  STATION_ORDER,
  HOMETOWN_DUST,
} from "./hometownWorld.js";
import {
  loadJourney,
  recordHometownStation,
  completeHometown,
  isCityOpen,
  getHometownOutputs,
} from "../journeyStore.js";
import { seedDayOneSnapshot } from "../../map-quest/useMapQuestState.js";
import { useAppData } from "../../../hooks/useAppData.js";
import "../../../styles/hometown.css";

// ════════════════════════════════════════════════════════════════════════
// THE HOMETOWN — ACT 0 orchestration (onboarding IS the game)
// Wraps WorldScene with the hometown config and runs the four stations:
// intro dialog → the station's real exercise → recorded in the journey
// store. Linear (no skipping), every completed station replayable as a
// memory. GATE 1: the road out only opens at 4/4; taking it plays the
// departure cinematic and hands the journey to the city.
// ════════════════════════════════════════════════════════════════════════

export default function HometownJourney({ reducedMotion = false, onComplete }) {
  const { addXP, celebrate } = useAppData();
  const [hometown, setHometown] = useState(() => loadJourney().hometown);
  const [active, setActive] = useState(null); // station def
  const [phase, setPhase] = useState(null); // "intro" | "exercise"
  const [cinematic, setCinematic] = useState(false);

  const revisit = Boolean(hometown.completedAt);
  const stationsDone = hometown.stations || {};

  // The restless morning nudge: on a brand-new save, the house pulses as
  // `next`; the world itself teaches the player to walk to it, so no auto
  // dialog is forced — the first door IS the tutorial.
  const world = useMemo(
    () => buildHometownWorld({ stationsDone, spawnAtRoad: revisit }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hometown, revisit]
  );

  const refresh = () => setHometown(loadJourney().hometown);

  const openStation = (station) => {
    setActive(station);
    setPhase(station.kind === "sendoff" ? "exercise" : "intro");
  };

  const playInteraction = (kind, id) => {
    const station = stationByTrigger(kind, id);
    if (!station) return;
    const doneCount = STATION_ORDER.filter((s) => stationsDone[s]).length;
    if (station.index > doneCount) return; // linear story — no skipping
    openStation(station);
  };

  const closeStation = () => {
    setActive(null);
    setPhase(null);
  };

  const finishStation = (stationId, outputs = {}) => {
    const { firstTime } = recordHometownStation(stationId, outputs);
    if (stationId === "why") {
      // seed the Day-One snapshot the quest mirrors at Ch1 + Ch23
      seedDayOneSnapshot({
        whyILeft: outputs.whyILeft,
        whoIAmNow: outputs.whoIAmNow,
        biggestFear: outputs.biggestFear,
      });
    }
    if (firstTime) {
      const titles = {
        why: { title: "THE WHY IS WRITTEN", subtitle: "It travels with you now." },
        letter: {
          title: "THE LETTER IS SEALED",
          subtitle: "On the worst night, the app hands it back.",
        },
        quit: { title: "YOU WALKED OUT", subtitle: "The excuses stay in this town." },
        sendoff: {
          title: "THE PENDANT IS YOURS",
          subtitle: "Radiance · Love · Power · Majesty · Joy",
        },
      };
      const t = titles[stationId];
      addXP(15, `Hometown station: ${stationId}`);
      if (t) {
        celebrate({
          variant: "project",
          title: t.title,
          subtitle: t.subtitle,
          detail: "The road out is closer than it was.",
        });
      }
    }
    refresh();
    closeStation();
  };

  const onIntroDone = () => {
    if (!active) return;
    setPhase("exercise");
  };

  const onExitEdge = (side) => {
    if (side !== "right") return;
    if (!isCityOpen()) return;
    setCinematic(true);
  };

  // Sendoff scene is built fresh each open so it echoes the latest WHY.
  const sendoffScene = useMemo(
    () => (active && active.kind === "sendoff" ? buildSendoffScene(getHometownOutputs()) : null),
    [active]
  );

  const outputs = hometown.outputs || {};
  const paused = Boolean(active || cinematic);

  return (
    <>
      <WorldScene
        world={world}
        spawnX={world.spawnX}
        paused={paused}
        reducedMotion={reducedMotion}
        playerGlow={HOMETOWN_DUST}
        showAmbient={false}
        onEnterBuilding={(id) => playInteraction("building", id)}
        onTalkNpc={(id) => playInteraction("npc", id)}
        onExitEdge={onExitEdge}
      />

      {active && phase === "intro" ? (
        <StoryDialog
          scene={active.intro}
          onDone={onIntroDone}
          onClose={stationsDone[active.id] ? closeStation : undefined}
        />
      ) : null}

      {active && phase === "exercise" && active.id === "why" ? (
        <StationForm
          initial={outputs}
          onSave={(vals) => finishStation("why", vals)}
          onClose={stationsDone.why ? closeStation : undefined}
        />
      ) : null}

      {active && phase === "exercise" && active.id === "letter" ? (
        <LetterDesk
          initial={outputs.antiQuitLetter || ""}
          onSave={(antiQuitLetter) => finishStation("letter", { antiQuitLetter })}
          onClose={stationsDone.letter ? closeStation : undefined}
        />
      ) : null}

      {active && phase === "exercise" && active.id === "quit" ? (
        <QuitJobGame
          onDone={() => finishStation("quit")}
          onClose={stationsDone.quit ? closeStation : undefined}
        />
      ) : null}

      {active && phase === "exercise" && active.kind === "sendoff" ? (
        <StoryDialog
          scene={sendoffScene}
          onDone={() => finishStation("sendoff")}
          onClose={stationsDone.sendoff ? closeStation : undefined}
        />
      ) : null}

      {cinematic ? (
        <DepartureCinematic
          onDone={() => {
            const { firstEver, blocked } = completeHometown();
            setCinematic(false);
            if (!blocked && onComplete) onComplete({ firstEver });
          }}
        />
      ) : null}
    </>
  );
}
