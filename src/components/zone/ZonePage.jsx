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

// The Accountability Zone — its own world inside the app.
// Gates: no supabase/user → ZoneGate; no zone identity → onboarding; else the Zone.
export default function ZonePage() {
  const { userId } = useAppData();
  if (!supabase || !userId) return <ZoneGate />;
  return (
    <ZoneProvider userId={userId}>
      <ZoneInner />
    </ZoneProvider>
  );
}

function ZoneInner() {
  const { loading, member, fire, refreshState } = useZoneCtx();
  const [view, setView] = useState("home");
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
        <div>
          <h1 className="zn-head__title">The Zone</h1>
          <p className="zn-head__sub">
            @{member.username} · {fire.label} fire
          </p>
        </div>
        <div className="zn-phoenix" style={{ padding: 0 }}>
          <span style={{ fontSize: 26, filter: `drop-shadow(0 0 10px var(--zfire-glow))` }} aria-hidden="true">🔥</span>
        </div>
      </header>

      <ZoneNav view={view} go={go} />

      {view === "home" && <ZoneHome go={go} openDeclare={openDeclare} openProof={openProof} />}
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
