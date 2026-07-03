import React, { useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { createSquad, joinSquadByCode } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";

const EMBLEMS = ["🔥", "🛡️", "⚔️", "🦅", "🏔️", "🌊", "⚡", "🐺", "🏆", "🌋"];

// Two doors into squad life: forge your own, or join with a code.
export default function SquadCreateJoin({ onDone }) {
  const { pushToast, celebrate } = useAppData();
  const { refreshState } = useZoneCtx();
  const [name, setName] = useState("");
  const [emblem, setEmblem] = useState(EMBLEMS[0]);
  const [code, setCode] = useState("");
  const [forging, setForging] = useState(false);
  const [joining, setJoining] = useState(false);

  const forge = async (e) => {
    e?.preventDefault();
    const n = name.trim();
    if (!n || forging) return;
    setForging(true);
    try {
      await createSquad(n, emblem);
      celebrate({
        variant: "project",
        title: "Squad forged",
        subtitle: `${emblem} ${n} is live. Share the invite code with your people.`,
      });
      setName("");
      refreshState();
      onDone?.();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't forge squad", message: zoneErrorMessage(err) });
    } finally {
      setForging(false);
    }
  };

  const join = async (e) => {
    e?.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length !== 8 || joining) return;
    setJoining(true);
    try {
      await joinSquadByCode(c);
      celebrate({
        variant: "project",
        title: "Squad joined",
        subtitle: "Your fire feeds theirs now.",
      });
      setCode("");
      refreshState();
      onDone?.();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't join", message: zoneErrorMessage(err) });
    } finally {
      setJoining(false);
    }
  };

  return (
    <>
      <div className="zn-card">
        <p className="zn-eyebrow">Forge a squad</p>
        <form onSubmit={forge}>
          <div className="zn-field">
            <label className="zn-label" htmlFor="zn-squad-name">Squad name</label>
            <input
              id="zn-squad-name"
              className="zn-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The 5AM Wolves"
              maxLength={40}
            />
          </div>
          <div className="zn-field">
            <span className="zn-label">Emblem</span>
            <div className="zn-chipbar">
              {EMBLEMS.map((em) => (
                <button
                  key={em}
                  type="button"
                  className={`zn-chip${emblem === em ? " zn-chip--fire" : ""}`}
                  style={{ cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                  aria-pressed={emblem === em}
                  aria-label={`Emblem ${em}`}
                  onClick={() => setEmblem(em)}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="zn-btn" disabled={forging || !name.trim()}>
            {forging ? "Forging…" : `${emblem} Forge squad`}
          </button>
        </form>
      </div>

      <div className="zn-card">
        <p className="zn-eyebrow">Join with a code</p>
        <form onSubmit={join}>
          <div className="zn-field">
            <label className="zn-label" htmlFor="zn-squad-code">Invite code</label>
            <input
              id="zn-squad-code"
              className="zn-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="8 CHARACTERS"
              maxLength={8}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              style={{ textAlign: "center", letterSpacing: 4, fontWeight: 800 }}
            />
            <p className="zn-hint">Someone saved you a seat? Their code goes here.</p>
          </div>
          <button
            type="submit"
            className="zn-btn zn-btn--ghost"
            disabled={joining || code.trim().length !== 8}
          >
            {joining ? "Joining…" : "🛡️ Join squad"}
          </button>
        </form>
      </div>
    </>
  );
}
