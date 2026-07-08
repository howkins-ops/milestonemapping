import React, { useCallback, useState } from "react";
import "../../styles/zone.css";
import "../../styles/arena.css";
import "../../styles/arena3d.css";
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
import MessagesHub from "./messages/MessagesHub.jsx";
import ZoneProfile from "./profile/ZoneProfile.jsx";
import ReportsPanel from "./reports/ReportsPanel.jsx";
import ArenaHome from "./arena/ArenaHome.jsx";
import RosterSheet from "../layout/RosterSheet.jsx";
import MapQuestCityPage from "../city/MapQuestCityPage.jsx";
import { EmberCanvas, ArenaIntro } from "./arena/ArenaFX.jsx";

// The Accountability Zone — its own world inside the app.
// Gates: no supabase/user → ZoneGate; no zone identity → onboarding; else the Zone.
// Milestone City lives here as its own tab — the Zone is the city's population.
export default function ZonePage({ onNavigate, onOpenMapQuest, initialView, initialParam }) {
  const { userId } = useAppData();
  if (!supabase || !userId) return <ZoneGate />;
  return (
    <ZoneProvider userId={userId}>
      <ZoneInner
        onNavigate={onNavigate}
        onOpenMapQuest={onOpenMapQuest}
        initialView={initialView}
        initialParam={initialParam}
      />
    </ZoneProvider>
  );
}

function ZoneInner({ onNavigate, onOpenMapQuest, initialView, initialParam }) {
  const { loading, error, state, member, fire, refreshState } = useZoneCtx();
  // "hoops" is a launch sentinel from the main-page basketball button: land
  // straight on Full Court in fullscreen. Everything else lands as-routed.
  const bootHoops = initialView === "hoops";
  const [view, setView] = useState(bootHoops ? "arena" : initialView || "home");
  const [viewParam, setViewParam] = useState(bootHoops ? "full_court" : initialParam ?? null);
  const [gameFullscreen, setGameFullscreen] = useState(bootHoops);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [overlay, setOverlay] = useState(null); // 'declare' | 'proof' | null

  const go = useCallback((next, param = null) => {
    if (next === "hoops") {
      setGameFullscreen(true);
      setView("arena");
      setViewParam("full_court");
      window.scrollTo({ top: 0 });
      return;
    }
    setGameFullscreen(false);
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

  // Couldn't reach the Zone (e.g. offline): an existing member must NOT be
  // dropped into the "claim your @name" join flow — show a retry instead.
  if (error && !state) {
    return (
      <div className="zone-root" data-fire="cold">
        <div className="zn-empty" style={{ paddingTop: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div className="zn-witness__orb" style={{ margin: "0 auto" }} aria-hidden="true" />
          <div>The Zone couldn't load. Check your connection and try again.</div>
          <button type="button" className="zn-btn" onClick={refreshState}>Retry</button>
        </div>
      </div>
    );
  }

  if (!member) return <ZoneOnboarding onJoined={refreshState} />;

  const isProofOverlay = overlay && overlay.kind === "proof";

  return (
    <div className="zone-root" data-fire={fire.key}>
      <EmberCanvas tint={fire.tint} />
      <ArenaIntro />
      <header className="zn-head">
        <div className="zn-head__titlewrap">
          <h1 className="zn-head__title" data-text="The Zone">The Zone</h1>
          <p className="zn-head__sub">
            @{member.username} · {fire.label} fire
          </p>
        </div>
        <span className="zn-head__crest" aria-hidden="true">
          <img src="/assets/nav/nav-zone.png" alt="" />
        </span>
      </header>

      <ZoneNav
        view={gameFullscreen ? "hoops" : view === "arena" ? "squad" : view}
        go={go}
        onOpenRoster={() => setRosterOpen(true)}
      />

      {view === "home" && <ZoneHome go={go} openDeclare={openDeclare} openProof={openProof} />}
      {view === "city" && (
        <MapQuestCityPage
          onNavigate={onNavigate}
          onOpenMapQuest={onOpenMapQuest}
          embedded
        />
      )}
      {view === "feed" && <ZoneFeed go={go} />}
      {view === "arena" && <ArenaHome go={go} gameKey={viewParam} fullscreen={gameFullscreen} />}
      {view === "squad" && <SquadPanel go={go} squadId={viewParam} />}
      {view === "messages" && <MessagesHub go={go} conversationId={viewParam} initialTab="chats" />}
      {view === "inbox" && <MessagesHub go={go} initialTab="alerts" />}
      {view === "profile" && <ZoneProfile go={go} viewUserId={viewParam} />}
      {view === "friends" && <FriendsPanel go={go} />}
      {view === "partner" && <PartnerPanel go={go} />}
      {view === "challenges" && <ChallengesPanel go={go} challengeId={viewParam} />}
      {view === "reports" && <ReportsPanel go={go} />}

      {overlay === "declare" && <DeclareMission onClose={closeOverlay} onDone={closeOverlay} />}
      {isProofOverlay && <PostProof onClose={closeOverlay} onDone={closeOverlay} challengeId={overlay.param} />}

      {/* Roster — the games launcher, opened from the Zone nav's Roster tab. */}
      <RosterSheet
        open={rosterOpen}
        onClose={() => setRosterOpen(false)}
        onPickGame={(key) => { setRosterOpen(false); go("arena", key); }}
        onPickView={(v) => { setRosterOpen(false); go(v, null); }}
      />
    </div>
  );
}
