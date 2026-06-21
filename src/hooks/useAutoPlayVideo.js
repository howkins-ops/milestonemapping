import { useEffect, useRef } from "react";

/**
 * Drives a muted, looping <video> to autoplay reliably — including iOS Safari.
 *
 * Why this is needed:
 *  - React doesn't reliably emit the `muted` *attribute* into the DOM at parse
 *    time, so iOS treats the video as non-muted and blocks autoplay. We force
 *    the muted property/attribute here.
 *  - iOS refuses programmatic autoplay entirely in Low Power Mode. The only
 *    escape is a real user gesture, so we also start playback on the user's
 *    first interaction anywhere on the page (the X/Instagram-web technique).
 *
 * Returns a ref to attach to the <video>.
 */
export default function useAutoPlayVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Harden the element for iOS muted-autoplay rules.
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");

    let done = false;
    const tryPlay = () => {
      if (done) return;
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          done = true;
        }).catch(() => {
          /* autoplay blocked — the gesture fallback will retry */
        });
      }
    };

    // Attempt now, and again once the media is ready (covers cached + cold).
    tryPlay();
    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("canplay", tryPlay);

    // First-gesture fallback: any tap/scroll/click/key starts playback.
    const GESTURES = ["touchstart", "touchend", "pointerdown", "click", "keydown"];
    const onGesture = () => tryPlay();
    const gestureOpts = { passive: true, capture: true };
    GESTURES.forEach((evt) =>
      document.addEventListener(evt, onGesture, gestureOpts)
    );

    return () => {
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("canplay", tryPlay);
      GESTURES.forEach((evt) =>
        document.removeEventListener(evt, onGesture, gestureOpts)
      );
    };
  }, []);

  return ref;
}
