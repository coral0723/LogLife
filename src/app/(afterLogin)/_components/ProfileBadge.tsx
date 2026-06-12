"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { fetchCurrentUser, userQueryKeys } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";
import { ImageWithFallback } from "./ImageWithFallback";

const BADGE_CLASSNAME =
  "fixed left-4 top-6 z-30 flex items-center gap-2 rounded-3xl border-4 border-[#A1A1AA] bg-[#F3F4F6] pl-2 pr-4 pt-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:left-8 md:top-8 md:gap-3 md:pr-6";

export function ProfileBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchCurrentUser,
  });

  if (isLoading) {
    return (
      <div className={BADGE_CLASSNAME}>
        <div className="h-16 w-16 flex-shrink-0 animate-pulse bg-zinc-200 md:h-20 md:w-20" />
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
        containerClassName="flex h-16 w-16 flex-shrink-0 items-center justify-center md:h-20 md:w-20"
        objectFit="contain"
        iconSize={18}
        iconClassName="text-zinc-300"
      />
      <span className="max-w-30 truncate text-lg font-semibold text-[#A1A1AA] md:max-w-40 md:text-xl">
        {nickname}
      </span>
    </Link>
  );
}
