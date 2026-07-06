import React, { useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { recommit } from "../../../lib/zoneService.js";
import { ZONE_ICONS, zoneErrorMessage } from "../../../lib/zoneFire.js";
import { pickLine, WITNESS, fillTokens } from "../witness/witnessLines.js";
import { playSound } from "../../../lib/sounds.js";
import { getTodayKey } from "../../../lib/dates.js";
import ZoneIcon from "../shared/ZoneIcon.jsx";

// The Recommit — pure Shift One, three moves:
//   1. Face it (the lie + the truth)
//   2. The cost (private — never sent anywhere)
//   3. Recommit (declaration + a 24h proof promise, posted publicly)
export default function Recommit({ onClose, onDone }) {
  const { member, todayMission, refreshState } = useZoneCtx();
  const { addXP, pushToast, celebrate, settings } = useAppData();
  const [step, setStep] = useState(0);
  const [lie, setLie] = useState("");
  const [truth, setTruth] = useState("");
  const [cost, setCost] = useState("");
  const [declaration, setDeclaration] = useState("I am back in integrity");
  const [proof, setProof] = useState("");
  const [asMission, setAsMission] = useState(!todayMission);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const intro = fillTokens(
    pickLine(WITNESS.recommitIntro, `${getTodayKey()}:${member?.username || ""}`),
    { name: member?.display_name || member?.username || "" }
  );

  const canNext =
    step === 0 ? lie.trim() && truth.trim()
    : step === 1 ? cost.trim()
    : declaration.trim() && proof.trim();

  const next = () => {
    if (!canNext) return;
    playSound("click", settings);
    setStep((s) => Math.min(2, s + 1));
  };
  const back = () => {
    playSound("click", settings);
    setStep((s) => Math.max(0, s - 1));
  };

  const submit = async () => {
    if (!canNext || busy) return;
    setBusy(true);
    setError("");
    try {
      // The cost never leaves this sheet — it's fuel, not content.
      const res = await recommit({
        lie: lie.trim(),
        truth: truth.trim(),
        declaration: declaration.trim(),
        proof: proof.trim(),
        asMission,
      });
      if (res?.xp_earned > 0) addXP(res.xp_earned, "Recommitted");
      playSound(res?.rose ? "levelup" : "chime", settings);
      celebrate({
        variant: "rank",
        title: res?.rose ? "Risen — Back in Integrity" : "Back in Integrity",
        subtitle: fillTokens(pickLine(WITNESS.recommitCelebration, getTodayKey()), {}),
      });
      if (asMission) {
        pushToast({ type: "success", title: "On the board", message: "Your proof promise is today's mission.", icon: "⚡" });
      }
      await refreshState();
      onDone();
    } catch (err) {
      setError(zoneErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="zn-overlay" onClick={onClose}>
      <div className="zn-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Recommit to integrity">
        <div className="zn-sheet__handle" aria-hidden="true" />
        <h3 className="zn-sheet__title">
          <ZoneIcon src={ZONE_ICONS.fire} className="zn-sheet__title-icon" />
          The Recommit
        </h3>
        <p className="zn-recommit__intro">{intro}</p>

        <div className="zn-recommit__steps" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i <= step ? "on" : ""} />
          ))}
        </div>

        {step === 0 && (
          <>
            <p className="zn-eyebrow">Step 1 · Face it</p>
            <div className="zn-field">
              <label className="zn-label" htmlFor="zn-rc-lie">The story I've been telling</label>
              <input
                id="zn-rc-lie"
                className="zn-input"
                value={lie}
                onChange={(e) => setLie(e.target.value)}
                placeholder="e.g. I'll start Monday. I did enough today."
                maxLength={200}
              />
            </div>
            <div className="zn-field">
              <label className="zn-label" htmlFor="zn-rc-truth">The truth underneath</label>
              <input
                id="zn-rc-truth"
                className="zn-input"
                value={truth}
                onChange={(e) => setTruth(e.target.value)}
                placeholder="e.g. I've been avoiding it for weeks."
                maxLength={200}
              />
              <p className="zn-hint">If it doesn't sting a little, it's not the truth yet.</p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="zn-eyebrow">Step 2 · The cost</p>
            <div className="zn-field">
              <label className="zn-label" htmlFor="zn-rc-cost">What has the broken word been costing?</label>
              <textarea
                id="zn-rc-cost"
                className="zn-input"
                rows={3}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Time, money, trust, confidence, self-respect — be specific about the price."
                maxLength={400}
              />
              <p className="zn-hint">🔒 This stays here — it's never posted, never saved. It's fuel, not content.</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="zn-eyebrow">Step 3 · Recommit</p>
            <div className="zn-field">
              <label className="zn-label" htmlFor="zn-rc-decl">Your declaration</label>
              <input
                id="zn-rc-decl"
                className="zn-input"
                value={declaration}
                onChange={(e) => setDeclaration(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="zn-field">
              <label className="zn-label" htmlFor="zn-rc-proof">Your proof in the next 24 hours</label>
              <input
                id="zn-rc-proof"
                className="zn-input"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="One small promise you will actually keep"
                maxLength={200}
              />
              <p className="zn-hint">Declaration without proof is a wish. This is the proof.</p>
            </div>
            <label className="zn-recommit__mission">
              <input
                type="checkbox"
                checked={asMission}
                onChange={(e) => setAsMission(e.target.checked)}
              />
              <span>
                {todayMission
                  ? "Replace today's mission with this promise"
                  : "Put it on the board as today's mission"}
              </span>
            </label>
          </>
        )}

        {error && <p className="zn-hint zn-hint--bad" role="alert">{error}</p>}

        <div className="zn-2col" style={{ marginTop: 14, marginBottom: 0 }}>
          {step > 0 ? (
            <button type="button" className="zn-btn zn-btn--ghost" onClick={back} disabled={busy}>
              ‹ Back
            </button>
          ) : (
            <button type="button" className="zn-btn zn-btn--ghost" onClick={onClose} disabled={busy}>
              Not now
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="zn-btn" onClick={next} disabled={!canNext}>
              {step === 0 ? "Feel the cost ›" : "Recommit ›"}
            </button>
          ) : (
            <button type="button" className="zn-btn" onClick={submit} disabled={busy || !canNext}>
              {!busy && <ZoneIcon src={ZONE_ICONS.fire} className="zn-btn__icon" />}
              {busy ? "Posting…" : "Post the Recommit"}
            </button>
          )}
        </div>
        {step === 2 && (
          <p style={{ fontSize: 11.5, color: "var(--text-soft)", textAlign: "center", marginTop: 10 }}>
            The lie, the truth, and your word go on the feed. Friends and squad-mates will see it. That's the point.
          </p>
        )}
      </div>
    </div>
  );
}
