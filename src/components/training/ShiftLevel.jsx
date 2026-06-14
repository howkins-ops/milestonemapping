import React, { useState } from "react";
import ShiftCinematic from "./ShiftCinematic.jsx";
import ShiftComplete from "./ShiftComplete.jsx";
import IntroGame from "./games/IntroGame.jsx";
import ValuesGame from "./games/ValuesGame.jsx";
import IdentityGame from "./games/IdentityGame.jsx";
import MasksGame from "./games/MasksGame.jsx";
import MisconceptionsGame from "./games/MisconceptionsGame.jsx";

function GameRouter({ module, onComplete }) {
  switch (module.gameType) {
    case "intro":
      return <IntroGame module={module} onComplete={onComplete} />;
    case "values":
      return <ValuesGame module={module} onComplete={onComplete} />;
    case "identity":
      return <IdentityGame module={module} onComplete={onComplete} />;
    case "masks":
      return <MasksGame module={module} onComplete={onComplete} />;
    case "misconceptions":
      return <MisconceptionsGame module={module} onComplete={onComplete} />;
    default:
      return null;
  }
}

export default function ShiftLevel({ module, onClose, onShiftComplete }) {
  const [phase, setPhase] = useState("cinematic"); // "cinematic" | "game" | "complete"
  const [artifacts, setArtifacts] = useState(null);

  const handleCinematicDone = () => {
    setPhase("game");
  };

  const handleGameDone = (gameArtifacts) => {
    setArtifacts(gameArtifacts);
    onShiftComplete(module.id, gameArtifacts);
    setPhase("complete");
  };

  const handleReplay = () => {
    setPhase("cinematic");
    setArtifacts(null);
  };

  return (
    <>
      {phase === "cinematic" && (
        <ShiftCinematic module={module} onComplete={handleCinematicDone} />
      )}
      {phase === "game" && (
        <GameRouter module={module} onComplete={handleGameDone} />
      )}
      {phase === "complete" && (
        <ShiftComplete
          module={module}
          artifacts={artifacts}
          onDone={onClose}
          onReplay={handleReplay}
        />
      )}
    </>
  );
}
