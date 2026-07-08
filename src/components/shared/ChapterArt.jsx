import React, { useEffect, useState } from "react";

/* ChapterArt — drop-in header/cover art for titled chapters, stages,
   districts, and boss cards across the app. Same zero-code-change
   convention as ExerciseImg/FoodImg: resolves /assets/{folder}/{slug}.png
   and renders nothing until the file exists (onError hides it), so the
   existing text/glyph layout stays intact until Codex art lands per
   APP-IMAGE-SLUGS.md. Pass an explicit `slug`, or a `name` to derive one. */

export const artSlug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function chapterArtSrc(folder, slugOrName) {
  const key = artSlug(slugOrName);
  return folder && key ? `/assets/${folder}/${key}.png` : null;
}

export default function ChapterArt({ folder, slug, name, className = "", alt, style }) {
  const src = chapterArtSrc(folder, slug || name);
  const [ok, setOk] = useState(true);
  useEffect(() => { setOk(true); }, [src]);
  if (!src || !ok) return null;
  return (
    <img className={`chapter-art ${className}`} src={src} alt={alt || name || ""}
      loading="lazy" style={style} onError={() => setOk(false)} />
  );
}
