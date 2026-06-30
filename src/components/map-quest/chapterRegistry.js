import { lazy } from "react";

// The chapter registry — maps a chapter's `component` id (see questChapters.js) to
// its lazily-loaded component. To add a built chapter: add one line here, then set
// the matching `component` id + `available: true` in questChapters.js. The Quest Book
// map (MapQuestMap) and both routers (RPGWorldPage, App) pick it up automatically.
export const CHAPTER_COMPONENTS = {
  ChapterAnchor: lazy(() => import("./chapters/ChapterAnchor.jsx")),
  ChapterSignal: lazy(() => import("./chapters/ChapterSignal.jsx")),
  ChapterShadow: lazy(() => import("./chapters/ChapterShadow.jsx")),
  ChapterFixer: lazy(() => import("./chapters/ChapterFixer.jsx")),
  ChapterHoloMap: lazy(() => import("./chapters/ChapterHoloMap.jsx")),
  ChapterGate: lazy(() => import("./chapters/ChapterGate.jsx")),
  ChapterVault: lazy(() => import("./chapters/ChapterVault.jsx")),
  ChapterReturn: lazy(() => import("./chapters/ChapterReturn.jsx")),
  ChapterChallenger: lazy(() => import("./chapters/ChapterChallenger.jsx")),
  ChapterForgeCh: lazy(() => import("./chapters/ChapterForgeCh.jsx")),
  ChapterNeonChapel: lazy(() => import("./chapters/ChapterNeonChapel.jsx")),
  ChapterDesert: lazy(() => import("./chapters/ChapterDesert.jsx")),
  ChapterDataSpire: lazy(() => import("./chapters/ChapterDataSpire.jsx")),
  ChapterRecursion: lazy(() => import("./chapters/ChapterRecursion.jsx")),
  ChapterDiagnostic: lazy(() => import("./chapters/ChapterDiagnostic.jsx")),
  ChapterRuins: lazy(() => import("./chapters/ChapterRuins.jsx")),
  ChapterGarden: lazy(() => import("./chapters/ChapterGarden.jsx")),
  ChapterBlackMarket: lazy(() => import("./chapters/ChapterBlackMarket.jsx")),
  ChapterCitadel: lazy(() => import("./chapters/ChapterCitadel.jsx")),
  ChapterBecomingSignal: lazy(() => import("./chapters/ChapterBecomingSignal.jsx")),
};
