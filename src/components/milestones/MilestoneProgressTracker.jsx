import React, { useState } from "react";
import Button from "../ui/Button.jsx";

// Pull a sensible target + unit suggestion out of a title like "50 SALES" or
// "Read 12 books" → { target: "50", unit: "sales" } / { target: "12", unit: "books" }.
function suggestFromTitle(title = "") {
  const m = String(title).match(/(\d[\d,]*)\s*([a-zA-Z%$]*)/);
  if (!m) return { target: "", unit: "" };
  return { target: m[1].replace(/,/g, ""), unit: (m[2] || "").toLowerCase() };
}

const clamp0 = (n) => Math.max(0, Number(n) || 0);

const STRIP = {
  marginTop: 18,
  paddingTop: 18,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

export default function MilestoneProgressTracker({ milestone, onUpdate, carryFrom = 0, carryUnit = "" }) {
  const hasTarget = milestone.targetValue > 0;
  const current = Number(milestone.currentValue) || 0;
  const unit = milestone.unit || "";
  const carry = Number(carryFrom) || 0;

  const suggestion = suggestFromTitle(milestone.title);
  const [setupTarget, setSetupTarget] = useState(suggestion.target);
  const [setupUnit, setSetupUnit] = useState(suggestion.unit || carryUnit);
  const [editing, setEditing] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [amount, setAmount] = useState("");
  const [exact, setExact] = useState("");

  const patch = (p) => onUpdate(milestone.id, p);

  const openEdit = () => {
    setSetupTarget(hasTarget ? String(milestone.targetValue) : suggestion.target);
    setSetupUnit(unit || suggestion.unit || carryUnit);
    setEditing(true);
  };

  const setGoal = () => {
    const t = Number(setupTarget);
    if (!(t > 0)) return;
    // Pick up from the previous milestone's threshold when we have no progress yet.
    const start = current > 0 ? current : carry;
    patch({ targetValue: t, unit: setupUnit.trim(), currentValue: Math.min(start, t) });
    setEditing(false);
  };

  const startFromCarry = () => patch({ currentValue: Math.min(carry, milestone.targetValue) });

  const bump = (delta) => patch({ currentValue: clamp0(current + delta) });

  const addAmount = () => {
    const a = Number(amount);
    if (!a) return;
    patch({ currentValue: clamp0(current + a) });
    setAmount("");
  };

  const commitExact = () => {
    if (exact === "") return;
    patch({ currentValue: clamp0(exact) });
    setExact("");
  };

  /* ---------------- target setup / edit form ---------------- */
  if (editing) {
    return (
      <div style={STRIP}>
        <div className="kicker" style={{ color: "var(--brand-gold)", marginBottom: 10 }}>
          {hasTarget ? "EDIT TARGET" : "SET YOUR TARGET"}
        </div>
        {!hasTarget && carry > 0 && (
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            ↪ Picks up where your last milestone left off — starts at <strong>{carry}</strong>
            {carryUnit ? ` ${carryUnit}` : ""}.
          </p>
        )}
        <div className="row row--wrap" style={{ gap: 10, alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="soft" style={{ fontSize: 11 }}>Target</span>
            <input
              className="input"
              type="number"
              min="1"
              style={{ width: 110 }}
              placeholder="50"
              value={setupTarget}
              onChange={(e) => setSetupTarget(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setGoal()}
              aria-label="Target value"
              autoFocus
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="soft" style={{ fontSize: 11 }}>Unit (optional)</span>
            <input
              className="input"
              style={{ width: 150 }}
              placeholder="sales"
              value={setupUnit}
              onChange={(e) => setSetupUnit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setGoal()}
              aria-label="Unit"
            />
          </label>
          <Button variant="primary" onClick={setGoal} disabled={!(Number(setupTarget) > 0)}>
            {hasTarget ? "Save" : "Set Goal"}
          </Button>
          <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          {hasTarget && (
            <Button
              variant="ghost"
              style={{ color: "var(--brand-red)", marginLeft: "auto" }}
              onClick={() => { patch({ targetValue: null }); setEditing(false); }}
            >
              Remove target
            </Button>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- prompt (no target yet) ---------------- */
  if (!hasTarget) {
    return (
      <div style={STRIP} className="row row--between row--wrap" >
        <div style={{ minWidth: 0 }}>
          <div className="kicker" style={{ color: "var(--brand-gold)", marginBottom: 2 }}>TRACK BY THE NUMBERS</div>
          <p className="muted" style={{ fontSize: 13 }}>
            Count up to a target (50 sales, 20 lbs, 12 books) and this ring fills automatically.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={openEdit} style={{ flexShrink: 0 }}>
          ＋ Set a target
        </Button>
      </div>
    );
  }

  /* ---------------- live counter ---------------- */
  return (
    <div style={STRIP}>
      <div className="row row--between row--wrap" style={{ gap: 16, alignItems: "center" }}>
        <div>
          <div className="kicker soft" style={{ marginBottom: 4 }}>PROGRESS</div>
          <div className="mono" style={{ fontSize: 30, lineHeight: 1, color: "var(--brand-gold)" }}>
            {current}
            <span className="soft" style={{ fontSize: 18 }}> / {milestone.targetValue}</span>
            {unit && <span className="soft" style={{ fontSize: 15 }}> {unit}</span>}
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={() => bump(-1)} disabled={current <= 0} aria-label="Subtract one">−1</Button>
          <Button variant="primary" onClick={() => bump(1)} aria-label="Add one">+1</Button>
          <Button variant="secondary" size="sm" onClick={() => setShowMore((s) => !s)}>
            {showMore ? "Close" : "⋯ More"}
          </Button>
        </div>
      </div>

      {current === 0 && carry > 0 && (
        <button
          type="button"
          onClick={startFromCarry}
          className="mono"
          style={{
            marginTop: 12, background: "rgba(250,204,21,0.08)", color: "var(--brand-gold)",
            border: "1px solid rgba(250,204,21,0.3)", borderRadius: 8, padding: "6px 12px",
            fontSize: 12, cursor: "pointer",
          }}
        >
          ↪ Carry over from last milestone — start at {carry}{carryUnit ? ` ${carryUnit}` : ""}
        </button>
      )}

      {showMore && (
        <div className="row row--wrap" style={{ gap: 14, marginTop: 14, alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="soft" style={{ fontSize: 11 }}>Add several</span>
            <div className="row" style={{ gap: 6 }}>
              <input
                className="input"
                type="number"
                style={{ width: 90 }}
                placeholder="+ amt"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAmount()}
                aria-label="Amount to add"
              />
              <Button variant="secondary" onClick={addAmount} disabled={!Number(amount)}>Add</Button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="soft" style={{ fontSize: 11 }}>Set exact total</span>
            <div className="row" style={{ gap: 6 }}>
              <input
                className="input"
                type="number"
                style={{ width: 100 }}
                placeholder="total"
                value={exact}
                onChange={(e) => setExact(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitExact()}
                aria-label="Set exact value"
              />
              <Button variant="secondary" onClick={commitExact} disabled={exact === ""}>Set</Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={openEdit} style={{ marginLeft: "auto" }}>
            ✎ Edit target
          </Button>
        </div>
      )}
    </div>
  );
}
