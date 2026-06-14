export function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function clamp(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export function isValidDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidUrl(value) {
  if (!isNonEmpty(value)) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Validates the shape of an imported backup payload.
export function validateImportPayload(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Backup file is not a valid JSON object." };
  }
  if (!Array.isArray(data.milestones)) {
    return { valid: false, error: "Backup is missing the milestones list." };
  }
  if (data.dailyLogs && typeof data.dailyLogs !== "object") {
    return { valid: false, error: "Daily logs are corrupted in this backup." };
  }
  if (data.weeklyReviews && !Array.isArray(data.weeklyReviews)) {
    return { valid: false, error: "Weekly reviews are corrupted in this backup." };
  }
  return { valid: true, error: null };
}
