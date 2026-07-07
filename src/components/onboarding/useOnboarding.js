import { useEffect, useRef, useState } from "react";
import {
  hasCrossing,
  loadCrossing,
  hasLegacySignals,
  runMigrationOnce,
} from "./onboardingStore.js";

// ════════════════════════════════════════════════════════════════════════
// THE CROSSING — gate hook
// Classification is layered so a legacy user NEVER sees a frame of it:
//   1. crossing_v1 exists                → settled (respect it)
//   2. synchronous localStorage signals  → legacy, settled before first paint
//   3. neither → HOLD until the initial cloud pull lands, then decide from
//      the server: a pre-existing user_data row OR a non-empty pulled
//      snapshot = legacy on a brand-new device; truly fresh = the Crossing.
//      (NOT the profiles row — a DB trigger creates that at signup, so it
//      exists before first login. Verified against prod 2026-07-07.)
//
// The hold is bounded: if the cloud never answers (offline, no supabase),
// we fail SAFE — classify legacy, show the app. A real new user can still
// replay the Crossing from Settings.
// ════════════════════════════════════════════════════════════════════════

const HOLD_TIMEOUT_MS = 8000;

export default function useOnboarding({
  cloudReady = false,
  cloudHadData = null, // true | false | null — did a user_data row already exist?
  cloudEnabled = true, // false = guest / local-only session (no cloud check coming)
  xp = 0,
  projects = [],
  achievements = [],
} = {}) {
  // Runs once, synchronously, before the first paint.
  const [state, setState] = useState(() => {
    if (hasCrossing()) return { status: "settled", data: loadCrossing() };
    if (hasLegacySignals()) {
      return { status: "settled", data: runMigrationOnce({ existingUser: true }) };
    }
    return { status: "pending", data: null };
  });

  // Bounded hold — offline / storage-less sessions settle as legacy.
  const timeoutRef = useRef(null);
  useEffect(() => {
    if (state.status !== "pending") return undefined;
    timeoutRef.current = setTimeout(() => {
      setState((prev) => {
        if (prev.status !== "pending") return prev;
        return { status: "settled", data: runMigrationOnce({ existingUser: true }) };
      });
    }, HOLD_TIMEOUT_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [state.status]);

  // Decide once the initial cloud pull has landed.
  useEffect(() => {
    if (state.status !== "pending" || !cloudReady) return;
    // The pull may have restored a crossing record from the blob (new device).
    if (hasCrossing()) {
      setState({ status: "settled", data: loadCrossing() });
      return;
    }
    // Wait for the cloud check unless the snapshot already proves history.
    const snapshotHasHistory =
      Number(xp) > 0 ||
      (Array.isArray(projects) && projects.length > 0) ||
      (Array.isArray(achievements) && achievements.length > 0) ||
      hasLegacySignals();
    if (cloudHadData === null && cloudEnabled && !snapshotHasHistory) return;
    const existingUser = snapshotHasHistory || cloudHadData === true;
    setState({ status: "settled", data: runMigrationOnce({ existingUser }) });
  }, [state.status, cloudReady, cloudHadData, cloudEnabled, xp, projects, achievements]);

  const refresh = () => setState({ status: "settled", data: loadCrossing() });

  const crossing = state.data;
  return {
    holding: state.status === "pending",
    active: state.status === "settled" && Boolean(crossing) && !crossing.completed,
    crossing,
    refresh,
  };
}
