import React, { useEffect, useMemo, useState } from "react";
import "../../styles/onboarding.css";
import { useAppData } from "../../hooks/useAppData.js";
import { loadCrossing, hasCrossing, recordTorchItem } from "./onboardingStore.js";
import { buildTorchItems, FIRST_HOURS_CARD } from "./crossingScript.js";

// ════════════════════════════════════════════════════════════════════════
// THE FIRST 24 HOURS — the torch checklist, persisting on the Command
// Center until every item is lit or 7 days pass (Zeigarnik effect).
// Only shows for users who actually crossed (never legacy, never skipped).
// ════════════════════════════════════════════════════════════════════════

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function detectAuto(itemId, todayLog) {
  try {
    const ls = window.localStorage;
    if (itemId === "city") {
      const raw = ls.getItem("mapquest_city_v1");
      if (raw && JSON.parse(raw).firstVisitAt) return true;
    }
    if (itemId === "iron") {
      return ls.getItem("iron_workout_cache_v1") != null;
    }
  } catch {
    return false;
  }
  if (itemId === "ritual" && todayLog) {
    const g = todayLog.gratitude || {};
    return (todayLog.topFive || []).length > 0 || Boolean(g.entry1);
  }
  return false;
}

export default function FirstHoursCard({ onNavigate, onOpenWorkout }) {
  const { getTodayLog } = useAppData();
  const [crossing, setCrossing] = useState(() => (hasCrossing() ? loadCrossing() : null));

  const items = useMemo(
    () => (crossing ? buildTorchItems({ goals: crossing.answers.goals }) : []),
    [crossing]
  );

  // Auto-check what the app can already prove happened.
  useEffect(() => {
    if (!crossing || crossing.via !== "crossed") return;
    const todayLog = getTodayLog();
    let changed = false;
    for (const item of items) {
      if (!crossing.torch[item.id] && detectAuto(item.id, todayLog)) {
        recordTorchItem(item.id);
        changed = true;
      }
    }
    if (changed) setCrossing(loadCrossing());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!crossing || !crossing.completed || crossing.via !== "crossed") return null;
  const completedAt = crossing.completedAt ? new Date(crossing.completedAt).getTime() : 0;
  if (completedAt && Date.now() - completedAt > WEEK_MS) return null;
  const remaining = items.filter((i) => !crossing.torch[i.id]);
  if (remaining.length === 0) return null;

  const litCount = items.length - remaining.length;

  const handle = (item) => {
    recordTorchItem(item.id);
    setCrossing(loadCrossing());
    if (item.id === "iron" && onOpenWorkout) onOpenWorkout();
    else if (item.nav && onNavigate) onNavigate(item.nav);
  };

  return (
    <div className="fhc-card">
      <p className="fhc-kicker">
        <span aria-hidden="true">🔥</span> {FIRST_HOURS_CARD.kicker} · {litCount}/{items.length}
      </p>
      {items.map((item) => {
        const isDone = Boolean(crossing.torch[item.id]);
        return (
          <button
            key={item.id}
            type="button"
            className={`fhc-row ${isDone ? "is-done" : ""}`}
            disabled={isDone}
            onClick={() => handle(item)}
          >
            <span className="fhc-row__box" aria-hidden="true">
              {isDone ? "✓" : ""}
            </span>
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
