import React, { useCallback, useRef, useState } from "react";
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
import RosterPage from "./arena/RosterPage.jsx";
import { getArenaGame } from "./arena/arenaGames.js";
import MapQuestCityPage from "../city/MapQuestCityPage.jsx";
import { EmberCanvas, ArenaIntro } from "./arena/ArenaFX.jsx";

// The Accountability Zone — its own world inside the app.
// Gates: no supabase/user → ZoneGate; no zone identity → onboarding; else the Zone.
// Milestone City lives here as its own tab — the Zone is the city's population.
export default function ZonePage({ onNavigate, onOpenMapQuest, onCloseZone, initialView, initialParam }) {
  const { userId } = useAppData();
  if (!supabase || !userId) return <ZoneGate />;
  return (
    <ZoneProvider userId={userId}>
      <ZoneInner
        onNavigate={onNavigate}
        onOpenMapQuest={onOpenMapQuest}
        onCloseZone={onCloseZone}
        initialView={initialView}
        initialParam={initialParam}
      />
    </ZoneProvider>
  );
}

function ZoneInner({ onNavigate, onOpenMapQuest, onCloseZone, initialView, initialParam }) {
  const { loading, error, state, member, fire, refreshState } = useZoneCtx();
  // "hoops" is a launch sentinel from the main-page basketball button: land
  // straight on Full Court in fullscreen. "recommit" is a sentinel from the
  // dashboard / IRON Today integrity card: land on Home with the Recommit
  // ritual open. Everything else lands as-routed.
  const bootHoops = initialView === "hoops";
  const bootRecommit = initialView === "recommit";
  const [view, setView] = useState(
    bootHoops ? "arena" : bootRecommit ? "home" : initialView || "home"
  );
  const [viewParam, setViewParam] = useState(bootHoops ? "full_court" : initialParam ?? null);
  const [gameFullscreen, setGameFullscreen] = useState(bootHoops);
  const [overlay, setOverlay] = useState(null); // 'declare' | 'proof' | null
  // Games are hosted by the arena view, but they can be launched from the Games
  // tab (the Roster). Every game's exit is a bare go("arena"), so remember where
  // the launch came from and send it back there instead of stranding the player
  // on the Squad page. viewRef tracks the live view for that decision.
  const viewRef = useRef(bootHoops ? "arena" : bootRecommit ? "home" : initialView || "home");
  const gameOriginRef = useRef(null);
  // One-shot: the deep-link intent opens the Recommit ritual on first Home
  // render only — leaving and returning to Home must not reopen it.
  const [recommitPending, setRecommitPending] = useState(bootRecommit);

  const go = useCallback((next, param = null) => {
    // Launched straight from the main-screen HOOPS button (bootHoops): the game is
    // the only thing in this overlay, so its "Back to Arena" exit (go("arena"))
    // should close the whole Zone and drop the user back on the main screen —
    // NOT strand them inside the Accountability Zone's Arena hub. Every other path
    // into Hoops (Arena grid, friend-invite) leaves bootHoops false and lands in
    // the Arena as before.
    if (bootHoops && next === "arena" && onCloseZone) {
      onCloseZone();
      return;
    }
    if (next === "hoops") {
      gameOriginRef.current = viewRef.current === "roster" ? "roster" : null;
      setGameFullscreen(true);
      setView("arena");
      viewRef.current = "arena";
      setViewParam("full_court");
      window.scrollTo({ top: 0 });
      return;
    }
    let target = next;
    if (next === "arena" && param) {
      // Launching a game — remember the screen it was launched from.
      gameOriginRef.current = viewRef.current === "roster" ? "roster" : null;
    } else if (next === "arena" && !param && gameOriginRef.current === "roster") {
      // Leaving a game that started on the Games tab — land back on the Roster.
      target = "roster";
      gameOriginRef.current = null;
    }
    setGameFullscreen(false);
    setView(target);
    viewRef.current = target;
    setViewParam(param);
    window.scrollTo({ top: 0 });
  }, [bootHoops, onCloseZone]);

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

  // A game is actively being played when Hoops is fullscreen OR any arena game
  // is mounted (view "arena" with a real game key — not the arena hub). In that
  // case hide the Zone's own header + tab bar so the game owns the whole screen.
  // getArenaGame(null) is falsy, so the arena hub keeps its nav. Each game brings
  // its own exit (Hoops "Back to Arena", others' zn-back); Escape also closes the app.
  const gameActive = gameFullscreen || (view === "arena" && !!getArenaGame(viewParam));

  return (
    <div className="zone-root" data-fire={fire.key}>
      <EmberCanvas tint={fire.tint} />
      {/* HOOPS launches its own basketball splash (in FullCourt) — skip the
          Zone reveal on that path so the two cinematics don't collide. */}
      {!bootHoops && <ArenaIntro />}
      {!gameActive && (
        <>
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

          <ZoneNav view={view === "arena" ? "squad" : view} go={go} />
        </>
      )}

      {view === "home" && (
        <ZoneHome
          go={go}
          openDeclare={openDeclare}
          openProof={openProof}
          recommitIntent={recommitPending}
          onRecommitConsumed={() => setRecommitPending(false)}
        />
      )}
      {view === "city" && (
        <MapQuestCityPage
          onNavigate={onNavigate}
          onOpenMapQuest={onOpenMapQuest}
          embedded
        />
      )}
      {view === "feed" && <ZoneFeed go={go} />}
      {view === "arena" && <ArenaHome go={go} gameKey={viewParam} fullscreen={gameFullscreen} />}
      {view === "roster" && <RosterPage go={go} />}
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
    </div>
  );
}
