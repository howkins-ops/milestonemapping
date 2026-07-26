import React, { useRef, useState } from "react";
import { forgeClaims, claimFault, claimOk, CLAIM_FRAMES } from "./identityForge.js";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium } from "../../lib/haptics.js";
import { sfxPop, sfxCoin } from "../../lib/sfx.js";
import { hasAiConsent } from "../../lib/aiConsent.js";
import AiConsentModal from "../common/AiConsentModal.jsx";

/* ═══════════════════════════════════════════════════════════════
   THE CLAIM FORGE — stage 3 of the Identity Forge.
   His own two paragraphs go in; three candidate claims come back,
   forged in his own voice by THE CORNER (Haiku 4.5, server-side).
   He picks one, sharpens it, or writes his own — the forge never
   decides for him, and it never blocks: no key, no network, no
   problem, the local composer scaffolds from his own sentences and
   says so out loud.
   ═══════════════════════════════════════════════════════════════ */

export default function ClaimForge({ ctx, value, onSave, settings }) {
  const [draft, setDraft] = useState(value || "");
  const [cands, setCands] = useState([]);
  const [source, setSource] = useState(null); // "corner" | "local"
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const inputRef = useRef(null);

  const fault = claimFault(draft);
  const ready = claimOk(draft);

  const run = async (mode) => {
    if (busy) return;
    // 5.1.2: his two paragraphs don't reach Anthropic until he has said yes.
    // Without consent the forge still works — it just stays local.
    if (!hasAiConsent("anthropic")) { setPendingMode(mode); return; }
    setBusy(true);
    setAsked(true);
    tapMedium();
    const { claims, source: src } = await forgeClaims({
      ...ctx,
      mode: mode === "sharpen" ? "sharpen" : "forge",
      draft: mode === "sharpen" ? draft : "",
    });
    setCands(claims);
    setSource(claims.length ? src : null);
    setBusy(false);
    if (claims.length) sfxPop(settings);
  };

  const pick = (c, e) => {
    setDraft(c);
    tapLight();
    sfxPop(settings);
    cdFx.ringFrom(e, "#7fb4ff");
  };

  return (
    <div className="idf-claimforge">
      {!asked && (
        <button type="button" className="cd-btn idf-forge-btn" disabled={busy} onClick={() => run("forge")}>
          ⚡ FORGE IT FROM WHAT I WROTE
        </button>
      )}

      {busy && (
        <div className="idf-forge-wait" aria-live="polite">
          <span className="idf-forge-anvil" aria-hidden="true">✦</span>
          reading what you wrote…
        </div>
      )}

      {!busy && cands.length > 0 && (
        <>
          <div className="idf-forge-src">
            {source === "corner"
              ? "◈ THREE ANGLES, FORGED FROM YOUR OWN WORDS — tap the one that's true"
              : "◈ OFFLINE — these are scaffolds built from your own sentences, not forged lines. Edit freely."}
          </div>
          <div className="idf-cands">
            {cands.map((c) => (
              <button
                key={c}
                type="button"
                className={`idf-cand ${draft.trim() === c.trim() ? "idf-cand--on" : ""}`}
                onClick={(e) => pick(c, e)}
              >
                <span className="idf-cand-mark" aria-hidden="true">“</span>
                {c}
              </button>
            ))}
          </div>
          <button type="button" className="cd-ghost cd-ghost--sm" disabled={busy} onClick={() => run("forge")}>
            forge three more
          </button>
        </>
      )}

      {!busy && asked && !cands.length && (
        <>
          <div className="cd-nudge">
            The corner's out of reach right now, so this one's yours to write — which was always the
            strongest version anyway. Start from a frame if it helps:
          </div>
          <div className="cd-chips cd-chips--wrap">
            {CLAIM_FRAMES.map((f) => (
              <button key={f} type="button" className="cd-chip" onClick={() => {
                setDraft(f);
                tapLight();
                if (inputRef.current) {
                  inputRef.current.focus();
                  const n = f.length;
                  try { inputRef.current.setSelectionRange(n, n); } catch { /* fine */ }
                }
              }}>{f.trim()}…</button>
            ))}
          </div>
        </>
      )}

      <div className="idf-claim-own">
        <div className="cd-label">{cands.length ? "YOUR CLAIM — EDIT IT UNTIL IT'S YOURS" : "THE CLAIM"}</div>
        <textarea
          ref={inputRef}
          className="cd-input idf-claim-input"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="I'm someone who…"
        />
        {fault && <div className="cd-nudge">{fault}</div>}
        <div className="idf-claim-row">
          {draft.trim().length >= 10 && (
            <button type="button" className="cd-ghost cd-ghost--sm" disabled={busy} onClick={() => run("sharpen")}>
              ⚡ sharpen it
            </button>
          )}
          <button
            type="button"
            className="cd-btn cd-btn--sm"
            disabled={!ready}
            onClick={(e) => {
              onSave(draft.trim());
              cdFx.burstFrom(e, "spark", 14, "#7fb4ff");
              tapMedium();
              sfxCoin(settings);
            }}
          >
            THIS IS THE CLAIM →
          </button>
        </div>
      </div>

      {pendingMode && (
        <AiConsentModal
          provider="anthropic"
          onAccept={() => { const m = pendingMode; setPendingMode(null); run(m); }}
          onCancel={() => {
            // Declining is a real answer, not a dead end — fall through to the
            // local composer so the stage still completes.
            const m = pendingMode;
            setPendingMode(null);
            setBusy(true);
            setAsked(true);
            forgeClaims({
              ...ctx,
              mode: m === "sharpen" ? "sharpen" : "forge",
              draft: m === "sharpen" ? draft : "",
            }).then(({ claims, source: src }) => {
              setCands(claims);
              setSource(claims.length ? src : null);
              setBusy(false);
            });
          }}
        />
      )}
    </div>
  );
}
