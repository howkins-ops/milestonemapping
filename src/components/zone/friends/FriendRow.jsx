import React, { useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useZoneCtx } from "../../../hooks/useZone.js";
import {
  getOrCreateDm,
  invitePartner,
  removeFriend,
  blockUser,
} from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import UserChip from "../shared/UserChip.jsx";
import ReportButton from "../shared/ReportButton.jsx";

// One friend in the circle: chip + a ⋯ menu of everything you can do together.
export default function FriendRow({ friend, go, onChanged }) {
  const { pushToast } = useAppData();
  const { refreshState } = useZoneCtx();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(null); // 'remove' | 'block'
  const [busy, setBusy] = useState(null);

  const name = friend.display_name || friend.username;

  const openDm = async () => {
    setBusy("dm");
    try {
      const res = await getOrCreateDm(friend.user_id);
      go("messages", res.conversation_id);
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't open chat", message: zoneErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const invite = async () => {
    setBusy("invite");
    try {
      await invitePartner(friend.user_id);
      pushToast({
        type: "success",
        title: "Partner invite sent ⚭",
        message: `@${friend.username} will see it in their inbox.`,
      });
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't invite", message: zoneErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (confirming !== "remove") {
      setConfirming("remove");
      return;
    }
    setBusy("remove");
    try {
      await removeFriend(friend.user_id);
      pushToast({ type: "success", title: "Removed", message: `@${friend.username} left your circle.` });
      onChanged?.();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't remove", message: zoneErrorMessage(err) });
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  };

  const block = async () => {
    if (confirming !== "block") {
      setConfirming("block");
      return;
    }
    setBusy("block");
    try {
      await blockUser(friend.user_id);
      pushToast({ type: "success", title: "Blocked", message: "They can't find or reach you here." });
      onChanged?.();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't block", message: zoneErrorMessage(err) });
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  };

  return (
    <div className="zn-card" style={{ padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <UserChip
            member={friend}
            sub={friend.zone_streak > 0 ? `🔥 ${friend.zone_streak}-day streak` : undefined}
          />
        </div>
        <button
          type="button"
          className="zn-btn zn-btn--ghost zn-btn--small"
          aria-expanded={open}
          aria-label={`Actions for ${name}`}
          onClick={() => {
            setOpen(!open);
            setConfirming(null);
          }}
        >
          ⋯
        </button>
      </div>

      {open && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <button
            type="button"
            className="zn-btn zn-btn--ghost zn-btn--small"
            disabled={busy === "dm"}
            onClick={openDm}
          >
            💬 {busy === "dm" ? "Opening…" : "DM"}
          </button>
          <button
            type="button"
            className="zn-btn zn-btn--ghost zn-btn--small"
            disabled={busy === "invite"}
            onClick={invite}
          >
            ⚭ {busy === "invite" ? "Inviting…" : "Invite as partner"}
          </button>
          <button
            type="button"
            className="zn-btn zn-btn--ghost zn-btn--small"
            disabled={busy === "remove"}
            onClick={remove}
          >
            {busy === "remove" ? "…" : confirming === "remove" ? "Really remove?" : "Remove"}
          </button>
          <button
            type="button"
            className="zn-btn zn-btn--danger zn-btn--small"
            disabled={busy === "block"}
            onClick={block}
          >
            {busy === "block" ? "…" : confirming === "block" ? "Really block?" : "Block"}
          </button>
          <ReportButton contentType="profile" targetUser={friend.user_id} />
        </div>
      )}
    </div>
  );
}
