import React, { useEffect, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { listFriends, getOrCreateDm, sendMessage } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import UserChip from "../shared/UserChip.jsx";

// Pull existing friends into a squad. No invite RPC exists (squads are
// code-based), so one tap DMs the friend the squad's join code — reusing
// getOrCreateDm + sendMessage. Friends already in the squad are filtered out.
export default function SquadInviteFriends({ squad, memberIds, go }) {
  const { pushToast } = useAppData();
  const { userId } = useZoneCtx();
  const [friends, setFriends] = useState(null); // null = loading
  const [busyId, setBusyId] = useState(null);
  const [invited, setInvited] = useState({});

  useEffect(() => {
    let alive = true;
    listFriends()
      .then((res) => alive && setFriends(Array.isArray(res?.friends) ? res.friends : []))
      .catch(() => alive && setFriends([]));
    return () => {
      alive = false;
    };
  }, []);

  const inviteText = `Join my squad "${squad.name}" in the Zone 🔥 — code: ${squad.invite_code}`;

  const invite = async (friend) => {
    setBusyId(friend.user_id);
    try {
      const dm = await getOrCreateDm(friend.user_id);
      await sendMessage(dm.conversation_id, inviteText, userId);
      setInvited((m) => ({ ...m, [friend.user_id]: true }));
      pushToast({
        type: "success",
        title: "Invite sent 🔥",
        message: `@${friend.username} got the code in their DMs.`,
      });
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't invite", message: zoneErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  if (friends === null) {
    return (
      <div className="zn-card">
        <p className="zn-eyebrow">Invite your friends</p>
        <div className="zn-empty" style={{ padding: "6px 0" }}>Gathering your circle…</div>
      </div>
    );
  }

  const memberSet = new Set(memberIds || []);
  const eligible = friends.filter((f) => !memberSet.has(f.user_id));

  return (
    <div className="zn-card">
      <p className="zn-eyebrow">Invite your friends</p>

      {friends.length === 0 ? (
        <>
          <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: "0 0 12px", lineHeight: 1.55 }}>
            No friends in your circle yet. Add a few, then pull them into the fire.
          </p>
          <button
            type="button"
            className="zn-btn zn-btn--ghost zn-btn--small"
            onClick={() => go("friends")}
          >
            + Add friends
          </button>
        </>
      ) : eligible.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: 0, lineHeight: 1.55 }}>
          Everyone in your circle is already in the squad. That's a full fire. 🔥
        </p>
      ) : (
        <>
          <p style={{ fontSize: 12.5, color: "var(--text-soft)", margin: "0 0 10px", lineHeight: 1.5 }}>
            One tap sends them the join code in a DM.
          </p>
          {eligible.map((f) => (
            <div
              key={f.user_id}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserChip
                  member={f}
                  sub={f.zone_streak > 0 ? `🔥 ${f.zone_streak}-day streak` : undefined}
                />
              </div>
              {invited[f.user_id] ? (
                <span className="zn-chip zn-chip--fire">Invited ✓</span>
              ) : (
                <button
                  type="button"
                  className="zn-btn zn-btn--small"
                  disabled={busyId === f.user_id}
                  onClick={() => invite(f)}
                >
                  {busyId === f.user_id ? "…" : "Invite"}
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
