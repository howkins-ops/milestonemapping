import React from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { getTodayKey } from "../../../lib/dates.js";
import { witnessSay } from "./witnessLines.js";

// The check-in that never flakes. Context decides the voice; witnessLines.js
// guarantees the tone (celebration-forward, zero interrogation).
export default function Witness() {
  const { member, todayMission, todayProofCount } = useZoneCtx();
  if (!member) return null;

  const today = getTodayKey();
  const joinedToday = (member.joined_at || "").slice(0, 10) === today;

  let state = "prompt";
  if (member.ash_since) state = "ash";
  else if (todayProofCount > 0) state = "proved";
  else if (todayMission) state = "declared";
  else if (joinedToday && !member.last_proof_date) state = "first";
  else if (member.last_proof_date && member.last_proof_date < today && member.zone_streak === 0) state = "returning";

  const say = witnessSay(state, {
    today,
    name: (member.display_name || member.username || "").split(" ")[0],
    identity: member.identity_title || "next",
    mission: todayMission?.title || "",
    streak: member.zone_streak,
    fallen: member.fallen_streak,
  });

  return (
    <div className={`zn-card zn-card--glow zn-witness${state === "ash" ? " zn-witness--ash" : ""}`}>
      <div className="zn-witness__orb" aria-hidden="true">
        <span className="zwf-tongue zwf-tongue--l" />
        <span className="zwf-tongue zwf-tongue--r" />
        <span className="zwf-core" />
        <span className="zwf-ember zwf-ember--1" />
        <span className="zwf-ember zwf-ember--2" />
        <span className="zwf-ember zwf-ember--3" />
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="zn-witness__name">The Witness</p>
        <p className="zn-witness__line">{say.line}</p>
      </div>
    </div>
  );
}
