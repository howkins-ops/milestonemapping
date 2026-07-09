import React, { useEffect, useState } from "react";
import HL from "./HL.jsx";
import { exerciseImageSrc } from "./ExerciseImg.jsx";
import { exerciseInfo } from "./data/exercises.js";

/* ALPHA MODE — the full-screen exercise dossier.
   Opened from the wizard hero (or any lift row): covers the screen with
   the WHOLE demonstration image — never cropped — plus muscles, gear, the
   signature cue, the setup and every numbered form step. One tap in, tap
   the veil / ✕ / Escape to close. Body scroll is locked while it's open. */

export default function ExerciseDetail({ name, onClose }) {
  const info = exerciseInfo(name);
  const src = exerciseImageSrc(name);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!info && !src) return null;
  const hasArt = src && imgOk;

  return (
    <div className="iw-exd-veil" onClick={onClose} role="dialog" aria-modal="true" aria-label={name}>
      <div className="iw-exd" onClick={(e) => e.stopPropagation()}>
        <button className="iw-exd-close" onClick={onClose} aria-label="close">✕</button>

        <div className="iw-exd-scroll">
          <div className="iw-exd-figure">
            {hasArt ? (
              <img className="iw-exd-img" src={src} alt={name} onError={() => setImgOk(false)} />
            ) : (
              <div className="iw-exd-noart" aria-hidden="true"><span>🏋️</span></div>
            )}
            <div className="iw-exd-figcap">
              <h2 className="iw-exd-name">{name}</h2>
              {info && (
                <div className="iw-exd-tags">
                  <span className="iw-exd-tag">{info.muscles}</span>
                  <span className="iw-exd-tag">{info.equipment}</span>
                  {info.hold && <span className="iw-exd-tag iw-exd-tag-hold">timed hold</span>}
                </div>
              )}
            </div>
          </div>

          {info ? (
            <div className="iw-exd-body">
              {info.signature && (
                <div className="iw-exd-sig">
                  <span className="iw-exd-sig-tag">✦ signature move — {info.signature.genericName}</span>
                  <p className="iw-exd-sig-cue"><HL text={info.signature.cue} /></p>
                </div>
              )}

              <div className="iw-exd-sec">
                <div className="iw-exd-sec-h">the setup</div>
                <p className="iw-exd-setup"><HL text={info.setup} /></p>
              </div>

              <div className="iw-exd-sec">
                <div className="iw-exd-sec-h">the movement</div>
                <ol className="iw-exd-steps">
                  {info.steps.map((s, i) => (
                    <li key={i}><HL text={s} /></li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="iw-exd-body">
              <p className="iw-exd-setup">Your own lift — no library cues for this one. Load it honest and move it well.</p>
            </div>
          )}

          <button className="iw-btn-ember iw-btn-wide iw-exd-done" onClick={onClose}>got it — back to the set</button>
        </div>
      </div>
    </div>
  );
}
