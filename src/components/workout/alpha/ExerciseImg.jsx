import React, { useEffect, useState } from "react";
import { exerciseInfo } from "./data/exercises.js";

/* ALPHA MODE — exercise demonstration images.
   Art drops into public/assets/iron/ per IRON-IMAGES-NEEDED.md and
   appears here with zero code changes; until a file exists the
   component renders nothing (onError hides it). Lore names resolve
   to their signature hero card; everything else to the canonical
   library slug. */

const kebab = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function exerciseImageSrc(name) {
  const info = exerciseInfo(name);
  if (!info) return null;
  if (info.signature && info.signature.name === name) {
    return `/assets/iron/signature/${info.signature.id}.png`;
  }
  return `/assets/iron/exercises/${kebab(info.name)}.png`;
}

export default function ExerciseImg({ name, className = "" }) {
  const src = exerciseImageSrc(name);
  const [ok, setOk] = useState(true);
  useEffect(() => { setOk(true); }, [src]);
  if (!src || !ok) return null;
  return (
    <img className={`iw-exi ${className}`} src={src} alt={`How to do: ${name}`}
      loading="lazy" onError={() => setOk(false)} />
  );
}
