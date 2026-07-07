import React, { useMemo, useState } from "react";
import { ESSENCE_PAIRS, PENDANT_WORDS } from "./essencePairs.js";
import { loadJourney } from "../city/journeyStore.js";

// ════════════════════════════════════════════════════════════════════════
// THE PENDANT — the five words the Father hands over at the send-off,
// carried as a small HUD everywhere the journey renders. Tap it and the
// whole game explains itself: five Essences, five Shadows, where each one
// gets named (the Spire chapter) and where it gets forged for good (the
// Crossing city). This is how the dots connect across the entire app.
// States per pair: waiting → named (Spire chapter done) → forged (city flipped).
// ════════════════════════════════════════════════════════════════════════

const QUEST_STATE_KEY = "milestone-quest:mode-v1";

function readQuestChapters() {
  try {
    const raw = localStorage.getItem(QUEST_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw)?.chapters || {};
  } catch {
    return {};
  }
}

export function hasPendant(journey = loadJourney()) {
  return Boolean(
    journey.hometown.stations?.sendoff ||
      journey.hometown.completedAt ||
      journey.hometown.skipped
  );
}

export default function PendantHUD() {
  const [open, setOpen] = useState(false);

  const pairs = useMemo(() => {
    if (!open) return [];
    const chapters = readQuestChapters();
    const journey = loadJourney();
    return ESSENCE_PAIRS.map((p) => {
      const named = Boolean(chapters[p.chapterKey]?.complete);
      const forged = Boolean(journey.crossing.cities?.[p.crossingCity]?.flippedAt);
      return { ...p, state: forged ? "forged" : named ? "named" : "waiting" };
    });
  }, [open]);

  if (!hasPendant()) return null;

  return (
    <>
      <button
        type="button"
        className="pnd-fab"
        onClick={() => setOpen(true)}
        aria-label="The pendant — the five words"
      >
        ◈
      </button>

      {open ? (
        <div
          className="pnd-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="The five words"
          onClick={() => setOpen(false)}
        >
          <div className="pnd-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pnd-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p className="pnd-kicker">THE PENDANT · {PENDANT_WORDS.join(" · ").toUpperCase()}</p>
            <h3 className="pnd-title">Five gifts. Five masks. One shadow.</h3>
            <p className="pnd-sub">
              Whatever voice it uses, it is always trying to talk you out of one of these
              five. Every training in this city, every chamber in the Spire, every city on
              the crossing — it all serves these words.
            </p>

            <div className="pnd-pairs">
              {pairs.map((p) => (
                <div key={p.id} className={`pnd-pair is-${p.state}`} style={{ "--pp": p.color }}>
                  <div className="pnd-pair__head">
                    <span className="pnd-pair__essence">{p.essence}</span>
                    <span className="pnd-pair__vs">↔</span>
                    <span className="pnd-pair__shadow">{p.shadow}</span>
                    <span className="pnd-pair__state">
                      {p.state === "forged" ? "FORGED" : p.state === "named" ? "NAMED" : "WAITING"}
                    </span>
                  </div>
                  <p className="pnd-pair__lie">“{p.coreLie}”</p>
                  <p className="pnd-pair__protects">It protects: {p.protects}</p>
                </div>
              ))}
            </div>

            <p className="pnd-foot">
              Named in the Spire. Forged on the Crossing. It cannot survive being correctly
              named.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
