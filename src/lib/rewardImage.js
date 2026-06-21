import { uploadImage } from "./imageUploadService.js";

// Reads a File as a base64 data URL — the offline / signed-out fallback so
// reward images still work without Supabase.
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Turns a chosen image File into a src string we can store on the milestone.
 * Tries Supabase Storage first (returns a public URL); if that isn't available
 * (not signed in / not configured / network), falls back to a local data URL.
 */
export async function resolveRewardImage(file, userId) {
  try {
    if (userId) return await uploadImage(file, userId);
  } catch (err) {
    console.warn("[rewardImage] upload failed, storing locally:", err?.message || err);
  }
  return readAsDataUrl(file);
}
