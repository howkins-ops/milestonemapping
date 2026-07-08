import React, { useMemo, useState } from "react";
import { loadJourney, isSpireOpen, isCrossingOpen, spireLitCount, TUTORIAL_DISTRICT_IDS, CROSSING_CITIES } from "../city/journeyStore.js";
import { SPIRE_FLOORS, floorOpen, floorComplete } from "./spire/spireWorlds.js";
import { CITY_DEFS } from "./crossing/crossingWorlds.js";

// ════════════════════════════════════════════════════════════════════════
// THE WORLD ATLAS — every walkable world on the Golden Road, one panel.
// Hometown → City → five Spire floors → five Cities (+ roads) → the quiet
// road → the Oasis. Shows where you are, what's open, what's still sealed,
// and jumps anywhere the current surface can take you.
//
// onJump({ type, idx }) — host decides how to travel:
//   { type:"hometown" } · { type:"city" } · { type:"spire", idx } ·
//   { type:"crossing" }
// Hosts pass only the jumps they support; unsupported rows render as
// status-only.
// ════════════════════════════════════════════════════════════════════════

const QUEST_STATE_KEY = "milestone-quest:mode-v1";

function readChapterCount() {
  try {
    const raw = localStorage.getItem(QUEST_STATE_KEY);
    if (!raw) return 0;
    const chapters = JSON.parse(raw)?.chapters || {};
    return Object.values(chapters).filter((c) => c?.complete).length;
  } catch {
    return 0;
  }
}

export default function WorldAtlas({ onJump, current = null }) {
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    if (!open) return [];
    const journey = loadJourney();
    const isChapterComplete = (() => {
      try {
        const raw = localStorage.getItem(QUEST_STATE_KEY);
        const chapters = raw ? JSON.parse(raw)?.chapters || {} : {};
        return (key) => Boolean(chapters[key]?.complete);
      } catch {
        return () => false;
      }
    })();

    const hometownDone = Boolean(journey.hometown.completedAt || journey.hometown.skipped);
    const spireOpen = isSpireOpen(journey);
    const crossingOpen = isCrossingOpen(journey);

    const list = [
      {
        id: "hometown",
        act: "ACT 0",
        name: "The Hometown",
        detail: hometownDone ? "The road out was taken" : "Four stations before the road",
        state: hometownDone ? "done" : "now",
        jump: { type: "hometown" },
        color: "#C9A15E",
      },
      {
        id: "city",
        act: "ACT 1",
        name: "Milestone City",
        detail: spireOpen
          ? "Fully trained — the Spire answered"
          : `Training ${spireLitCount(journey)}/${TUTORIAL_DISTRICT_IDS.length} lit`,
        state: !hometownDone ? "locked" : spireOpen ? "done" : "now",
        jump: { type: "city" },
        color: "#00F0FF",
      },
    ];

    SPIRE_FLOORS.forEach((f, i) => {
      const opened = spireOpen && floorOpen(f, isChapterComplete);
      const done = floorComplete(f, isChapterComplete);
      list.push({
        id: f.id,
        act: "ACT 2",
        name: `${f.num} · ${f.title}`,
        detail: done ? "Every chamber sealed in gold" : opened ? "Chambers wait" : "The elevator hasn't reached it",
        state: done ? "done" : opened ? "now" : "locked",
        jump: opened ? { type: "spire", idx: i } : null,
        color: f.accent,
      });
    });

    CROSSING_CITIES.forEach((cid) => {
      const def = CITY_DEFS[cid];
      const flipped = Boolean(journey.crossing.cities?.[cid]?.flippedAt);
      list.push({
        id: cid,
        act: "ACT 3",
        name: `${def.num} · ${def.name}`,
        detail: flipped ? "Correctly named" : def.mask,
        state: flipped ? "done" : crossingOpen ? "now" : "locked",
        jump: crossingOpen ? { type: "crossing" } : null,
        color: "#D6538A",
      });
    });

    list.push({
      id: "oasis",
      act: "ACT 3",
      name: "The Quiet Road & the Oasis",
      detail: journey.crossing.oasisAt
        ? "Five voices, one shape — thanked"
        : journey.crossing.unveiledAt
          ? "It walks beside you now"
          : "Past the fifth city",
      state: journey.crossing.oasisAt ? "done" : crossingOpen ? "now" : "locked",
      jump: crossingOpen ? { type: "crossing" } : null,
      color: "#00FFBF",
    });

    return list;
  }, [open]);

  const chapterCount = open ? readChapterCount() : 0;

  return (
    <>
      <button type="button" className="atl-fab" onClick={() => setOpen(true)} aria-label="World Atlas">
        🗺
      </button>

      {open ? (
        <div className="atl-overlay" role="dialog" aria-modal="true" aria-label="World Atlas" onClick={() => setOpen(false)}>
          <div className="atl-panel" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="atl-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
            <p className="atl-kicker">THE WORLD ATLAS · THE GOLDEN ROAD</p>
            <h3 className="atl-title">One road. Seventeen worlds.</h3>
            <p className="atl-sub">
              Hometown to Oasis, every world walkable — {chapterCount}/24 chambers sealed.
            </p>

            <div className="atl-rows">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className={`atl-row is-${r.state}${current === r.id ? " is-here" : ""}`}
                  style={{ "--aw": r.color }}
                >
                  <span className="atl-row__act">{r.act}</span>
                  <span className="atl-row__name">{r.name}</span>
                  <span className="atl-row__detail">{r.detail}</span>
                  {r.jump && onJump && r.state !== "locked" ? (
                    <button
                      type="button"
                      className="atl-row__go"
                      onClick={() => {
                        setOpen(false);
                        onJump(r.jump);
                      }}
                    >
                      GO →
                    </button>
                  ) : (
                    <span className="atl-row__state">
                      {r.state === "locked" ? "SEALED" : r.state === "done" ? "✓" : "HERE"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
