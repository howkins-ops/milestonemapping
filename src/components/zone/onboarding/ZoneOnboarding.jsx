import React, { useEffect, useRef, useState } from "react";
import { joinZone, usernameAvailable } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { playSound } from "../../../lib/sounds.js";
import CommunityRules from "./CommunityRules.jsx";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

// Three beats: the fire → claim your name → hold the line. Then you're in.
export default function ZoneOnboarding({ onJoined }) {
  const { profile, settings, celebrate } = useAppData();
  const [beat, setBeat] = useState(0);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(profile?.display_name || profile?.full_name || "");
  const [avail, setAvail] = useState(null); // null | checking | true | false
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const checkTimer = useRef(null);

  useEffect(() => {
    if (!username) {
      setAvail(null);
      return undefined;
    }
    if (!USERNAME_RE.test(username)) {
      setAvail(false);
      return undefined;
    }
    setAvail("checking");
    clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(async () => {
      try {
        const ok = await usernameAvailable(username);
        setAvail(ok === true);
      } catch {
        setAvail(null);
      }
    }, 350);
    return () => clearTimeout(checkTimer.current);
  }, [username]);

  const join = async () => {
    setBusy(true);
    setError("");
    try {
      await joinZone({
        username,
        displayName: displayName.trim() || username,
        identityTitle: profile?.current_identity || null,
        avatarUrl: profile?.avatar_url || null,
      });
      playSound("levelup", settings);
      celebrate({
        variant: "rank",
        title: "You're in the Zone",
        subtitle: `@${username} — witnessed from day one`,
      });
      onJoined();
    } catch (err) {
      setError(zoneErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="zone-root" data-fire="warm">
      {beat === 0 && (
        <div className="zn-stagger" style={{ textAlign: "center", paddingTop: 46 }}>
          <div className="zn-witness__orb" style={{ margin: "0 auto 22px", width: 84, height: 84 }} aria-hidden="true" />
          <h1 className="zn-head__title" style={{ fontSize: 26 }}>The Accountability Zone</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15.5, lineHeight: 1.65, maxWidth: 400, margin: "12px auto 6px" }}>
            Declare a mission. Do the thing. Post proof.
            Your people — and a Witness that never flakes — see every rep.
          </p>
          <p style={{ color: "var(--text-soft)", fontSize: 13, maxWidth: 380, margin: "0 auto 28px" }}>
            No judges here. Missed days turn to ash, and ash has one door: Rise Again.
          </p>
          <button type="button" className="zn-btn" style={{ maxWidth: 320, margin: "0 auto" }} onClick={() => setBeat(1)}>
            Enter the fire →
          </button>
        </div>
      )}

      {beat === 1 && (
        <div className="zn-stagger" style={{ paddingTop: 26, maxWidth: 420, margin: "0 auto" }}>
          <p className="zn-eyebrow">Step 1 of 2</p>
          <h2 className="zn-head__title" style={{ fontSize: 22, marginBottom: 18 }}>Claim your name</h2>
          <div className="zn-field">
            <label className="zn-label" htmlFor="zn-username">@username — how your people find you</label>
            <input
              id="zn-username"
              className="zn-input"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
              placeholder="e.g. jon_rises"
              maxLength={20}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            {username && (
              <p className={`zn-hint ${avail === true ? "zn-hint--ok" : avail === false ? "zn-hint--bad" : ""}`}>
                {avail === "checking" && "Checking the flames…"}
                {avail === true && `@${username} is yours to claim ✓`}
                {avail === false && (USERNAME_RE.test(username) ? "Taken — try another." : "3–20 chars: lowercase letters, numbers, underscores.")}
              </p>
            )}
          </div>
          <div className="zn-field">
            <label className="zn-label" htmlFor="zn-displayname">Display name</label>
            <input
              id="zn-displayname"
              className="zn-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What your squad calls you"
              maxLength={40}
            />
          </div>
          <button type="button" className="zn-btn" disabled={avail !== true} onClick={() => setBeat(2)}>
            Continue →
          </button>
        </div>
      )}

      {beat === 2 && (
        <div className="zn-stagger" style={{ paddingTop: 26, maxWidth: 440, margin: "0 auto" }}>
          <p className="zn-eyebrow">Step 2 of 2</p>
          <h2 className="zn-head__title" style={{ fontSize: 22, marginBottom: 16 }}>Hold the line</h2>
          <div className="zn-card">
            <CommunityRules accepted={accepted} onToggle={setAccepted} />
          </div>
          {error && <p className="zn-hint zn-hint--bad" role="alert">{error}</p>}
          <button type="button" className="zn-btn" disabled={!accepted || busy} onClick={join}>
            {busy ? "Lighting the fire…" : `Rise as @${username} 🔥`}
          </button>
          <button type="button" className="zn-back" onClick={() => setBeat(1)} style={{ marginTop: 10 }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
