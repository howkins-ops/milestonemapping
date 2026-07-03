import React from "react";
import ConversationList from "./ConversationList.jsx";
import ChatThread from "./ChatThread.jsx";

// Messages tab: list of conversations, or one open thread when a
// conversationId is routed in via ZonePage's go("messages", id).
export default function MessagesPanel({ go, conversationId }) {
  if (conversationId) {
    return (
      <ChatThread
        conversationId={conversationId}
        onBack={() => go("messages", null)}
      />
    );
  }
  return <ConversationList onOpen={(id) => go("messages", id)} />;
}
