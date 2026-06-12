"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { fetchCurrentUser, userQueryKeys } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";
import { ImageWithFallback } from "./ImageWithFallback";

const BADGE_CLASSNAME =
  "fixed left-4 top-6 z-30 flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 py-1 pl-1 pr-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:left-8 md:top-8 md:gap-3 md:py-2 md:pl-2 md:pr-5";

export function ProfileBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchCurrentUser,
  });

  if (isLoading) {
    return (
      <div className={BADGE_CLASSNAME}>
        <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-zinc-200 md:h-11 md:w-11" />
        <div className="h-3 w-14 animate-pulse rounded-full bg-zinc-200 md:h-4 md:w-20" />
      </div>
    );
  }

  const avatarSrc = data?.image ?? AVATAR_PATHS[0];
  const nickname = isError ? "-" : data?.name ?? data?.username ?? "";

  return (
    <Link
      href="/profile"
      className={`${BADGE_CLASSNAME} transition-transform duration-150 active:scale-[0.98]`}
    >
      <ImageWithFallback
        src={avatarSrc}
        alt={nickname}
        containerClassName="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white md:h-11 md:w-11"
        iconSize={18}
        iconClassName="text-zinc-300"
      />
      <span className="max-w-30 truncate text-sm font-semibold text-zinc-900 md:max-w-40 md:text-base">
        {nickname}
      </span>
    </Link>
  );
}
