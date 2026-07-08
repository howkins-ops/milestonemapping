import React, { useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import ConversationList from "./ConversationList.jsx";
import ChatThread from "./ChatThread.jsx";
import InboxPanel from "../inbox/InboxPanel.jsx";

// Combined Chat tab: DMs and Alerts (notifications + requests) under one nav
// slot, toggled by a segmented control. Composes the existing panels — no new
// data logic. When a conversationId is routed in (go("messages", id)) the open
// thread takes over full-bleed, exactly like the old MessagesPanel did.
export default function MessagesHub({ go, conversationId, initialTab }) {
  const { unreadMessages, unreadNotifications } = useZoneCtx();
  const [tab, setTab] = useState(initialTab === "alerts" ? "alerts" : "chats");

  if (conversationId) {
    return (
      <ChatThread
        conversationId={conversationId}
        onBack={() => go("messages", null)}
      />
    );
  }

  return (
    <div className="zn-stagger">
      <div className="zn-subtabs" role="tablist" aria-label="Chat and alerts">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "chats"}
          className={`zn-subtab${tab === "chats" ? " zn-subtab--active" : ""}`}
          onClick={() => setTab("chats")}
        >
          Chats
          {unreadMessages > 0 && <span className="zn-subtab__dot" aria-hidden="true" />}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "alerts"}
          className={`zn-subtab${tab === "alerts" ? " zn-subtab--active" : ""}`}
          onClick={() => setTab("alerts")}
        >
          Alerts
          {unreadNotifications > 0 && <span className="zn-subtab__dot" aria-hidden="true" />}
        </button>
      </div>

      {tab === "chats" ? (
        <ConversationList onOpen={(id) => go("messages", id)} />
      ) : (
        <InboxPanel go={go} />
      )}
    </div>
  );
}
