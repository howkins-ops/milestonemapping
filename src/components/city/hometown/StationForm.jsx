import React, { useState } from "react";

// ════════════════════════════════════════════════════════════════════════
// THE WHY — station exercise #1 (Your House)
// A warm, analog, paper-feeling form: three prompts that seed the Day-One
// Snapshot (whyILeft / whoIAmNow / biggestFear). The Father reads the WHY
// back at the send-off; Ch1 echoes it; Ch23's Vault mirrors all three.
// ════════════════════════════════════════════════════════════════════════

const PROMPTS = [
  {
    key: "whyILeft",
    label: "WHY YOU'RE LEAVING",
    prompt:
      "Forget the goal for a second. Why are you really walking out the door — what can you no longer stay for?",
    placeholder: "Because…",
  },
  {
    key: "whoIAmNow",
    label: "WHO YOU ARE TODAY",
    prompt:
      "Before the road changes you, say it plainly: who are you right now, the day you set out?",
    placeholder: "Right now, I'm…",
  },
  {
    key: "biggestFear",
    label: "THE FEAR YOU CARRY",
    prompt:
      "Every traveler packs one fear they don't admit to. What's yours, walking into the dark?",
    placeholder: "The fear I don't say out loud…",
  },
];

export default function StationForm({ initial = {}, onSave, onClose }) {
  const [values, setValues] = useState(() => ({
    whyILeft: initial.whyILeft || "",
    whoIAmNow: initial.whoIAmNow || "",
    biggestFear: initial.biggestFear || "",
  }));

  const ready = PROMPTS.every((p) => values[p.key].trim().length >= 3);

  return (
    <div className="hmt-overlay" role="dialog" aria-modal="true" aria-label="Write your why">
      {onClose ? (
        <button type="button" className="hmt-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      ) : null}
      <div className="hmt-paper">
        <p className="hmt-kicker">YOUR HOUSE · STATION I</p>
        <h3 className="hmt-title">Write your WHY</h3>
        <p className="hmt-sub">
          The dream never explains itself. You have to. These words travel with you — the
          Father will ask for them before you leave, and the Vault will show them back to
          you at the end.
        </p>

        {PROMPTS.map((p) => (
          <label key={p.key} className="hmt-field">
            <span className="hmt-field__label">{p.label}</span>
            <span className="hmt-field__prompt">{p.prompt}</span>
            <textarea
              className="hmt-field__input"
              rows={3}
              value={values[p.key]}
              placeholder={p.placeholder}
              onChange={(e) => setValues((v) => ({ ...v, [p.key]: e.target.value }))}
            />
          </label>
        ))}

        <button
          type="button"
          className="hmt-primary"
          disabled={!ready}
          onClick={() =>
            onSave({
              whyILeft: values.whyILeft.trim(),
              whoIAmNow: values.whoIAmNow.trim(),
              biggestFear: values.biggestFear.trim(),
            })
          }
        >
          {ready ? "Fold it into your pocket →" : "Write all three first"}
        </button>
      </div>
    </div>
  );
}
