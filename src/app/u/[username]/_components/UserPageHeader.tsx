"use client";

import Link from "next/link";
import { ArrowLeft, UserPlus } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";

import { sendFriendRequest } from "@/actions/friend/actions";
import { ImageWithFallback } from "@/app/(afterLogin)/_components/ImageWithFallback";
import { AVATAR_PATHS } from "@/lib/avatar";
import type { FriendRelation } from "@/lib/friend/relation";

type TargetUser = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
};

type Props = {
  username: string;
  targetUser: TargetUser;
  isLoggedIn: boolean;
  relation: FriendRelation;
  isSelf: boolean;
};

const CONTAINER_CLASSNAME = "fixed left-4 top-14 z-30 flex items-center gap-2 md:left-8 md:top-8 lg:left-14 lg:top-14";

const ICON_BUTTON_CLASSNAME =
  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:h-12 md:w-12";

const PROFILE_BADGE_CLASSNAME =
  "flex items-center gap-3 rounded-3xl md:rounded-4xl border-2 border-[#A1A1AA] bg-[#F3F4F6] pl-2 pr-3 pt-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-transform duration-150 active:scale-[0.98] md:pr-5";

export function UserPageHeader({ username, targetUser, isLoggedIn, relation, isSelf }: Props) {
  const sendMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => alert("친구 신청이 되었습니다."),
    onError: (e) => alert(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다."),
  });

  const showFriendIcon = !isSelf && relation !== "friends";

  return (
    <div className={CONTAINER_CLASSNAME}>
      <Link
        href={isLoggedIn ? "/main" : "/"}
        aria-label="뒤로가기"
        className={`${ICON_BUTTON_CLASSNAME} border-2 border-[#A1A1AA] bg-[#F3F4F6] text-[#7b7b81] transition-transform duration-150 active:scale-[0.98]`}
      >
        <ArrowLeft size={18} weight="bold" />
      </Link>

      <Link href={`/u/${username}/profile`} className={PROFILE_BADGE_CLASSNAME}>
        <ImageWithFallback
          src={targetUser.image ?? AVATAR_PATHS[0]}
          alt={targetUser.name ?? targetUser.username}
          containerClassName="flex h-6 w-6 flex-shrink-0 items-center justify-center ml-[6px] md:h-8 md:w-8 lg:h-10 md:w-10"
          objectFit="contain"
          iconSize={18}
          iconClassName="text-zinc-300"
        />
        <span className="max-w-32 truncate text-xs font-sans text-[#7b7b81] md:max-w-44 md:text-md">
          {targetUser.name ?? targetUser.username}
        </span>
      </Link>

      {showFriendIcon &&
        (relation === "pending_sent" ? (
          <button
            type="button"
            disabled
            aria-label="친구 요청 보냄"
            className={`${ICON_BUTTON_CLASSNAME} cursor-not-allowed bg-zinc-300 text-white`}
          >
            <UserPlus size={18} weight="bold" />
          </button>
        ) : isLoggedIn ? (
          <button
            type="button"
            onClick={() => sendMutation.mutate(targetUser.id)}
            disabled={sendMutation.isPending}
            aria-label="친구 추가"
            className={`${ICON_BUTTON_CLASSNAME} bg-[#2cc2f7] text-white transition-transform duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <UserPlus size={18} weight="bold" />
          </button>
        ) : (
          <Link
            href="/login"
            aria-label="친구 추가"
            className={`${ICON_BUTTON_CLASSNAME} bg-[#2cc2f7] text-white transition-transform duration-150 active:scale-[0.98]`}
          >
            <UserPlus size={18} weight="bold" />
          </Link>
        ))}
    </div>
  );
}
