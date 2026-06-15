"use client";

import { useQuery } from "@tanstack/react-query";
import { Confetti } from "@phosphor-icons/react";

import { friendQueryKeys, fetchAchievedTogetherMoments } from "@/api/friends";

export function AchievedTogetherWidget() {
  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: friendQueryKeys.achievedTogether(),
    queryFn: fetchAchievedTogetherMoments,
  });

  return (
    <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
      <p className="mb-3 text-sm text-zinc-400">함께 달성한 모먼트</p>

      {isLoading ? (
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white p-3">
              <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-10 text-center">
          <p className="text-sm font-medium text-zinc-900">목록을 불러오지 못했어요</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-500">
            <Confetti size={20} weight="bold" />
          </div>
          <p className="text-sm font-medium text-zinc-900">함께 달성한 모먼트가 없어요</p>
          <p className="text-xs text-zinc-400">같은 장소를 비슷한 시기에 달성하면 보여드릴게요</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={`${item.myItem.id}-${item.friendItem.id}`}
              className="flex items-center gap-3 rounded-xl bg-white p-3"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500">
                <Confetti size={18} weight="bold" />
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">
                {item.friendItem.friendName ?? item.friendItem.friendUsername}님도 {item.daysApart}일 차이로{" "}
                {item.displayName} 달성
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
