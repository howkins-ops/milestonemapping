import React from "react";

// Shared safety line for every nutrition / training surface (Guideline 1.4.1).
// Apple's own wording — "remind users to check with a doctor" — is baked in.
// `variant="training"` adds the warm-up + exercise-program reminder; the
// default covers the eating/nutrition surfaces.
export default function AlphaDisclaimer({ variant = "nutrition" }) {
  return (
    <p className="iw-al-disclaimer">
      {variant === "training"
        ? "Alpha Mode is a game system — stats, timers, and programming, not medical advice. Warm up before heavy sets, and consult your physician before beginning this or any exercise program."
        : "Meal timings and targets are game guidance, not medical or nutrition advice. Consult your physician or a registered dietitian before starting any eating, fasting, or exercise program."}
    </p>
  );
}
