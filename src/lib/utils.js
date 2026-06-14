export function parseCommitments(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.replace(/^[-•*\d]+[.)]\s*/, '').trim())
    .filter(Boolean);
}

export function computeReviewStreak(weeklyReviews) {
  if (!Array.isArray(weeklyReviews) || weeklyReviews.length === 0) return 0;
  const sorted = [...weeklyReviews].sort((a, b) => b.weekNumber - a.weekNumber);
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].weekNumber - sorted[i].weekNumber === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function computeCommitmentStreak(weeklyReviews) {
  if (!Array.isArray(weeklyReviews) || weeklyReviews.length === 0) return 0;
  const withChecks = [...weeklyReviews]
    .sort((a, b) => b.weekNumber - a.weekNumber)
    .filter((r) => Array.isArray(r.lastWeekChecks) && r.lastWeekChecks.length > 0);
  let streak = 0;
  for (const r of withChecks) {
    if ((r.commitmentScore || 0) >= 0.75) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
