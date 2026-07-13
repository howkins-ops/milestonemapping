import React, { useEffect, useState, useCallback, Suspense } from "react";
import AuthGate from "./components/auth/AuthGate.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import BootSequence from "./components/layout/BootSequence.jsx";
import ToastStack from "./components/ui/Toast.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import CelebrationOverlay from "./components/ui/CelebrationOverlay.jsx";
import AnxietySOS from "./components/ui/AnxietySOS.jsx";
import DashboardPage from "./components/dashboard/DashboardPage.jsx";
import DailyPage from "./components/daily/DailyPage.jsx";
import ProjectsPage from "./components/projects/ProjectsPage.jsx";
import ProjectDetailPage from "./components/projects/ProjectDetailPage.jsx";
import MilestoneDetailPage from "./components/milestones/MilestoneDetailPage.jsx";
import WeeklyReviewPage from "./components/weekly/WeeklyReviewPage.jsx";
import RewardsPage from "./components/rewards/RewardsPage.jsx";
import VisionBoardPage from "./components/vision/VisionBoardPage.jsx";
import IdentityPage from "./components/identity/IdentityPage.jsx";
import StatsPage from "./components/stats/StatsPage.jsx";
import FormulaPage from "./components/formula/FormulaPage.jsx";
import ShiftsPage from "./components/training/ShiftsPage.jsx";
import SettingsPage from "./components/settings/SettingsPage.jsx";
import ShadowWorkPage from "./components/shadow/ShadowWorkPage.jsx";
import SciencePage from "./components/science/SciencePage.jsx";
import FillYourCup from "./components/wellbeing/FillYourCup.jsx";
import AngerGymPage from "./components/anger/AngerGymPage.jsx";
import BlazeRealTrainingOS from "./components/blaze/BlazeRealTrainingOS.jsx";
import ProfilePage from "./components/profile/ProfilePage.jsx";
import OpenWorldMap from "./components/game/OpenWorldMap.jsx";
import MapQuestCityPage from "./components/city/MapQuestCityPage.jsx";
import { CHAPTER_COMPONENTS } from "./components/map-quest/chapterRegistry.js";
import { getChapterByKey } from "./components/map-quest/questChapters.js";
import { isSpireOpen } from "./components/city/journeyStore.js";
import TopFivePage from "./components/daily/TopFivePage.jsx";
import AssetLibraryPage from "./components/assets/AssetLibraryPage.jsx";
import RPGWorldPage from "./components/rpg-world/RPGWorldPage.jsx";
import { AppDataProvider, useAppData } from "./hooks/useAppData.js";
import useOnboarding from "./components/onboarding/useOnboarding.js";

// Lazy import that survives a mid-session deploy. When a new build ships while
// this tab is still open, the old chunk filename 404s and the dynamic import
// rejects (ChunkLoadError) — which would otherwise dead-end on the ErrorBoundary
// with no way out but a manual reload. Instead we force a ONE-TIME hard reload
// to pull the fresh index.html + chunk map. A short time-guard per chunk stops a
// genuinely-broken chunk from reload-looping (it rethrows on the retry, so the
// ErrorBoundary still catches real failures).
function lazyWithReload(name, factory) {
  return React.lazy(() =>
    factory().catch((err) => {
      const KEY = `mm:chunk-retry:${name}`;
      try {
        const last = Number(window.sessionStorage.getItem(KEY) || 0);
        if (Date.now() - last > 10000) {
          window.sessionStorage.setItem(KEY, String(Date.now()));
          window.location.reload();
          return new Promise(() => {}); // hold render until the reload lands
        }
      } catch {
        /* sessionStorage blocked — fall through and surface the real error */
      }
      throw err;
    })
  );
}

const ZonePage = lazyWithReload("zone", () => import("./components/zone/ZonePage.jsx"));
const FieldJournalMode = lazyWithReload("journal", () => import("./components/journal/FieldJournalMode.jsx"));
const WorkoutMode = lazyWithReload("workout", () => import("./components/workout/WorkoutMode.jsx"));
const ClearDayMode = lazyWithReload("clearday", () => import("./components/clearday/ClearDayMode.jsx"));
const TheCrossing = lazyWithReload("crossing", () => import("./components/onboarding/TheCrossing.jsx"));

// Dark hold — shown for the instant between boot and the Crossing gate settling.
const crossingHoldStyle = { position: "fixed", inset: 0, background: "#050007", zIndex: 320 };

