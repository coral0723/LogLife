"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users } from "@phosphor-icons/react";

import { friendQueryKeys, fetchFriends } from "@/api/friends";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import { AVATAR_PATHS } from "@/lib/avatar";

const AVATAR_CONTAINER_CLASSNAME = "h-10 w-10 flex-shrink-0 overflow-hidden rounded-full";

export function FriendListSection() {
  const { data: friends = [] } = useQuery({
    queryKey: friendQueryKeys.list(),
    queryFn: fetchFriends,
  });

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-zinc-500">친구</h3>
      {friends.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <Users size={20} weight="bold" />
          </div>
          <p className="text-sm font-medium text-zinc-900">아직 친구가 없어요</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {friends.map((friend) => (
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
        </ul>
      )}
    </section>
  );
}
