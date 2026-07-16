import React, { useState } from "react";
import { settleLedger } from "./clearDayStore.js";
import { LEDGER_AREAS, LEDGER_LENSES, LEDGER_RECEIPT, powerCheck } from "./clearDayData.js";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, buzzSuccess } from "../../lib/haptics.js";
import { sfxPop, sfxWaxSeal } from "../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE NIGHT LEDGER — Ritual step IV. The urge at 11pm runs on fuel
   from 2pm: name today's fuel, mark what it hit, own YOUR column,
   burn it before the Mask can. Clean sweep is a completable state.
   Four beats, ~60 seconds. Overlay pattern: mounted from ClearDay
   root like Incantation; settles via store, done-state derives from
   ballot kind "ledger" like every other ritual step.
   ═══════════════════════════════════════════════════════════════ */

// The ledger takes ownership only — victim ink doesn't dry here.
const VICTIM_RE = /\b(made me|their fault|his fault|her fault|no choice|because of (him|her|them))\b/i;

export default function NightLedger({ day, settings, onDone, onClose }) {
  const [beat, setBeat] = useState(0);
  const [fuel, setFuel] = useState("");
  const [hit, setHit] = useState([]);
  const [myPart, setMyPart] = useState("");
  const [clean, setClean] = useState(false);
  const [burning, setBurning] = useState(false);
  const [sealed, setSealed] = useState(false);

  const bankrupt = powerCheck(myPart);
  const victim = VICTIM_RE.test(myPart);
  const partBlocked = victim || Boolean(bankrupt);

  const toggleHit = (a) => {
    tapLight();
    setHit((h) => (h.includes(a) ? h.filter((x) => x !== a) : h.length < 2 ? [...h, a] : h));
  };

  const sweep = () => {
    setClean(true);
    setFuel("");
    setHit([]);
    setMyPart("I walked through today without picking anything up.");
    setBeat(3);
    tapMedium();
  };

  const burn = () => {
    if (burning || sealed) return;
    setBurning(true);
    cdFx.burst("ember", 26, clean ? "#5ce0d3" : "#ff7a38");
    sfxWaxSeal(settings);
    setTimeout(() => {
      const { firstTime } = settleLedger({ fuel, hit, myPart, clean });
      setSealed(true);
      setBurning(false);
      buzzSuccess();
      if (firstTime && onDone) onDone({ clean });
    }, 1400);
  };

  return (
    <div className="cd-ledger" role="dialog" aria-label="The Night Ledger">
      <div className="cd-ledger-sky" aria-hidden="true" />
      <button type="button" className="cd-ledger-x" onClick={onClose} aria-label="Close">×</button>

      <div className="cd-ledger-scroll">
        <div className="cd-ledger-dots" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={beat >= i ? "on" : ""} />
          ))}
        </div>

        {beat === 0 && (
          <div className="cd-ledger-beat">
            <div className="cd-eyebrow" style={{ color: "var(--cd-amber)" }}>§ 01 · THE FUEL</div>
            <h1 className="cd-h1">What's still sitting in you tonight?</h1>
            <p className="cd-p cd-p--soft">
              Urges don't come from nowhere. At 11pm the Mask reaches for whatever today left in
              you — the swallowed comment, the fight, the loneliness — and burns it as fuel.
              <strong> Name it now and it can't be used against you later.</strong>
            </p>
            <textarea
              className="cd-ledger-input"
              maxLength={200}
              value={fuel}
              placeholder="e.g. Still chewing on what happened in that meeting…"
              onChange={(e) => setFuel(e.target.value)}
            />
            <button
              type="button"
              className="cd-btn cd-btn--rep"
              disabled={fuel.trim().length < 4}
              onClick={() => { setBeat(1); tapLight(); sfxPop(settings); }}
            >
              THAT'S THE FUEL →
            </button>
            <button type="button" className="cd-ledger-sweep" onClick={sweep}>
              🌊 CLEAN SWEEP — carrying nothing tonight
            </button>
          </div>
        )}

        {beat === 1 && (
          <div className="cd-ledger-beat">
            <div className="cd-eyebrow" style={{ color: "var(--cd-amber)" }}>§ 02 · WHAT IT HIT</div>
            <h1 className="cd-h1">Where did it land?</h1>
            <p className="cd-p cd-p--soft">Fuel only burns where it touches something you protect. Mark up to two.</p>
            <div className="cd-ledger-chips">
              {LEDGER_AREAS.map((a) => (
                <button key={a} type="button" className={`cd-ledger-chip ${hit.includes(a) ? "on" : ""}`} onClick={() => toggleHit(a)}>
                  {a}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="cd-btn cd-btn--rep"
              disabled={!hit.length}
              onClick={() => { setBeat(2); tapLight(); sfxPop(settings); }}
            >
              MARKED →
            </button>
          </div>
        )}

        {beat === 2 && (
          <div className="cd-ledger-beat">
            <div className="cd-eyebrow" style={{ color: "var(--cd-amber)" }}>§ 03 · MY PART</div>
            <h1 className="cd-h1">What do you own?</h1>
            <p className="cd-p cd-p--soft">
              Not blame — <strong>power</strong>. The only column of this ledger you control is yours.
            </p>
            <div className="cd-ledger-chips cd-ledger-chips--lens">
              {LEDGER_LENSES.map((l) => (
                <button
                  key={l}
                  type="button"
                  className="cd-ledger-chip"
                  onClick={() => { if (!myPart.trim()) setMyPart(`${l} — `); tapLight(); }}
                >
                  {l}
                </button>
              ))}
            </div>
            <textarea
              className="cd-ledger-input"
              maxLength={220}
              value={myPart}
              placeholder="I replayed it all afternoon instead of saying it out loud."
              onChange={(e) => setMyPart(e.target.value)}
            />
            {victim && (
              <div className="cd-ledger-law">
                ⚖ The ledger takes ownership only. "Made me", "their fault" — that ink doesn't dry
                here. What did <strong>you</strong> feed, hide, or protect?
              </div>
            )}
            {!victim && bankrupt && (
              <div className="cd-ledger-law">
                ⚖ "{bankrupt.from}" is bankrupt ink — write it as "{bankrupt.to}".
              </div>
            )}
            <button
              type="button"
              className="cd-btn cd-btn--rep"
              disabled={partBlocked || myPart.trim().length < 8}
              onClick={() => { setBeat(3); tapMedium(); sfxPop(settings); }}
            >
              OWNED →
            </button>
          </div>
        )}

        {beat === 3 && (
          <div className="cd-ledger-beat">
            {!sealed ? (
              <>
                <div className="cd-eyebrow" style={{ color: "var(--cd-amber)" }}>§ 04 · SETTLE &amp; SEAL</div>
                <h1 className="cd-h1">Read it once. Then burn it.</h1>
                <div className={`cd-ledger-entry ${burning ? "cd-ledger-entry--burning" : ""}`}>
                  <div className="cd-ledger-row">
                    <span className="cd-ledger-lbl">TONIGHT'S FUEL</span>
                    <p>{clean ? "Nothing held. Carrying nothing into the night." : `“${fuel.trim()}”`}</p>
                  </div>
                  <div className="cd-ledger-row">
                    <span className="cd-ledger-lbl">WHAT IT HIT</span>
                    <p>{hit.length ? hit.join("  ·  ") : "—"}</p>
                  </div>
                  <div className="cd-ledger-row">
                    <span className="cd-ledger-lbl">MY PART — THE ONLY COLUMN I CONTROL</span>
                    <p style={{ color: "var(--cd-amber)" }}>{myPart.trim()}</p>
                  </div>
                </div>
                <button type="button" className="cd-btn cd-btn--seal" disabled={burning} onClick={burn}>
                  🔥 BURN IT BEFORE THE MASK CAN
                </button>
              </>
            ) : (
              <div className="cd-ledger-done">
                <div className={`cd-ledger-stamp ${clean ? "cd-ledger-stamp--clean" : ""}`}>
                  <span>DAY {day}<br />{clean ? "CLEAN" : "SETTLED"}</span>
                </div>
                <div className="cd-ledger-filed">EXHIBIT FILED · {clean ? "CLEAN SWEEP" : "LEDGER SETTLED"}</div>
                <p className="cd-p cd-p--soft">
                  {clean
                    ? "Zero debt carried through a whole day. The night has nothing to work with."
                    : "The fuel is off your books. Whatever the Mask reaches for tonight, it won't be this."}
                </p>
                <div className="cd-cite">◈ {LEDGER_RECEIPT}</div>
                <button type="button" className="cd-btn cd-btn--rep" onClick={onClose}>
                  BACK TO THE RITUAL — SEAL THE DAY
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
