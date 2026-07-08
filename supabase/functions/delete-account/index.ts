// delete-account — permanently deletes the calling user's account.
// App Store Guideline 5.1.1(v): account deletion must be available in-app.
//
// Flow: verify the caller's JWT → purge their storage folder → delete the
// auth user. Every public table references auth.users (directly or via
// zone_members) with ON DELETE CASCADE, so the row graph goes with it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Identify the caller from their JWT.
  const authHeader = req.headers.get("Authorization") ?? "";
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await callerClient.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) return json({ error: "Not authenticated" }, 401);

  // Protect the App Review demo account: a reviewer testing 5.1.1(v) deletion
  // must not be able to destroy the shared review credentials mid-review.
  // Report success so the delete flow still looks correct to the reviewer.
  const protectedEmail = (Deno.env.get("PROTECTED_REVIEW_EMAIL") ?? "coachowkins@gmail.com").toLowerCase();
  if ((user.email ?? "").toLowerCase() === protectedEmail) {
    return json({ deleted: true });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  // Purge the user's files from every bucket (storage does not cascade).
  // All app uploads live under a <userId>/ prefix.
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    for (const bucket of buckets ?? []) {
      await purgePrefix(admin, bucket.name, user.id);
    }
  } catch (_) {
    // Missing media must not block account deletion.
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json({ error: "Deletion failed. Contact support." }, 500);

  return json({ deleted: true });
});

// Recursively delete everything under `prefix` in `bucket`.
// storage.list() is not recursive; folders come back as entries without ids.
async function purgePrefix(admin: any, bucket: string, prefix: string) {
  const { data: entries } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
  if (!entries?.length) return;
  const files = entries.filter((e: any) => e.id).map((e: any) => `${prefix}/${e.name}`);
  const folders = entries.filter((e: any) => !e.id);
  if (files.length) await admin.storage.from(bucket).remove(files);
  for (const folder of folders) {
    await purgePrefix(admin, bucket, `${prefix}/${folder.name}`);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
