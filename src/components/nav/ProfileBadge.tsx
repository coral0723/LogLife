"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "@phosphor-icons/react";
import Link from "next/link";

import { fetchCurrentUser, userQueryKeys } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

const BADGE_CLASSNAME =
  "fixed left-4 top-[calc(env(safe-area-inset-top)+3.5rem)] z-30 flex items-end gap-2.5 overflow-hidden rounded-full border border-[rgba(226,232,240,0.7)] bg-white/95 pl-1.5 pr-4 pt-1.5 pb-0 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] backdrop-blur-xl md:left-8 md:top-8 lg:left-14 lg:top-14";

const AVATAR_CONTAINER_CLASSNAME =
  "flex h-7 w-7 flex-shrink-0 items-center justify-center md:h-9 md:w-9 lg:h-10 lg:w-10";

export function ProfileBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchCurrentUser,
  });

  if (isLoading) {
    return (
      <div className={BADGE_CLASSNAME}>
        <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-zinc-100 md:h-9 md:w-9 lg:h-10 lg:w-10" />
        <div className="h-2.5 w-14 animate-pulse rounded-full bg-zinc-100 self-center md:w-20" />
      </div>
    );
  }

  const avatarSrc = data?.image ?? AVATAR_PATHS[0];
  const nickname = isError ? "-" : data?.name ?? data?.username ?? "";

  return (
    <Link
      href="/profile"
      className={`${BADGE_CLASSNAME} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.10)] active:translate-y-0 active:scale-[0.98]`}
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
      <span className="self-center max-w-32 truncate mb-1 text-xs font-medium tracking-[-0.01em] text-[#71717A] md:max-w-44 md:text-sm">
        {nickname}
      </span>
    </Link>
  );
}
