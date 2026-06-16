"use client";

import Link from "next/link";
import { ArrowLeft, UserPlus } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

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
  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl md:h-10 md:w-10";

const PROFILE_BADGE_CLASSNAME =
  "flex items-end gap-2.5 overflow-hidden rounded-full border border-[rgba(226,232,240,0.7)] bg-white/95 pl-1.5 pr-4 pt-1.5 pb-0 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.10)] active:translate-y-0 active:scale-[0.98]";

export function UserPageHeader({ username, targetUser, isLoggedIn, relation, isSelf }: Props) {
  const [requestSent, setRequestSent] = useState(false);

  const sendMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      setRequestSent(true);
      alert("친구 신청이 되었습니다.");
    },
    onError: (e) => alert(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다."),
  });

  const isPendingSent = requestSent || relation === "pending_sent";
  const showFriendIcon = !isSelf && relation !== "friends" && relation !== "pending_received";

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
          containerClassName="flex h-7 w-7 flex-shrink-0 items-center justify-center md:h-9 md:w-9 lg:h-10 lg:w-10"
          objectFit="contain"
          iconSize={18}
          iconClassName="text-zinc-300"
        />
        <span className="self-center max-w-32 truncate mb-1 text-xs font-medium tracking-[-0.01em] text-[#71717A] md:max-w-44 md:text-sm">
          {targetUser.name ?? targetUser.username}
        </span>
      </Link>

      {showFriendIcon &&
        (isPendingSent ? (
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
            className={`${ICON_BUTTON_CLASSNAME} cursor-pointer bg-[#2cc2f7] text-white transition-transform duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <UserPlus size={18} weight="bold" />
          </button>
        ) : (
          <Link
            href="/login"
            aria-label="친구 추가"
            className={`${ICON_BUTTON_CLASSNAME} cursor-pointer bg-[#2cc2f7] text-white transition-transform duration-150 active:scale-[0.98]`}
          >
            <UserPlus size={18} weight="bold" />
          </Link>
        ))}
    </div>
  );
}
