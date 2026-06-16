import type { AchievementStats } from "@/lib/bucketList/achievementStats";
import type { DifficultyExcitementItem } from "@/lib/bucketList/difficultyExcitementMatrix";

export const dashboardQueryKeys = {
  bucketCount: (username?: string) =>
    username
      ? (["dashboard", "bucket-count", username] as const)
      : (["dashboard", "bucket-count"] as const),
  upcomingDeadlines: (username?: string) =>
    username
      ? (["dashboard", "upcoming-deadlines", username] as const)
      : (["dashboard", "upcoming-deadlines"] as const),
  difficultyExcitement: (username?: string) =>
    username
      ? (["dashboard", "difficulty-excitement", username] as const)
      : (["dashboard", "difficulty-excitement"] as const),
  achievementStats: (username?: string) =>
    username
      ? (["dashboard", "achievement-stats", username] as const)
      : (["dashboard", "achievement-stats"] as const),
};

function withUsername(path: string, username?: string): string {
  if (!username) return path;
  const params = new URLSearchParams({ username });
  return `${path}?${params}`;
}

export async function fetchBucketCount(username?: string): Promise<number> {
  const res = await fetch(withUsername("/api/dashboard/bucket-count", username));
  if (!res.ok) throw new Error("버킷리스트 개수 조회 실패");
  const data = await res.json();
  return data.count;
}

export type UpcomingDeadlineItem = {
  id: string;
  title: string;
  displayName: string;
  deadlineAt: string;
};

export async function fetchUpcomingDeadlines(username?: string): Promise<UpcomingDeadlineItem[]> {
  const res = await fetch(withUsername("/api/dashboard/upcoming-deadlines", username));
  if (!res.ok) throw new Error("마감 임박 리스트 조회 실패");
  const data = await res.json();
  return data.items;
}

export async function fetchDifficultyExcitementMatrix(
  username?: string,
): Promise<DifficultyExcitementItem[]> {
  const res = await fetch(withUsername("/api/dashboard/difficulty-excitement", username));
  if (!res.ok) throw new Error("난이도 × 설렘 매트릭스 조회 실패");
  const data = await res.json();
  return data.items;
}

export async function fetchAchievementStats(username?: string): Promise<AchievementStats> {
  const res = await fetch(withUsername("/api/dashboard/achievement-stats", username));
  if (!res.ok) throw new Error("달성 통계 조회 실패");
  return res.json();
}
