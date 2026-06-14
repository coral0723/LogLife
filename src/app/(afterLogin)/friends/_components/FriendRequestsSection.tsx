"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { CaretDown } from "@phosphor-icons/react";

import { acceptFriendRequest, declineFriendRequest } from "@/actions/friend/actions";
import { friendQueryKeys, fetchFriendRequests, type FriendRequestsPage } from "@/api/friends";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";
import { AVATAR_PATHS } from "@/lib/avatar";

const AVATAR_CONTAINER_CLASSNAME = "h-10 w-10 flex-shrink-0 overflow-hidden rounded-full";

export function FriendRequestsSection() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: friendQueryKeys.requests(),
    queryFn: ({ pageParam }) => fetchFriendRequests(pageParam ?? undefined),
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

  const removeRequest = (friendshipId: string) => {
    queryClient.setQueryData<InfiniteData<FriendRequestsPage>>(
      friendQueryKeys.requests(),
      (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pages: prev.pages.map((page, index) => ({
            ...page,
            items: page.items.filter((item) => item.friendshipId !== friendshipId),
            totalCount: index === 0 ? Math.max(0, page.totalCount - 1) : page.totalCount,
          })),
        };
      },
    );
  };

  const handleError = (e: unknown) => {
    alert(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.");
  };

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (_, friendshipId) => {
      removeRequest(friendshipId);
      queryClient.invalidateQueries({ queryKey: friendQueryKeys.list() });
    },
    onError: handleError,
  });

  const declineMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: (_, friendshipId) => removeRequest(friendshipId),
    onError: handleError,
  });

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-500">받은 친구 요청</h3>
          {totalCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white">
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
            <div className="flex h-32 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-sm text-zinc-400">
              받은 요청이 없습니다
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((request) => {
                const isPending =
                  (acceptMutation.isPending && acceptMutation.variables === request.friendshipId) ||
                  (declineMutation.isPending && declineMutation.variables === request.friendshipId);

                return (
                  <li
                    key={request.friendshipId}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-3"
                  >
                    <ImageWithFallback
                      src={request.image ?? AVATAR_PATHS[0]}
                      alt={request.name ?? request.username}
                      containerClassName={AVATAR_CONTAINER_CLASSNAME}
                      objectFit="cover"
                      iconSize={18}
                      iconClassName="text-zinc-300"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {request.name ?? request.username}
                      </p>
                      <p className="truncate text-xs text-zinc-400">@{request.username}</p>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => acceptMutation.mutate(request.friendshipId)}
                        disabled={isPending}
                        className="cursor-pointer rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        수락
                      </button>
                      <button
                        type="button"
                        onClick={() => declineMutation.mutate(request.friendshipId)}
                        disabled={isPending}
                        className="cursor-pointer rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        거절
                      </button>
                    </div>
                  </li>
                );
              })}
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
