import React, { useEffect, useState } from "react";

/* ALPHA MODE — food ingredient photos for the Fridge.
   Same drop-in convention as ExerciseImg: art lands in
   public/assets/iron/foods/{slug}.png per APP-IMAGE-SLUGS.md and
   shows up here with zero code changes. Until a file exists the
   component renders nothing (onError hides it), so the emoji
   fallback on the plate/shelf carries the look in the meantime.
   Parentheticals are stripped so "Tuna (canned)" → tuna.png and
   "Ground beef (90/10)" → ground-beef.png. */

export const foodSlug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function foodImageSrc(name) {
  const slug = foodSlug(name);
  return slug ? `/assets/iron/foods/${slug}.png` : null;
}

export default function FoodImg({ name, className = "" }) {
  const src = foodImageSrc(name);
  const [ok, setOk] = useState(true);
  useEffect(() => { setOk(true); }, [src]);
  if (!src || !ok) return null;
  return (
    <img className={`iw-food-img ${className}`} src={src} alt={name}
      loading="lazy" onError={() => setOk(false)} />
  );
}
