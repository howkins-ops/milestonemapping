import React, { useCallback, useEffect, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useZoneCtx } from "../../../hooks/useZone.js";
import {
  getPartnerState,
  listFriends,
  invitePartner,
  respondPartner,
  endPartnership,
} from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import PartnerTools from "./PartnerTools.jsx";
import UserChip from "../shared/UserChip.jsx";

// One partner. Two fires. No judges. States: none → invite a friend;
// pending (either side); active → the shared dashboard.
export default function PartnerPanel({ go }) {
  const { pushToast, celebrate } = useAppData();
  const { refreshState } = useZoneCtx();
  const [ps, setPs] = useState(null);
  const [friends, setFriends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getPartnerState();
      const next = res && !res.offline ? res : { link: null, partner: null };
      setPs(next);
      if (!next.link) {
        const fl = await listFriends();
        setFriends(Array.isArray(fl?.friends) ? fl.friends : []);
      }
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't load partner", message: zoneErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (friend) => {
    setBusy(friend.user_id);
    try {
      await invitePartner(friend.user_id);
      pushToast({
        type: "success",
        title: "Invite sent ⚭",
        message: `@${friend.username} will see it in their inbox.`,
      });
      await load();
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't invite", message: zoneErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const respond = async (accept) => {
    setBusy(accept ? "accept" : "decline");
    try {
      await respondPartner(ps.link.id, accept);
      if (accept) {
        celebrate({
          variant: "project",
          title: "Partners linked ⚭",
          subtitle: "Two fires, one watch. Show up for each other.",
        });
      } else {
        pushToast({ type: "success", title: "Declined", message: "No hard feelings in the Zone." });
      }
      await load();
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't respond", message: zoneErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const end = async () => {
    if (!confirmEnd) {
      setConfirmEnd(true);
      return;
    }
    setConfirmEnd(false);
    setBusy("end");
    try {
      await endPartnership(ps.link.id);
      pushToast({
        type: "success",
        title: "Partnership ended",
        message: "The fire remembers the days you shared.",
      });
      await load();
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't end it", message: zoneErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <div className="zn-empty">Checking the partner fire…</div>;
  }

  const link = ps?.link || null;
  const partner = ps?.partner || null;

  /* ---------- (a) no link: explainer + friend picker ---------- */
  if (!link) {
    return (
      <div className="zn-stagger">
        <div className="zn-card zn-card--glow">
          <p className="zn-eyebrow">Accountability partner</p>
          <h2 className="zn-card__title" style={{ fontSize: 17, marginBottom: 6 }}>
            One partner. Two fires. No judges.
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: 0, lineHeight: 1.6 }}>
            Pick one friend who gets to see your daily fire up close — warm nudges,
            loud celebrations, and proof, both ways. Presence over pressure, always.
          </p>
        </div>

        <div className="zn-card">
          <p className="zn-eyebrow">Pick from your friends</p>
          {friends === null ? (
            <div className="zn-empty" style={{ padding: "18px 10px" }}>…</div>
          ) : friends.length === 0 ? (
            <>
              <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: "0 0 12px", lineHeight: 1.55 }}>
                A partner starts as a friend. Add one first — exact @name only.
              </p>
              <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("friends")}>
                🤝 Find friends
              </button>
            </>
          ) : (
            friends.map((f) => (
              <div
                key={f.user_id}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <UserChip
                    member={f}
                    sub={f.zone_streak > 0 ? `🔥 ${f.zone_streak}-day streak` : undefined}
                  />
                </div>
                <button
                  type="button"
                  className="zn-btn zn-btn--small"
                  disabled={busy === f.user_id}
                  onClick={() => invite(f)}
                >
                  {busy === f.user_id ? "…" : "⚭ Invite"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  /* ---------- (b) pending, I invited ---------- */
  if (link.status === "pending" && ps.i_am_inviter) {
    return (
      <div className="zn-stagger">
        <div className="zn-card zn-card--glow" style={{ textAlign: "center" }}>
          <p className="zn-eyebrow">Partner invite</p>
          {partner && (
            <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 10px" }}>
              <UserChip member={partner} size="lg" />
            </div>
          )}
          <p style={{ fontSize: 15, color: "var(--text-main)", margin: "0 0 6px", fontWeight: 700 }}>
            Invite sent — the fire is patient.
          </p>
          <p style={{ fontSize: 12.5, color: "var(--text-soft)", margin: 0 }}>
            They'll see it in their inbox. Until then, keep feeding your own fire.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- (c) pending, they invited me ---------- */
  if (link.status === "pending") {
    return (
      <div className="zn-stagger">
        <div className="zn-card zn-card--glow">
          <p className="zn-eyebrow">Partner invite</p>
          <UserChip member={partner} sub="wants to be your accountability partner" />
          <div className="zn-2col" style={{ marginTop: 14 }}>
            <button
              type="button"
              className="zn-btn zn-btn--ghost"
              disabled={busy === "decline"}
              onClick={() => respond(false)}
            >
              {busy === "decline" ? "…" : "Decline"}
            </button>
            <button
              type="button"
              className="zn-btn"
              disabled={busy === "accept"}
              onClick={() => respond(true)}
            >
              {busy === "accept" ? "…" : "⚭ Accept"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- (d) active: the dashboard ---------- */
  const both = ps.i_proved_today && ps.partner_proved_today;
  const todayLine = both
    ? "Both fires lit today. 🔥🔥 That's the whole point of this."
    : ps.i_proved_today
      ? "Your fire is lit — theirs is still warming up. A nudge is warmth, not pressure."
      : ps.partner_proved_today
        ? "Their fire is lit today — go celebrate them. 🎉"
        : "Fresh day for both fires.";

  return (
    <div className="zn-stagger">
      <div className="zn-card zn-card--glow">
        <p className="zn-eyebrow">Your partner</p>
        <UserChip member={partner} size="lg" />
        <div className="zn-2col" style={{ marginTop: 12 }}>
          <div className="zn-stat">
            <div className="zn-stat__num">⚭ {link.partner_streak || 0}</div>
            <div className="zn-stat__label">Mutual fire days</div>
          </div>
          <div className="zn-stat">
            <div className="zn-stat__num" aria-hidden="true">
              {ps.i_proved_today ? "🔥" : "·"}{ps.partner_proved_today ? "🔥" : "·"}
            </div>
            <div className="zn-stat__label">Today, you · them</div>
          </div>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--text-main)", margin: "10px 0 0", lineHeight: 1.55, textAlign: "center" }}>
          {todayLine}
        </p>
      </div>

      <PartnerTools onSent={load} />

      <button
        type="button"
        className="zn-btn zn-btn--danger"
        disabled={busy === "end"}
        onClick={end}
      >
        {busy === "end" ? "…" : confirmEnd ? "Really end the partnership?" : "End partnership"}
      </button>
    </div>
  );
}
