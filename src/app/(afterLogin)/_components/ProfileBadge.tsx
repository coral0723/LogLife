"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "@phosphor-icons/react";
import Link from "next/link";

import { fetchCurrentUser, userQueryKeys } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";
import { ImageWithFallback } from "./ImageWithFallback";

const BADGE_CLASSNAME =
  "fixed left-4 top-14 z-30 flex items-center gap-3 rounded-3xl md:rounded-4xl border-2 border-[#A1A1AA] bg-[#F3F4F6] pl-2 pr-3 pt-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:left-8 md:top-8 md:pr-5 lg:left-14 lg:top-14";

const AVATAR_CONTAINER_CLASSNAME =
  "flex h-6 w-6 flex-shrink-0 items-center justify-center md:h-8 md:w-8 lg:h-10 md:w-10";

export function ProfileBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchCurrentUser,
  });

  if (isLoading) {
    return (
      <div className={BADGE_CLASSNAME}>
        <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-zinc-200 md:h-12 md:w-12 lg:h-14 lg:w-14" />
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
      {isError ? (
        <div className={AVATAR_CONTAINER_CLASSNAME}>
          <User size={18} className="text-zinc-300" weight="regular" />
        </div>
      ) : (
        <ImageWithFallback
          src={avatarSrc}
          alt={nickname}
          containerClassName={AVATAR_CONTAINER_CLASSNAME}
          objectFit="contain"
          iconSize={18}
          iconClassName="text-zinc-300"
        />
      )}
      <span className="max-w-32 truncate text-xs font-sans text-[#7b7b81] md:max-w-44 md:text-md">
        {nickname}
      </span>
    </Link>
  );
}
