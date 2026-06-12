"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy } from "@phosphor-icons/react";

import { dashboardQueryKeys, fetchAchievementStats } from "@/api/dashboard";

type Props = {
  isOpen: boolean;
};

export function AchievementStatsWidget({ isOpen }: Props) {
  const {
    data: achievementStats = { achievementRate: 0, avgDays: null, longestItem: null },
    isLoading: isAchievementStatsLoading,
    isError: isAchievementStatsError,
  } = useQuery({
    queryKey: dashboardQueryKeys.achievementStats(),
    queryFn: fetchAchievementStats,
    enabled: isOpen,
  });

  return (
    <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
      {isAchievementStatsLoading ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
      ) : isAchievementStatsError ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-10 text-center">
          <p className="text-sm font-medium text-zinc-900">통계를 불러오지 못했어요</p>
        </div>
      ) : achievementStats.avgDays === null || achievementStats.longestItem === null ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <Trophy size={20} weight="bold" />
          </div>
          <p className="text-sm font-medium text-zinc-900">아직 달성한 항목이 없어요</p>
          <p className="text-xs text-zinc-400">버킷리스트를 달성해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">평균 달성 소요 기간</span>
            <span className="font-medium text-zinc-900">{achievementStats.avgDays}일</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex-shrink-0 text-zinc-400">가장 오래 미룬 항목</span>
            <span className="min-w-0 truncate font-medium text-zinc-900">
              {achievementStats.longestItem.title} · {achievementStats.longestItem.days}일
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
