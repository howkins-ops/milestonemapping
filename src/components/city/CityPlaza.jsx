import React, { useEffect, useState } from "react";
import { getFireLevel } from "../../lib/zoneFire.js";
import "../../styles/cityPlaza.css";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — The Plaza
// A horizontal presence strip: your friends stand in the city square, each
// wrapped in a fire-tier aura ring; your squad flies its banner; your
// accountability partner stands beside you. Renders nothing offline or when
// the citizen has no people yet — the plaza only exists once it's populated.
// ════════════════════════════════════════════════════════════════════════

function PlazaAvatar({ url, name }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
  }, [url]);
  const monogram = String(name || "?").trim().charAt(0).toUpperCase() || "?";
  if (url && !broken) {
    return (
      <img
        className="mqc-pl-avatar"
        src={url}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <span className="mqc-pl-avatar mqc-pl-avatar--mono" aria-hidden="true">
      {monogram}
    </span>
  );
}

function FriendChip({ friend }) {
  const name = friend.display_name || friend.username || "someone";
  const streak = Math.max(0, Number(friend.zone_streak) || 0);
  const fire = getFireLevel(streak);
  return (
    <li
      className="mqc-pl-chip"
      style={{ "--pl-tint": fire.tint, "--pl-glow": fire.glow }}
      aria-label={`${name} — ${fire.label} fire, ${streak} day streak`}
    >
      <span className="mqc-pl-aura">
        <PlazaAvatar url={friend.avatar_url} name={name} />
        <span className="mqc-pl-flame" aria-hidden="true">
          🔥{streak}
        </span>
      </span>
      <span className="mqc-pl-chip__name">{name}</span>
    </li>
  );
}

function SquadBanner({ squad }) {
  const count = Math.max(0, Number(squad.member_count) || 0);
  const label =
    count > 0
      ? `Squad ${squad.name} — ${count} member${count === 1 ? "" : "s"}`
      : `Squad ${squad.name}`;
  return (
    <li className="mqc-pl-squad" aria-label={label}>
      <span className="mqc-pl-squad__emblem" aria-hidden="true">
        {squad.emblem || "🔥"}
      </span>
      <span className="mqc-pl-squad__txt">
        <span className="mqc-pl-squad__kicker">Squad</span>
        <span className="mqc-pl-squad__name">{squad.name}</span>
        {count > 0 ? (
          <span className="mqc-pl-squad__count">
            {count} member{count === 1 ? "" : "s"}
          </span>
        ) : null}
      </span>
    </li>
  );
}

function PartnerChip({ partnerState }) {
  const p = partnerState && partnerState.partner ? partnerState.partner : null;
  if (!p) return null;
  const name = p.display_name || p.username || "partner";
  const proved = !!partnerState.partner_proved_today;
  return (
    <li
      className="mqc-pl-chip mqc-pl-chip--partner"
      aria-label={`${name} — your accountability partner${proved ? ", proved today" : ""}`}
    >
      <span className="mqc-pl-aura mqc-pl-aura--partner">
        <PlazaAvatar url={p.avatar_url} name={name} />
        {proved ? (
          <span className="mqc-pl-proved" aria-hidden="true">
            ✓
          </span>
        ) : null}
      </span>
      <span className="mqc-pl-chip__name">{name}</span>
      <span className="mqc-pl-partnerlbl">Partner</span>
    </li>
  );
}

export default function CityPlaza({ social }) {
  if (!social || !social.online) return null;

  const friends = Array.isArray(social.friends) ? social.friends : [];
  const squads = Array.isArray(social.squads) ? social.squads : [];
  const partnerState = social.partner || null;
  const partnerMember =
    partnerState && partnerState.partner ? partnerState.partner : null;

  if (friends.length === 0 && squads.length === 0 && !partnerMember) return null;

  const squad = squads.length > 0 ? squads[0] : null;

  return (
    <section className="mqc-pl" aria-label="The Plaza — your people are in the city">
      <p className="mqc-kicker mqc-pl-kicker">
        <span className="mqc-pl-kicker__name">The Plaza</span>
        <span className="mqc-pl-kicker__sep" aria-hidden="true">
          —
        </span>
        <span className="mqc-pl-kicker__sub">your people are in the city</span>
      </p>

      <ul className="mqc-pl-strip" role="list">
        {partnerMember ? <PartnerChip partnerState={partnerState} /> : null}
        {squad ? <SquadBanner squad={squad} /> : null}
        {friends.map((f, i) => (
          <FriendChip key={f.user_id || f.username || `friend-${i}`} friend={f} />
        ))}
      </ul>

      <span className="mqc-pl-ground" aria-hidden="true" />
    </section>
  );
}
