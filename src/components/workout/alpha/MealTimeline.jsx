import React, { useMemo } from "react";
import HL from "./HL.jsx";
import FoodImg from "./FoodImg.jsx";
import { mealTimeline } from "./engine/mealTimeline.js";
import { daySlot, dayIdxFromDate } from "./engine/scheduler.js";
import { PHASES } from "./data/phases.js";

/* ═══════════════════════════════════════════════════════════════
   TODAY'S PLATE — the fridge, hour by hour.
   A vertical clock rail: when the fast breaks, what lands on each
   plate, where the carbs go, when the window slams shut. Every
   slot names its portions and which fridge shelf to raid.
   ═══════════════════════════════════════════════════════════════ */

const SHELF_LABELS = {
  protein: "proteins",
  "free-veg": "the green wall",
  carb: "fuel",
  fat: "fats",
};
/* emoji carry the plate before Codex art lands (FoodImg overlays when present) */
const SHELF_GLYPH = {
  protein: "🍗",
  "free-veg": "🥦",
  carb: "🍚",
  fat: "🥑",
};
/* plate wedge order so protein always anchors the dish */
const PLATE_ORDER = ["protein", "free-veg", "carb", "fat"];

export default function MealTimeline({ alpha }) {
  const { state } = alpha;
  const phase = PHASES[state.phase];
  const todayIdx = dayIdxFromDate();
  const slot = useMemo(
    () => daySlot(state.phase, state.week, todayIdx),
    [state.phase, state.week, todayIdx]
  );
  const data = useMemo(() => mealTimeline({ state, slot }), [state, slot]);

  if (!data) {
    return (
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">today&apos;s plate</div>
        <p className="iw-al-fastline">
          The plate unlocks once the campaign knows your numbers — make the
          Crossing on the Today tab and the fridge starts planning your hours.
        </p>
      </div>
    );
  }

  if (data.kind === "cheat") {
    return (
      <div className="iw-al-card iw-al-cheatline">
        <div className="iw-eyebrow iw-al-card-title">today&apos;s plate · cheat day</div>
        <div className="iw-al-offledger">OFF THE LEDGER</div>
        <p className="iw-al-fastline">
          No clock, no counting today. Three rules only: don&apos;t eat to sickness ·
          same-day food only · zero guilt. The furnace is fed on purpose.
        </p>
      </div>
    );
  }

  return (
    <div className="iw-mt">
      {data.kind === "day" && (
        <div className="iw-al-card iw-mt-ledger" style={{ "--iw-al-accent": phase?.accent }}>
          <div className="iw-al-card-head">
            <span className="iw-eyebrow">today&apos;s ledger</span>
            <span className={`iw-chip ${data.isWorkoutDay ? "iw-chip-ember" : ""}`}>
              {data.isWorkoutDay ? "training day" : "rest day"}
            </span>
          </div>
          <div className="iw-al-macros">
            <div className="iw-al-macro"><span className="iw-al-macro-num">{data.macros.calories.toLocaleString()}</span><span className="iw-al-macro-label">calories</span></div>
            <div className="iw-al-macro"><span className="iw-al-macro-num">{data.macros.protein}g</span><span className="iw-al-macro-label">protein</span></div>
            <div className="iw-al-macro"><span className="iw-al-macro-num">{data.macros.carbs}g</span><span className="iw-al-macro-label">carbs</span></div>
            <div className="iw-al-macro"><span className="iw-al-macro-num">{data.macros.fat}g</span><span className="iw-al-macro-label">fat</span></div>
          </div>
          <div className="iw-al-fastline">
            <HL text={`Eating window ${data.window.start} → ${data.window.end} · the ${data.window.fastHours}-hour fast does the quiet work`} />
          </div>
        </div>
      )}

      <div className="iw-mt-rail">
        {data.slots.map((s) => (
          <div key={s.id} className={`iw-mt-slot iw-mt-slot-${s.id}`}>
            <div className="iw-mt-time">
              <span className="iw-mt-icon" aria-hidden="true">{s.icon}</span>
              <span className="iw-mt-when">{s.time}</span>
            </div>
            <div className="iw-mt-card">
              <div className="iw-mt-title">{s.title}</div>
              {s.line && <p className="iw-mt-line"><HL text={s.line} /></p>}
              {s.macros && (
                <div className="iw-mt-macros">
                  {s.macros.protein > 0 && <span className="iw-mt-macro"><b>{s.macros.protein}g</b> protein</span>}
                  {s.macros.carbs > 0 && <span className="iw-mt-macro iw-mt-macro-carb"><b>{s.macros.carbs}g</b> carbs</span>}
                  {s.macros.fat > 0 && <span className="iw-mt-macro"><b>{s.macros.fat}g</b> fat</span>}
                </div>
              )}
              {s.picks && (() => {
                const plated = PLATE_ORDER
                  .map((shelf) => [shelf, s.picks[shelf]])
                  .filter(([, items]) => items && items.length);
                if (!plated.length) return null;
                return (
                  <>
                    <div className="iw-mt-plate" aria-hidden="true">
                      <div className="iw-mt-dish">
                        {plated.map(([shelf, items], k) => (
                          <span key={shelf} className={`iw-mt-portion iw-mt-portion-${shelf}`}
                            style={{ animationDelay: `${120 + k * 90}ms` }}>
                            <span className="iw-mt-portion-glyph">{SHELF_GLYPH[shelf]}</span>
                            <FoodImg name={items[0]} className="iw-mt-portion-img" />
                          </span>
                        ))}
                      </div>
                    </div>
                    {plated.map(([shelf, items]) => (
                      <div key={shelf} className="iw-mt-picks">
                        <span className="iw-mt-shelf">{SHELF_LABELS[shelf] || shelf}</span>
                        <span className="iw-mt-items">
                          {items.map((it) => (
                            <span key={it} className="iw-mt-fooditem">
                              <FoodImg name={it} className="iw-mt-food-thumb" />
                              {it}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      <p className="iw-al-fastline iw-mt-foot">
        <HL text="Times ride a default noon-to-8 window — shift the whole rail earlier or later to fit your day, keep the order and the gaps." />
      </p>
    </div>
  );
}
