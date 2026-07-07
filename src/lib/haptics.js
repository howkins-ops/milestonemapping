// Native haptic feedback (Capacitor); silently does nothing on the web.
// Sprinkle on game events: door slams, buzzers, milestone completions, streaks.

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const native = () => Capacitor.isNativePlatform();

export function tapLight() {
  if (native()) Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

export function tapMedium() {
  if (native()) Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
}

export function slamHeavy() {
  if (native()) Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
}

export function buzzSuccess() {
  if (native()) Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}

export function buzzWarning() {
  if (native()) Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
}

export function buzzError() {
  if (native()) Haptics.notification({ type: NotificationType.Error }).catch(() => {});
}
