import React, { useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { listChallenges, postProof } from "../../../lib/zoneService.js";
import { uploadProofPhoto } from "../../../lib/zoneMedia.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";

const DURATIONS = [10, 15, 25, 30, 45, 60, 90];

// The heart of the product: proof. Photo (camera or library) or words —
// atomic XP/streak/fire/eruption on the server, celebration here.
export default function PostProof({ onClose, onDone, challengeId = null }) {
  const { userId, todayMission, refreshState } = useZoneCtx();
  const { addXP, celebrate, pushToast, settings } = useAppData();
  const [kind, setKind] = useState("photo");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoSource, setPhotoSource] = useState(null);
  const [caption, setCaption] = useState("");
  const [duration, setDuration] = useState(null);
  const [challenge, setChallenge] = useState(challengeId);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cameraRef = useRef(null);
  const libraryRef = useRef(null);

  useEffect(() => {
    if (challengeId) return undefined;
    let alive = true;
    listChallenges()
      .then((res) => alive && setActiveChallenges(res?.active || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [challengeId]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (e, source) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPhotoSource(source);
      playSound("pop", settings);
    }
    e.target.value = "";
  };

  const submit = async () => {
    if (kind === "photo" && !file) return;
    if (kind === "text" && !caption.trim()) return;
    setBusy(true);
    setError("");
    try {
      let mediaPath = null;
      if (kind === "photo") mediaPath = await uploadProofPhoto(file, userId);
      const res = await postProof({
        kind,
        caption: caption.trim(),
        mediaPath,
        challengeId: challenge || null,
        durationMinutes: duration,
        photoSource: kind === "photo" ? photoSource : null,
      });
      if (res?.xp_earned) addXP(res.xp_earned, "Proof witnessed");
      playSound("tada", settings);
      celebrate({
        variant: "day",
        title: "Witnessed 🔥",
        subtitle:
          res?.zone_streak > 1
            ? `${res.zone_streak} days of showing up`
            : "The fire is lit. Day one.",
      });
      if (res?.erupted?.length) {
        setTimeout(() => {
          playSound("levelup", settings);
          celebrate({
            variant: "milestone",
            title: "🌋 SQUAD ERUPTION",
            subtitle: `${res.erupted.map((s) => s.name || s.squad_name).join(", ")} lit the whole meter`,
          });
        }, 1800);
      }
      if (res?.challenge?.completed) {
        setTimeout(() => {
          celebrate({
            variant: "reward",
            title: "🏆 Challenge complete",
            subtitle: "Every check-in, witnessed. Take the podium.",
          });
        }, 3400);
      }
      await refreshState();
      // Pass the RPC result up — callers like The Vow link res.proof_id to a defuse.
      onDone(res);
    } catch (err) {
      setError(zoneErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="zn-overlay" onClick={onClose}>
      <div className="zn-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Post proof">
        <div className="zn-sheet__handle" aria-hidden="true" />
        <h3 className="zn-sheet__title">📸 Post proof</h3>
        {todayMission && (
          <p style={{ fontSize: 13, color: "var(--text-soft)", margin: "-6px 0 14px" }}>
            Completing: <strong style={{ color: "var(--text-main)" }}>{todayMission.title}</strong>
          </p>
        )}

        <div className="zn-2col" style={{ marginBottom: 14 }}>
          <button type="button" className={`zn-cat${kind === "photo" ? " zn-cat--active" : ""}`} onClick={() => setKind("photo")}>
            <span className="zn-cat__icon" aria-hidden="true">📷</span>Photo
          </button>
          <button type="button" className={`zn-cat${kind === "text" ? " zn-cat--active" : ""}`} onClick={() => setKind("text")}>
            <span className="zn-cat__icon" aria-hidden="true">✍️</span>Words
          </button>
        </div>

        {kind === "photo" && (
          <div className="zn-field">
            {previewUrl ? (
              <div style={{ position: "relative" }}>
                <img src={previewUrl} alt="Proof preview" style={{ width: "100%", borderRadius: 16, maxHeight: 320, objectFit: "cover" }} />
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost zn-btn--small"
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(4,0,7,0.7)" }}
                  onClick={() => setFile(null)}
                >
                  ✕ Retake
                </button>
                <span className="zn-chip" style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(4,0,7,0.7)" }}>
                  {photoSource === "camera" ? "📷 Taken in-app" : "🖼️ From library"}
                </span>
              </div>
            ) : (
              <div className="zn-2col">
                <button type="button" className="zn-btn zn-btn--ghost" onClick={() => cameraRef.current?.click()}>
                  📷 Camera
                </button>
                <button type="button" className="zn-btn zn-btn--ghost" onClick={() => libraryRef.current?.click()}>
                  🖼️ Library
                </button>
              </div>
            )}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pickFile(e, "camera")} />
            <input ref={libraryRef} type="file" accept="image/*" hidden onChange={(e) => pickFile(e, "library")} />
          </div>
        )}

        <div className="zn-field">
          <label className="zn-label" htmlFor="zn-proof-caption">{kind === "text" ? "What happened" : "Caption (optional)"}</label>
          <textarea
            id="zn-proof-caption"
            className="zn-textarea"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={kind === "text" ? "Two lines is plenty: what you did, how it felt." : "Say a little something…"}
            maxLength={300}
          />
        </div>

        <div className="zn-field">
          <span className="zn-label">How long? (optional)</span>
          <div className="zn-chipbar">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={`zn-react${duration === d ? " zn-react--mine" : ""}`}
                onClick={() => setDuration(duration === d ? null : d)}
              >
                ⏱ {d >= 60 ? `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ""}` : `${d} min`}
              </button>
            ))}
          </div>
        </div>

        {!challengeId && activeChallenges.length > 0 && (
          <div className="zn-field">
            <span className="zn-label">Count toward a challenge?</span>
            <div className="zn-chipbar">
              {activeChallenges.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`zn-react${challenge === c.id ? " zn-react--mine" : ""}`}
                  onClick={() => setChallenge(challenge === c.id ? null : c.id)}
                >
                  🏆 {c.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="zn-hint zn-hint--bad" role="alert">{error}</p>}
        <button
          type="button"
          className="zn-btn"
          onClick={submit}
          disabled={busy || (kind === "photo" ? !file : !caption.trim())}
        >
          {busy ? "Sending to the fire…" : "Prove it 🔥"}
        </button>
      </div>
    </div>
  );
}
