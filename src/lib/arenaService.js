// All Squad Arena backend calls. Every RPC is az_* SECURITY DEFINER server logic;
// RLS handles direct table reads. Server is authoritative — clients never write
// game outcomes directly. Guard: null supabase → { offline: true }.
// Mirrors src/lib/zoneService.js (same private rpc helper + offline guard).
import { supabase } from "./supabase.js";
import { assertClean } from "./contentFilter.js";

const OFFLINE = { offline: true };

async function rpc(name, args = {}) {
  if (!supabase) return OFFLINE;
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

/* ---------------- the vow ---------------- */

export const vowCreate = ({ title, ifCue, dueAt, squadId, witnessId, stake }) => {
  // The vow's title/cue/stake are shown to the witness and squadmates — filter
  // them like every other user-generated content surface (Guideline 1.2).
  assertClean(title, ifCue, stake);
  return rpc("az_vow_create", {
    p_title: title,
    p_if_cue: ifCue || null,
    p_due_at: dueAt,
    p_squad: squadId || null,
    p_witness: witnessId || null,
    p_stake: stake || null,
  });
};

export const vowList = ({ squadId } = {}) =>
  rpc("az_vow_list", { p_squad: squadId || null });

export const vowDefuse = ({ vowId, proofId }) =>
  rpc("az_vow_defuse", { p_vow: vowId, p_proof: proofId || null });

/* ---------------- boss battle ---------------- */

export const bossState = ({ squadId }) =>
  rpc("az_arena_boss_state", { p_squad: squadId });

/* ---------------- the chain ---------------- */

export const chainState = ({ squadId }) =>
  rpc("az_arena_chain_state", { p_squad: squadId });

export const chainFreeze = ({ squadId }) =>
  rpc("az_arena_chain_freeze", { p_squad: squadId });

/* ---------------- duels ---------------- */

export const duelStart = ({ partnerId }) =>
  rpc("az_arena_duel_start", { p_partner: partnerId });

export const duelState = () => rpc("az_arena_duel_state");

/* ---------------- league / ascension ---------------- */

export const leagueState = ({ squadId }) =>
  rpc("az_arena_league_state", { p_squad: squadId });

/* ---------------- full court ---------------- */

export const fullcourtLogGame = (payload) =>
  rpc("az_fullcourt_log_game", { p_payload: payload });

export const fullcourtSeason = ({ userId }) =>
  rpc("az_fullcourt_season", { p_user: userId });

export const fullcourtH2H = ({ partnerId }) =>
  rpc("az_fullcourt_h2h", { p_partner: partnerId });

/* ---------------- dawn patrol ---------------- */

export const dawnState = ({ squadId }) =>
  rpc("az_arena_dawn_state", { p_squad: squadId });

/* ---------------- stakes ---------------- */

export const stakeCreate = ({ refereeId, refKind, refId, stakeKind, amount, ladderLevel }) =>
  rpc("az_stake_create", {
    p_referee: refereeId,
    p_ref_kind: refKind,
    p_ref_id: refId,
    p_stake_kind: stakeKind,
    p_amount: amount,
    p_ladder_level: ladderLevel,
  });

export const stakeList = () => rpc("az_stake_list");

export const stakeVerify = ({ stakeId, kept }) =>
  rpc("az_stake_verify", { p_stake: stakeId, p_kept: kept });

export const stakeSettle = ({ stakeId }) =>
  rpc("az_stake_settle", { p_stake: stakeId });
