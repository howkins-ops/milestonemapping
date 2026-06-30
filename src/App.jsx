import React, { useEffect, useState, Suspense } from "react";
import AuthGate from "./components/auth/AuthGate.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import BootSequence from "./components/layout/BootSequence.jsx";
import ToastStack from "./components/ui/Toast.jsx";
import CelebrationOverlay from "./components/ui/CelebrationOverlay.jsx";
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
import BlazeRealTrainingOS from "./components/blaze/BlazeRealTrainingOS.jsx";
import ProfilePage from "./components/profile/ProfilePage.jsx";
import OpenWorldMap from "./components/game/OpenWorldMap.jsx";
import SeekerCity from "./components/game/SeekerCity.jsx";
import { CHAPTER_COMPONENTS } from "./components/map-quest/chapterRegistry.js";
import { getChapterByKey } from "./components/map-quest/questChapters.js";
import TopFivePage from "./components/daily/TopFivePage.jsx";
import AssetLibraryPage from "./components/assets/AssetLibraryPage.jsx";
import RPGWorldPage from "./components/rpg-world/RPGWorldPage.jsx";
import { AppDataProvider, useAppData } from "./hooks/useAppData.js";

const BOOT_SESSION_FLAG = "milestone_mapping_boot_shown";

function AppContent({ signOut }) {
  const { settings, milestones, projects } = useAppData();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [rpgWorldProjectId, setRpgWorldProjectId] = useState(null);
  const [rpgWorldInitialMode, setRpgWorldInitialMode] = useState(null);
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

  const navigate = (page) => {
    setSelectedProjectId(null);
    setSelectedMilestoneId(null);
    setRpgWorldProjectId(null);
    setRpgWorldInitialMode(null);
    setCurrentPage(page);
    window.scrollTo({ top: 0 });
  };

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
        return <DashboardPage onNavigate={navigate} onOpenProject={openProject} onOpenMapQuest={openMapQuest} />;
      case "daily":
        return <DailyPage />;
      case "milestones":
        return <ProjectsPage onOpenProject={openProject} onNavigate={navigate} onOpenMapQuest={openMapQuest} />;
      case "weekly":
        return <WeeklyReviewPage />;
      case "rewards":
        return <RewardsPage onNavigate={navigate} />;
      case "essence":
        return <ShadowWorkPage />;
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
      case "blaze":
        return <BlazeRealTrainingOS />;
      case "profile":
        return <ProfilePage onNavigate={navigate} />;
      case "topfive":
        return <TopFivePage onNavigate={navigate} />;
      case "openworld":
        return <SeekerCity onNavigate={navigate} onOpenProject={openProject} />;
      case "openworld-legacy":
        return <OpenWorldMap onNavigate={navigate} onOpenProject={openProject} />;
      case "chapter-anchor":
      case "chapter-shadow": {
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
        return <DashboardPage onNavigate={navigate} onOpenProject={openProject} onOpenMapQuest={openMapQuest} />;
    }
  }

  if (booting) {
    return <BootSequence onDone={finishBoot} />;
  }

  return (
    <>
      <AppShell currentPage={currentPage} onNavigate={navigate} onSignOut={signOut}>
        {renderPage()}
      </AppShell>
      <ToastStack />
      <CelebrationOverlay />
    </>
  );
}

export default function App() {
  return (
    <AuthGate>
      {(userId, userEmail, signOut) => (
        <AppDataProvider userId={userId} userEmail={userEmail}>
          <AppContent signOut={signOut} />
        </AppDataProvider>
      )}
    </AuthGate>
  );
}
