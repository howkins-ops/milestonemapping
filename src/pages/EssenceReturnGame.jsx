import { useMemo, useState } from "react";
import AwarenessMirror from "../components/AwarenessMirror.jsx";
import BreathingGame from "../components/BreathingGame.jsx";
import EssenceSelection from "../components/EssenceSelection.jsx";
import EssenceVisualization from "../components/EssenceVisualization.jsx";
import IdentitySwitch from "../components/IdentitySwitch.jsx";
import MaskDraw from "../components/MaskDraw.jsx";
import XPModal from "../components/XPModal.jsx";
import { essenceCards } from "../data/essenceCards.js";
import { maskCards } from "../data/maskCards.js";
import { useGamification } from "../hooks/useGamification.js";
import {
  XP_REWARDS,
  appendEssenceEntry,
  getEssenceProfile,
  getLevelFromXp,
  mergeBadges,
  saveEssenceProfile
} from "../utils/localStorage.js";

const steps = ["mask", "awareness", "breathing", "essence", "visualization", "identity"];

const emptyAwareness = {
  trigger: "",
  protection: "",
  emotion: "",
  story: "",
  disobedienceFear: "",
  cost: ""
};

const emptyVisualization = {
  bodyFeeling: "",
  message: "",
  nextAction: "",
  stopDoing: "",
  proofAction: ""
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export default function EssenceReturnGame() {
  const { addXP: addGlobalXP } = useGamification();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedMask, setSelectedMask] = useState(null);
  const [selectedEssence, setSelectedEssence] = useState(null);
  const [awarenessAnswers, setAwarenessAnswers] = useState(emptyAwareness);
  const [visualizationAnswers, setVisualizationAnswers] = useState(emptyVisualization);
  const [profile, setProfile] = useState(() => getEssenceProfile());
  const [sessionXp, setSessionXp] = useState(0);
  const [earnedEvents, setEarnedEvents] = useState({});
  const [xpEvent, setXpEvent] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [proofCompleted, setProofCompleted] = useState(false);

  const currentStep = steps[stepIndex];
  const identityStatement = useMemo(() => {
    const maskName = selectedMask?.name || "[MASK]";
    const essenceName = selectedEssence?.name || "[ESSENCE]";
    const proof = visualizationAnswers.proofAction || "[ACTION]";
    return `I notice the ${maskName}.\nI thank it for protecting me.\nI no longer let it lead.\nI now choose ${essenceName}.\nMy next proof is ${proof}.`;
  }, [selectedEssence, selectedMask, visualizationAnswers.proofAction]);

  function award(key, xp, label, badges = []) {
    if (earnedEvents[key]) return;
    const nextXp = profile.xp + xp;
    const nextBadges = mergeBadges(profile.badges, badges);
    const nextProfile = {
      xp: nextXp,
      level: getLevelFromXp(nextXp),
      badges: nextBadges
    };
    setProfile(nextProfile);
    saveEssenceProfile(nextProfile);
    setSessionXp((current) => current + xp);
    setEarnedEvents((current) => ({ ...current, [key]: true }));
    setXpEvent({ xp, label, badges });
    addGlobalXP(xp, label);
  }

  function goTo(stepName) {
    setStepIndex(steps.indexOf(stepName));
  }

  function handleMaskSelected(mask) {
    setSelectedMask(mask);
    award("maskIdentified", XP_REWARDS.maskIdentified, "Mask identified", ["Mask Breaker"]);
  }

  function completeAwareness() {
    award("awarenessCompleted", XP_REWARDS.awarenessCompleted, "Awareness scan completed", ["Essence Returned"]);
    goTo("breathing");
  }

  function completeBreathing() {
    award("breathingCompleted", XP_REWARDS.breathingCompleted, "Survival mode interrupted", [
      "Survival Interrupted",
      "Body Before Battle"
    ]);
    goTo("essence");
  }

  function completeEssenceSelection() {
    if (!selectedEssence) return;
    award("essenceChosen", XP_REWARDS.essenceChosen, `${selectedEssence.name} activated`, [
      `${selectedEssence.name} Activated`
    ]);
    goTo("visualization");
  }

  function completeVisualization() {
    goTo("identity");
  }

  function lockInEssence() {
    if (completed || !selectedMask || !selectedEssence) return;
    const finalXp = sessionXp + XP_REWARDS.identityCompleted;
    const entry = {
      id: createId(),
      date: new Date().toISOString(),
      selectedMask: selectedMask.name,
      awarenessAnswers,
      breathingCompleted: true,
      selectedEssence: selectedEssence.name,
      supportEssence: selectedMask.essenceReturn.find((name) => name !== selectedEssence.name) || "",
      visualizationAnswers,
      identityStatement,
      xpEarned: finalXp,
      completed: true
    };

    appendEssenceEntry(entry);
    award("identityCompleted", XP_REWARDS.identityCompleted, "Identity switch completed", [
      "Proof Over Potential",
      "Essence Returned"
    ]);
    setCompleted(true);
  }

  function completeProofAction() {
    if (proofCompleted) return;
    award("proofCompleted", XP_REWARDS.proofCompleted, "Proof action completed", ["Proof Over Potential"]);
    setProofCompleted(true);
  }

  function resetGame() {
    setStepIndex(0);
    setSelectedMask(null);
    setSelectedEssence(null);
    setAwarenessAnswers(emptyAwareness);
    setVisualizationAnswers(emptyVisualization);
    setSessionXp(0);
    setEarnedEvents({});
    setXpEvent(null);
    setCompleted(false);
    setProofCompleted(false);
  }

  return (
    <section className={`essence-game step-${currentStep}`}>
      <div className="energy-field" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <header className="game-hud">
        <div>
          <span className="hud-label">Milestone Mapping</span>
          <strong>Essence Return Game</strong>
        </div>
        <div className="hud-stats" aria-label="XP profile">
          <span>Level {profile.level}</span>
          <span>{profile.xp} XP</span>
          <span>{sessionXp} this run</span>
        </div>
      </header>

      <nav className="step-rail" aria-label="Game progress">
        {steps.map((step, index) => (
          <button
            type="button"
            key={step}
            className={index === stepIndex ? "is-active" : index < stepIndex ? "is-complete" : ""}
            onClick={() => index <= stepIndex && setStepIndex(index)}
            disabled={index > stepIndex}
          >
            <span>{index + 1}</span>
            {step}
          </button>
        ))}
      </nav>

      {currentStep === "mask" && (
        <MaskDraw
          masks={maskCards}
          selectedMask={selectedMask}
          onMaskSelected={handleMaskSelected}
        />
      )}

      {currentStep === "awareness" && selectedMask && (
        <AwarenessMirror
          selectedMask={selectedMask}
          answers={awarenessAnswers}
          onChange={(key, value) => setAwarenessAnswers((current) => ({ ...current, [key]: value }))}
          onComplete={completeAwareness}
        />
      )}

      {currentStep === "breathing" && <BreathingGame onComplete={completeBreathing} />}

      {currentStep === "essence" && (
        <EssenceSelection
          essences={essenceCards}
          selectedEssence={selectedEssence}
          suggestedEssences={selectedMask?.essenceReturn || []}
          onSelect={setSelectedEssence}
          onComplete={completeEssenceSelection}
        />
      )}

      {currentStep === "visualization" && selectedEssence && (
        <EssenceVisualization
          selectedEssence={selectedEssence}
          answers={visualizationAnswers}
          onChange={(key, value) => setVisualizationAnswers((current) => ({ ...current, [key]: value }))}
          onComplete={completeVisualization}
        />
      )}

      {currentStep === "identity" && selectedMask && selectedEssence && (
        <IdentitySwitch
          selectedMask={selectedMask}
          selectedEssence={selectedEssence}
          proofAction={visualizationAnswers.proofAction}
          statement={identityStatement}
          xpEarned={sessionXp + (completed ? 0 : XP_REWARDS.identityCompleted)}
          onLockIn={lockInEssence}
          completed={completed}
        />
      )}

      {currentStep === "mask" && selectedMask && (
        <div className="floating-next">
          <button className="primary-btn" type="button" onClick={() => goTo("awareness")}>
            Begin Awareness Mirror
          </button>
        </div>
      )}

      {completed && (
        <div className="return-banner">
          <p className="hud-label">Return complete</p>
          <h2>Proof action saved</h2>
          <div className="return-actions">
            <button className="primary-btn" type="button" onClick={completeProofAction} disabled={proofCompleted}>
              {proofCompleted ? "Proof Completed" : "Complete Proof Action"}
            </button>
            <button className="ghost-btn" type="button" onClick={resetGame}>
              Start Another Return
            </button>
          </div>
        </div>
      )}

      <XPModal event={xpEvent} onClose={() => setXpEvent(null)} />
    </section>
  );
}
