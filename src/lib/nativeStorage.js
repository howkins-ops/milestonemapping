// iOS durability for localStorage (Capacitor only; no-op on the web).
//
// WKWebView storage can be reclaimed under disk pressure, and the app keeps
// all progress (shifts_state, descent, XP, Supabase session…) in localStorage
// across ~90 call sites. Rather than migrate every caller to an async API,
// we mirror the ENTIRE localStorage into native Preferences (UserDefaults):
//   - snapshot on a 30s debounce after any write, and when the app backgrounds
//   - on boot, if localStorage looks evicted but a snapshot exists, restore it
// Call initNativeStorage() from main.jsx before rendering.

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const SNAPSHOT_KEY = "ls_snapshot_v1";
// Short debounce: a hard crash inside the window loses recent writes,
// so keep it tight. Snapshots are cheap (one JSON string).
const DEBOUNCE_MS = 5_000;

// Auth tokens stay out of the UserDefaults snapshot (unencrypted at rest).
// Cost: after a rare WKWebView eviction the user re-signs-in. Worth it.
const EXCLUDE_PREFIXES = ["sb-"];

let timer = null;

function takeSnapshot() {
  try {
    const all = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (EXCLUDE_PREFIXES.some((p) => key.startsWith(p))) continue;
      all[key] = window.localStorage.getItem(key);
    }
    Preferences.set({ key: SNAPSHOT_KEY, value: JSON.stringify(all) });
  } catch (err) {
    console.error("nativeStorage snapshot failed", err);
  }
}

function scheduleSnapshot() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    takeSnapshot();
  }, DEBOUNCE_MS);
}

export async function initNativeStorage() {
  if (!Capacitor.isNativePlatform()) return;

  // Restore: an evicted store has none of our data; a fresh install has no snapshot.
  try {
    const { value } = await Preferences.get({ key: SNAPSHOT_KEY });
    if (value && window.localStorage.length === 0) {
      const all = JSON.parse(value);
      for (const [key, raw] of Object.entries(all)) {
        window.localStorage.setItem(key, raw);
      }
      console.info(`nativeStorage: restored ${Object.keys(all).length} keys`);
    }
  } catch (err) {
    console.error("nativeStorage restore failed", err);
  }

  // Mirror every write, whoever makes it.
  const origSet = Storage.prototype.setItem;
  const origRemove = Storage.prototype.removeItem;
  const origClear = Storage.prototype.clear;
  Storage.prototype.setItem = function (...args) {
    origSet.apply(this, args);
    if (this === window.localStorage) scheduleSnapshot();
  };
  Storage.prototype.removeItem = function (...args) {
    origRemove.apply(this, args);
    if (this === window.localStorage) scheduleSnapshot();
  };
  Storage.prototype.clear = function (...args) {
    origClear.apply(this, args);
    if (this === window.localStorage) scheduleSnapshot();
  };

  // Flush immediately when the app heads to the background.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (timer) { clearTimeout(timer); timer = null; }
      takeSnapshot();
    }
  });
}
