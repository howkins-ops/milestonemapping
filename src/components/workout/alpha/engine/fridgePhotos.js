/* ALPHA MODE — meal-prep photo helpers.
   Photos live at state.flags.fridgePhotos[dateKey][blockId] =
   { preview, path, uploaded, caption }. blockId is a meal-timeline
   slot id ("meal1", "post", "meal2"…) or "day" for the door magnet.
   The legacy flat shape ({ dateKey: { preview,... } }) is normalized
   as block "legacy" so old photos never disappear. */

export const photoDateKey = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/* the block→photo map for one day (normalizing the legacy flat shape) */
export function dayPhotos(all, dateKey) {
  const d = all?.[dateKey];
  if (!d) return {};
  if (d.preview || d.path || d.uploaded !== undefined) return { legacy: d };
  return d;
}
export function hasPhotoOn(all, dateKey) {
  return Object.keys(dayPhotos(all, dateKey)).length > 0;
}
export function firstPhotoOn(all, dateKey) {
  const d = dayPhotos(all, dateKey);
  const k = Object.keys(d)[0];
  return k ? d[k] : null;
}

/* resize an image file on a canvas; returns { small, full } data URLs */
export async function resizePhoto(file) {
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

export const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();
