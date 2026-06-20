"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin } from "@phosphor-icons/react";

import { friendQueryKeys, fetchCommonBucketMatches } from "@/api/friends";

export function CommonBucketMatchesWidget() {
  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: friendQueryKeys.commonBuckets(),
    queryFn: fetchCommonBucketMatches,
  });

  return (
    <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
      <p className="mb-3 text-sm text-zinc-400">친구와 겹치는 버킷리스트</p>

      {isLoading ? (
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white p-3">
              <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-zinc-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-10 text-center">
          <p className="text-sm font-medium text-zinc-900">목록을 불러오지 못했어요</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <MapPin size={20} weight="bold" />
          </div>
          <p className="text-sm font-medium text-zinc-900">친구와 겹치는 버킷리스트가 없어요</p>
          <p className="text-xs text-zinc-400">같은 장소를 버킷리스트에 추가해보세요</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.flatMap((item) =>
            item.friends.map((friend) => (
              <li
                key={`${item.placeId}-${friend.id}`}
                className="flex items-center gap-3 rounded-xl bg-white p-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <MapPin size={18} weight="bold" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {friend.name ?? friend.username}님과 함께 — {item.displayName}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {item.myItem.title} · {friend.title}
                  </p>
                </div>
              </li>
            )),
          )}
        </ul>
      )}
    </section>
  );
}
