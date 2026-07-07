import { Capacitor } from "@capacitor/core";

// Open an external URL without navigating the app's WKWebView away.
// Native: SFSafariViewController via @capacitor/browser. Web: new tab.
export async function openExternal(url) {
  if (!url) return;
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url });
      return;
    } catch {
      // fall through to window.open
    }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
