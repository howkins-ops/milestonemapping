import React, { useMemo, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { groceryPlan } from "./engine/mealPrep.js";
import { FOOD_CATEGORIES } from "./data/foods.js";
import FillYourFridge from "./FillYourFridge.jsx";
import FoodImg from "./FoodImg.jsx";
import { sfxCoin } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE STOCKPILE — the weekly food plan, plain and interactive.
   The week's targets → a real grocery checklist (curated for your
   plan, full list on tap, add your own) → the fridge that fills as
   you check things off → the prep steps. No jargon.
   ═══════════════════════════════════════════════════════════════ */

const mondayKey = (d = new Date()) => {
  const m = new Date(d);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  const p = (n) => String(n).padStart(2, "0");
  return `${m.getFullYear()}-${p(m.getMonth() + 1)}-${p(m.getDate())}`;
};

const CAT_LABEL = { protein: "Proteins", "free-veg": "Veggies", carb: "Carbs", fat: "Fats" };
const fullItemsFor = (catId) => {
  const c = FOOD_CATEGORIES.find((x) => x.id === catId);
  return c ? c.groups.flatMap((g) => g.items) : [];
};
const itemId = (catId, name) => `item|${catId}|${name}`;

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
  const customItems = state.flags.customItems || {};

  const patchChecks = (nextChecks, extraFlags = {}) => {
    alpha.patchState({
      flags: {
        ...state.flags, ...extraFlags,
        fridgeChecks: { ...(state.flags.fridgeChecks || {}), [weekKey]: nextChecks },
      },
    });
  };

  const toggle = (id) => {
    const next = checks.has(id) ? checksArr.filter((x) => x !== id) : [...checksArr, id];
    if (!checks.has(id)) sfxCoin(settings);
    if (!checksArr.length && !checks.has(id)) alpha.logEvent("meal_prep", { weekKey });
    patchChecks(next);
  };

  const addCustom = (catId, name) => {
    const clean = (name || "").trim();
    if (!clean) return;
    const list = customItems[catId] || [];
    if (list.some((x) => x.toLowerCase() === clean.toLowerCase())) return;
    sfxCoin(settings);
    const id = itemId(catId, clean);
    const nextChecks = checks.has(id) ? checksArr : [...checksArr, id];
    patchChecks(nextChecks, { customItems: { ...customItems, [catId]: [...list, clean] } });
  };

  const removeCustom = (catId, name) => {
    const id = itemId(catId, name);
    patchChecks(checksArr.filter((x) => x !== id), {
      customItems: { ...customItems, [catId]: (customItems[catId] || []).filter((x) => x !== name) },
    });
  };

  /* what counts toward a stocked fridge: the curated items + the prep steps */
  const requiredIds = [
    ...plan.lines.flatMap((l) => l.picks.map((it) => itemId(l.id, it))),
    ...plan.prepSteps.map((s) => `step:${s.id}`),
  ];

  const t = plan.targets;

  return (
    <div className="iw-al-stockpile">
      {!embedded && (
        <>
          <button className="iw-back" onClick={onBack}>❮ back</button>
          <div className="iw-eyebrow">plan your week&apos;s food</div>
          <h2 className="iw-display iw-page-title">The Stockpile</h2>
        </>
      )}
      {embedded && <div className="iw-eyebrow iw-al-card-title">plan your week&apos;s food</div>}

      {/* the week's totals */}
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">this week · {t.workoutDays} training days</div>
        <div className="iw-al-macros">
          <div className="iw-al-macro"><span className="iw-al-macro-num">{Math.round(t.calories / 1000).toLocaleString()}k</span><span className="iw-al-macro-label">calories</span></div>
          <div className="iw-al-macro"><span className="iw-al-macro-num">{t.protein.toLocaleString()}g</span><span className="iw-al-macro-label">protein</span></div>
          <div className="iw-al-macro"><span className="iw-al-macro-num">{t.carbs.toLocaleString()}g</span><span className="iw-al-macro-label">carbs</span></div>
          <div className="iw-al-macro"><span className="iw-al-macro-num">{t.fat.toLocaleString()}g</span><span className="iw-al-macro-label">fat</span></div>
        </div>
        {plan.cheatNote && <div className="iw-al-fastline iw-al-cheatnote">⚠ {plan.cheatNote}</div>}
      </div>

      {/* the fridge — fills as you check items off */}
      <FillYourFridge alpha={alpha} userId={userId} checks={checks} requiredIds={requiredIds}
        weekKey={weekKey} addXP={addXP} settings={settings} />

      {/* the grocery list — tap each thing as you buy it */}
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">your grocery list · tap each thing as you buy it</div>
        <div className="iw-stack">
          {plan.lines.map((l) => (
            <CategoryChecklist key={l.id} line={l} checks={checks} toggle={toggle}
              custom={customItems[l.id] || []} onAdd={(n) => addCustom(l.id, n)} onRemoveCustom={(n) => removeCustom(l.id, n)} />
          ))}
        </div>
      </div>

      {/* prep it — one guided hour */}
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">prep it · seven steps, about an hour</div>
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
        A full fridge on Sunday is the first win of the week — everything ready, no thinking required.
      </p>
    </div>
  );
}

/* ── one food category: curated picks, full list on tap, add-your-own ── */
function CategoryChecklist({ line, checks, toggle, custom, onAdd, onRemoveCustom }) {
  const [showAll, setShowAll] = useState(false);
  const [draft, setDraft] = useState("");
  const curated = line.picks;
  const full = fullItemsFor(line.id).filter((it) => !curated.includes(it));

  const itemRow = (name, removable = false) => {
    const id = itemId(line.id, name);
    const on = checks.has(id);
    return (
      <div key={name} className="iw-al-item-wrap">
        <button className={`iw-al-item ${on ? "iw-al-item-on" : ""}`} onClick={() => toggle(id)}>
          <span className="iw-al-item-check" aria-hidden="true">{on ? "✓" : ""}</span>
          <FoodImg name={name} className="iw-al-item-img" />
          <span className="iw-al-item-name">{name}</span>
        </button>
        {removable && <button className="iw-al-item-del" onClick={() => onRemoveCustom(name)} aria-label="remove">✕</button>}
      </div>
    );
  };

  return (
    <div className="iw-al-catblock">
      <div className="iw-al-cathead">
        <span className="iw-al-catname">{CAT_LABEL[line.id] || line.label}</span>
        <span className="iw-al-catqty">{line.qty}</span>
      </div>
      <div className="iw-al-items">
        {curated.map((n) => itemRow(n))}
        {custom.map((n) => itemRow(n, true))}
        {showAll && full.map((n) => itemRow(n))}
      </div>
      {full.length > 0 && (
        <button className="iw-al-catmore" onClick={() => setShowAll((s) => !s)}>
          {showAll ? "▾ show fewer" : `▸ show all ${(CAT_LABEL[line.id] || "options").toLowerCase()} (${full.length} more)`}
        </button>
      )}
      <form className="iw-al-additem" onSubmit={(e) => { e.preventDefault(); onAdd(draft); setDraft(""); }}>
        <input className="iw-al-additem-input" value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder={`add your own ${(CAT_LABEL[line.id] || "item").toLowerCase()}…`} />
        <button type="submit" className="iw-al-additem-btn">＋ add</button>
      </form>
    </div>
  );
}
