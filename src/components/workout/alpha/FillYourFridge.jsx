import React, { useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient.js";
import { sfxFridgeSlam, sfxMagnetClack, sfxCoin } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   FILL YOUR FRIDGE — the Stockpile game.
   A steel fridge with four shelves. Checking off grocery lines and
   prep steps stocks the shelves; at 100% the doors SLAM and the
   week is STOCKED. The closed door carries 7 magnets — one meal
   photo a day for accountability. Photos are private: stored small
   locally for the door, uploaded full-size when the bucket exists
   (migration 016). "Saved on this phone" until then.
   ═══════════════════════════════════════════════════════════════ */

const SHELVES = [
  { id: "protein", label: "PROTEINS" },
  { id: "free-veg", label: "THE GREEN WALL" },
  { id: "carb", label: "FUEL" },
  { id: "fat", label: "FATS" },
];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dateKey = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/* resize an image file on a canvas; returns {small, full} data URLs */
async function resizePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i); i.onerror = rej; i.src = url;
    });
    const draw = (maxPx, q) => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL("image/jpeg", q);
    };
    return { small: draw(256, 0.7), full: draw(1280, 0.8) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

export default function FillYourFridge({ alpha, userId, plan, checks, weekKey, onCheck, addXP, settings }) {
  const { state } = alpha;
  const [slammed, setSlammed] = useState(false);
  const fileRef = useRef(null);
  const [uploadingDay, setUploadingDay] = useState(null);

  const allItems = [...plan.lines.map((l) => `line:${l.id}`), ...plan.prepSteps.map((s) => `step:${s.id}`)];
  const progress = allItems.length ? checks.size / allItems.length : 0;
  const stocked = progress >= 1;
  const stockedFlag = state.flags[`stocked_${weekKey}`];

  /* stock a shelf item (with the pop-in handled by CSS on the shelf chip) */
  const shelfItems = useMemo(() => {
    const by = Object.fromEntries(SHELVES.map((s) => [s.id, []]));
    for (const l of plan.lines) if (checks.has(`line:${l.id}`)) by[l.id]?.push(l.label);
    const stepsDone = plan.prepSteps.filter((s) => checks.has(`step:${s.id}`));
    // prepped steps stack onto shelves round-robin so the fridge visibly fills
    stepsDone.forEach((s, i) => by[SHELVES[i % SHELVES.length].id].push(s.label));
    return by;
  }, [plan, checks]);

  const slam = () => {
    if (stockedFlag) return;
    sfxFridgeSlam(settings);
    try { if (navigator.vibrate) navigator.vibrate([50, 70, 50]); } catch { /* silent */ }
    setSlammed(true);
    alpha.logEvent("fridge_stocked", { weekKey, targets: plan.targets });
    alpha.patchState({ flags: { ...state.flags, [`stocked_${weekKey}`]: true } });
    addXP(25, "STOCKED — the week is locked in");
  };

  /* ── photo magnets ── */
  const photos = state.flags.fridgePhotos || {};
  const todayKey = dateKey();

  const pinPhoto = async (file) => {
    if (!file) return;
    setUploadingDay(todayKey);
    try {
      const { small, full } = await resizePhoto(file);
      let uploaded = false;
      let path = `${userId}/${todayKey}.jpg`;
      if (supabase && userId) {
        try {
          const blob = await dataUrlToBlob(full);
          const { error } = await supabase.storage.from("fridge-photos")
            .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
          uploaded = !error;
          if (error) console.error("[fridge] upload:", error.message);
        } catch (e) {
          console.error("[fridge] upload:", e?.message);
        }
      }
      sfxMagnetClack(settings);
      try { if (navigator.vibrate) navigator.vibrate(20); } catch { /* silent */ }
      const nextPhotos = { ...photos, [todayKey]: { preview: small, path, uploaded } };
      alpha.patchState({ flags: { ...alpha.state.flags, fridgePhotos: nextPhotos } });
      alpha.logEvent("fridge_photo", { date: todayKey, path, uploaded });
      addXP(5, "Pinned to the door — accountability held");

      /* SEVEN SEALS: 7 straight days ending today */
      const d = new Date();
      let run = 0;
      for (let i = 0; i < 7; i++) {
        if (nextPhotos[dateKey(d)]) run++; else break;
        d.setDate(d.getDate() - 1);
      }
      if (run >= 7 && alpha.state.flags.sevenSealsWeek !== weekKey) {
        sfxCoin(settings);
        alpha.patchState({ flags: { ...alpha.state.flags, fridgePhotos: nextPhotos, sevenSealsWeek: weekKey } });
        addXP(30, "SEVEN SEALS — a full week on the door");
      }
    } finally {
      setUploadingDay(null);
    }
  };

  /* this week's Mon..Sun date keys — parse weekKey as LOCAL, not UTC
     (new Date("yyyy-mm-dd") is UTC midnight and shifts a day in MDT) */
  const weekDays = useMemo(() => {
    const [y, mo, da] = weekKey.split("-").map(Number);
    const monday = new Date(y, mo - 1, da);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return dateKey(d);
    });
  }, [weekKey]);

  const showClosed = (stocked && (slammed || stockedFlag));

  return (
    <div className="iw-al-fridgewrap">
      <div className={`iw-al-fridge ${showClosed ? "iw-al-fridge-closed" : ""} ${slammed ? "iw-al-fridge-slamming" : ""}`}>
        {/* open interior */}
        <div className="iw-al-fridge-inside" aria-hidden={showClosed}>
          {SHELVES.map((s) => (
            <div key={s.id} className="iw-al-shelf">
              <span className="iw-al-shelf-label">{s.label}</span>
              <div className="iw-al-shelf-items">
                {shelfItems[s.id].map((item, i) => (
                  <span key={`${item}${i}`} className="iw-al-shelf-item">{item}</span>
                ))}
                {shelfItems[s.id].length === 0 && <span className="iw-al-shelf-empty">empty</span>}
              </div>
            </div>
          ))}
        </div>

        {/* doors */}
        <div className="iw-al-door iw-al-door-l" aria-hidden="true" />
        <div className="iw-al-door iw-al-door-r" aria-hidden="true">
          <span className="iw-al-door-handle" />
        </div>

        {/* closed-door face: STOCKED stamp + the 7 magnets */}
        {showClosed && (
          <div className="iw-al-doorface">
            <div className="iw-al-stocked-stamp">STOCKED</div>
            <div className="iw-al-magnets">
              {weekDays.map((dk, i) => {
                const p = photos[dk];
                const isToday = dk === todayKey;
                return (
                  <button key={dk}
                    className={`iw-al-magnet ${p ? "iw-al-magnet-pinned" : ""} ${isToday ? "iw-al-magnet-today" : ""}`}
                    disabled={!isToday || Boolean(uploadingDay)}
                    onClick={() => fileRef.current?.click()}
                    aria-label={p ? `${DAY_LABELS[i]} — pinned` : isToday ? "pin today's photo" : DAY_LABELS[i]}>
                    <span className="iw-al-magnet-dot" aria-hidden="true" />
                    {p ? (
                      <img className="iw-al-polaroid" src={p.preview} alt="" />
                    ) : (
                      <span className="iw-al-magnet-day">{DAY_LABELS[i]}</span>
                    )}
                    {p && !p.uploaded && <span className="iw-al-magnet-local" title="saved on this phone">◐</span>}
                  </button>
                );
              })}
            </div>
            <div className="iw-al-fastline iw-al-door-hint">
              {photos[todayKey]
                ? "today is on the door — seven straight earns the Seven Seals"
                : uploadingDay ? "pinning…" : "tap today's magnet — one photo a day keeps you honest"}
            </div>
          </div>
        )}
      </div>

      {/* handle-side gauge + slam CTA while stocking */}
      {!showClosed && (
        <>
          <div className="iw-al-fridge-gauge">
            <div className="iw-al-bc-bar"><div className="iw-al-bc-fill" style={{ width: `${progress * 100}%` }} /></div>
            <span className="iw-al-fastline">{Math.round(progress * 100)}% stocked</span>
          </div>
          {stocked && (
            <button className="iw-btn-ember iw-btn-wide iw-al-slam-btn" onClick={slam}>
              🧊 SLAM THE DOORS — lock the week in
            </button>
          )}
        </>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => { pinPhoto(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
