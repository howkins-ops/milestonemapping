import React from "react";
import { useZoneCtx } from "../../hooks/useZone.js";

// Custom neon glyphs — stroked in currentColor so the live fire tint
// (--zfire) flows straight through them. No emoji. They ignite on active.
const GLYPHS = {
  home: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  city: (
    <>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </>
  ),
  friends: (
    <>
      <path d="M13 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
  squad: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  messages: (
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </>
  ),
  inbox: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M10.27 21a1.94 1.94 0 0 0 3.46 0" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </>
  ),
};

function Glyph({ name }) {
  return (
    <svg
      className="zn-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}

// City (MapQuest) intentionally NOT a tab — it's reachable from the Command
// dashboard's "open MapQuest". Keeps this dock short and focused.
// Friends is its own tab (people asked "how do I add a friend?") — one tap
// to the search + your circle, right next to Squad.
const TABS = [
  { key: "home", label: "Home" },
  { key: "friends", label: "Friends" },
  { key: "squad", label: "Squad" },
  { key: "messages", label: "Chat" },
  { key: "inbox", label: "Inbox" },
  { key: "profile", label: "You" },
];

// Secondary views map to a primary tab for highlight purposes.
// Feed lives inside Home now (preview strip + "Open the feed"), so it
// keeps Home lit rather than needing its own slot.
const TAB_ALIAS = {
  feed: "home",
  city: "home",
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
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            data-key={t.key}
            className={`zn-tab${isActive ? " zn-tab--active" : ""}${badge > 0 ? " zn-tab--alert" : ""}`}
            onClick={() => go(t.key === "squad" ? "arena" : t.key)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="zn-tab__icon" aria-hidden="true">
              <Glyph name={t.key} />
            </span>
            <span className="zn-tab__label">{t.label}</span>
            {badge > 0 && <span className="zn-tab__badge">{badge > 9 ? "9+" : badge}</span>}
          </button>
        );
      })}
    </nav>
  );
}
