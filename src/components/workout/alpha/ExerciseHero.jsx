import React, { useEffect, useState } from "react";
import { exerciseImageSrc } from "./ExerciseImg.jsx";
import { exerciseInfo } from "./data/exercises.js";
import ExerciseDetail from "./ExerciseDetail.jsx";

/* ALPHA MODE — the wizard's exercise hero.
   ONE big, complete demonstration image (letterboxed, never cropped) that
   doubles as a button: tap it for the full-screen dossier (image + every
   form cue). Replaces the old crop-and-duplicate look — the how-to panel
   below it now runs text-only, so nothing shows twice.
   When the art file isn't there yet, a tappable steel plate stands in so
   the "full demo & form" popup is always one tap away. */

export default function ExerciseHero({ name }) {
  const info = exerciseInfo(name);
  const src = exerciseImageSrc(name);
  const [ok, setOk] = useState(true);
  const [open, setOpen] = useState(false);
  useEffect(() => { setOk(true); }, [src]);

  /* a truly custom lift with no library entry AND no art → nothing to show */
  if (!info && (!src || !ok)) return null;
  const hasArt = src && ok;

  return (
    <>
      <button type="button" className="iw-exhero" onClick={() => setOpen(true)}
        aria-label={`${name} — full demo and form`}>
        {hasArt ? (
          <img className="iw-exhero-img" src={src} alt={name} loading="lazy" onError={() => setOk(false)} />
        ) : (
          <span className="iw-exhero-noart" aria-hidden="true">🏋️</span>
        )}
        <span className="iw-exhero-scrim" aria-hidden="true" />
        <span className="iw-exhero-expand" aria-hidden="true">⤢ full demo &amp; form</span>
        {info && (
          <span className="iw-exhero-tags" aria-hidden="true">
            <span className="iw-exhero-tag">{info.muscles}</span>
            <span className="iw-exhero-tag">{info.equipment}</span>
          </span>
        )}
      </button>
      {open && <ExerciseDetail name={name} onClose={() => setOpen(false)} />}
    </>
  );
}
