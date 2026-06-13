const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type AchievedItem = {
  title: string;
  displayName: string;
  createdAt: Date;
  achievedAt: Date;
};

export type AchievementStats = {
  achievementRate: number;
  avgDays: number | null;
  longestItem: { title: string; displayName: string; days: number } | null;
};

export function computeAchievementStats(
  achievedItems: AchievedItem[],
  totalCount: number
): AchievementStats {
  const achievementRate =
    totalCount === 0 ? 0 : Math.round((achievedItems.length / totalCount) * 100);

  if (achievedItems.length === 0) {
    return { achievementRate, avgDays: null, longestItem: null };
  }

  let totalDays = 0;
  let longest = achievedItems[0];
  let longestDays = -1;

  for (const item of achievedItems) {
    const days = Math.round((item.achievedAt.getTime() - item.createdAt.getTime()) / MS_PER_DAY);
    totalDays += days;
    if (days > longestDays) {
      longestDays = days;
      longest = item;
    }
  }

  return {
    achievementRate,
    avgDays: Math.round(totalDays / achievedItems.length),
    longestItem: { title: longest.title, displayName: longest.displayName, days: longestDays },
  };
}
