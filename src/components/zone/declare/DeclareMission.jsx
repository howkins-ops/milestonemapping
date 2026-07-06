import React, { useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { declareMission } from "../../../lib/zoneService.js";
import { MISSION_CATEGORIES, ZONE_ICONS, zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import ZoneIcon from "../shared/ZoneIcon.jsx";

// Public declaration — the implementation intention that starts the loop.
export default function DeclareMission({ onClose, onDone }) {
  const { todayMission, refreshState } = useZoneCtx();
  const { addXP, pushToast, settings } = useAppData();
  const [category, setCategory] = useState(todayMission?.category || null);
  const [title, setTitle] = useState(todayMission?.title || "");
  const [note, setNote] = useState(todayMission?.note || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pickCat = (c) => {
    setCategory(c.key);
    if (!title || MISSION_CATEGORIES.some((m) => m.label === title)) {
      setTitle(c.key === "custom" ? "" : c.label);
    }
    playSound("click", settings);
  };

  const submit = async () => {
    if (!category || !title.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await declareMission({ category, title: title.trim(), note: note.trim() });
      if (res?.xp_earned > 0) {
        addXP(res.xp_earned, "Mission declared");
        playSound("chime", settings);
        pushToast({ type: "success", title: "Declared", message: "It's on the board. Your people can see it.", icon: "⚡" });
      } else {
        pushToast({ type: "success", title: "Mission updated", message: "The board is current.", icon: "⚡" });
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
      <div className="zn-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Declare today's mission">
        <div className="zn-sheet__handle" aria-hidden="true" />
        <h3 className="zn-sheet__title">
          <ZoneIcon src={ZONE_ICONS.declare} className="zn-sheet__title-icon" />
          Declare today's mission
        </h3>

        <div className="zn-cats" style={{ marginBottom: 16 }}>
          {MISSION_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`zn-cat${category === c.key ? " zn-cat--active" : ""}`}
              onClick={() => pickCat(c)}
            >
              <ZoneIcon src={c.art} className="zn-cat__icon" />
              {c.label}
            </button>
          ))}
        </div>

        <div className="zn-field">
          <label className="zn-label" htmlFor="zn-mission-title">The mission</label>
          <input
            id="zn-mission-title"
            className="zn-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 45 min strength session"
            maxLength={120}
          />
        </div>
        <div className="zn-field">
          <label className="zn-label" htmlFor="zn-mission-note">Why it matters today (optional)</label>
          <input
            id="zn-mission-note"
            className="zn-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One line is plenty"
            maxLength={200}
          />
        </div>

        {error && <p className="zn-hint zn-hint--bad" role="alert">{error}</p>}
        <button type="button" className="zn-btn" onClick={submit} disabled={busy || !category || !title.trim()}>
          {!busy && !todayMission && <ZoneIcon src={ZONE_ICONS.fire} className="zn-btn__icon" />}
          {busy ? "Committing…" : todayMission ? "Update the board" : "Commit publicly"}
        </button>
        <p style={{ fontSize: 11.5, color: "var(--text-soft)", textAlign: "center", marginTop: 10 }}>
          Friends and squad-mates will see this. That's the point.
        </p>
      </div>
    </div>
  );
}