const BOOT_SESSION_FLAG = "milestone_mapping_boot_shown";

function AppContent({ signOut }) {
  const {
    settings,
    milestones,
    projects,
    xp,
    achievements,
    cloudReady,
    cloudHadData,
    cloudEnabled,
  } = useAppData();
  // The Crossing — global onboarding gate. Classifies synchronously for
  // devices with history; holds behind the boot for brand-new devices until
  // the cloud pull proves the account is genuinely fresh.
  const crossing = useOnboarding({ cloudReady, cloudHadData, cloudEnabled, xp, projects, achievements });
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [rpgWorldProjectId, setRpgWorldProjectId] = useState(null);
  const [rpgWorldInitialMode, setRpgWorldInitialMode] = useState(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [clearDayOpen, setClearDayOpen] = useState(false);
  // The Zone is its own full-screen app (sibling of The Iron / Field Journal):
  // it opens as an overlay above the shell, not as a bottom-nav page.
  const [zoneOpen, setZoneOpen] = useState(false);
  // Roster deep-links into the Zone Arena. `zoneInitial` sets ZonePage's landing
  // view/param on mount; `zoneNonce` forces a fresh mount so a launch works even
  // when the user is already sitting on the Zone. Normal navigate() clears it so
  // ordinary Zone taps still land on "home".
  const [zoneInitial, setZoneInitial] = useState(null);
  const [zoneNonce, setZoneNonce] = useState(0);

  // deep links into THE IRON (e.g. Sunday Review → Alpha Stockpile)
  useEffect(() => {
    const openIron = () => setWorkoutOpen(true);
    window.addEventListener("mm:open-iron", openIron);
    return () => window.removeEventListener("mm:open-iron", openIron);
  }, []);

  // deep links into CLEARDAY (urge SOS entry points anywhere in the app)
  useEffect(() => {
    const openClearDay = () => setClearDayOpen(true);
    window.addEventListener("mm:open-clearday", openClearDay);
    return () => window.removeEventListener("mm:open-clearday", openClearDay);
  }, []);

  // Lock the shell behind the Zone app + let Escape close it (mirrors the
  // Iron / Journal full-screen modes).
  useEffect(() => {
    if (!zoneOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      // Don't tear the whole Zone out from under someone who's mid-typing
      // (e.g. a half-written mission in DeclareMission / a proof caption) —
      // when a field is focused, let it own Escape instead of discarding text.
      const el = document.activeElement;
      const tag = el && el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (el && el.isContentEditable)) return;
      setZoneOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoneOpen]);

  const [booting, setBooting] = useState(() => {
    if (!settings.introEnabled) return false;
    try {
      return !window.sessionStorage.getItem(BOOT_SESSION_FLAG);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme || "dark_neon";
    document.documentElement.dataset.reducedMotion = String(Boolean(settings.reducedMotion));
  }, [settings.theme, settings.reducedMotion]);

  const finishBoot = () => {
    try {
      window.sessionStorage.setItem(BOOT_SESSION_FLAG, "1");
    } catch {
      // sessionStorage unavailable
    }
    setBooting(false);
  };

  // Raise the Zone app. Every existing entry point still calls
  // navigate("zone") / onNavigate("zone"), so navigate() intercepts that id
  // below and routes it here — no caller changes needed anywhere.
  const openZone = () => {
    setZoneInitial(null);
    setZoneNonce((n) => n + 1);
    setZoneOpen(true);
  };

  // Stable so ZonePage's `go` router (which closes the overlay when Hoops was
  // launched from the main-screen button) keeps a constant identity.
  const closeZone = useCallback(() => setZoneOpen(false), []);

  const navigate = (page) => {
    if (page === "zone") { openZone(); return; }
    setSelectedProjectId(null);
    setSelectedMilestoneId(null);
    setRpgWorldProjectId(null);
    setRpgWorldInitialMode(null);
    setZoneInitial(null);
    setCurrentPage(page);
    window.scrollTo({ top: 0 });
  };

  // Roster → jump straight into a Zone sub-view (an arena game, or challenges/
  // partner/friends). navigate() clears zoneInitial; we re-set it in the same
  // batch (last write wins) and bump the nonce so ZonePage remounts fresh.
  const openZoneView = (view, param = null) => {
    setZoneInitial({ view, param });
    setZoneNonce((n) => n + 1);
    setZoneOpen(true);
  };

  // Integrity card (dashboard + IRON Today): land in the Zone with the Recommit
  // ritual open. From IRON we close the workout overlay first so the Zone owns
  // the screen.
  const openRecommit = () => openZoneView("recommit");
  const openRecommitFromWorkout = () => { setWorkoutOpen(false); openZoneView("recommit"); };

  const openProject = (id) => {
    setRpgWorldProjectId(null);
    setSelectedProjectId(id);
    setSelectedMilestoneId(null);
    setCurrentPage("milestones");
    window.scrollTo({ top: 0 });
  };

  const openRPGWorld = (projectId, mode = null) => {
    setRpgWorldProjectId(projectId);
    setRpgWorldInitialMode(mode);
    window.scrollTo({ top: 0 });
  };

  // Launch the Map Quest game directly. The quest story is shared across
  // projects, so we anchor it to the first available project (active first).
  const openMapQuest = () => {
    const target = projects.find((p) => p.status !== "completed") || projects[0];
    if (!target) {
      navigate("milestones");
      return;
    }
    openRPGWorld(target.id, "quest");
  };

  const closeRPGWorld = () => {
    setRpgWorldProjectId(null);
    setRpgWorldInitialMode(null);
    window.scrollTo({ top: 0 });
  };

  const openMilestone = (id) => {
    const milestone = milestones.find((m) => m.id === id);
    setSelectedProjectId((milestone && milestone.projectId) || null);
    setSelectedMilestoneId(id);
    setCurrentPage("milestones");
    window.scrollTo({ top: 0 });
  };

  function renderPage() {
    if (rpgWorldProjectId) {
      return (
        <RPGWorldPage
          projectId={rpgWorldProjectId}
          initialMode={rpgWorldInitialMode}
          onExitWorld={closeRPGWorld}
          onGoToCity={() => {
            closeRPGWorld();
            navigate("city");
          }}
        />
      );
    }
    if (currentPage === "milestones" && selectedMilestoneId) {
      return (
        <MilestoneDetailPage
          milestoneId={selectedMilestoneId}
          onBack={() => {
            setSelectedMilestoneId(null);
            window.scrollTo({ top: 0 });
          }}
        />
      );
    }
    if (currentPage === "milestones" && selectedProjectId) {
      return (
        <ProjectDetailPage
          projectId={selectedProjectId}
          onBack={() => {
            setSelectedProjectId(null);
            window.scrollTo({ top: 0 });
          }}
          onOpenMilestone={openMilestone}
          onOpenRPGWorld={openRPGWorld}
        />
      );
    }
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            onNavigate={navigate}
            onOpenProject={openProject}
            onOpenMapQuest={openMapQuest}
            onOpenWorkout={() => setWorkoutOpen(true)}
            onRecommit={openRecommit}
          />
        );
      case "daily":
        return <DailyPage />;
      case "milestones":
        return <ProjectsPage onOpenProject={openProject} onNavigate={navigate} onOpenMapQuest={openMapQuest} />;
      case "weekly":
        return <WeeklyReviewPage />;
      case "rewards":
        return <RewardsPage onNavigate={navigate} />;
      case "essence":
        return <ShadowWorkPage onNavigate={navigate} />;
      case "vision":
        return <VisionBoardPage />;
      case "identity":
        return <IdentityPage />;
      case "stats":
        return <StatsPage />;
      case "formula":
        return <FormulaPage />;
      case "training":
        return <ShiftsPage />;
      case "settings":
        return <SettingsPage />;
      case "science":
        return <SciencePage />;
      case "wellbeing":
        return <FillYourCup />;
      case "anger":
        return <AngerGymPage />;
      case "blaze":
        return <BlazeRealTrainingOS />;
      case "profile":
        return <ProfilePage onNavigate={navigate} />;
      case "topfive":
        return <TopFivePage onNavigate={navigate} />;
      case "city":
      case "openworld":
        return (
          <MapQuestCityPage
            onNavigate={navigate}
            onOpenProject={openProject}
            onOpenMapQuest={openMapQuest}
          />
        );
      case "openworld-legacy":
        return <OpenWorldMap onNavigate={navigate} onOpenProject={openProject} />;
      case "chapter-anchor":
      case "chapter-shadow": {
        // GATE 2 — legacy chapter deep-links respect the sealed Spire too.
        if (!isSpireOpen()) {
          return (
            <MapQuestCityPage
              onNavigate={navigate}
              onOpenProject={openProject}
              onOpenMapQuest={openMapQuest}
            />
          );
        }
        const chapterDef = getChapterByKey(currentPage);
        const ChapterComponent = chapterDef && CHAPTER_COMPONENTS[chapterDef.component];
        return ChapterComponent ? (
          <Suspense fallback={null}>
            <ChapterComponent onComplete={() => navigate("openworld")} />
          </Suspense>
        ) : (
          <DashboardPage onNavigate={navigate} onOpenProject={openProject} onOpenMapQuest={openMapQuest} />
        );
      }
      case "assets":
        return <AssetLibraryPage />;
      default:
        return (
          <DashboardPage
            onNavigate={navigate}
            onOpenProject={openProject}
            onOpenMapQuest={openMapQuest}
            onOpenWorkout={() => setWorkoutOpen(true)}
            onRecommit={openRecommit}
          />
        );
    }
  }

  if (booting) {
    return <BootSequence onDone={finishBoot} />;
  }

  if (crossing.holding) {
    return <div style={crossingHoldStyle} aria-hidden="true" />;
  }

  if (crossing.active) {
    return (
      <>
        <ErrorBoundary onReset={crossing.refresh}>
          <Suspense fallback={<div style={crossingHoldStyle} aria-hidden="true" />}>
            <TheCrossing onDone={crossing.refresh} />
          </Suspense>
        </ErrorBoundary>
        <ToastStack />
        <CelebrationOverlay />
      </>
    );
  }

  return (
    <>
      <AppShell
        currentPage={currentPage}
        onNavigate={navigate}
        onSignOut={signOut}
        onOpenSOS={() => setSosOpen(true)}
        onOpenJournal={() => setJournalOpen(true)}
        onOpenWorkout={() => setWorkoutOpen(true)}
        onOpenClearDay={() => setClearDayOpen(true)}
        onOpenGame={() => openZoneView("hoops")}
        onOpenZone={openZone}
      >
        {/* Keyed by page: navigating away from a crashed page auto-recovers. */}
        <ErrorBoundary key={currentPage} onReset={() => navigate("dashboard")}>
          {renderPage()}
        </ErrorBoundary>
      </AppShell>
      <ToastStack />
      <CelebrationOverlay />
      {/* Each overlay gets its own boundary: a crash inside one closes that
          overlay instead of unmounting the whole app shell. */}
      <ErrorBoundary onReset={() => setSosOpen(false)}>
        <AnxietySOS open={sosOpen} onClose={() => setSosOpen(false)} />
      </ErrorBoundary>
      {journalOpen && (
        <ErrorBoundary onReset={() => setJournalOpen(false)}>
          <Suspense fallback={null}>
            <FieldJournalMode open onClose={() => setJournalOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      )}
      {workoutOpen && (
        <ErrorBoundary onReset={() => setWorkoutOpen(false)}>
          <Suspense fallback={null}>
            <WorkoutMode open onClose={() => setWorkoutOpen(false)} onRecommit={openRecommitFromWorkout} />
          </Suspense>
        </ErrorBoundary>
      )}
      {clearDayOpen && (
        <ErrorBoundary onReset={() => setClearDayOpen(false)}>
          <Suspense fallback={null}>
            <ClearDayMode open onClose={() => setClearDayOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      )}
      {zoneOpen && (
        <ErrorBoundary onReset={() => setZoneOpen(false)}>
          <div className="zone-app" role="dialog" aria-modal="true" aria-label="The Zone">
            <button
              type="button"
              className="zone-app__close"
              onClick={() => setZoneOpen(false)}
              aria-label="Close the Zone"
            >
              ✕
            </button>
            <div className="zone-app__scroll">
              <Suspense fallback={null}>
                <ZonePage
                  key={`zoneapp-${zoneNonce}`}
                  initialView={zoneInitial?.view}
                  initialParam={zoneInitial?.param}
                  onNavigate={(page) => { setZoneOpen(false); navigate(page); }}
                  onOpenMapQuest={() => { setZoneOpen(false); openMapQuest(); }}
                  onCloseZone={closeZone}
                />
              </Suspense>
            </div>
          </div>
        </ErrorBoundary>
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthGate>
        {(userId, userEmail, signOut) => (
          <AppDataProvider userId={userId} userEmail={userEmail}>
            <AppContent signOut={signOut} />
          </AppDataProvider>
        )}
      </AuthGate>
    </ErrorBoundary>
  );
}
