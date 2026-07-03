import React, { useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { createChallenge } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { CHALLENGE_TEMPLATES } from "./challengeTemplates.js";

const MIN_DAYS = 3;
const MAX_DAYS = 90;

// Light a new challenge: pick a template (prefills), tune it, choose who's in.
export default function ChallengeCreate({ onCreated, onCancel }) {
  const { squads } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const [templateKey, setTemplateKey] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [squadId, setSquadId] = useState(null); // null = friends scope
  const [busy, setBusy] = useState(false);

  const pickTemplate = (t) => {
    setTemplateKey(t.key);
    setTitle(t.title);
    setDescription(t.description);
    setDuration(t.durationDays);
  };

  const submit = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle || busy) return;
    const days = Math.min(MAX_DAYS, Math.max(MIN_DAYS, Number(duration) || MIN_DAYS));
    setBusy(true);
    try {
      await createChallenge({
        scope: squadId ? "squad" : "friends",
        squadId,
        templateKey,
        title: cleanTitle,
        description: description.trim() || null,
        durationDays: days,
      });
      celebrate({ variant: "project", title: "Challenge lit 🏆", subtitle: cleanTitle });
      onCreated();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't light it", message: zoneErrorMessage(err) });
      setBusy(false);
    }
  };

  return (
    <div className="zn-card zn-card--glow">
      <h3 className="zn-card__title">＋ New challenge</h3>

      <div className="zn-field">
        <span className="zn-label">Start from a template</span>
        <div className="zn-cats">
          {CHALLENGE_TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`zn-cat${templateKey === t.key ? " zn-cat--active" : ""}`}
              onClick={() => pickTemplate(t)}
            >
              <span className="zn-cat__icon" aria-hidden="true">{t.icon}</span>
              {t.title}
            </button>
          ))}
        </div>
      </div>

      <div className="zn-field">
        <label className="zn-label" htmlFor="zn-ch-title">Title</label>
        <input
          id="zn-ch-title"
          className="zn-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name the fire"
          maxLength={80}
        />
      </div>

      <div className="zn-field">
        <label className="zn-label" htmlFor="zn-ch-desc">What counts as a day won</label>
        <textarea
          id="zn-ch-desc"
          className="zn-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Keep it simple enough to do on your worst day."
          maxLength={300}
        />
      </div>

      <div className="zn-field">
        <label className="zn-label" htmlFor="zn-ch-days">Duration (days)</label>
        <input
          id="zn-ch-days"
          className="zn-input"
          type="number"
          min={MIN_DAYS}
          max={MAX_DAYS}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <p className="zn-hint">{MIN_DAYS}–{MAX_DAYS} days · starts today, {new Date().toLocaleDateString()}</p>
      </div>

      <div className="zn-field">
        <span className="zn-label">Who's in the fire</span>
        <div className="zn-chipbar">
          <button
            type="button"
            className={`zn-react${squadId === null ? " zn-react--mine" : ""}`}
            onClick={() => setSquadId(null)}
          >
            🤝 Friends
          </button>
          {(squads || []).map((s) => (
            <button
              key={s.id}
              type="button"
              className={`zn-react${squadId === s.id ? " zn-react--mine" : ""}`}
              onClick={() => setSquadId(s.id)}
            >
              {s.emblem || "🔥"} {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="zn-2col">
        <button type="button" className="zn-btn zn-btn--ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="zn-btn" onClick={submit} disabled={busy || !title.trim()}>
          {busy ? "Lighting…" : "Light it 🏆"}
        </button>
      </div>
    </div>
  );
}
