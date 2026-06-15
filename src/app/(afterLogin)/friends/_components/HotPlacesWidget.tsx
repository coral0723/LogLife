"use client";

import { useQuery } from "@tanstack/react-query";
import { Fire } from "@phosphor-icons/react";

import { friendQueryKeys, fetchHotPlaces } from "@/api/friends";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";

export function HotPlacesWidget() {
  const {
    data: items = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: friendQueryKeys.hotPlaces(),
    queryFn: fetchHotPlaces,
  });

  return (
    <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
      <p className="mb-3 text-sm text-zinc-400">친구들의 인기 장소</p>

      {isLoading ? (
        <ul className="space-y-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white p-3">
              <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-lg bg-zinc-200" />
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <Fire size={20} weight="bold" />
          </div>
          <p className="text-sm font-medium text-zinc-900">친구들의 인기 장소가 없어요</p>
          <p className="text-xs text-zinc-400">친구가 버킷리스트를 추가하면 보여드릴게요</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item.countryCode}-${item.displayName}`}
              className="flex items-center gap-3 rounded-xl bg-white p-3"
            >
              <ImageWithFallback
                src={`/api/places/photo?placeId=${item.placeId}`}
                containerClassName="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100"
                iconSize={20}
                iconClassName="text-zinc-300"
              />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">
                {index + 1}. {item.displayName} · {item.count}곳
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
