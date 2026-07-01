/* ════════════════════════════════════════════════════════════════════════
   SWAMP VALVE — safety layer.

   Swamp Valve is playful, but anger is not always. If a player types anything
   pointing at real-world harm — to themselves or someone else, revenge with
   weapons, stalking, driving dangerously, or a sense of losing control — the
   game must drop out of playful mode immediately. No jokes, no fireflies, no
   XP. Just a calm screen that points toward safety and a real human.

   `scanForRisk(text)` returns a { risk, kind } object. Any free-text input
   (custom trigger, truth sentence, rumination thought) should be scanned, and
   on `risk === true` the mode should render <SafetyScreen/> instead of
   continuing the game.
   ════════════════════════════════════════════════════════════════════════ */

import React from "react";

// Word-boundary patterns. Kept deliberately broad — a false positive costs a
// calm screen the player can dismiss; a false negative costs more.
const PATTERNS = [
  { kind: "self-harm", re: /\b(kill myself|end my life|end it all|suicide|suicidal|don'?t want to (be here|live|exist)|better off dead|hurt myself|self[-\s]?harm|cut myself|overdose|no reason to live|want to die)\b/i },
  { kind: "harm-others", re: /\b(kill (him|her|them|you|everyone)|hurt (him|her|them)|make (him|her|them) pay|beat (him|her|them) up|shoot|stab|attack (him|her|them)|hunt (him|her|them) down|destroy (his|her|their) life)\b/i },
  { kind: "weapon", re: /\b(gun|knife|blade|weapon|bullets?|firearm)\b/i },
  { kind: "stalking", re: /\b(follow (him|her|them) home|show up at (his|her|their)|track (his|her|their) (location|phone)|stalk)\b/i },
  { kind: "driving", re: /\b(drive (into|off)|floor it|run (him|her|them) over|crash (the|my) car on purpose|speed until)\b/i },
  { kind: "losing-control", re: /\b(lose control|snap and|can'?t stop myself|going to do something (bad|stupid|i'?ll regret)|out of control)\b/i },
];

export function scanForRisk(text) {
  if (!text || typeof text !== "string") return { risk: false, kind: null };
  for (const p of PATTERNS) {
    if (p.re.test(text)) return { risk: true, kind: p.kind };
  }
  return { risk: false, kind: null };
}

/* ── The calm screen (no gamification, no playful language) ──────────────── */
export function SafetyScreen({ kind, onClose }) {
  const urgent = kind === "self-harm" || kind === "harm-others" || kind === "driving";
  return (
    <div className="sv-safety">
      <div className="sv-safety__card">
        <div className="sv-safety__mark" aria-hidden>🫂</div>
        <h2 className="sv-safety__title">Let&rsquo;s pause the game for a second.</h2>
        <p className="sv-safety__lead">
          What you just wrote matters more than any level. You don&rsquo;t have to carry this
          moment alone, and you don&rsquo;t have to act on it.
        </p>

        {urgent && (
          <div className="sv-safety__urgent">
            If you might act on this right now, please step away from anything or anyone
            that could get hurt — and reach out immediately.
          </div>
        )}

        <ul className="sv-safety__list">
          <li><b>If you&rsquo;re in immediate danger,</b> call your local emergency number (911 in the US/Canada).</li>
          <li><b>In the US:</b> call or text <b>988</b> (Suicide &amp; Crisis Lifeline), any time.</li>
          <li><b>Elsewhere:</b> search &ldquo;crisis line&rdquo; for your country, or call a trusted person now.</li>
          <li>Message one person you trust and tell them how you&rsquo;re really doing.</li>
        </ul>

        <div className="sv-safety__breath">
          <p>While you&rsquo;re here: one slow breath. In for 4… hold for 2… out for 6. Again.</p>
        </div>

        <p className="sv-safety__foot">
          This isn&rsquo;t weakness — it&rsquo;s the strongest valve there is. The swamp will keep.
        </p>
        <button className="sv-safety__btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
