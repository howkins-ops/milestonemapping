import { useEffect, useState } from "react";
import {
  loadMasks,
  subscribeMasks,
  setEncountersOff,
  markFramingSeen,
  snoozeSession,
  isSessionSnoozed,
  recordAmbush,
  recordWalkAway,
  recordWildWin,
  recordIntegration,
  recordRelapseWin,
  maybeMaterialize,
  integratedCount,
  namedCriticCount,
  wildWinCount,
  courtClaimed,
  relapseEligibleBossIds,
} from "./maskStore.js";

// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — live view of the Mask Court store
// State + actions; every store write notifies, so any component holding
// this hook (codex chip, battle overlay, allies) re-renders together.
// ════════════════════════════════════════════════════════════════════════

export default function useMasks() {
  const [state, setState] = useState(loadMasks);

  useEffect(() => subscribeMasks(() => setState(loadMasks())), []);

  return {
    state,
    integrated: state.integrated,
    wildWins: state.wildWins,
    entries: state.entries,
    encountersOff: state.encountersOff,
    firstFramingSeen: state.firstFramingSeen,
    integratedCount: integratedCount(state),
    namedCriticCount: namedCriticCount(state),
    wildWinCount: wildWinCount(state),
    courtClaimed: courtClaimed(state),
    isIntegrated: (id) => Boolean(state.integrated[id]),
    relapseEligibleBossIds: () => relapseEligibleBossIds(state),
    // actions (store notifies → state refreshes itself)
    setEncountersOff,
    markFramingSeen,
    snoozeSession,
    isSessionSnoozed,
    recordAmbush,
    recordWalkAway,
    recordWildWin,
    recordIntegration,
    recordRelapseWin,
    maybeMaterialize,
  };
}
