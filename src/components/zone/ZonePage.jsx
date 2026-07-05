import React, { useCallback, useState } from "react";
import "../../styles/zone.css";
import { supabase } from "../../lib/supabase.js";
import { useAppData } from "../../hooks/useAppData.js";
import { ZoneProvider, useZoneCtx } from "../../hooks/useZone.js";
import ZoneGate from "./ZoneGate.jsx";
import ZoneNav from "./ZoneNav.jsx";
import ZoneOnboarding from "./onboarding/ZoneOnboarding.jsx";
import ZoneHome from "./home/ZoneHome.jsx";
import DeclareMission from "./declare/DeclareMission.jsx";
import PostProof from "./proof/PostProof.jsx";
import ZoneFeed from "./feed/ZoneFeed.jsx";
import FriendsPanel from "./friends/FriendsPanel.jsx";
import SquadPanel from "./squad/SquadPanel.jsx";
import PartnerPanel from "./partner/PartnerPanel.jsx";
import ChallengesPanel from "./challenges/ChallengesPanel.jsx";
import MessagesPanel from "./messages/MessagesPanel.jsx";
import InboxPanel from "./inbox/InboxPanel.jsx";
import ZoneProfile from "./profile/ZoneProfile.jsx";
import ReportsPanel from "./reports/ReportsPanel.jsx";
import MapQuestCityPage from "../city/MapQuestCityPage.jsx";

// The Accountability Zone — its own world inside the app.
// Gates: no supabase/user → ZoneGate; no zone identity → onboarding; else the Zone.
// MapQuest City lives here as its own tab — the Zone is the city's population.
export default function ZonePage({ onNavigate, onOpenMapQuest, initialView }) {
  const { userId } = useAppData();
  if (!supabase || !userId) return <ZoneGate />;
  return (
    <ZoneProvider userId={userId}>
      <ZoneInner
        onNavigate={onNavigate}
        onOpenMapQuest={onOpenMapQuest}
        initialView={initialView}
      />
    </ZoneProvider>
  );
}

function ZoneInner({ onNavigate, onOpenMapQuest, initialView }) {
  const { loading, member, fire, refreshState } = useZoneCtx();
  const [view, setView] = useState(initialView || "home");
  const [viewParam, setViewParam] = useState(null);
  const [overlay, setOverlay] = useState(null); // 'declare' | 'proof' | null

  const go = useCallback((next, param = null) => {
    setView(next);
    setViewParam(param);
    window.scrollTo({ top: 0 });
  }, []);

  const openDeclare = useCallback(() => setOverlay("declare"), []);
  const openProof = useCallback((param = null) => setOverlay({ kind: "proof", param }), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  if (loading) {
    return (
      <div className="zone-root" data-fire="cold">
        <div className="zn-empty" style={{ paddingTop: 90 }}>
          <div className="zn-witness__orb" style={{ margin: "0 auto 18px" }} aria-hidden="true" />
          Entering the Zone…
        </div>
      </div>
    );
  }

  if (!member) return <ZoneOnboarding onJoined={refreshState} />;

  const isProofOverlay = overlay && overlay.kind === "proof";

  return (
    <div className="zone-root" data-fire={fire.key}>
      <header className="zn-head">
        <div className="zn-head__titlewrap">
          <h1 className="zn-head__title" data-text="The Zone">The Zone</h1>
          <p className="zn-head__sub">
            @{member.username} · {fire.label} fire
          </p>
        </div>
        <span className="zn-head__flame" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </span>
      </header>

      <ZoneNav view={view} go={go} />

      {view === "home" && <ZoneHome go={go} openDeclare={openDeclare} openProof={openProof} />}
      {view === "city" && (
        <MapQuestCityPage
          onNavigate={onNavigate}
          onOpenMapQuest={onOpenMapQuest}
          embedded
        />
      )}
      {view === "feed" && <ZoneFeed go={go} />}
      {view === "squad" && <SquadPanel go={go} squadId={viewParam} />}
      {view === "messages" && <MessagesPanel go={go} conversationId={viewParam} />}
      {view === "inbox" && <InboxPanel go={go} />}
      {view === "profile" && <ZoneProfile go={go} viewUserId={viewParam} />}
      {view === "friends" && <FriendsPanel go={go} />}
      {view === "partner" && <PartnerPanel go={go} />}
      {view === "challenges" && <ChallengesPanel go={go} challengeId={viewParam} />}
      {view === "reports" && <ReportsPanel go={go} />}

      {overlay === "declare" && <DeclareMission onClose={closeOverlay} onDone={closeOverlay} />}
      {isProofOverlay && <PostProof onClose={closeOverlay} onDone={closeOverlay} challengeId={overlay.param} />}
    </div>
  );
}
