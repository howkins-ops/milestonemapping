import { resolveImageSrc } from "./imageUploadService.js";

/**
 * Turns a chosen image File into a src string we can store on the milestone.
 * Tries Supabase Storage first (returns a public URL); if that isn't available
 * (not signed in / not configured / network), falls back to a local data URL.
 */
export async function resolveRewardImage(file, userId) {
  return resolveImageSrc(file, userId);
}
