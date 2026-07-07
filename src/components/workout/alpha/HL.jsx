import React from "react";

/* ALPHA MODE — keyword highlighter for instruction text.
   Wraps numbers + their units (4 rounds, 30s, 8-12 reps, 5 lbs, 20%,
   8-12RM, 4-0-1) in ember, and ALL-CAPS terms (AMRAP, TWICE, PRIME)
   in chalk, so the load-bearing words pop out of the grey. Pass any
   string; renders inline. */

const NUM_SRC =
  "\\d+(?:\\.\\d+)?(?:\\s*[-–—/×x:]\\s*\\d+(?:\\.\\d+)?)*" +
  "(?:\\s*(?:seconds?|sec\\b|s\\b|minutes?|min\\b|lbs?\\b|reps?\\b|rounds?\\b|sets?\\b|moves?\\b|%|RM\\b|g\\b|cal(?:ories)?\\b|total\\b))?";
const CAPS_SRC = "\\b[A-Z]{3,}\\b";
const TOKEN = new RegExp(`(${NUM_SRC})|(${CAPS_SRC})`, "g");

export default function HL({ text, className }) {
  if (text == null || text === "") return null;
  const str = String(text);
  const out = [];
  let last = 0;
  let key = 0;
  TOKEN.lastIndex = 0;
  let m;
  while ((m = TOKEN.exec(str)) !== null) {
    if (m[0].length === 0) { TOKEN.lastIndex += 1; continue; }
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(
      <b key={key++} className={m[1] != null ? "iw-hl-ember" : "iw-hl"}>{m[0]}</b>
    );
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push(str.slice(last));
  return className ? <span className={className}>{out}</span> : <>{out}</>;
}
