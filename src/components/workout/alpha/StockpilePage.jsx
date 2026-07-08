import React, { useMemo } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { groceryPlan } from "./engine/mealPrep.js";
import FillYourFridge from "./FillYourFridge.jsx";
import FoodImg from "./FoodImg.jsx";
import { sfxCoin } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE STOCKPILE — Sunday meal prep as a ritual.
   The week's macro ledger → the grocery plan → the 7-step prep
   guide → FILL YOUR FRIDGE. Pairs with the Sunday check-in and
   the cheat-day law (never stock the feast in advance).
   ═══════════════════════════════════════════════════════════════ */

const mondayKey = (d = new Date()) => {
  const m = new Date(d);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  const p = (n) => String(n).padStart(2, "0");
  return `${m.getFullYear()}-${p(m.getMonth() + 1)}-${p(m.getDate())}`;
};

export default function StockpilePage({ alpha, addXP, settings, onBack, embedded = false }) {
  const { userId } = useAppData();
  const { state } = alpha;
  const weekKey = mondayKey();

  const plan = useMemo(() => groceryPlan({
    weightLb: state.bodyWeight || 200,
    bodyFatPct: state.bodyFat ?? 20,
    phaseId: state.phase,
    week: state.week,
  }), [state.bodyWeight, state.bodyFat, state.phase, state.week]);

  const checksArr = state.flags.fridgeChecks?.[weekKey] || [];
  const checks = useMemo(() => new Set(checksArr), [checksArr]);

  const toggle = (id) => {
    const next = checks.has(id) ? checksArr.filter((x) => x !== id) : [...checksArr, id];
    if (!checks.has(id)) sfxCoin(settings);
    if (!checksArr.length && !checks.has(id)) alpha.logEvent("meal_prep", { weekKey });
    alpha.patchState({
      flags: { ...state.flags, fridgeChecks: { ...(state.flags.fridgeChecks || {}), [weekKey]: next } },
    });
  };

  const t = plan.targets;

  return (
    <div className="iw-al-stockpile">
      {!embedded && (
        <>
          <button className="iw-back" onClick={onBack}>❮ back</button>
          <div className="iw-eyebrow">the sunday ritual</div>
          <h2 className="iw-display iw-page-title">The Stockpile</h2>
        </>
      )}
      {embedded && <div className="iw-eyebrow iw-al-card-title">the sunday ritual</div>}

      {/* the week's ledger */}
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">this week's ledger · {t.workoutDays} training days</div>
        <div className="iw-al-macros">
          <div className="iw-al-macro"><span className="iw-al-macro-num">{Math.round(t.calories / 1000).toLocaleString()}k</span><span className="iw-al-macro-label">calories</span></div>
          <div className="iw-al-macro"><span className="iw-al-macro-num">{t.protein.toLocaleString()}g</span><span className="iw-al-macro-label">protein</span></div>
          <div className="iw-al-macro"><span className="iw-al-macro-num">{t.carbs.toLocaleString()}g</span><span className="iw-al-macro-label">carbs</span></div>
          <div className="iw-al-macro"><span className="iw-al-macro-num">{t.fat.toLocaleString()}g</span><span className="iw-al-macro-label">fat</span></div>
        </div>
        {plan.cheatNote && <div className="iw-al-fastline iw-al-cheatnote">⚠ {plan.cheatNote}</div>}
      </div>

      {/* the fridge */}
      <FillYourFridge alpha={alpha} userId={userId} plan={plan} checks={checks}
        weekKey={weekKey} addXP={addXP} settings={settings} />

      {/* the grocery run — go buy the list, tick it off */}
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">the grocery run · check it off as you buy</div>
        <div className="iw-stack">
          {plan.lines.map((l) => {
            const id = `line:${l.id}`;
            const on = checks.has(id);
            return (
              <div key={l.id} className={`iw-al-grocery ${on ? "iw-al-grocery-done" : ""}`}>
                <button className="iw-al-grocery-row" onClick={() => toggle(id)}>
                  <span className="iw-al-grocery-check" aria-hidden="true">{on ? "✓" : ""}</span>
                  <span className="iw-al-grocery-text">
                    <span className="iw-al-grocery-label">{l.label} — {l.qty}</span>
                    <span className="iw-al-grocery-why">{l.why}</span>
                  </span>
                </button>
                <div className="iw-al-grocery-shelf">
                  {l.picks.map((it) => (
                    <span key={it} className="iw-al-fooditem">
                      <FoodImg name={it} className="iw-al-fooditem-img" />
                      <span className="iw-al-fooditem-name">{it}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* the sunday prep day — one guided hour */}
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">the prep day · seven moves, one hour</div>
        <div className="iw-stack">
          {plan.prepSteps.map((s, i) => {
            const id = `step:${s.id}`;
            const on = checks.has(id);
            return (
              <button key={s.id} className={`iw-al-prepstep ${on ? "iw-al-grocery-done" : ""}`} onClick={() => toggle(id)}>
                <span className="iw-al-prep-n">{on ? "✓" : i + 1}</span>
                <span className="iw-al-grocery-text">
                  <span className="iw-al-grocery-label">{s.label}</span>
                  <span className="iw-al-grocery-why">{s.line}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="iw-al-fastline iw-al-stock-footer">
        Linked to your Sunday Review — a stocked fridge is the first ✓ of the
        new week. The fridge is the loadout screen; the week is the run.
      </p>
    </div>
  );
}
