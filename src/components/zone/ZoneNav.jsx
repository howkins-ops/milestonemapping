import React from "react";
import { useZoneCtx } from "../../hooks/useZone.js";

const TABS = [
  { key: "home", label: "Home", icon: "🔥" },
  { key: "feed", label: "Feed", icon: "📜" },
  { key: "squad", label: "Squad", icon: "🛡️" },
  { key: "messages", label: "Chat", icon: "💬" },
  { key: "inbox", label: "Inbox", icon: "🔔" },
  { key: "profile", label: "You", icon: "👤" },
];

// Secondary views map to a primary tab for highlight purposes.
const TAB_ALIAS = {
  friends: "profile",
  partner: "home",
  challenges: "home",
  reports: "profile",
};

export default function ZoneNav({ view, go }) {
  const { unreadNotifications, unreadMessages } = useZoneCtx();
  const active = TAB_ALIAS[view] || view;
  const badgeFor = (key) =>
    key === "inbox" ? unreadNotifications : key === "messages" ? unreadMessages : 0;

  return (
    <nav className="zn-tabs" aria-label="Zone sections">
      {TABS.map((t) => {
        const badge = badgeFor(t.key);
        return (
          <button
            key={t.key}
            type="button"
            className={`zn-tab${active === t.key ? " zn-tab--active" : ""}`}
            onClick={() => go(t.key)}
            aria-current={active === t.key ? "page" : undefined}
          >
            <span className="zn-tab__icon" aria-hidden="true">{t.icon}</span>
            {t.label}
            {badge > 0 && <span className="zn-tab__badge">{badge > 9 ? "9+" : badge}</span>}
          </button>
        );
      })}
    </nav>
  );
}
