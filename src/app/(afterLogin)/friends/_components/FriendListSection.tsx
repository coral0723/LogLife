"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CaretDown, Users } from "@phosphor-icons/react";

import { friendQueryKeys, fetchFriends } from "@/api/friends";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";
import { AVATAR_PATHS } from "@/lib/avatar";

const AVATAR_CONTAINER_CLASSNAME = "h-10 w-10 flex-shrink-0 overflow-hidden rounded-full";

export function FriendListSection() {
  const [isOpen, setIsOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: friendQueryKeys.list(),
    queryFn: ({ pageParam }) => fetchFriends(pageParam ?? undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isOpen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-500">친구</h3>
          {totalCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-200 px-1 text-[11px] font-semibold leading-none text-zinc-600">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </div>
        <CaretDown
          size={16}
          weight="bold"
          className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50">
              <LoadingSpinner size="xs" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <Users size={20} weight="bold" />
              </div>
              <p className="text-sm font-medium text-zinc-900">아직 친구가 없어요</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((friend) => (
                <li key={friend.friendshipId}>
                  <Link
                    href={`/u/${friend.username}`}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-3"
                  >
                    <ImageWithFallback
                      src={friend.image ?? AVATAR_PATHS[0]}
                      alt={friend.name ?? friend.username}
                      containerClassName={AVATAR_CONTAINER_CLASSNAME}
                      objectFit="cover"
                      iconSize={18}
                      iconClassName="text-zinc-300"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {friend.name ?? friend.username}
                      </p>
                      <p className="truncate text-xs text-zinc-400">@{friend.username}</p>
                    </div>
                  </Link>
                </li>
              ))}
              <div ref={sentinelRef} className="h-1" />
              {isFetchingNextPage && (
                <li className="flex items-center justify-center py-2">
                  <div className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
