import React, { useRef, useState } from "react";
import { sealIdentity } from "./clearDayStore.js";
import { TRACK_META } from "./clearDayData.js";
import SignaturePad, { MIN_INK, readSignature } from "./SignaturePad.jsx";
import cdFx from "./cdFx.js";
import { slamHeavy } from "../../lib/haptics.js";
import { sfxWaxSeal, sfxQuillScratch } from "../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE SEALING — stage 5. The whole file laid out as a document,
   then signed in his own hand.
   He signs a contract for the DAY every night; he had never once
   signed WHO HE IS. Identity-relevant signatures raise follow-
   through where administrative ones don't (Kettle & Häubl), and a
   claim that has been signed and spoken is retrievable at 11pm in
   a way a claim that was merely typed is not.
   Same instrument as the Day Contract — same ink gate, same quill
   scratch, same wax. Refining the claim later costs a re-signature:
   the file is only as good as the last time he put his name on it.
   ═══════════════════════════════════════════════════════════════ */

export default function IdentitySeal({ S, day, claim, settings, resign = false, onSealed }) {
  const [ink, setInk] = useState(0);
  const [clearSignal, setClearSignal] = useState(0);
  const [sealing, setSealing] = useState(false);
  const padRef = useRef(null);

  const rules = S.rules || [];
  const armed = rules.filter((r) => r.armedAt);
  const maskName = S.identity.maskName || "The Mask";

  const prettyDate = (() => {
    try {
      return new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return `day ${day}`;
    }
  })();

  const sign = () => {
    if (ink < MIN_INK || sealing) return;
    setSealing(true);
    const sig = readSignature(padRef.current);
    sealIdentity(sig, claim);
    sfxWaxSeal(settings);
    slamHeavy();
    cdFx.sunrise("#ffc46b");
    const W = window.innerWidth || 390;
    const H = window.innerHeight || 844;
    cdFx.burst(W / 2, H * 0.5, "petal", 26);
    cdFx.burst(W / 2, H * 0.62, "ember", 14, "#ffc46b");
    if (onSealed) setTimeout(() => onSealed(), 420);
  };

  return (
    <div className={`idf-deed ${sealing ? "idf-deed--sealing" : ""}`}>
      <div className="idf-deed-head">
        <span className="idf-deed-title">THE IDENTITY FILE</span>
        <span className="idf-deed-date">{prettyDate}</span>
      </div>

      <div className="idf-deed-claim">
        <span className="idf-deed-quote" aria-hidden="true">“</span>
        {claim}
      </div>

      <div className="idf-deed-body">
        <div className="idf-deed-row">
          <span className="idf-deed-k">LEAVING</span>
          <span className="idf-deed-v">{S.doors.dark || "—"}</span>
        </div>
        <div className="idf-deed-row">
          <span className="idf-deed-k">BECOMING</span>
          <span className="idf-deed-v">{S.doors.clear || "—"}</span>
        </div>
        <div className="idf-deed-row">
          <span className="idf-deed-k">THE VOICE</span>
          <span className="idf-deed-v">
            Named <strong>{maskName}</strong>. It talks. It gets no say in this file.
          </span>
        </div>
        {S.tracks.map((t) => (
          <div key={t} className="idf-deed-law" style={{ color: TRACK_META[t].color, borderColor: `${TRACK_META[t].color}55` }}>
            {S.laws[t] || TRACK_META[t].lawHint}
          </div>
        ))}
        <div className="idf-deed-row">
          <span className="idf-deed-k">THE CODE</span>
          <span className="idf-deed-v">
            {rules.length} non-negotiable{rules.length === 1 ? "" : "s"} · {armed.length} armed with a when-then
          </span>
        </div>
      </div>

      <div className="idf-deed-sigline">
        {resign
          ? "The claim changed. Sign the new one:"
          : "Signed, in his own hand, by the man he's becoming:"}
      </div>
      <SignaturePad
        onInkChange={setInk}
        clearSignal={clearSignal}
        padRef={padRef}
        onFirstStroke={() => sfxQuillScratch(settings)}
        tint="#ffc46b"
      />
      <div className="idf-deed-sigrow">
        <button type="button" className="cd-ghost" onClick={() => setClearSignal((n) => n + 1)}>clear</button>
        <button type="button" className="cd-btn idf-deed-signbtn" disabled={ink < MIN_INK} onClick={sign}>
          {ink < MIN_INK ? "SIGN IT — FINGER TO GLASS" : "✦ SEAL THE FILE"}
        </button>
      </div>

      {sealing && (
        <div className="cd-seal-wax" aria-hidden="true">
          <span className="cd-seal-wax-sun">☀</span>
        </div>
      )}
    </div>
  );
}
