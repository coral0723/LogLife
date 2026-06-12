"use client";

import { useQuery } from "@tanstack/react-query";
import { User, CaretRight } from "@phosphor-icons/react";

import { fetchCurrentUser, userQueryKeys } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";

const AVATAR_CONTAINER_CLASSNAME = "h-32 w-24 md:h-36 md:w-28";

export function ProfileSettingsView() {
  const { data, isLoading, isError } = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchCurrentUser,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const avatarSrc = data?.image ?? AVATAR_PATHS[0];
  const nickname = isError ? "-" : data?.name ?? data?.username ?? "";

  return (
    <div className="flex flex-1 flex-col px-6 py-16">
      <div className="flex flex-col items-center gap-3">
        {isError ? (
          <div className={`${AVATAR_CONTAINER_CLASSNAME} flex items-center justify-center`}>
            <User size={40} className="text-zinc-300" weight="regular" />
          </div>
        ) : (
          <ImageWithFallback
            src={avatarSrc}
            alt={nickname}
            containerClassName={AVATAR_CONTAINER_CLASSNAME}
            objectFit="cover"
            iconSize={40}
            iconClassName="text-zinc-300"
          />
        )}

        <button
          type="button"
          className="cursor-pointer rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          프로필 변경
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between border-y border-zinc-100 py-4">
        <span className="text-sm text-zinc-900">닉네임</span>
        <div className="flex items-center gap-1 text-sm text-zinc-500">
          <span>{nickname}</span>
          <CaretRight size={16} weight="regular" />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-6">
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl border border-zinc-900 bg-white py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          로그아웃
        </button>
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600"
        >
          탈퇴하기
        </button>
      </div>
    </div>
  );
}
