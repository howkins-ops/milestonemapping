import { useRef } from "react";
import fx from "./world/fx.js";
import { markZoneSeen, markWhisperSeen } from "./streetStore.js";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — the camera tells the legend (Phase 7 · CINEMA & STORY)
// One orchestrator owns every directed shot so no two cinematics ever
// overlap (single cineLock). Everything is skippable (walking cancels the
// engine pan) and reduced-motion-safe (pans become jump-cuts inside the
// engine; cards appear/disappear instantly via fx). Real-life-first: no
// shot ever blocks input, doors, or navigation.
// ════════════════════════════════════════════════════════════════════════

// Zone title lines — plain, warm, direct.
export const ZONE_LINES = {
  "THE GRID": "Where days are won before noon.",
  "NEON HEIGHTS": "Who you are, in lights.",
  "THE ARCHIVE ROW": "Every method that ever worked, shelved and waiting.",
  "THE UNDERGLOW": "The city keeps its fire in the basement.",
  "THE COMMONS": "Nobody builds alone.",
  "THE TERMINUS": "Everything you earned, kept.",
  "THE SPIRE": "The tower was watching the whole time.",
};

// Guide mile-marker whispers — once each, ever (streetStore).
export const WHISPERS = [
  "Notice you kept walking. That's the whole secret.",
  "The street doesn't care how you feel about it. It just counts steps.",
  "Every window you lit is somebody's proof it can be done.",
  "Slow is fine. Stopped is fine too — as long as you start again.",
  "You're farther east than most people ever walk.",
];

const WHISPER_FRACTIONS = [0.12, 0.3, 0.5, 0.7, 0.9];
const SPIRE_NEAR_PX = 600;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function useCinematics(fxApiRef, { guideColor = "#00F0FF" } = {}) {
  const lockRef = useRef(false); // one cinematic at a time, ever
  const lastXRef = useRef(null); // for eastward arch-crossing detection
  const spireNearRef = useRef(false);
  const spireHumRef = useRef(null); // Phase 8 plugs the hum in here

  const api = () => fxApiRef.current;

  /* ── The power-on shot: letterbox → pan → eruption → title card ─────── */
  const powerOn = async (district, { accent } = {}) => {
    const a = api();
    if (!a) return;
    if (lockRef.current) {
      a.erupt(district.id); // never queue cinematics — the building still performs
      return;
    }
    lockRef.current = true;
    try {
      const doorX = a.buildingX(district.id);
      a.letterbox(true);
      if (doorX != null) await a.panTo(doorX, { ms: 750, hold: 250 });
      a.erupt(district.id);
      if (a.powerOnSwell) a.powerOnSwell();
      fx.titleCard(a.viewportEl(), {
        title: district.name,
        sub: "POWERS ON",
        color: accent || district.color,
        ms: 1500,
      });
      a.shake({ amp: 3, ms: 160 }); // the title card slams
      await wait(1400);
      a.letterbox(false);
      // no pan back needed — the camera eases home to the player on its own
    } catch {
      /* cinema is garnish */
    } finally {
      lockRef.current = false;
    }
  };

  /* ── GATE 2: the city salutes — every lit beacon answers the Spire ───── */
  const spireSalute = async (world, litIds) => {
    const a = api();
    if (!a || lockRef.current) return;
    lockRef.current = true;
    try {
      const spire = (world.buildings || []).find((b) => b.id === "alchemist-spire");
      const vpH = a.viewportEl() ? a.viewportEl().clientHeight : 400;
      a.letterbox(true);
      if (spire) {
        await a.panTo(Math.round(spire.x + spire.w / 2), { ms: 850, hold: 1500 });
      }
      // beacons fire in story order, 60ms stagger — 15 lights answering
      const order = (litIds || []).slice(0, 15);
      order.forEach((id, i) => {
        const b = (world.buildings || []).find((v) => v.id === id);
        if (!b) return;
        setTimeout(() => {
          a.ringAt(Math.round(b.x + b.w / 2), Math.round((b.hPct / 100) * vpH), b.color);
        }, i * 60);
      });
      await wait(Math.min(1200, order.length * 60 + 300));
      a.letterbox(false);
    } catch {
      /* cinema is garnish */
    } finally {
      lockRef.current = false;
    }
  };

  /* ── Stride observer: zone cards, Guide whispers, Spire dread ────────── */
  // Called from the page's stride wrapper — a handful of comparisons per
  // stride frame, nothing allocated.
  const onStride = (x, world, { spireSealed = false } = {}) => {
    const a = api();
    if (!a) return;
    const lastX = lastXRef.current;
    lastXRef.current = x;

    // zone title cards — first eastward walk past each arch, ever
    if (lastX != null && x > lastX && !lockRef.current) {
      const archesList = world.arches || [];
      for (let zi = 0; zi < archesList.length; zi += 1) {
        const arch = archesList[zi];
        const gate = arch.x + 70;
        if (lastX < gate && x >= gate) {
          const { firstTime } = markZoneSeen(arch.label);
          if (firstTime) {
            fx.titleCard(a.viewportEl(), {
              title: arch.label,
              sub: ZONE_LINES[arch.label] || "",
              color: arch.accent,
              ms: 2300,
            });
            if (a.zoneSting) a.zoneSting(zi);
            a.letterbox(true);
            setTimeout(() => a.letterbox(false), 2400);
          }
          break;
        }
      }
    }

    // Guide mile-markers — one-line whispers, once each, ever
    for (let i = 0; i < WHISPER_FRACTIONS.length; i += 1) {
      const wx = world.width * WHISPER_FRACTIONS[i];
      if (Math.abs(x - wx) < 40) {
        const { firstTime } = markWhisperSeen(i);
        if (firstTime) a.toast(WHISPERS[i], guideColor, { big: false });
        break;
      }
    }

    // the Spire approach — standing under a thunderhead
    const spire = (world.buildings || []).find((b) => b.id === "alchemist-spire");
    if (spire) {
      const near =
        spireSealed && Math.abs(x - (spire.x + spire.w / 2)) < SPIRE_NEAR_PX;
      if (near !== spireNearRef.current) {
        spireNearRef.current = near;
        const vp = a.viewportEl();
        if (vp) vp.classList.toggle("mqfx-spirenear", near);
        if (spireHumRef.current) spireHumRef.current(near); // Phase 8 hum
      }
    }
  };

  return { powerOn, spireSalute, onStride, spireHumRef, isLocked: () => lockRef.current };
}
