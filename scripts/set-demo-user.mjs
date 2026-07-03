// Create or reset a login (default: coachowkins@gmail.com / demodemo) using the
// Supabase service-role key — bypasses email confirmation and rate limits.
//
// Get the key: supabase.com dashboard > project gvtxvwlzyzmfszapzcce > Settings > API > service_role (secret)
//
// PowerShell:
//   $env:SUPABASE_SERVICE_ROLE_KEY="<key>"; node scripts/set-demo-user.mjs
// Optional overrides:
//   node scripts/set-demo-user.mjs someone@example.com somepassword
//
// Never commit the service-role key or put it in a VITE_-prefixed env var.

import { createClient } from "@supabase/supabase-js";

const URL = "https://gvtxvwlzyzmfszapzcce.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2] || "coachowkins@gmail.com";
const password = process.argv[3] || "demodemo";

if (!KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var. See comments at the top of this script.");
  process.exit(1);
}

const admin = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let user = null;
for (let page = 1; page <= 50 && !user; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) { console.error("listUsers failed:", error.message); process.exit(1); }
  user = data.users.find(u => (u.email || "").toLowerCase() === email.toLowerCase()) ?? null;
  if (data.users.length < 200) break;
}

if (user) {
  const { error } = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) { console.error("update failed:", error.message); process.exit(1); }
  console.log(`OK — existing user ${email}: password reset, email confirmed. Login is ready.`);
} else {
  const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) { console.error("create failed:", error.message); process.exit(1); }
  console.log(`OK — created ${email} pre-confirmed. Login is ready.`);
}
