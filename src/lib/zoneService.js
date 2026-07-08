// All Zone backend calls. Every RPC is SECURITY DEFINER server logic;
// RLS handles direct table reads. Guard: null supabase → { offline: true }.
import { supabase } from "./supabase.js";
import { getTodayKey } from "./dates.js";
import { assertClean } from "./contentFilter.js";

const OFFLINE = { offline: true };

async function rpc(name, args = {}) {
  if (!supabase) return OFFLINE;
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

function today() {
  return getTodayKey();
}

/* ---------------- identity / onboarding ---------------- */

export const usernameAvailable = (username) =>
  rpc("az_username_available", { p_username: username });

export const joinZone = ({ username, displayName, identityTitle, avatarUrl }) => {
  assertClean(username, displayName, identityTitle);
  return rpc("az_join_zone", {
    p_username: username,
    p_display_name: displayName || null,
    p_identity_title: identityTitle || null,
    p_avatar_url: avatarUrl || null,
  });
};

export const getZoneState = () => rpc("az_get_zone_state", { p_local_date: today() });

export const riseAgain = () => rpc("az_rise_again", { p_local_date: today() });

export async function updateZoneProfile(userId, patch) {
  if (!supabase || !userId) return OFFLINE;
  assertClean(patch?.display_name, patch?.identity_title, patch?.bio, patch?.username);
  const { data, error } = await supabase
    .from("zone_members")
    .update(patch)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- friends / blocks / reports ---------------- */

export const findUser = (username) => rpc("az_find_user", { p_username: username });
export const listFriends = () => rpc("az_list_friends");
export const sendFriendRequest = (username) =>
  rpc("az_send_friend_request", { p_username: username });
export const respondFriendRequest = (requestId, accept) =>
  rpc("az_respond_friend_request", { p_request_id: requestId, p_accept: accept });
export const removeFriend = (userId) => rpc("az_remove_friend", { p_user: userId });
export const blockUser = (userId) => rpc("az_block_user", { p_user: userId });

export async function unblockUser(userId, myId) {
  if (!supabase || !myId) return OFFLINE;
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker", myId)
    .eq("blocked", userId);
  if (error) throw error;
  return { unblocked: true };
}

export async function reportContent({ targetUser, contentType, contentId, reason, details }) {
  if (!supabase) return OFFLINE;
  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user?.id;
  if (!me) return OFFLINE;
  const { error } = await supabase.from("reports").insert({
    reporter: me,
    target_user: targetUser || null,
    content_type: contentType,
    content_id: contentId || null,
    reason,
    details: details || null,
  });
  if (error) throw error;
  return { reported: true };
}

/* ---------------- squads ---------------- */

export const createSquad = (name, emblem) => {
  assertClean(name);
  return rpc("az_create_squad", { p_name: name, p_emblem: emblem || "🔥" });
};
export const joinSquadByCode = (code) => rpc("az_join_squad_by_code", { p_code: code });
export const squadDetail = (squadId) => rpc("az_squad_detail", { p_squad: squadId });
export const kickMember = (squadId, userId) =>
  rpc("az_kick_member", { p_squad: squadId, p_user: userId });
export const transferOwnership = (squadId, userId) =>
  rpc("az_transfer_ownership", { p_squad: squadId, p_user: userId });
export const leaveSquad = (squadId) => rpc("az_leave_squad", { p_squad: squadId });

export async function updateSquad(squadId, patch) {
  if (!supabase) return OFFLINE;
  assertClean(patch?.name, patch?.motto, patch?.description);
  const { data, error } = await supabase
    .from("squads")
    .update(patch)
    .eq("id", squadId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- partner ---------------- */

export const invitePartner = (userId) => rpc("az_invite_partner", { p_user: userId });
export const respondPartner = (linkId, accept) =>
  rpc("az_respond_partner", { p_link: linkId, p_accept: accept });
export const endPartnership = (linkId) => rpc("az_end_partnership", { p_link: linkId });
export const partnerAction = (kind, note) => {
  assertClean(note);
  return rpc("az_partner_action", { p_kind: kind, p_note: note || null });
};
export const getPartnerState = () =>
  rpc("az_get_partner_state", { p_local_date: today() });

/* ---------------- missions / proofs ---------------- */

export const declareMission = ({ category, title, note }) => {
  assertClean(title, note);
  return rpc("az_declare_mission", {
    p_local_date: today(),
    p_category: category,
    p_title: title,
    p_note: note || null,
  });
};

// Shift One ritual — the cost step is private and intentionally never sent.
export const recommit = ({ lie, truth, declaration, proof, asMission }) => {
  assertClean(lie, truth, declaration, proof);
  return rpc("az_recommit", {
    p_local_date: today(),
    p_lie: lie,
    p_truth: truth,
    p_declaration: declaration,
    p_proof: proof,
    p_as_mission: !!asMission,
  });
};

export const postProof = ({ kind, caption, mediaPath, challengeId, durationMinutes, photoSource }) => {
  assertClean(caption);
  return rpc("az_post_proof", {
    p_local_date: today(),
    p_kind: kind,
    p_caption: caption || null,
    p_media_path: mediaPath || null,
    p_challenge_id: challengeId || null,
    p_duration_minutes: durationMinutes || null,
    p_local_time: new Date().toTimeString().slice(0, 8),
    p_photo_source: photoSource || null,
  });
};

export async function listMyProofs(userId, limit = 60) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from("zone_proofs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function listProofDays(userId, sinceKey) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from("zone_proofs")
    .select("proof_date")
    .eq("user_id", userId)
    .gte("proof_date", sinceKey);
  if (error) throw error;
  return [...new Set((data || []).map((r) => r.proof_date))];
}

/* ---------------- feed / reactions / comments ---------------- */

const FEED_SELECT =
  "*, member:zone_members!feed_events_actor_fkey(username, display_name, avatar_url, identity_title), reactions(user_id, emoji), comments(id)";

export async function fetchFeed({ before, squadId, actorId, limit = 20 } = {}) {
  if (!supabase) return [];
  let q = supabase
    .from("feed_events")
    .select(FEED_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  if (squadId) q = q.eq("squad_id", squadId);
  if (actorId) q = q.eq("actor", actorId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function react(eventId, emoji, myId) {
  if (!supabase || !myId) return OFFLINE;
  const { error } = await supabase
    .from("reactions")
    .insert({ event_id: eventId, emoji, user_id: myId });
  if (error && error.code !== "23505") throw error;
  return { ok: true };
}

export async function unreact(eventId, emoji, myId) {
  if (!supabase || !myId) return OFFLINE;
  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("event_id", eventId)
    .eq("emoji", emoji)
    .eq("user_id", myId);
  if (error) throw error;
  return { ok: true };
}

export async function listComments(eventId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("comments")
    .select("*, member:zone_members!comments_user_id_fkey(username, display_name, avatar_url)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addComment(eventId, body, myId) {
  if (!supabase || !myId) return OFFLINE;
  assertClean(body);
  const { data, error } = await supabase
    .from("comments")
    .insert({ event_id: eventId, body, user_id: myId })
    .select("*, member:zone_members!comments_user_id_fkey(username, display_name, avatar_url)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(commentId, myId) {
  if (!supabase || !myId) return OFFLINE;
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", myId);
  if (error) throw error;
  return { ok: true };
}

export async function deleteOwnEvent(eventId, myId) {
  if (!supabase || !myId) return OFFLINE;
  const { error } = await supabase
    .from("feed_events")
    .delete()
    .eq("id", eventId)
    .eq("actor", myId);
  if (error) throw error;
  return { ok: true };
}

export const getLeaderboard = (days = 7) =>
  rpc("az_get_leaderboard", { p_local_date: today(), p_days: days });

/* ---------------- challenges ---------------- */

export const createChallenge = ({ scope, squadId, templateKey, title, description, durationDays, startsOn }) => {
  assertClean(title, description);
  return rpc("az_create_challenge", {
    p_scope: scope,
    p_squad: squadId || null,
    p_template_key: templateKey || null,
    p_title: title,
    p_description: description || null,
    p_duration_days: durationDays,
    p_starts_on: startsOn || today(),
  });
};

export const joinChallenge = (challengeId) =>
  rpc("az_join_challenge", { p_challenge: challengeId });
export const challengeCheckin = (challengeId, note) =>
  rpc("az_challenge_checkin", { p_challenge: challengeId, p_local_date: today(), p_note: note || null });
export const listChallenges = () => rpc("az_list_challenges", { p_local_date: today() });
export const challengeDetail = (challengeId) =>
  rpc("az_challenge_detail", { p_challenge: challengeId });

/* ---------------- messaging ---------------- */

export const getOrCreateDm = (userId) => rpc("az_get_or_create_dm", { p_user: userId });
export const listConversations = () => rpc("az_list_conversations");

export async function fetchMessages(conversationId, { before, limit = 40 } = {}) {
  if (!supabase) return [];
  let q = supabase
    .from("messages")
    .select("*, member:zone_members!messages_sender_fkey(username, display_name, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).reverse();
}

export async function sendMessage(conversationId, body, myId) {
  if (!supabase || !myId) return OFFLINE;
  assertClean(body);
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, body, sender: myId })
    .select("*, member:zone_members!messages_sender_fkey(username, display_name, avatar_url)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOwnMessage(messageId, myId) {
  if (!supabase || !myId) return OFFLINE;
  const { error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString(), body: "•" })
    .eq("id", messageId)
    .eq("sender", myId);
  if (error) throw error;
  return { ok: true };
}

export async function markConversationRead(conversationId, myId) {
  if (!supabase || !myId) return OFFLINE;
  const { error } = await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", myId);
  if (error) throw error;
  return { ok: true };
}

/* ---------------- inbox / notifications ---------------- */

export async function listNotifications(myId, limit = 50) {
  if (!supabase || !myId) return [];
  const { data, error } = await supabase
    .from("zone_notifications")
    .select("*")
    .eq("user_id", myId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function markNotificationsRead(myId, ids = null) {
  if (!supabase || !myId) return OFFLINE;
  let q = supabase
    .from("zone_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", myId)
    .is("read_at", null);
  if (ids) q = q.in("id", ids);
  const { error } = await q;
  if (error) throw error;
  return { ok: true };
}

/* ---------------- weekly reports ---------------- */

export const generateWeeklyReport = (weekStart) =>
  rpc("az_generate_weekly_report", { p_week_start: weekStart });
export const shareWeeklyReport = (reportId) =>
  rpc("az_share_weekly_report", { p_report: reportId });

export async function listMyReports(myId, limit = 12) {
  if (!supabase || !myId) return [];
  const { data, error } = await supabase
    .from("zone_weekly_reports")
    .select("*")
    .eq("user_id", myId)
    .order("week_start", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
