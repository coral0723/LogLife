import type { AchievementStats } from "@/lib/bucketList/achievementStats";
import type { DifficultyExcitementItem } from "@/lib/bucketList/difficultyExcitementMatrix";

export const dashboardQueryKeys = {
  bucketCount: () => ["dashboard", "bucket-count"] as const,
  upcomingDeadlines: () => ["dashboard", "upcoming-deadlines"] as const,
  difficultyExcitement: () => ["dashboard", "difficulty-excitement"] as const,
  achievementStats: () => ["dashboard", "achievement-stats"] as const,
};

export async function fetchBucketCount(): Promise<number> {
  const res = await fetch("/api/dashboard/bucket-count");
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

export async function fetchUpcomingDeadlines(): Promise<UpcomingDeadlineItem[]> {
  const res = await fetch("/api/dashboard/upcoming-deadlines");
  if (!res.ok) throw new Error("마감 임박 리스트 조회 실패");
  const data = await res.json();
  return data.items;
}

export async function fetchDifficultyExcitementMatrix(): Promise<DifficultyExcitementItem[]> {
  const res = await fetch("/api/dashboard/difficulty-excitement");
  if (!res.ok) throw new Error("난이도 × 설렘 매트릭스 조회 실패");
  const data = await res.json();
  return data.items;
}

export async function fetchAchievementStats(): Promise<AchievementStats> {
  const res = await fetch("/api/dashboard/achievement-stats");
  if (!res.ok) throw new Error("달성 통계 조회 실패");
  return res.json();
}
