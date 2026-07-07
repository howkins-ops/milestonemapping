import { Capacitor } from "@capacitor/core";
import { supabase } from "./supabaseClient.js";

// Handles milestonemapping://auth-callback deep links from Supabase auth
// emails (signup confirmation, password recovery). Without this, the email
// opens Safari and the native app never receives the session.
export async function initDeepLinks() {
  if (!Capacitor.isNativePlatform() || !supabase) return;

  const { App } = await import("@capacitor/app");

  App.addListener("appUrlOpen", async ({ url }) => {
    try {
      const hashIndex = url.indexOf("#");
      if (hashIndex === -1) return;
      const params = new URLSearchParams(url.slice(hashIndex + 1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (!access_token || !refresh_token) return;

      await supabase.auth.setSession({ access_token, refresh_token });

      if (params.get("type") === "recovery") {
        // AuthGate listens for this to show the set-new-password screen.
        window.dispatchEvent(new CustomEvent("mm-password-recovery"));
      }
    } catch (err) {
      console.warn("[deepLinks] failed to handle auth callback", err);
    }
  });
}
