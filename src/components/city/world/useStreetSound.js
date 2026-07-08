import { useEffect, useMemo, useRef, useState } from "react";
import {
  isSfxMuted,
  toggleSfxMute,
  onSfxMuteChange,
  sfxDuck,
  sfxStreetLevel,
  sfxStreetBedLoop,
  sfxStreetRainLoop,
  sfxSpireHumLoop,
  sfxFootstep,
  sfxJumpWhoosh,
  sfxLandThud,
  sfxChainPop,
  sfxDoorChime,
  sfxPowerOnSwell,
  sfxSparkPickup,
  sfxZoneSting,
} from "../../../lib/sfx.js";
import { getStreetAudio, setStreetAudio } from "../streetStore.js";
import { isWet } from "./weather.js";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — the street's ears (Phase 8 · THE SOUND OF THE CITY)
// One hook owns the whole mix: the tod/theme ambient bed, the weather
// layer, the Spire hum, every verb one-shot, the −8dB dialog duck, and
// the persisted mute/volume chip state. Autoplay-law compliant: nothing
// starts until the first gesture inside the world (arm()). The game is
// 100% playable silent — every call is try/catch'd inside sfx.js.
// ════════════════════════════════════════════════════════════════════════

export default function useStreetSound({ todKey, theme, weatherKind, paused }) {
  const [muted, setMuted] = useState(isSfxMuted);
  const [volume, setVolumeState] = useState(() => getStreetAudio().volume);
  const [armed, setArmed] = useState(false);
  const bedRef = useRef(null);
  const rainRef = useRef(null);
  const humRef = useRef(null);

  // first gesture inside the world arms the mix (autoplay policy)
  const arm = () => setArmed(true);

  // live mute subscription — the Arena chip and ours share one switch
  useEffect(() => onSfxMuteChange((m) => setMuted(m)), []);

  // volume → the street bus + persistence
  useEffect(() => {
    sfxStreetLevel(volume);
    setStreetAudio({ volume });
  }, [volume]);

  // the −8dB duck while any dialog/battle overlay is open
  useEffect(() => {
    sfxDuck(Boolean(paused));
  }, [paused]);

  // ambient bed + weather layer lifecycle
  useEffect(() => {
    if (!armed || muted) return undefined;
    bedRef.current = sfxStreetBedLoop(todKey, theme);
    if (isWet(weatherKind)) {
      rainRef.current = sfxStreetRainLoop(weatherKind === "rain" ? 0.14 : 0.07);
    }
    return () => {
      if (bedRef.current) bedRef.current.stop();
      if (rainRef.current) rainRef.current.stop();
      bedRef.current = null;
      rainRef.current = null;
    };
  }, [armed, muted, todKey, theme, weatherKind]);

  // stop everything on unmount (belt + suspenders for the hum)
  useEffect(
    () => () => {
      if (humRef.current) humRef.current.stop();
      humRef.current = null;
      sfxDuck(false);
    },
    []
  );

  // the Spire's low hum — cinematics toggle this on approach
  const spireHum = (on) => {
    if (on && !humRef.current && armed && !muted) {
      humRef.current = sfxSpireHumLoop();
    } else if (!on && humRef.current) {
      humRef.current.stop();
      humRef.current = null;
    }
  };

  const verbs = useMemo(
    () => ({
      step: (foot, run) => sfxFootstep(foot, run),
      jump: () => sfxJumpWhoosh(),
      land: (weight) => sfxLandThud(weight),
      chain: (n) => sfxChainPop(n),
      chime: (districtId) => sfxDoorChime(districtId),
      powerOn: () => sfxPowerOnSwell(),
      spark: (i) => sfxSparkPickup(i),
      sting: (zoneIdx) => sfxZoneSting(zoneIdx),
    }),
    []
  );

  return {
    arm,
    armed,
    muted,
    volume,
    setVolume: (v) => setVolumeState(Math.max(0, Math.min(1, Number(v) || 0))),
    toggleMute: () => toggleSfxMute(),
    spireHum,
    verbs,
  };
}
